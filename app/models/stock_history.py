from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import date

class StockHistory(db.Model):
    __tablename__ = 'stock_history'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}
    else:
        __table_args__ = ()

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False)
    date = db.Column(db.Date, nullable=False)
    close = db.Column(db.Float, nullable=False)
    timeframe = db.Column(db.String(30), nullable=False)  # DAILY, WEEKLY, etc.

    # Prevent duplicate entries for a given symbol, date, and timeframe
    __table_args__ = (
        db.UniqueConstraint('symbol', 'date', 'timeframe'),
    )

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'date': self.date.strftime('%Y-%m-%d'),
            'close': self.close,
            'timeframe': self.timeframe
        }
