import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts'; // Recharts for visualizing stock data

const StockDetailPage = () => {
  const { symbol } = useParams(); // Get stock symbol from the URL
  const [history, setHistory] = useState([]); // Store stock price history
  const [timeframe, setTimeframe] = useState('TIME_SERIES_DAILY'); // User-selected timeframe
  const [loading, setLoading] = useState(true); // Show loading spinner/message
  const [error, setError] = useState(null); // Capture API error messages

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
    <div style={{ padding: '20px' }}>
      <h1>Stock: {symbol.toUpperCase()}</h1>

      {/* Dropdown for selecting timeframe */}
      <div style={{ margin: '15px 0' }}>
        <label style={{ marginRight: '10px' }}>Timeframe:</label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="TIME_SERIES_DAILY">1D</option>
          <option value="TIME_SERIES_WEEKLY">1W</option>
          <option value="TIME_SERIES_MONTHLY">1M</option>
        </select>
      </div>

      {/* Show loading or error message */}
      {loading && <p>Loading stock data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* If data is loaded successfully, render a line chart */}
      {!loading && !error && history.length > 0 && (
        <div>
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
