# stocks_routes.py
from flask import Blueprint, request, jsonify
from app.models import db, Stock
import os
import requests
from dotenv import load_dotenv
import pprint
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

# Real-time or historical stock data from Alpha Vantage
@stocks_routes.route('/<symbol>/history')
def get_stock_history(symbol):
    timeframe = request.args.get('timeframe', 'TIME_SERIES_DAILY')
    url = f'https://www.alphavantage.co/query?function={timeframe}&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'

    response = requests.get(url)
    data = response.json()

    pprint.pprint(data)
    # Parse the time series data
    key = next((k for k in data if 'Time Series' in k), None)
    if not key:
        return jsonify({'error': 'Data not available'}), 400

    time_series = data[key]
    formatted_data = [
        {'date': date, 'close': float(values['4. close'])}
        for date, values in list(time_series.items())[:30]  # limit to last 30 points
    ][::-1]  # Reverse to show oldest first

    return jsonify(formatted_data)
