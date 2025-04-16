import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPortfolio } from "../../redux/portfolio";
import SellStockModal from "./SellStockModal";

const PortfolioDetails = () => {
  const { portfolioId } = useParams();
  const dispatch = useDispatch();
  const portfolios = useSelector((state) => state.portfolio.portfolios);
  const portfolio = portfolios?.find((p) => p.id === parseInt(portfolioId)) ?? null;

  const [holdingsWithPrices, setHoldingsWithPrices] = useState([]);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("");

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
    setShowModal(true);
  };

  const closeSellModal = () => {
    setShowModal(false);
    setSelectedHolding(null);
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
    } catch (err) {
      console.error("Error selling stock:", err);
    }
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
  
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
  
      setAmountToAdd(""); // Clear input
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

      {showModal && (
        <SellStockModal
          holdings={holdingsWithPrices}
          onClose={closeSellModal}
          onSell={sellStock}
        />
      )}

<div style={{ marginTop: "20px" }}>
    <h3>Add Money to Balance</h3>
    <input
        type="number"
        placeholder="Enter amount"
        value={amountToAdd}
        onChange={(e) => setAmountToAdd(e.target.value)}
    />
    <button onClick={handleAddMoney}>Add Money</button>
</div>

    </div>
  );
};

export default PortfolioDetails;