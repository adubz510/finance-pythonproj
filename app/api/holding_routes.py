# app/api/holding_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Portfolio, Holding, Stock, Transaction

holding_routes = Blueprint('holdings', __name__)

# Get all holdings for a specific portfolio
@holding_routes.route('/', methods=['GET'])
@login_required
def get_holdings(portfolio_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    holdings = [holding.to_dict() for holding in portfolio.holdings]
    return jsonify({'holdings': holdings}), 200

# Buy stock (create or update a holding)
@holding_routes.route('/buy', methods=['POST'])
@login_required
def buy_stock(portfolio_id):
    data = request.get_json()
    symbol = data.get('symbol')
    quantity = data.get('quantity', 0)

    if not symbol or quantity <= 0:
        return jsonify({'error': 'Invalid symbol or quantity'}), 400

    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404
    
    # Calculate the cost of the transaction
    current_stock_price = stock.current_price
    total_amount = current_stock_price * quantity

    # Check if the user has enough balance to buy the stock
    if portfolio.balance < total_amount:
        return jsonify({'error': 'Not enough balance'}), 400

    # Deduct the cost from the portfolio balance
    portfolio.balance -= total_amount

    # check if user already has stock in holdings
    holding = Holding.query.filter_by(portfolio_id=portfolio.id, stock_id=stock.id).first()

    if holding:
        holding.quantity += quantity
    else:
        holding = Holding(
            portfolio_id=portfolio.id,
            stock_symbol=symbol.upper(),
            stock_id=stock.id,
            quantity=quantity
        )
        db.session.add(holding)

    # Create the transaction entry for the purchase
    transaction = Transaction(
        transaction_type='buy',
        quantity=quantity,
        current_stock_price=current_stock_price,
        total_amount=total_amount,
        portfolio_id=portfolio.id,
        stock_id=stock.id
    )
    db.session.add(transaction)


    db.session.commit()
    return jsonify({'message': 'Stock purchased', 'holding': holding.to_dict()}), 200

# Sell stock (decrease or delete holding)
@holding_routes.route('/sell', methods=['PUT'])
@login_required
def sell_stock(portfolio_id):
    data = request.get_json()
    symbol = data.get('symbol')
    quantity = data.get('quantity', 0)

    if not symbol or quantity <= 0:
        return jsonify({'error': 'Invalid symbol or quantity'}), 400

    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    # check if user has stock in holding
    holding = Holding.query.filter_by(portfolio_id=portfolio.id, stock_id=stock.id).first()
    if not holding or holding.quantity < quantity:
        return jsonify({'error': 'Not enough shares to sell'}), 400
    
    # Calculate the cost of the transaction
    current_stock_price = stock.current_price
    total_amount = current_stock_price * quantity

    # Add the proceeds from the sale to the portfolio balance
    portfolio.balance += total_amount

    holding.quantity -= quantity
    if holding.quantity == 0:
        db.session.delete(holding)

    # Create the transaction entry for the sale
    transaction = Transaction(
        transaction_type='sell',
        quantity=quantity,
        current_stock_price=current_stock_price,
        total_amount=total_amount,
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        holding_id=holding.id if holding else None
    )
    db.session.add(transaction)

    db.session.commit()
    return jsonify({'message': 'Stock sold', 'holding': holding.to_dict() if holding.quantity > 0 else None}), 200