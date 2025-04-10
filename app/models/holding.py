from .db import db, environment, SCHEMA, add_prefix_for_prod

class Holding(db.Model):
    __tablename__ = 'holdings'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)
    stock_symbol = db.Column(db.String(10), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stocks.id')), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0)

    # Foreign key to Portfolio
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)

    portfolio = db.relationship('Portfolio', back_populates='holdings')
    stock = db.relationship('Stock', back_populates='holdings')
    transactions = db.relationship('Transaction', back_populates='holding', cascade="all, delete-orphan")


    def to_dict(self):
        return {
            'id': self.id,
            'stock': self.stock.to_dict(),
            'quantity': self.quantity,
            'portfolio_id': self.portfolio_id
        }