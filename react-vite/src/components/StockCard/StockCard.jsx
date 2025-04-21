import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockCard.css';

const StockCard = ({ stock }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [latestPrice, setLatestPrice] = useState(stock.current_price);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeframe = "TIME_SERIES_DAILY"; // default timeframe

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks/${stock.symbol}/history?timeframe=${timeframe}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setHistory([]);
        } else {
          setError(null);
          const reversed = [...data].reverse(); // oldest → newest
          setHistory(reversed);
          if (reversed.length > 0) {
            setLatestPrice(reversed[reversed.length - 1].close.toFixed(2));
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch stock data.');
        setLoading(false);
      });
  }, [stock.symbol]);

  const handleClick = () => {
    navigate(`/stocks/${stock.symbol}`);
  };

  return (
    <div className="stock-card" onClick={handleClick}>
      <div className="stock-symbol">{stock.symbol}</div>
      <div className="stock-name">{stock.name}</div>
      <div className="stock-price">
        {loading ? 'Loading...' : `$${latestPrice}`}
      </div>
      {error && <div className="stock-error">⚠ {error}</div>}
    </div>
  );
};

export default StockCard;
