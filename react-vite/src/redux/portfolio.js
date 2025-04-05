const SET_PORTFOLIO = "portfolio/setPortfolio";
const REMOVE_PORTFOLIO = "portfolio/removePortfolio";
const ADD_MONEY = "portfolio/addMoney";
const ADD_STOCK = "portfolio/addStock";
const REMOVE_STOCK = "portfolio/removeStock";
const SET_TRANSACTIONS = "portfolio/setTransactions";
const SET_WATCHLIST = "portfolio/setWatchlist";

// Action Creators
const setPortfolio = (portfolio) => ({
  type: SET_PORTFOLIO,
  payload: portfolio,
});

const removePortfolio = () => ({
  type: REMOVE_PORTFOLIO,
});

const addMoney = (amount) => ({
  type: ADD_MONEY,
  amount,
});

const addStock = (stock, quantity) => ({
  type: ADD_STOCK,
  stock,
  quantity,
});

const removeStock = (stockId) => ({
  type: REMOVE_STOCK,
  stockId,
});

const setTransactions = (transactions) => ({
  type: SET_TRANSACTIONS,
  transactions,
});

const setWatchlist = (watchlist) => ({
  type: SET_WATCHLIST,
  watchlist,
});

// Thunks
export const thunkFetchPortfolio = () => async (dispatch) => {
  const res = await fetch("/api/portfolios/");
  if (res.ok) {
    const data = await res.json();
    dispatch(setPortfolio(data.portfolio));
  }
};

export const thunkCreatePortfolio = () => async (dispatch) => {
  const res = await fetch("/api/portfolios/", { method: "POST" });
  if (res.ok) {
    const data = await res.json();
    dispatch(setPortfolio(data.portfolio));
  }
};

export const thunkUpdateBalance = (amount) => async (dispatch) => {
  const res = await fetch("/api/portfolios/balance", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(addMoney(amount)); // Updating the balance in Redux state
  }
};

export const thunkDeletePortfolio = () => async (dispatch) => {
  const res = await fetch("/api/portfolios/", { method: "DELETE" });
  if (res.ok) {
    dispatch(removePortfolio());
  }
};

// Adding/removing stocks in the portfolio
export const thunkAddStockToPortfolio = (stock, quantity) => async (dispatch) => {
  const res = await fetch(`/api/portfolios/stocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock, quantity }),
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(addStock(data.stock, data.quantity));
  }
};

export const thunkRemoveStockFromPortfolio = (stockId) => async (dispatch) => {
  const res = await fetch(`/api/portfolios/stocks/${stockId}`, { method: "DELETE" });
  if (res.ok) {
    dispatch(removeStock(stockId));
  }
};

// Fetch transactions for the portfolio
export const thunkFetchTransactions = () => async (dispatch) => {
  const res = await fetch("/api/transactions");
  if (res.ok) {
    const transactions = await res.json();
    dispatch(setTransactions(transactions));
  }
};

// Fetch user's watchlist
export const thunkFetchWatchlist = () => async (dispatch) => {
  const res = await fetch("/api/watchlist");
  if (res.ok) {
    const watchlist = await res.json();
    dispatch(setWatchlist(watchlist));
  }
};

// Reducer
const initialState = { 
  portfolio: null,
  transactions: [],
  watchlist: []
};

function portfolioReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PORTFOLIO:
      return { ...state, portfolio: action.payload };
    case REMOVE_PORTFOLIO:
      return { ...state, portfolio: null };
    case ADD_MONEY:
      return { ...state, portfolio: { ...state.portfolio, balance: state.portfolio.balance + action.amount } };
    case ADD_STOCK:
      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          holdings: [
            ...state.portfolio.holdings,
            { ...action.stock, quantity: action.quantity },
          ],
        },
      };
    case REMOVE_STOCK:
      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          holdings: state.portfolio.holdings.filter((stock) => stock.id !== action.stockId),
        },
      };
    case SET_TRANSACTIONS:
      return { ...state, transactions: action.transactions };
    case SET_WATCHLIST:
      return { ...state, watchlist: action.watchlist };
    default:
      return state;
  }
}

export default portfolioReducer;