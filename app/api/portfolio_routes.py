# app/api/portfolio_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Portfolio, Holding, Stock, Transaction

portfolio_routes = Blueprint('portfolios', __name__)

# Get all current user's portfolio
@portfolio_routes.route('/', methods=['GET'])
@login_required
def get_portfolios():
    portfolios = Portfolio.query.filter_by(user_id=current_user.id).all()
    return jsonify({'portfolios': [p.to_dict() for p in portfolios]}), 200

# Get a specific portfolio by ID
@portfolio_routes.route('/<int:portfolio_id>', methods=['GET'])
@login_required
def get_portfolio_by_id(portfolio_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    return jsonify({'portfolio': portfolio.to_dict()}), 200

# Create a new portfolio (Allowing multiple portfolios per user)
@portfolio_routes.route('/', methods=['POST'])
@login_required
def create_portfolio():
    data = request.get_json()
    name = data.get('name', f"{current_user.username}'s Portfolio")  # Default to user's name if not provided
    balance = data.get('balance', 0.00)  # Default balance is 1000.00 if not provided

    portfolio = Portfolio(user_id=current_user.id, name=name, balance=balance)
    db.session.add(portfolio)
    db.session.commit()
    
    return jsonify({'message': 'Portfolio created successfully', 'portfolio': portfolio.to_dict()}), 201

# update balance of specific portfolio
@portfolio_routes.route('/<int:portfolio_id>/balance', methods=['PUT'])
@login_required
def update_balance(portfolio_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    data = request.get_json()
    amount = data.get('amount', 0)

    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400

    portfolio.balance += amount
    db.session.commit()
    
    return jsonify({'message': 'Balance updated successfully', 'portfolio': portfolio.to_dict()}), 200

# delete portfolio (simulate selling all stocks before deletion)
@portfolio_routes.route('/<int:portfolio_id>', methods=['DELETE'])
@login_required
def delete_portfolio(portfolio_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    # Simulate selling all holdings
    for holding in portfolio.holdings:
        stock = holding.stock
        quantity = holding.quantity
        current_stock_price = stock.current_price
        total_amount = quantity * current_stock_price

        # Add proceeds to portfolio balance
        portfolio.balance += total_amount

        # Create and add a "sell" transaction for each holding
        transaction = Transaction(
            transaction_type='sell',
            quantity=quantity,
            price_per_stock=current_stock_price,
            total_amount=total_amount,
            portfolio_id=portfolio.id,
            stock_id=stock.id,
            holding_id=holding.id
        )
        db.session.add(transaction)

        # Remove the holding
        db.session.delete(holding)

    # Unlink transactions before deleting portfolio
    for transaction in portfolio.transactions:
        transaction.portfolio_id = None

    # Now delete the portfolio itself
    db.session.delete(portfolio)
    db.session.commit()

    return jsonify({'message': 'Portfolio deleted and holdings sold'}), 200