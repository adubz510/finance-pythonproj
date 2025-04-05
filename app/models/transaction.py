from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(50), nullable=False)  # 'buy' or 'sell'
    stock_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_per_stock = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    # Foreign key to Portfolio
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)

    portfolio = db.relationship('Portfolio', backref='transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'stock_name': self.stock_name,
            'quantity': self.quantity,
            'price_per_stock': self.price_per_stock,
            'total_amount': self.total_amount,
            'timestamp': self.timestamp,
            'portfolio_id': self.portfolio_id
        }