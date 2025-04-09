from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Watchlist, WatchlistStock, Stock

watchlist_routes = Blueprint('watchlists', __name__)

@watchlist_routes.route('/api/watchlist', methods=['GET'])
@login_required
def view_watched_stocks():
    watchlists = Watchlist.query.all()
    return jsonify([watchlist.to_dict() for watchlist in watchlists])

@watchlist_routes.route('/api/watchlist', methods=['POST'])
@login_required
def add_stock():
    stock_id = request.json.get('stock_id')

    if not stock_id:
        return jsonify({'error': 'missing stock_id'}), 400
    
    watchlist = Watchlist.query.filter_by(user_id = current_user.id).first()
    if not watchlist:
        watchlist = Watchlist(user_id=current_user.id)
        db.session.add(watchlist)
        db.session.commit()

    existing = WatchlistStock.query.filter_by(watchlist_id = watchlist.id, stock_id = stock_id).first()
    if existing:
        return jsonify({'error': 'Stock already in watchlist'}), 200
    
    new_entry = WatchlistStock(watchlist_id=watchlist.id, stock_id=stock_id)
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({'message': 'Stock added to watchlist'})
    
@watchlist_routes.route('/api/watchlist/:stock_id', methods=['DELETE'])
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
    return jsonify({'message': 'Stock removed from watchlist'})

