import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts'; // Recharts for visualizing stock data
import '../styles/StockDetailPage.css'; // Imported stylesheet for styling

const StockDetailPage = () => {
  const { symbol } = useParams(); // Get stock symbol from the URL
  const [history, setHistory] = useState([]); // Store stock price history
  const [timeframe, setTimeframe] = useState('TIME_SERIES_DAILY'); // User-selected timeframe
  const [loading, setLoading] = useState(true); // Show loading spinner/message
  const [error, setError] = useState(null); // Capture API error messages
  // const [stockSymbols, setStockSymbols] = useState([]); // (unused) potentially for future symbol list dropdown

  // Fetch stock price history when component mounts or timeframe changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks/${symbol}/history?timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setHistory([]);
        } else {
          setError(null);
          setHistory(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch stock data.");
        setLoading(false);
      });
  }, [symbol, timeframe]);

  return (
    <div className="stock-detail-container">
      {/* <h1>Stock: {stockSymbols.map((stock) => console.log(stock), stock.symbol)}</h1> */}
      <h1 className="stock-detail-title">Stock: {symbol?.toUpperCase()}</h1>

      {/* Dropdown for selecting timeframe */}
      <div className="stock-detail-dropdown">
        <label htmlFor="timeframe-select">Timeframe:</label>
        <select
          id="timeframe-select"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="TIME_SERIES_DAILY">1D</option>
          <option value="TIME_SERIES_WEEKLY">1W</option>
          <option value="TIME_SERIES_MONTHLY">1M</option>
        </select>
      </div>

      {/* Show loading or error message */}
      {loading && <p className="stock-detail-loading">Loading stock data...</p>}
      {error && <p className="stock-detail-error">{error}</p>}

      {/* Show current price and percent change only when history has enough data */}
      {!loading && !error && history.length > 1 && (
        <div className="stock-price-summary">
          {/* Display the most recent close price (i.e., current price) */}
          <p className="current-price">
            Current Price: ${history[history.length - 1].close.toFixed(2)}
          </p>

          {/* Display % change from previous close to latest close, color-coded */}
          <p
            className="percent-change"
            style={{
              color:
                history[history.length - 1].close > history[history.length - 2].close
                  ? 'green'
                  : 'red'
            }}
          >
            Change: {(
              ((history[history.length - 1].close - history[history.length - 2].close) /
                history[history.length - 2].close) *
              100
            ).toFixed(2)}%
          </p>
        </div>
      )}

      {/* If data is loaded successfully, render a line chart */}
      {!loading && !error && history.length > 0 && (
        <div className="chart-section">
          <h3>Price Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <XAxis dataKey="date" />
              <YAxis dataKey="close" domain={['auto', 'auto']} />
              <Tooltip />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#6c63ff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
