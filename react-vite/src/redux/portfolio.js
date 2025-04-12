const SET_PORTFOLIO = "portfolio/setPortfolio";
const REMOVE_PORTFOLIO = "portfolio/removePortfolio";
const ADD_MONEY = "portfolio/addMoney";
const ADD_STOCK = "portfolio/addStock";
const REMOVE_STOCK = "portfolio/removeStock";
const SET_TRANSACTIONS = "portfolio/setTransactions";
const SET_WATCHLIST = "portfolio/setWatchlist";
const SET_LOADING = "portfolio/setLoading"; // New action type for loading state
const SET_ERROR = "portfolio/setError"; // New action type for errors

// Action Creators
const setPortfolio = (portfolio) => ({
  type: SET_PORTFOLIO,
  payload: portfolio,
});

const removePortfolio = (portfolioId) => ({
  type: REMOVE_PORTFOLIO,
  payload: portfolioId
});

const addMoney = (amount, portfolioId) => ({
  type: ADD_MONEY,
  amount,
  portfolioId
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

const setLoading = (loading) => ({
  type: SET_LOADING,
  loading,
});

const setError = (error) => ({
  type: SET_ERROR,
  error,
});

// Thunks
export const thunkFetchPortfolio = () => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch("/api/portfolios/");
    if (res.ok) {
      const data = await res.json();
      dispatch(setPortfolio(data.portfolios));
    } else {
        throw new Error("Failed to fetch portfolio");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

export const thunkCreatePortfolio = (data) => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch("/api/portfolios/", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(setPortfolio(data.portfolio));
    } else {
        throw new Error("Failed to create portfolio");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

export const thunkUpdateBalance = (portfolioId, amount, closeModal) => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch(`/api/portfolios/${portfolioId}/balance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(addMoney(data.portfolio.balance, portfolioId)); // Updating the balance in Redux state
      closeModal();
    } else {
        throw new Error("Failed to update balance");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

export const thunkDeletePortfolio = (portfolioId) => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch(`/api/portfolios/${portfolioId}`, { method: "DELETE" });
    if (res.ok) {
      dispatch(removePortfolio(portfolioId));
    } else {
      throw new Error("Failed to delete portfolio");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

// Adding/removing stocks in the portfolio
export const thunkAddStockToPortfolio = (stock, quantity) => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch(`/api/portfolios/stocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock, quantity }),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(addStock(data.stock, data.quantity));
    } else {
      throw new Error("Failed to add stock");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

export const thunkRemoveStockFromPortfolio = (stockId) => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch(`/api/portfolios/stocks/${stockId}`, { method: "DELETE" });
    if (res.ok) {
      dispatch(removeStock(stockId));
    } else {
      throw new Error("Failed to remove stock");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

// Fetch transactions for the portfolio
export const thunkFetchTransactions = () => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch("/api/transactions");
    if (res.ok) {
      const transactions = await res.json();
      dispatch(setTransactions(transactions));
    } else {
      throw new Error("Failed to fetch transactions");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

// Fetch user's watchlist
export const thunkFetchWatchlist = () => async (dispatch) => {
  dispatch(setLoading(true)); // Start loading
  try {
    const res = await fetch("/api/watchlist");
    if (res.ok) {
      const watchlist = await res.json();
      dispatch(setWatchlist(watchlist));
    } else {
      throw new Error("Failed to fetch watchlist");
    }
  } catch (error) {
        dispatch(setError(error.message));
  } finally {
        dispatch(setLoading(false)); // Stop loading
  }
};

// Reducer
const initialState = { 
  portfolio: [],
  transactions: [],
  watchlist: [],
  loading: false,
  error: null
};

function portfolioReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PORTFOLIO:
        if (Array.isArray(action.payload)) {
            return { ...state, portfolio: action.payload };
        } else {
            return {
                ...state,
                portfolio: [...(state.portfolio || []), action.payload],
                };
        }
    case REMOVE_PORTFOLIO:
      return { 
        ...state, 
        portfolio: state.portfolio.filter((p) => p.id !== action.payload) 
      };
    case ADD_MONEY:
      return { 
        ...state, 
        portfolio: state.portfolio.map((p) =>
            p.id === action.payload.id
              ? { ...p, balance: p.balance + action.amount }
              : p
          ),
        };
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
    case SET_LOADING:
      return { ...state, loading: action.loading };
    case SET_ERROR:
      return { ...state, error: action.error };
    default:
      return state;
  }
}

export default portfolioReducer;