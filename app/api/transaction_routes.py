from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Transaction, Portfolio, Stock, Holding
from datetime import datetime

transaction_routes = Blueprint('transactions', __name__)

# Get all transactions for a user's portfolio
@transaction_routes.route('/', methods=['GET'])
@login_required
def get_transactions():
    portfolio_id = request.args.get('portfolio_id', type=int)
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    transactions = Transaction.query.filter_by(portfolio_id=portfolio_id).order_by(Transaction.timestamp.desc()).all()
    return jsonify([t.to_dict() for t in transactions]), 200


# Order a stock (buy or sell), optionally with a future scheduled time
@transaction_routes.route('/order', methods=['POST'])
@login_required
def order_stock():
    portfolio_id = request.args.get('portfolio_id', type=int)
    data = request.get_json()
    transaction_type = data.get('transaction_type')  # 'buy' or 'sell'
    symbol = data.get('symbol')
    quantity = data.get('quantity')
    scheduled_time = data.get('scheduled_time')  # Optional ISO string

    if not symbol or not quantity or transaction_type not in ['buy', 'sell']:
        return jsonify({'error': 'Missing or invalid fields'}), 400

    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user.id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    holding = Holding.query.filter_by(portfolio_id=portfolio.id, stock_id=stock.id).first()
    current_stock_price = stock.current_price
    total_amount = current_stock_price * quantity
    timestamp = datetime.fromisoformat(scheduled_time) if scheduled_time else datetime.now()

    if transaction_type == 'buy' and portfolio.balance < total_amount:
        return jsonify({'error': 'Insufficient balance'}), 400

    if transaction_type == 'sell' and (not holding or holding.quantity < quantity):
        return jsonify({'error': 'Not enough shares to sell'}), 400

    transaction = Transaction(
        transaction_type=transaction_type,
        quantity=quantity,
        current_stock_price=current_stock_price,
        total_amount=total_amount,
        timestamp=timestamp,
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        holding_id=holding.id if holding else None
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({'message': 'Order placed', 'transaction': transaction.to_dict()}), 201


# Cancel a future (scheduled) transaction
@transaction_routes.route('/cancel/<int:transaction_id>', methods=['DELETE'])
@login_required
def cancel_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404

    portfolio = Portfolio.query.get(transaction.portfolio_id)
    if not portfolio or portfolio.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    if transaction.timestamp <= datetime.now():
        return jsonify({'error': 'Cannot cancel past or executed transactions'}), 400

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction canceled'}), 200