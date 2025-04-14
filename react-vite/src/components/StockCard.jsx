
import './StockCard.css';
import { Link } from 'react-router-dom';

const StockCard = ({ stock }) => {
  return (
    <Link to={`/stocks/${stock.symbol}`} className="stock-card">
      <h3>{stock.symbol}</h3>
      <p>{stock.name}</p>
      <span>${stock.current_price?.toFixed(2)}</span>
    </Link>
  );
};

export default StockCard;
