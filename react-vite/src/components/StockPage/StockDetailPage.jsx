import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import '../styles/StockDetailPage.css';

const StockDetailPage = () => {
  const { symbol } = useParams(); // Extract symbol from URL
  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('TIME_SERIES_DAILY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [portfolios, setPortfolios] = useState([]); // All user portfolios
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null); // Selected portfolio
  const [quantity, setQuantity] = useState(1);
  const [holding, setHolding] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // ✅ Fetch user's portfolios
  useEffect(() => {
    fetch('/api/portfolios')
      .then((res) => res.json())
      .then((data) => {
        setPortfolios(data.portfolios || []);
        if (data.portfolios.length > 0) {
          setSelectedPortfolioId(data.portfolios[0].id); // Default to first one
        }
      });
  }, []);

  // ✅ Fetch stock history
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
        setError('Failed to fetch stock data.');
        setLoading(false);
      });
  }, [symbol, timeframe]);

  // ✅ Fetch current holding for this stock
  useEffect(() => {
    if (!selectedPortfolioId) return;
    fetch(`/api/portfolios/${selectedPortfolioId}/holdings/${symbol}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setHolding(data);
        else setHolding(null);
      });
  }, [symbol, selectedPortfolioId]);

  // ✅ Handle Buy Request
  const handleBuy = async () => {
    const res = await fetch(`/api/portfolios/${selectedPortfolioId}/holdings/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, quantity })
    });

    const data = await res.json();

    if (res.ok) {
      setPurchaseMessage(`✅ Purchased ${quantity} share(s) of ${symbol}`);
      setHolding(data.holding);
    } else {
      setPurchaseMessage(`❌ ${data.error}`);
    }

    setTimeout(() => setPurchaseMessage(''), 3000);
  };

  return (
    <div className="stock-detail-container">
      <h1 className="stock-detail-title">Stock: {symbol?.toUpperCase()}</h1>

      {/* 🔽 Timeframe Selector */}
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

      {/* 🔽 Portfolio Selector */}
      <div className="stock-detail-dropdown">
        <label htmlFor="portfolio-select">Select Portfolio:</label>
        <select
          id="portfolio-select"
          value={selectedPortfolioId || ''}
          onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
        >
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Balance: ${p.balance.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* 📊 Status Messages */}
      {loading && <p className="stock-detail-loading">Loading stock data...</p>}
      {error && <p className="stock-detail-error">{error}</p>}
      {purchaseMessage && (
        <p className="stock-detail-message">{purchaseMessage}</p>
      )}

      {/* 📉 Price + Change */}
      {!loading && !error && history.length > 1 && (
        <div className="stock-price-summary">
          <p className="current-price">
            Current Price: ${history[history.length - 1].close.toFixed(2)}
          </p>
          <p
            className="percent-change"
            style={{
              color:
                history[history.length - 1].close >
                history[history.length - 2].close
                  ? 'green'
                  : 'red'
            }}
          >
            Change:{' '}
            {(
              ((history[history.length - 1].close -
                history[history.length - 2].close) /
                history[history.length - 2].close) *
              100
            ).toFixed(2)}
            %
          </p>
        </div>
      )}

      {/* 🛒 Buy Section */}
      <div className="buy-section">
        <h3>Buy {symbol.toUpperCase()}</h3>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
        <button onClick={handleBuy}>Buy</button>
        {holding && (
          <p className="stock-detail-holding">
            You currently hold: {holding.quantity} shares
          </p>
        )}
      </div>

      {/* 📈 Price Chart */}
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
