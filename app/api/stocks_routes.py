# stocks_routes.py
from flask import Blueprint, request, jsonify
from app.models import db, Stock
from sqlalchemy.orm import joinedload

stocks_routes = Blueprint('stocks', __name__)

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

# (Optional) Add a dummy stock (for development only)
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
