from .db import db, environment, SCHEMA, add_prefix_for_prod

# Association table for many-to-many relationship between Watchlist and Stock
class WatchlistStock(db.Model):
    __tablename__ = 'watchlist_stocks'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    watchlist_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('watchlists.id')), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stocks.id')), nullable=False)

    watchlist = db.relationship('Watchlist', back_populates='watchlist_stocks')
    stock = db.relationship('Stock', back_populates='watchlists')


class Watchlist(db.Model):
    __tablename__ = 'watchlists'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(255), nullable=False, default='My Watchlist')

    user = db.relationship('User', back_populates='watchlists')
    watchlist_stocks = db.relationship('WatchlistStock', back_populates='watchlist', cascade="all, delete-orphan", lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'stocks': [ws.stock.to_dict() for ws in self.watchlist_stocks]
        }