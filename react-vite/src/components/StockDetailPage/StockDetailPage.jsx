// ...imports
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area
} from 'recharts';
import BuyModal from '../BuyModal/BuyModal';
import './StockDetailPage.css';

const StockDetailPage = () => {
  const { symbol } = useParams();
  const sessionUser = useSelector((state) => state.session.user);

  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('TIME_SERIES_DAILY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);

  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [holding, setHolding] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch(`/api/stocks/${symbol}/info`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStockInfo(data);
      });
  }, [symbol]);

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
          setHistory([...data].reverse()); // ✅ Reverse so oldest → newest
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

  const handleAddToWatchlist = async () => {
    const resInfo = await fetch(`/api/stocks/${symbol}`);
    const stock = await resInfo.json();

    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_id: stock.id })
    });

    const data = await res.json();

    if (res.ok) {
      alert(`✅ ${symbol.toUpperCase()} added to your watchlist`);
      navigate('/watchlist');
    } else {
      alert(`❌ ${data.error || data.message}`);
    }
  };

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
      setShowToast(true);

      const updated = await fetch('/api/portfolios');
      const updatedData = await updated.json();
      if (updatedData.portfolios) setPortfolios(updatedData.portfolios);

      const userRes = await fetch('/api/auth/');
      const userData = await userRes.json();
      if (userData && userData.id) setUser(userData);
    } else {
      setPurchaseMessage(`❌ ${data.error}`);
    }

    setTimeout(() => setPurchaseMessage(''), 3000);
    setTimeout(() => setShowToast(false), 3000);
    setShowModal(false);
  };

  const latestPrice = history.length > 0 ? history[history.length - 1].close.toFixed(2) : null;
  const prevPrice = history.length > 1 ? history[history.length - 2].close : null;
  const percentChange = prevPrice ? (((history[history.length - 1].close - prevPrice) / prevPrice) * 100).toFixed(2) : null;

  return (

    <div className="stock-detail-container">
<h1 className="stock-detail-title">
  {stockInfo?.name || `Stock: ${symbol?.toUpperCase()}`}
</h1>

      {user && (
        <p className="account-balance">
          Account Balance: ${user.total_balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
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
      {purchaseMessage && <p className="stock-detail-message">{purchaseMessage}</p>}

      {sessionUser ? (
        <div className="buy-section">
          <h1 className="buy-section-symbol">{symbol.toUpperCase()}</h1>
          <button onClick={() => setShowModal(true)}>Buy Stock</button>
          <button onClick={handleAddToWatchlist} className="watchlist-button">Add to Watchlist</button>
          {holding && (
            <p className="stock-detail-holding">
              You currently hold: {holding.quantity} shares
            </p>



          )}
           <p className="current-price">Current Price: ${latestPrice}</p>
          <p
            className="percent-change"
            style={{
              color: percentChange > 0 ? '#bbf7d0' : 'red'
            }}
          >
            Change: {percentChange}%
          </p>
        </div>
      ) : (
        <p style={{ marginTop: '2rem', fontStyle: 'italic', color: 'white' }}>
          Please log in to buy this stock or manage your portfolio.
        </p>
      )}

      {!loading && !error && history.length > 1 && (
        <div className="stock-price-summary below-buy-section">
          {/* <p className="current-price">Current Price: ${latestPrice}</p>
          <p
            className="percent-change"
            style={{
              color: percentChange > 0 ? '#bbf7d0' : 'red'
            }}
          >
            Change: {percentChange}%
          </p> */}
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="chart-section">
          <div className="chart-header">
            <h1>Price Chart</h1>
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
  <LineChart
    data={history}
    margin={{ top: 10, right: 20, bottom: 30, left: 50 }}
  >
    {/* Gradient definition */}
    <defs>
      <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
      </linearGradient>
    </defs>

    <XAxis
      dataKey="date"
      interval="preserveStartEnd"
      tick={{ fontSize: 12 }}
      tickFormatter={(date) => {
        const d = new Date(date);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      }}
      angle={-45}
      textAnchor="end"
    />
    <YAxis dataKey="close" domain={['auto', 'auto']} orientation="right" />
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    <Tooltip />

    {/* This renders the filled area under the line */}
    <Area
      type="monotone"
      dataKey="close"
      stroke="none"
      fill="url(#colorClose)"
    />

    {/* This is the visible line on top of the area */}
    <Line
      type="monotone"
      dataKey="close"
      stroke="#6c63ff"
      strokeWidth={2}
      dot={false}
    />
  </LineChart>
</ResponsiveContainer>
</div>

        </div>
      )}

      {showModal && (
        <BuyModal
          symbol={symbol}
          quantity={quantity}
          setQuantity={setQuantity}
          onClose={() => setShowModal(false)}
          onBuy={handleBuy}
          portfolioId={selectedPortfolioId}
        />
      )}

      {showToast && (
        <div className="toast-message">
          ✅ Purchase Successful!
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
