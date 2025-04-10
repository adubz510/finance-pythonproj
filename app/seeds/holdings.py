# from app.models import db, Holding, environment, SCHEMA
# from sqlalchemy.sql import text


# holding_data = [
#     {'portfolio_id': 1, 'stock_symbol': 'AAPL', 'quantity': 10},
#     {'portfolio_id': 1, 'stock_symbol': 'GOOGL', 'quantity': 5},
#     {'portfolio_id': 1, 'stock_symbol': 'AMZN', 'quantity': 3},
    
#     {'portfolio_id': 2, 'stock_symbol': 'TSLA', 'quantity': 12},
#     {'portfolio_id': 2, 'stock_symbol': 'MSFT', 'quantity': 8},
#     {'portfolio_id': 2, 'stock_symbol': 'META', 'quantity': 7},
    
#     {'portfolio_id': 3, 'stock_symbol': 'NVDA', 'quantity': 6},
#     {'portfolio_id': 3, 'stock_symbol': 'AAPL', 'quantity': 4},
#     {'portfolio_id': 3, 'stock_symbol': 'MSFT', 'quantity': 9},
    
#     {'portfolio_id': 4, 'stock_symbol': 'GOOGL', 'quantity': 15},
#     {'portfolio_id': 4, 'stock_symbol': 'AMZN', 'quantity': 10},
#     {'portfolio_id': 4, 'stock_symbol': 'TSLA', 'quantity': 2},
    
#     {'portfolio_id': 5, 'stock_symbol': 'AAPL', 'quantity': 20},
#     {'portfolio_id': 5, 'stock_symbol': 'GOOGL', 'quantity': 5},
#     {'portfolio_id': 5, 'stock_symbol': 'META', 'quantity': 3},
    
#     {'portfolio_id': 6, 'stock_symbol': 'MSFT', 'quantity': 30},
#     {'portfolio_id': 6, 'stock_symbol': 'AMZN', 'quantity': 10},
#     {'portfolio_id': 6, 'stock_symbol': 'TSLA', 'quantity': 8},
# ]

# def seed_holdings():
#     holdings = [Holding(**data) for data in holding_data]
#     db.session.add_all(holdings)
#     db.session.commit()

# # Removes all data from the holdings table and resets IDs
# def undo_holdings():
#     if environment == "production":
#         db.session.execute(f"TRUNCATE table {SCHEMA}.holdings RESTART IDENTITY CASCADE;")
#     else:
#         db.session.execute(text("DELETE FROM holdings"))

#     db.session.commit()

from app.models import db, Holding, Stock, environment, SCHEMA
from sqlalchemy.sql import text

holding_data = [
    {'portfolio_id': 1, 'stock_symbol': 'AAPL', 'quantity': 10},
    {'portfolio_id': 1, 'stock_symbol': 'GOOGL', 'quantity': 5},
    {'portfolio_id': 1, 'stock_symbol': 'AMZN', 'quantity': 3},
    
    {'portfolio_id': 2, 'stock_symbol': 'TSLA', 'quantity': 12},
    {'portfolio_id': 2, 'stock_symbol': 'MSFT', 'quantity': 8},
    {'portfolio_id': 2, 'stock_symbol': 'META', 'quantity': 7},
    
    {'portfolio_id': 3, 'stock_symbol': 'NVDA', 'quantity': 6},
    {'portfolio_id': 3, 'stock_symbol': 'AAPL', 'quantity': 4},
    {'portfolio_id': 3, 'stock_symbol': 'MSFT', 'quantity': 9},
    
    {'portfolio_id': 4, 'stock_symbol': 'GOOGL', 'quantity': 15},
    {'portfolio_id': 4, 'stock_symbol': 'AMZN', 'quantity': 10},
    {'portfolio_id': 4, 'stock_symbol': 'TSLA', 'quantity': 2},
    
    {'portfolio_id': 5, 'stock_symbol': 'AAPL', 'quantity': 20},
    {'portfolio_id': 5, 'stock_symbol': 'GOOGL', 'quantity': 5},
    {'portfolio_id': 5, 'stock_symbol': 'META', 'quantity': 3},
    
    {'portfolio_id': 6, 'stock_symbol': 'MSFT', 'quantity': 30},
    {'portfolio_id': 6, 'stock_symbol': 'AMZN', 'quantity': 10},
    {'portfolio_id': 6, 'stock_symbol': 'TSLA', 'quantity': 8},
]

def seed_holdings():
    holdings = []
    for data in holding_data:
        stock = Stock.query.filter_by(symbol=data['stock_symbol']).first()
        if stock:
            holding = Holding(
                portfolio_id=data['portfolio_id'],
                stock_symbol=data['stock_symbol'],
                stock_id=stock.id,
                quantity=data['quantity']
            )
            holdings.append(holding)

    if holdings:
        db.session.add_all(holdings)
        db.session.commit()
    else:
        print("No Holdings were added")
        
def undo_holdings():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.holdings RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM holdings"))

    db.session.commit()