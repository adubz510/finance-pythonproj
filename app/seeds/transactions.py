from app.models import db, Transaction, environment, SCHEMA
from datetime import datetime
from sqlalchemy.sql import text

# Sample transaction data (3 transactions per portfolio with at least 2 different stocks)
transaction_data = [
    # Demo Portfolio (portfolio_id=1)
    {
        'transaction_type': 'buy',
        'quantity': 10,
        'price_per_stock': 195.30,  # AAPL
        'total_amount': 1953.00,  # 10 * 195.30
        'timestamp': datetime(2025, 4, 1, 14, 30, 0),
        'portfolio_id': 1,  # Demo Portfolio
        'stock_id': 1,  # AAPL
        'holding_id': 1  # Assuming holding with id 1 exists for AAPL
    },
    {
        'transaction_type': 'buy',
        'quantity': 5,
        'price_per_stock': 175.60,  # TSLA
        'total_amount': 878.00,  # 5 * 175.60
        'timestamp': datetime(2025, 4, 2, 9, 15, 0),
        'portfolio_id': 1,  # Demo Portfolio
        'stock_id': 5,  # TSLA
        'holding_id': 1  # Assuming holding with id 1 exists for AAPL
    },
    {
        'transaction_type': 'sell',
        'quantity': 3,
        'price_per_stock': 195.30,  # AAPL
        'total_amount': 585.90,  # 3 * 195.30
        'timestamp': datetime(2025, 4, 3, 11, 0, 0),
        'portfolio_id': 1,  # Demo Portfolio
        'stock_id': 1,  # AAPL
        'holding_id': 1  # Assuming holding with id 1 exists for AAPL
    },

    # Demo IRA (portfolio_id=2)
    {
        'transaction_type': 'buy',
        'quantity': 8,
        'price_per_stock': 138.75,  # GOOGL
        'total_amount': 1110.00,  # 8 * 138.75
        'timestamp': datetime(2025, 4, 4, 16, 0, 0),
        'portfolio_id': 2,  # Demo IRA
        'stock_id': 3,  # GOOGL
        'holding_id': 4  # Assuming holding with id 4 exists for GOOGL
    },
    {
        'transaction_type': 'sell',
        'quantity': 5,
        'price_per_stock': 138.75,  # GOOGL
        'total_amount': 693.75,  # 5 * 138.75
        'timestamp': datetime(2025, 4, 5, 9, 30, 0),
        'portfolio_id': 2,  # Demo IRA
        'stock_id': 3,  # GOOGL
        'holding_id': 4  # Assuming holding with id 4 exists for GOOGL
    },
    {
        'transaction_type': 'buy',
        'quantity': 10,
        'price_per_stock': 320.45,  # META
        'total_amount': 3204.50,  # 10 * 320.45
        'timestamp': datetime(2025, 4, 6, 13, 45, 0),
        'portfolio_id': 2,  # Demo IRA
        'stock_id': 6,  # META
        'holding_id': 6  # Assuming holding with id 6 exists for META
    },

    # Marnie's Portfolio (portfolio_id=3)
    {
        'transaction_type': 'buy',
        'quantity': 7,
        'price_per_stock': 320.45,  # META
        'total_amount': 2243.15,  # 7 * 320.45
        'timestamp': datetime(2025, 4, 7, 10, 30, 0),
        'portfolio_id': 3,  # Marnie's Portfolio
        'stock_id': 6,  # META
        'holding_id': 9  # Assuming holding with id 9 exists for META
    },
    {
        'transaction_type': 'sell',
        'quantity': 3,
        'price_per_stock': 138.75,  # GOOGL
        'total_amount': 416.25,  # 3 * 138.75
        'timestamp': datetime(2025, 4, 8, 14, 0, 0),
        'portfolio_id': 3,  # Marnie's Portfolio
        'stock_id': 3,  # GOOGL
        'holding_id': 10  # Assuming holding with id 10 exists for GOOGL
    },
    {
        'transaction_type': 'buy',
        'quantity': 4,
        'price_per_stock': 195.30,  # AAPL
        'total_amount': 781.20,  # 4 * 195.30
        'timestamp': datetime(2025, 4, 9, 11, 0, 0),
        'portfolio_id': 3,  # Marnie's Portfolio
        'stock_id': 1,  # AAPL
        'holding_id': 10  # Assuming holding with id 10 exists for AAPL
    }
]

# Adds demo transactions
def seed_transactions():
    transactions = [Transaction(**data) for data in transaction_data]
    db.session.add_all(transactions)
    db.session.commit()

# Removes all data from the transactions table and resets IDs
def undo_transactions():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.transactions RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM transactions"))

    db.session.commit()