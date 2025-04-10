from app.models import db, Watchlist, WatchlistStock, environment, SCHEMA
from sqlalchemy.sql import text

def seed_watchlists():
    # Create 3 watchlists (1 per user)
    watchlist1 = Watchlist(user_id=1, name="Tech Watch")
    watchlist2 = Watchlist(user_id=2, name="Growth Picks")
    watchlist3 = Watchlist(user_id=3, name="Safe Bets")

    db.session.add_all([watchlist1, watchlist2, watchlist3])
    db.session.flush()  # Flush to get the watchlist IDs

    # Add stocks to each watchlist via WatchlistStock
    watchlist_stocks = [
        # User 1's Watchlist
        WatchlistStock(watchlist_id=watchlist1.id, stock_id=1),  # AAPL
        WatchlistStock(watchlist_id=watchlist1.id, stock_id=2),  # MSFT
        WatchlistStock(watchlist_id=watchlist1.id, stock_id=3),  # GOOGL

        # User 2's Watchlist
        WatchlistStock(watchlist_id=watchlist2.id, stock_id=4),  # AMZN
        WatchlistStock(watchlist_id=watchlist2.id, stock_id=5),  # TSLA

        # User 3's Watchlist
        WatchlistStock(watchlist_id=watchlist3.id, stock_id=1),  # AAPL
        WatchlistStock(watchlist_id=watchlist3.id, stock_id=6),  # META
        WatchlistStock(watchlist_id=watchlist3.id, stock_id=7),  # NVDA
    ]

    db.session.add_all(watchlist_stocks)
    db.session.commit()

def undo_watchlists():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.watchlist_stocks RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.watchlists RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM watchlist_stocks"))
        db.session.execute(text("DELETE FROM watchlists"))
    db.session.commit()
