import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPortfolio } from "../../redux/portfolio";

const PortfolioDetails = () => {
  const { portfolioId } = useParams();
  const dispatch = useDispatch();
  const portfolios = useSelector((state) => state.portfolio.portfolio);
  const portfolio = portfolios.find((p) => p.id === parseInt(portfolioId));

  const [holdingsWithPrices, setHoldingsWithPrices] = useState([]);

  // Fetch portfolio data if not already loaded
  useEffect(() => {
    if (!portfolio) {
      dispatch(thunkFetchPortfolio());
    }
  }, [dispatch, portfolio]);

  // Fetch current prices for holdings
  useEffect(() => {
    const fetchPrices = async () => {
      if (!portfolio || !portfolio.holdings) return;

      const updatedHoldings = await Promise.all(
        portfolio.holdings.map(async (holding) => {
          const symbol = holding.stock.symbol;

          if (!symbol) {
            console.warn("Missing stock symbol in holding:", holding);
            return {
              ...holding,
              current_price: null,
            };
          }

          try {
            const res = await fetch(`/api/stocks/${symbol}`);
            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();

            return {
              ...holding,
              current_price: data.current_price,
            };
          } catch (err) {
            console.error("Error fetching stock price for", symbol, err);
            return {
              ...holding,
              current_price: null,
            };
          }
        })
      );

      setHoldingsWithPrices(updatedHoldings);
    };

    fetchPrices();
  }, [portfolio]);

  if (!portfolio) return <p>Loading portfolio...</p>;

  return (
    <div>
      <h1>{portfolio.name}</h1>
      <p>Balance: ${portfolio.balance.toFixed(2)}</p>

      <h2>Holdings</h2>
      {holdingsWithPrices.length > 0 ? (
        <ul>
          {holdingsWithPrices.map((h) => (
            <li key={h.id}>
              {h.stock.symbol} - {h.quantity} shares @ $
              {(h.current_price !== null ? h.current_price.toFixed(2) : '...')} = $
              {(h.current_price !== null ? (h.current_price * h.quantity).toFixed(2) : 'N/A')}
            </li>
          ))}
        </ul>
      ) : (
        <p>No holdings in this portfolio.</p>
      )}
    </div>
  );
};

export default PortfolioDetails;