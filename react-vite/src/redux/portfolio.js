import { thunkFetchUserBalance } from "./user";

// Action Types
const SET_PORTFOLIOS = "portfolio/setPortfolios";
const ADD_PORTFOLIO = "portfolio/addPortfolio";
const REMOVE_PORTFOLIO = "portfolio/removePortfolio";
const ADD_MONEY = "portfolio/addMoney";
const ADD_STOCK = "portfolio/addStock";
const REMOVE_STOCK = "portfolio/removeStock";
const SET_TRANSACTIONS = "portfolio/setTransactions";
const SET_WATCHLIST = "portfolio/setWatchlist";
const SET_LOADING = "portfolio/setLoading";
const SET_ERROR = "portfolio/setError";

// Action Creators
const setPortfolios = (portfolios) => ({ type: SET_PORTFOLIOS, payload: portfolios });
const addPortfolio = (portfolio) => ({ type: ADD_PORTFOLIO, payload: portfolio });
const removePortfolio = (portfolioId) => ({ type: REMOVE_PORTFOLIO, payload: portfolioId });

const addMoney = (amount, portfolioId) => ({
  type: ADD_MONEY,
  payload: { amount, portfolioId },
});

const addStock = (stock, quantity) => ({
  type: ADD_STOCK,
  stock,
  quantity,
});

const removeStock = (stockId, portfolioId) => ({
  type: REMOVE_STOCK,
  stockId,
  portfolioId,
});

const setTransactions = (transactions) => ({
  type: SET_TRANSACTIONS,
  transactions,
});

const setWatchlist = (watchlist) => ({
  type: SET_WATCHLIST,
  watchlist,
});


const setLoading = (loading) => ({ type: SET_LOADING, loading });
const setError = (error) => ({ type: SET_ERROR, error });

// Thunks
export const thunkFetchPortfolio = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch("/api/portfolios/");
    if (res.ok) {
      const data = await res.json();
      dispatch(setPortfolios(data.portfolios));
    } else throw new Error("Failed to fetch portfolios");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkCreatePortfolio = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch("/api/portfolios/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(addPortfolio(data.portfolio)); // appending instead of overwriting
    } else throw new Error("Failed to create portfolio");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkUpdateBalance = (portfolioId, amount, closeModal) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch(`/api/portfolios/${portfolioId}/balance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(addMoney(amount, portfolioId));
      closeModal();
    } else throw new Error("Failed to update balance");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkDeletePortfolio = (portfolioId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch(`/api/portfolios/delete?portfolio_id=${portfolioId}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      dispatch(removePortfolio(portfolioId));
      dispatch(thunkFetchUserBalance());
    } else throw new Error("Failed to delete portfolio");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkAddStockToPortfolio = (portfolioId, stock, quantity) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch(`/api/portfolios/stocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolio_id: portfolioId, stock, quantity }),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(addStock(data.stock, data.quantity));
    } else throw new Error("Failed to add stock");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkRemoveStockFromPortfolio = (stockId, portfolioId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch(`/api/portfolios/stocks/${stockId}`, { method: "DELETE" });
    if (res.ok) {
      dispatch(removeStock(stockId, portfolioId));
    } else throw new Error("Failed to remove stock");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkFetchTransactions = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch("/api/transactions");
    if (res.ok) {
      const transactions = await res.json();
      dispatch(setTransactions(transactions));
    } else throw new Error("Failed to fetch transactions");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkFetchWatchlist = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch("/api/watchlist");
    if (res.ok) {
      const watchlist = await res.json();
      dispatch(setWatchlist(watchlist));
    } else throw new Error("Failed to fetch watchlist");
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Reducer
const initialState = {
  portfolios: [],
  transactions: [],
  watchlist: [],
  loading: false,
  error: null,
};

function portfolioReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PORTFOLIOS:
      return { ...state, portfolios: action.payload };

    case ADD_PORTFOLIO:
      return { ...state, portfolios: [...state.portfolios, action.payload] };

    case REMOVE_PORTFOLIO:
      return {
        ...state,
        portfolios: state.portfolios.filter((p) => p.id !== action.payload),
      };

    case ADD_MONEY:
      return {
        ...state,
        portfolios: state.portfolios.map((p) =>
          p.id === action.payload.portfolioId
            ? { ...p, balance: p.balance + action.payload.amount }
            : p
        ),
      };

    case ADD_STOCK:
      return {
        ...state,
        portfolios: state.portfolios.map((p) =>
          p.id === action.stock.portfolioId
            ? {
                ...p,
                holdings: [...(p.holdings || []), { ...action.stock, quantity: action.quantity }],
              }
            : p
        ),
      };

    case REMOVE_STOCK:
      return {
        ...state,
        portfolios: state.portfolios.map((p) =>
          p.id === action.portfolioId
            ? {
                ...p,
                holdings: p.holdings?.filter((stock) => stock.id !== action.stockId) || [],
              }
            : p
        ),
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