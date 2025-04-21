
import React, { useEffect, useState } from 'react';
import "./WatchlistPage.css";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const Watchlist = () => {
  const [stocks, setStocks] = useState([]);
  const [stockId, setStockId] = useState('');
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
    const csrfToken = getCookie('csrf_token');
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ stock_id: parseInt(stockId) })
    });

    const data = await res.json();
    if (res.ok) {
      fetchWatchlist();
      setStockId('');
    } else {
      setError(data.error);
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

  return (
    <div className="watchlist_">
      <h1>My Watchlist</h1>
      <form onSubmit={handleAddStock} className="space-x-2">
        <input
          type="string"
          placeholder="Enter Stock Symbol"
          value={stockId}
          onChange={(e) => setStockId(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Stock
        </button>
      </form>
      {error && <div className="text-red-500">{error}</div>}
      <ul className="divide-y">
        {stocks.map((stock) => (
          <li key={stock.id} className="py-2 flex justify-between">
            <span>{stock.symbol} {stock.name ? `- ${stock.name}` : "" }</span>
            <button
              onClick={() => handleRemoveStock(stock.id)}
              className="text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Watchlist;