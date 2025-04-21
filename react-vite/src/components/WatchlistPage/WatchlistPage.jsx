import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import "./WatchlistPage.css";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const Watchlist = () => {
  const [stocks, setStocks] = useState([]);
  const [symbolInput, setSymbolInput] = useState('');
  const [error, setError] = useState(null);

  const fetchWatchlist = async () => {
    const res = await fetch('/api/watchlist', {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      setStocks(data.stocks || []);
    } else {
      console.error('Failed to load watchlist');
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    setError(null);
  
    const alreadyInWatchlist = stocks.some(
      (s) => s.symbol.toLowerCase() === symbolInput.trim().toLowerCase()
    );
  
    if (alreadyInWatchlist) {
      setError('Stock already in Watchlist');
      return;
    }
  
    const csrfToken = getCookie('csrf_token');
  
    try {
      const lookupRes = await fetch(`/api/watchlist/lookup/${symbolInput}`, {
        credentials: 'include'
      });
  
      if (!lookupRes.ok) {
        const err = await lookupRes.json();
        setError(err.error || 'Stock not found');
        return;
      }
  
      const stock = await lookupRes.json();
  
      const addRes = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ stock_id: stock.id })
      });
  
      const addData = await addRes.json();
      if (addRes.ok) {
        fetchWatchlist();
        setSymbolInput('');
      } else {
        setError(addData.error || 'Failed to add stock');
      }
  
    } catch (err) {
      console.error('Add stock error:', err);
      setError('Please enter stock symbol');
    }
  };
  

  const handleRemoveStock = async (id) => {
    const csrfToken = getCookie('csrf_token');
    const res = await fetch(`/api/watchlist/${id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrfToken
      },
      credentials: 'include'
    });
    if (res.ok) {
      fetchWatchlist();
    }
  };

  const navigate = useNavigate();

  return (

    <div className="watchlist-container">
      <h1>My Watchlist</h1>
      <form onSubmit={handleAddStock} className="watchlist-form">
        <input
          type="text"
          placeholder="Enter Stock Symbol (e.g. AAPL)"
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Stock
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <ul className="divide-y">
        {stocks.map((stock) => (
          <li key={stock.id} className="py-2 flex justify-between items-center">
            <span>
              <strong>{stock.symbol}</strong>{stock.name ? ` - ${stock.name}` : ''} (${stock.current_price.toFixed(2)})
            </span>
            <div className="space-x-2">
              <button
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                More Details
              </button>
              <button
                onClick={() => handleRemoveStock(stock.id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default Watchlist;
