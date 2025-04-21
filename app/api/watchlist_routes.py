from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Watchlist, WatchlistStock
from app.models import Stock

watchlist_routes = Blueprint('watchlist', __name__)

@watchlist_routes.route('', methods=['GET'])
@login_required
def view_watched_stocks():
    watchlist = Watchlist.query.filter_by(user_id=current_user.id).first()
    if not watchlist:
        return jsonify({'stocks': []})
    return jsonify(watchlist.to_dict())

@watchlist_routes.route('', methods=['POST'])
@login_required
def add_stock():
    stock_id = request.json.get('stock_id')

    if not stock_id:
        return jsonify({'error': 'Missing stock_id'}), 400

    watchlist = Watchlist.query.filter_by(user_id=current_user.id).first()
    if not watchlist:
        watchlist = Watchlist(user_id=current_user.id)
        db.session.add(watchlist)
        db.session.commit()

    existing = WatchlistStock.query.filter_by(watchlist_id=watchlist.id, stock_id=stock_id).first()
    if existing:
        return jsonify({'error': 'Stock already in watchlist'}), 200

    new_entry = WatchlistStock(watchlist_id=watchlist.id, stock_id=stock_id)
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({'message': 'Stock added to watchlist'}), 201

@watchlist_routes.route('/<int:stock_id>', methods=['DELETE'])
@login_required
def remove_stock(stock_id):
    watchlist = Watchlist.query.filter_by(user_id=current_user.id).first()
    if not watchlist:
        return jsonify({'error': 'No watchlist found'}), 404

    entry = WatchlistStock.query.filter_by(watchlist_id=watchlist.id, stock_id=stock_id).first()
    if not entry:
        return jsonify({'error': 'Stock not found in watchlist'}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Stock removed from watchlist'}), 200