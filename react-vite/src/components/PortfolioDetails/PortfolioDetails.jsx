import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPortfolio } from "../../redux/portfolio";
import SellStockModal from "./SellStockModal";
import AddMoneyModal from "./AddMoneyModal";
import "./PortfolioDetails.css";

const PortfolioDetails = () => {
  const { portfolioId } = useParams();
  const dispatch = useDispatch();
  const portfolios = useSelector((state) => state.portfolio.portfolios);
  const portfolio = portfolios?.find((p) => p.id === parseInt(portfolioId)) ?? null;

  const [holdingsWithPrices, setHoldingsWithPrices] = useState([]);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [sellSuccessMessage, setSellSuccessMessage] = useState("");



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

  const openSellModal = () => {
    setShowSellModal(true);
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setSelectedHolding(null);
  };

  const openAddMoneyModal = () => {
    setShowAddMoneyModal(true);
  };

  const closeAddMoneyModal = () => {
    setShowAddMoneyModal(false);
  };

  const sellStock = async (holding, quantity) => {
    if (!holding || !holding.id) {
        console.error("Invalid holding provided:", holding);
        return;
    }

    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/holdings/${holding.id}/sell`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Sell failed:", errorData); // 👈 important!
        throw new Error(errorData.error || "Sell failed");
      }

      await dispatch(thunkFetchPortfolio());
      closeSellModal();

      setSellSuccessMessage(`Sold ${quantity} share(s) of ${holding.stock.symbol} successfully!`);

      setTimeout(() => {
        setSellSuccessMessage("");
        }, 3000);

    } catch (err) {
      console.error("Error selling stock:", err);
    }
  };

  const addMoney = async (portfolioId, amount) => {
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/balance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add money");
      }

      await dispatch(thunkFetchPortfolio()); // Refresh portfolio data
    } catch (err) {
      console.error("Error adding money:", err);
      alert(err.message);
    }
  };

  if (!portfolio) return <p>Loading portfolio...</p>;

  return (
    <div>
        <div>
      <h1>{portfolio.name}</h1>
      <p>Balance: ${portfolio.balance.toFixed(2)}</p>
      </div>

      {sellSuccessMessage && (
  <div className="success-message">
    {sellSuccessMessage}
  </div>
        )}

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
          <button onClick={() => openSellModal()}>
        Sell Stocks
       </button>
        </ul>
         
         ) : (
        <p>No holdings in this portfolio.</p>
      )}

      {showSellModal && (
        <SellStockModal
          holdings={holdingsWithPrices}
          onClose={closeSellModal}
          onSell={sellStock}
        />
      )}

<div>
        <button onClick={openAddMoneyModal}>Add Money</button>
      </div>

      {showAddMoneyModal && (
        <AddMoneyModal
          portfolioId={portfolioId}
          onClose={closeAddMoneyModal}
          onAddMoney={addMoney}
        />
      )}
    </div>
  );
};

export default PortfolioDetails;