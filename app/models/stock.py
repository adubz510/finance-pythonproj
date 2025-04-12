from .db import db, environment, SCHEMA, add_prefix_for_prod
from sqlalchemy.orm import relationship


class Stock(db.Model):
    __tablename__ = 'stocks'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    current_price = db.Column(db.Float)



    watchlists = db.relationship('WatchlistStock', back_populates='stock', cascade="all, delete-orphan")
    holdings = relationship('Holding', back_populates='stock') 


    def to_dict(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "current_price": self.current_price
            }  #Custom instance method to convert stock object into a dictionary , will return object for sending to front end