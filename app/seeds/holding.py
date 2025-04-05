from app.models import db, Holding, environment, SCHEMA
from sqlalchemy.sql import text

# Example seed data: Three holdings for each portfolio
holding_data = [
    {'portfolio_id': 1, 'stock_name': 'APL', 'quantity': 10},
    {'portfolio_id': 1, 'stock_name': 'GOGL', 'quantity': 5},
    {'portfolio_id': 1, 'stock_name': 'AMZ', 'quantity': 3},
    
    {'portfolio_id': 2, 'stock_name': 'TSL', 'quantity': 12},
    {'portfolio_id': 2, 'stock_name': 'MSF', 'quantity': 8},
    {'portfolio_id': 2, 'stock_name': 'NFX', 'quantity': 7},
    
    {'portfolio_id': 3, 'stock_name': 'NVD', 'quantity': 6},
    {'portfolio_id': 3, 'stock_name': 'MET', 'quantity': 4},
    {'portfolio_id': 3, 'stock_name': 'INT', 'quantity': 9},
    
    {'portfolio_id': 4, 'stock_name': 'DIS', 'quantity': 15},
    {'portfolio_id': 4, 'stock_name': 'BABA', 'quantity': 10},
    {'portfolio_id': 4, 'stock_name': 'PYPL', 'quantity': 2},
    
    {'portfolio_id': 5, 'stock_name': 'AMD', 'quantity': 20},
    {'portfolio_id': 5, 'stock_name': 'CRM', 'quantity': 5},
    {'portfolio_id': 5, 'stock_name': 'GS', 'quantity': 3},
    
    {'portfolio_id': 6, 'stock_name': 'SPY', 'quantity': 30},
    {'portfolio_id': 6, 'stock_name': 'QQQ', 'quantity': 10},
    {'portfolio_id': 6, 'stock_name': 'IWM', 'quantity': 8},
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