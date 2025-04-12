from .db import db, environment, SCHEMA, add_prefix_for_prod

class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)  
    balance = db.Column(db.Float, nullable=False, default=0.00)  

    user = db.relationship('User', back_populates='portfolios')
    holdings = db.relationship('Holding', back_populates='portfolio', cascade="all, delete-orphan", lazy='joined')
    transactions = db.relationship('Transaction', back_populates='portfolio', cascade="save-update, merge, refresh-expire, expunge")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'balance': self.balance,
            'holdings': [holding.to_dict() for holding in self.holdings]
        }