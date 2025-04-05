from .db import db, environment, SCHEMA, add_prefix_for_prod

class Holding(db.Model):
    __tablename__ = 'holdings'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    stock_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)

    # Foreign key to Portfolio
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)

    portfolio = db.relationship('Portfolio', back_populates='holdings')

    def to_dict(self):
        return {
            'id': self.id,
            'stock_name': self.stock_name,
            'quantity': self.quantity,
            'portfolio_id': self.portfolio_id
        }