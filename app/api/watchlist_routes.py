from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Watchlist, Stock

watchlists_routes = Blueprint('watchlists', __name__)

@watchlists_routes.route('/api/watchlist', methods=['GET'])
def view_watched_stocks():
    watchlists = Watchlist.query.all()
    return jsonify([watchlist.to_dict() for watchlist in watchlists])

@watchlists_routes.route('/api/watchlist', methods=['POST'])
def add_stock():
    stock_id = request.json.get('stock_id')
    stock = Stock.query.get(stock_id)

@watchlists_routes.route('/api/watchlist/:stock_id', methods=['DELETE'])
def remove_stock():