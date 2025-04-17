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

    # Check if the stock already exists in holdings
    holding = Holding.query.filter_by(portfolio_id=portfolio.id, stock_id=stock.id).first()

    if holding:
        # If the stock is already in the portfolio, update the quantity
        holding.quantity += quantity
    else:
        # If the stock is not in the portfolio, create a new holding
        holding = Holding(
            portfolio_id=portfolio.id,
            stock_symbol=stock.symbol,
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

    # Commit the changes to the database
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

@holding_routes.route('/<int:holding_id>/sell', methods=['PATCH'])
@login_required
def sell_holding_by_id(portfolio_id, holding_id):
    data = request.get_json()
    quantity = data.get('quantity', 0)

    print(f"[DEBUG] Sell request: quantity={quantity}, holding_id={holding_id}, portfolio_id={portfolio_id}")

    if quantity <= 0:
        return jsonify({'error': 'Invalid quantity'}), 400

    holding = Holding.query.get(holding_id)

    if not holding or holding.portfolio_id != portfolio_id or holding.portfolio.user_id != current_user.id:
        return jsonify({'error': 'Holding not found or unauthorized'}), 404

    if holding.quantity < quantity:
        return jsonify({'error': 'Not enough shares to sell'}), 400

    stock = holding.stock
    current_price = stock.current_price
    total_amount = current_price * quantity

    holding.quantity -= quantity
    portfolio = holding.portfolio
    portfolio.balance += total_amount

    if holding.quantity == 0:
        db.session.delete(holding)

    # Record the transaction
    transaction = Transaction(
        transaction_type='sell',
        quantity=quantity,
        price_per_stock=current_price,
        total_amount=total_amount,
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        holding_id=holding_id
    )
    db.session.add(transaction)

    db.session.commit()

    return jsonify({
        'message': 'Stock sold',
        'portfolio': portfolio.to_dict()
    }), 200

@holding_routes.route('/<string:symbol>', methods=['GET'])
@login_required
def get_holding_by_symbol(portfolio_id, symbol):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    holding = Holding.query.filter_by(portfolio_id=portfolio.id, stock_id=stock.id).first()
    if not holding:
        return jsonify({'message': 'Holding not found'}), 404

    return jsonify(holding.to_dict()), 200