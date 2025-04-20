from flask import Blueprint, request, jsonify
from app.models import db, Stock
import os
import requests
from dotenv import load_dotenv
import pprint
from datetime import datetime, timedelta
from app.models import StockHistory
stocks_routes = Blueprint('stocks', __name__)

load_dotenv()
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# Get all stocks
@stocks_routes.route('/', methods=['GET'])
def get_all_stocks():
    stocks = Stock.query.all()
    return jsonify([stock.to_dict() for stock in stocks])

# Get a stock by symbol
@stocks_routes.route('/<string:symbol>', methods=['GET'])
def get_stock_by_symbol(symbol):
    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404
    return stock.to_dict()

# Search stocks by query param
@stocks_routes.route('/search', methods=['GET'])
def search_stocks():
    query = request.args.get('query', '').lower()
    results = Stock.query.filter(
        (Stock.symbol.ilike(f'%{query}%')) |
        (Stock.name.ilike(f'%{query}%'))
    ).all()
    return jsonify([stock.to_dict() for stock in results])

# Dummy stock (using for development only)
@stocks_routes.route('/', methods=['POST'])
def create_stock():
    data = request.json
    symbol = data.get('symbol')
    name = data.get('name')
    price = data.get('current_price')

    if not symbol or not name or price is None:
        return jsonify({'error': 'Missing required fields'}), 400

    existing = Stock.query.filter_by(symbol=symbol.upper()).first()
    if existing:
        return jsonify({'error': 'Stock already exists'}), 409

    new_stock = Stock(symbol=symbol.upper(), name=name, current_price=price)
    db.session.add(new_stock)
    db.session.commit()

    return new_stock.to_dict(), 201

# ✅ New route to fetch stock name/info
@stocks_routes.route('/<symbol>/info', methods=['GET'])
def get_stock_info(symbol):
    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404
    return jsonify(stock.to_dict())


# Real-time or historical stock data from Alpha Vantage
@stocks_routes.route('/<symbol>/history')
def get_stock_history(symbol):
    timeframe = request.args.get('timeframe', 'TIME_SERIES_DAILY')
    now = datetime.utcnow()

    # 🔍 Try to fetch from cache
    cached_data = StockHistory.query.filter(
        StockHistory.symbol == symbol.upper(),
        StockHistory.timeframe == timeframe
    ).order_by(StockHistory.date.desc()).all()

    print(f"[DEBUG] Fetched {len(cached_data)} cached entries for {symbol} ({timeframe})")
    print(f"[DEBUG] Latest cache date: {cached_data[0].date}" if cached_data else "[DEBUG] No cached entries")


    # ✅ Serve cached response if it's fresh
    if cached_data and cached_data[0].date >= (now - timedelta(days=10)).date():
        print("[✅] Returning cached stock history from DB...")
        return jsonify([entry.to_dict() for entry in cached_data])

    # 🛰️ Call Alpha Vantage API
    url = f'https://www.alphavantage.co/query?function={timeframe}&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    data = response.json()

    key = next((k for k in data if 'Time Series' in k), None)
    if not key:
        return jsonify({'error': 'Data not available'}), 400

    time_series = data[key]
    parsed = []

    # 🧠 Loop through all date entries (no slice/limit)
    for date_str, values in time_series.items():
        close = float(values['4. close'])
        parsed.append({'date': date_str, 'close': close})

        # 🗂️ Cache each record if it doesn't already exist
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        exists = StockHistory.query.filter_by(
            symbol=symbol.upper(),
            date=date_obj,
            timeframe=timeframe
        ).first()

        if not exists:
            new_entry = StockHistory(
                symbol=symbol.upper(),
                date=date_obj,
                close=close,
                timeframe=timeframe
            )
            db.session.add(new_entry)

    db.session.commit()

    # ⏪ Reverse to show oldest-to-newest for frontend graph
    return jsonify(parsed[::-1])
