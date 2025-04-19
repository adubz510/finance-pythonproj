#api/user_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import User, db

user_routes = Blueprint('users', __name__)


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = User.query.all()
    return {'users': [user.to_dict() for user in users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = User.query.get(id)
    return user.to_dict()

@user_routes.route('/me/balance')
@login_required
def user_balance():
    """
    Returns the total balance for the currently logged-in user
    """
    return jsonify({'total_balance': current_user.total_balance})

@user_routes.route('/me/balance', methods=['PUT'])
@login_required
def update_user_balance():
    user = current_user
    data = request.get_json()
    amount = data.get('amount', 0)
    user.total_balance += amount
    db.session.commit()
    return jsonify({'total_balance': user.total_balance})