from .db import db

class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable = False)

    user = db.relationship('User', back_populates = 'watchlist')
    stock = db.relationship('Stock', back_populates = 'watchlists')

class WatchlistStock(db.Model):
    __tablename__ = 'watchlist_stocks'
    id = db.Column(db.Integer, primary_key = True)
    watchlist_id = db.Column(db.integer, db.ForeignKey('watchlist_id'), nullable = False)
    stock_id = db.Column(db.integer, db.ForeignKey('stock_id'), nullable = False)

    watchlist = db.relationship('Watchlist', back_populates = 'stocks')
    stock = db.relationship('Stock', back_populates = 'watchlist_entries')

class Stock(db.Model):
    __tablename__='stocks'
    id = db.Column(db.Integer, primary_key = True)
    symbol = db.Column(db.String, nullable = False, unique = True)
    name = db.Column(db.String, nullable = False)

    Watchlist_entries = db.relationship('WatchlistStock', back_populates = 'stock')

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Ineteger, primary_key = True)
    username = db.Column(db.String, nullable = False, unique = True)

    watchlist = db.relationship('Watchlist', uselist = False, back_populates = 'user', cascade = 'all, delete-orphan')


    