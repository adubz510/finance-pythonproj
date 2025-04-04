from flask import Blueprint, request, jsonify
from app.models import db, Watchlist

watchlists_routes = Blueprint('watchlists', __name__)

@watchlists_routes.route('/', methods=['GET'])
def view_watched_stocks():
    watchlists = Watchlist.query.all()
    return jsonify([watchlist.to_dict() for watchlist in watchlists])

@watchlists_routes.route('/add', methods=['POST'])
def add_stock():

@watchlists_routes.route('/remove', methods=['DELETE'])
def remove_stock():