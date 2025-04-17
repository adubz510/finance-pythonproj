#api/user_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required
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

#api/user_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required
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

@user_routes.route('/update_balance', methods=['PUT'])
@login_required
def update_balance():
    """
    Update the logged-in user's total balance
    """
    data = request.get_json()
    new_balance = data.get('total_balance')

    if new_balance is None:
        return jsonify({'error': 'Missing total_balance'}), 400

    # Make sure that the total_balance is a valid number
    if not isinstance(new_balance, (int, float)):
        return jsonify({'error': 'Invalid total_balance value'}), 400

    current_user.total_balance = new_balance
    db.session.commit()

    return jsonify({'message': 'User balance updated successfully', 'total_balance': current_user.total_balance}), 200