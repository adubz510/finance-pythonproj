import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StockCard.css'; // Make sure this matches your CSS file name

const StockCard = ({ stock }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/stocks/${stock.symbol}`);
  };

  return (
    <div className="stock-card" onClick={handleClick}>
      <div className="stock-symbol">{stock.symbol}</div>
      <div className="stock-name">{stock.name}</div>
      <div className="stock-price">${Number(stock.current_price).toFixed(2)}</div>
    </div>
  );
};

export default StockCard;
