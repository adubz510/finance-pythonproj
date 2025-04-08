from app.models import db, Holding, environment, SCHEMA
from sqlalchemy.sql import text


holding_data = [
    {'portfolio_id': 1, 'stock_name': 'AAPL', 'quantity': 10},
    {'portfolio_id': 1, 'stock_name': 'GOOGL', 'quantity': 5},
    {'portfolio_id': 1, 'stock_name': 'AMZN', 'quantity': 3},
    
    {'portfolio_id': 2, 'stock_name': 'TSLA', 'quantity': 12},
    {'portfolio_id': 2, 'stock_name': 'MSFT', 'quantity': 8},
    {'portfolio_id': 2, 'stock_name': 'META', 'quantity': 7},
    
    {'portfolio_id': 3, 'stock_name': 'NVDA', 'quantity': 6},
    {'portfolio_id': 3, 'stock_name': 'AAPL', 'quantity': 4},
    {'portfolio_id': 3, 'stock_name': 'MSFT', 'quantity': 9},
    
    {'portfolio_id': 4, 'stock_name': 'GOOGL', 'quantity': 15},
    {'portfolio_id': 4, 'stock_name': 'AMZN', 'quantity': 10},
    {'portfolio_id': 4, 'stock_name': 'TSLA', 'quantity': 2},
    
    {'portfolio_id': 5, 'stock_name': 'AAPL', 'quantity': 20},
    {'portfolio_id': 5, 'stock_name': 'GOOGL', 'quantity': 5},
    {'portfolio_id': 5, 'stock_name': 'META', 'quantity': 3},
    
    {'portfolio_id': 6, 'stock_name': 'MSFT', 'quantity': 30},
    {'portfolio_id': 6, 'stock_name': 'AMZN', 'quantity': 10},
    {'portfolio_id': 6, 'stock_name': 'TSLA', 'quantity': 8},
]

def seed_holdings():
    holdings = [Holding(**data) for data in holding_data]
    db.session.add_all(holdings)
    db.session.commit()

# Removes all data from the holdings table and resets IDs
def undo_holdings():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.holdings RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM holdings"))

    db.session.commit()