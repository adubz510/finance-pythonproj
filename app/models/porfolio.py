from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin

class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=10000.0)  # Default starting balance

    user = db.relationship('User', back_populates='portfolio')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'balance': self.balance,
            'username': self.user.username if self.user else None  # Include username
        }
