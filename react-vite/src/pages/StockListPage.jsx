import { useEffect, useState } from 'react';
import StockCard from '../components/StockCard';
import '../styles/StockListPage.css';

// StockListPage: Displays all stocks and supports live search by name or symbol
const StockListPage = () => {
  // State to hold all stock data
  const [stocks, setStocks] = useState([]);

  // State to track search input
  const [query, setQuery] = useState('');

  // Fetch stocks from the backend whenever search query changes
  useEffect(() => {
    fetch(`/api/stocks${query ? `/search?query=${query}` : ''}`)
      .then(res => res.json())
      .then(data => setStocks(data));
  }, [query]);

  return (
    <div className="stock-list-page">
      <h1>Browse Stocks</h1>

      {/* Search input field */}
      <input
        type="text"
        placeholder="Search by name or symbol..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {/* Display each stock using StockCard */}
      <div className="stock-list">
        {stocks.map(stock => (
          <StockCard key={stock.id} stock={stock} />
        ))}
      </div>
    </div>
  );
};

export default StockListPage;
