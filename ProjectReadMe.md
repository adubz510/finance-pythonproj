# Webull

## Live Site
_Not yet deployed_

## Backend Repository
[_This repository includes both frontend and backend code._](https://github.com/adubz510/finance-pythonproj/tree/dev-full-features)

## Summary

This is a full-stack clone of Webull, a commission-free stock trading platform. The project simulates core features such as viewing stocks, managing portfolios, buying and selling shares, and tracking stock performance via charts. It also integrates Alpha Vantage API to fetch real-time stock data, allowing users to monitor price changes, search for stocks, and build watchlists. Modals are used throughout for seamless user experience in creating portfolios, buying stocks, and managing balances.

---

## 🖼 Screenshots

| Feature | Screenshot |
|--------|------------|
| Signup Page | ![Signup Page](https://i.imgur.com/FYgxVd9.png) |
| Login Page | ![Login Page](https://i.imgur.com/ax9uYoF.png) |
| Logged Out Homepage | ![Logged Out Homepage](https://i.imgur.com/VopXh6n.png) |
| Logged In Homepage | ![Logged In Homepage](https://i.imgur.com/Jx1axCF.png) |
| Stock Cards Page | ![Stock Card Page](https://i.imgur.com/mPERfFs.png) |
| Stock Detail Page | ![Stock Detail Page](https://i.imgur.com/NGWGma3.png) |
| Portfolio Page | ![Portfolio Page](https://i.imgur.com/Q9HBdDP.png) |
| Portfolio Details Page | ![Portfolio Details Page](https://i.imgur.com/nK8XayK.png) |
| Watchlist Page | ![Watchlist Page](https://i.imgur.com/uKx1giH.png) |

---

## 🔧 Features

- Fully functional stock buying and selling
- Alpha Vantage API for stock data & charting
- Interactive portfolio management with live balance updates
- Add and remove stocks from a watchlist
- Dynamic search with routing
- Real-time price chart with different timeframes
- Modal integration for purchase, creation, and fund transfers

---

## ⚙️ Technologies Used

- **Frontend**: React + Vite, Recharts (for graphs), HTML5, CSS3
- **Backend**: Python, Flask, SQLAlchemy, Flask-Login
- **Database**: PostgreSQL (production), SQLite (development)
- **API**: [Alpha Vantage API](https://www.alphavantage.co)
- **Authentication**: Flask-Login session management

---

## 📁 Redux Store Shape

```js
{
  session: {
    user: {
      id,
      username,
      email,
      total_balance
    }
  },
  portfolio: {
    portfolios: [
      {
        id,
        name,
        balance,
        holdings: [
          {
            id,
            stock_id,
            quantity
          }
        ]
      }
    ],
    transactions: [],
    watchlist: {
      stocks: [
        {
          id,
          name,
          symbol,
          current_price
        }
      ]
    },
    loading: false,
    error: null
  },
  user: {
    balance: number
  }
}

```

---

## 📂 API Routes

### Auth
- `GET /api/auth/` — restore session
- `POST /api/auth/login` — login
- `POST /api/auth/signup` — signup
- `POST /api/auth/logout` — logout

### Users
- `GET /api/users/:id` — get user data

### Stocks
- `GET /api/stocks/` — all stocks
- `GET /api/stocks/:symbol` — get stock by symbol
- `GET /api/stocks/:symbol/history?timeframe=` — get historical chart data
- `GET /api/stocks/:symbol/info` — full stock info

### Portfolio
- `GET /api/portfolios/` — get all portfolios for user
- `POST /api/portfolios/` — create new portfolio
- `PUT /api/portfolios/balance` — add money to portfolio
- `DELETE /api/portfolios/:id` — delete portfolio

### Holdings
- `POST /api/holdings/buy` — buy a stock
- `PATCH /api/holdings/:id/sell` — sell a stock
- `GET /api/holdings/:symbol` — get a user's holding for symbol

### Watchlist
- `GET /api/watchlist` — get current user's watchlist
- `POST /api/watchlist` — add stock to watchlist
- `DELETE /api/watchlist/:stock_id` — remove from watchlist
- `GET /api/watchlist/lookup/:symbol` — get stock by symbol

---

## 🎨 Frontend Routes

- `/` — Home page (logged out & logged in views)
- `/login` — Login form modal
- `/signup` — Signup form modal
- `/stocks` — List all stocks
- `/stocks/:symbol` — Stock detail view with chart
- `/portfolio` — User’s list of portfolios
- `/portfolios/:id` — Portfolio detail page
- `/watchlist` — User’s watchlist page

---

## 🧠 Technical Highlights

- Custom toast system for feedback (watchlist, purchases)
- Alpha Vantage integration with dynamic timeframe support
- Efficient stock data caching through backend schema
- Responsive charts using Recharts
- Defensive error handling on backend and modals
- Redux integration to persist authentication & user state

---

## 🗃 Database Schema

- **User**: id, username, email, hashed_password, total_balance
- **Stock**: id, symbol, name, current_price
- **Portfolio**: id, user_id, name, balance
- **Holding**: id, portfolio_id, stock_id, quantity
- **Watchlist**: id, user_id
- **WatchlistStock**: id, watchlist_id, stock_id
- **StockHistory**: id, stock_id, date, close_price

![Database Schema Diagram](https://i.imgur.com/FZJF4VT.png)


---

## 🔮 Future Features

- Real-time WebSocket price updates
- Transaction history logs
- Sorting/filtering for stocks
- Improved search autocomplete
- Portfolio performance graph

---

## 🛠 Installation & Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd webull-clone
```

2. Backend setup:
```bash
pipenv install
pipenv shell
flask db upgrade
flask seed all
flask run
```

3. Frontend setup:
```bash
cd react-vite
npm install
npm run build
```

---

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co) for providing free stock market data
- [Recharts](https://recharts.org/) for charting utilities
- AA curriculum for full-stack development structure and best practices

---
