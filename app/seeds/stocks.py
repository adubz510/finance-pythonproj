# # stocks.py
# from app.models import db, Stock
# from sqlalchemy.sql import text

from app.models import db, Stock
from sqlalchemy.sql import text
from app.models.db import environment, SCHEMA  #

def seed_stocks():
    sample_stocks = [
        Stock(symbol='AAPL', name='Apple Inc.', current_price=195.30),
        Stock(symbol='MSFT', name='Microsoft Corporation', current_price=410.50),
        Stock(symbol='GOOGL', name='Alphabet Inc.', current_price=138.75),
        Stock(symbol='AMZN', name='Amazon.com, Inc.', current_price=155.10),
        Stock(symbol='TSLA', name='Tesla, Inc.', current_price=175.60),
        Stock(symbol='META', name='Meta Platforms, Inc.', current_price=320.45),
        Stock(symbol='NVDA', name='NVIDIA Corporation', current_price=905.20),
    ]

    db.session.bulk_save_objects(sample_stocks)
    db.session.commit()

def undo_stocks():
    if environment == "production":
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.stocks RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM stocks"))
    db.session.commit()
