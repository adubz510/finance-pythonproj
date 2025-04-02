from app.models import db, Portfolio, environment, SCHEMA
from sqlalchemy.sql import text

# Adds demo portfolios
def seed_portfolios():
    portfolio1 = Portfolio(
        user_id=1, balance=10000.00, name="Demo Portfolio"
    )
    portfolio2 = Portfolio(
        user_id=2, balance=15000.50, name="Marnie's Portfolio"
    )
    portfolio3 = Portfolio(
        user_id=3, balance=15000.00, name="Bobbie's Portfolio"
    )
    portfolio4 = Portfolio(
        user_id=3, balance=500.96, name="Wayne's Portfolio"
    )
    portfolio5 = Portfolio(
        user_id=3, balance=3330.25, name="Ally's Portfolio"
    )
    portfolio6 = Portfolio(
        user_id=3, balance=9876.75, name="Tommy's Portfolio"
    )


    db.session.add(portfolio1)
    db.session.add(portfolio2)
    db.session.add(portfolio3)
    db.session.add(portfolio4)
    db.session.add(portfolio5)
    db.session.add(portfolio6)
    db.session.commit()

# Removes all data from the portfolios table and resets IDs
def undo_portfolios():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.portfolios RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM portfolios"))

    db.session.commit()
