import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import './StockDetailPage.css';

const StockDetailPage = () => {
  const { symbol } = useParams();
  const sessionUser = useSelector((state) => state.session.user);

  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('TIME_SERIES_DAILY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [holding, setHolding] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setUser(data);
      });
  }, []);

  useEffect(() => {
    fetch('/api/portfolios')
      .then(res => res.json())
      .then(data => {
        const fetched = data.portfolios || [];
        setPortfolios(fetched);
        if (fetched.length > 0) {
          setSelectedPortfolioId(fetched[0].id);
        }
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks/${symbol}/history?timeframe=${timeframe}`)
      .then(res => res.json())
      .then(data => {
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

  useEffect(() => {
    if (!selectedPortfolioId) return;
    fetch(`/api/holdings/${symbol}?portfolio_id=${selectedPortfolioId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setHolding(data || null);
      });
  }, [symbol, selectedPortfolioId]);

  const handleBuy = async () => {
    const res = await fetch(`/api/holdings/buy?portfolio_id=${selectedPortfolioId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, quantity })
    });

    const data = await res.json();

    if (res.ok) {
      setPurchaseMessage(`✅ Purchased ${quantity} share(s) of ${symbol}`);
      setHolding(data.holding);

      const updated = await fetch('/api/portfolios');
      const updatedData = await updated.json();
      if (updatedData.portfolios) {
        setPortfolios(updatedData.portfolios);
      }
    } else {
      setPurchaseMessage(`❌ ${data.error}`);
    }

    setTimeout(() => setPurchaseMessage(''), 3000);
  };

  return (
    <div className="stock-detail-container">
      <h1 className="stock-detail-title">Stock: {symbol?.toUpperCase()}</h1>

      {user && (
        <p className="account-balance">
          Account Balance: ${user.total_balance.toFixed(2)}
        </p>
      )}

      {sessionUser && (
        <div className="stock-detail-dropdown">
          <label htmlFor="portfolio-select">Select Portfolio:</label>
          <select
            id="portfolio-select"
            value={selectedPortfolioId || ''}
            onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
          >
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="stock-detail-loading">Loading stock data...</p>}
      {error && <p className="stock-detail-error">{error}</p>}
      {purchaseMessage && (
        <p className="stock-detail-message">{purchaseMessage}</p>
      )}

      {sessionUser ? (
        <div className="buy-section">
          <h1>{symbol.toUpperCase()}</h1>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
          <button
            onClick={handleBuy}
            disabled={!selectedPortfolioId || quantity <= 0}
          >
            Buy
          </button>
          {holding && (
            <p className="stock-detail-holding">
              You currently hold: {holding.quantity} shares
            </p>
          )}
        </div>
      ) : (
        <p style={{ marginTop: '2rem', fontStyle: 'italic', color: 'white' }}>
          Please log in to buy this stock or manage your portfolio.
        </p>
      )}

      {/* 📉 Price + Change - now moved BELOW the buy section */}
      {!loading && !error && history.length > 1 && (
        <div className="stock-price-summary below-buy-section">
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

      {!loading && !error && history.length > 0 && (
        <div className="chart-section">
          <div className="chart-header">
            <h3>Price Chart</h3>
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
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
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
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
