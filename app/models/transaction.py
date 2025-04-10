from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(50), nullable=False)  # 'buy' or 'sell'
    quantity = db.Column(db.Integer, nullable=False)
    price_per_stock = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    # Foreign keys
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stocks.id')), nullable=False)
    holding_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('holdings.id')), nullable=True)

    # Relationships
    portfolio = db.relationship('Portfolio', back_populates='transactions')
    holding = db.relationship('Holding', back_populates='transactions') 
    stock = db.relationship('Stock', backref='transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'quantity': self.quantity,
            'price_per_stock': self.price_per_stock,
            'total_amount': self.total_amount,
            'timestamp': self.timestamp,
            'portfolio_id': self.portfolio_id,
            'stock': self.stock.to_dict(),
            'holding_id': self.holding_id,  # Include the holding_id
            'holding': self.holding.to_dict() if self.holding else None  # Optionally include holding details as well if needed       
        }