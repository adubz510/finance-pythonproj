from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import db, Portfolio

portfolio_routes = Blueprint('portfolios', __name__)

# Get the current user's portfolio
@portfolio_routes.route('/', methods=['GET'])
@login_required
def get_portfolio():
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).first()
    if not portfolio:
        return {'error': 'Portfolio not found'}, 404
    return {'portfolio': portfolio.to_dict()}

# Create a new portfolio (Only if user doesn't already have one)
@portfolio_routes.route('/', methods=['POST'])
@login_required
def create_portfolio():
    existing_portfolio = Portfolio.query.filter_by(user_id=current_user.id).first()
    if existing_portfolio:
        return {'error': 'Portfolio already exists'}, 400

    portfolio = Portfolio(user_id=current_user.id, balance=10000.0)
    db.session.add(portfolio)
    db.session.commit()
    return {'message': 'Portfolio created successfully', 'portfolio': portfolio.to_dict()}, 201

# Update portfolio balance (Add fake money)
@portfolio_routes.route('/balance', methods=['PUT'])
@login_required
def update_balance():
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).first()
    if not portfolio:
        return {'error': 'Portfolio not found'}, 404

    data = request.get_json()
    amount = data.get('amount', 0)

    if not isinstance(amount, (int, float)) or amount <= 0:
        return {'error': 'Invalid amount'}, 400

    portfolio.balance += amount
    db.session.commit()
    return {'message': 'Balance updated successfully', 'portfolio': portfolio.to_dict()}

# Delete portfolio (Simulating selling all stocks)
@portfolio_routes.route('/', methods=['DELETE'])
@login_required
def delete_portfolio():
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).first()
    if not portfolio:
        return {'error': 'Portfolio not found'}, 404

    db.session.delete(portfolio)
    db.session.commit()
    return {'message': 'Portfolio deleted successfully'}
