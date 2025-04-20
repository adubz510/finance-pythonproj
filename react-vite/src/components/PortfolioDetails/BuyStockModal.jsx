//the newest version
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { thunkFetchUserBalance } from "../../redux/user";
import "./BuyStockModal.css";

const BuyStockModal = ({
  onClose,
  onBuy,
  balance,
  stockPrices,
  portfolioId,
  availableStocks, // <-- passed in from parent now
  onBalanceUpdate,
}) => {
  const dispatch = useDispatch();
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Set initial selected symbol
  useEffect(() => {
    if (availableStocks?.length > 0) {
      setSelectedSymbol(availableStocks[0].symbol);
    }
  }, [availableStocks]);

  const handleBuy = async () => {
    if (!selectedSymbol || quantity <= 0) {
      setErrorMessage("Invalid buy parameters.");
      return;
    }

    const stockPrice = stockPrices[selectedSymbol];
    const totalCost = stockPrice * quantity;

    if (totalCost > balance) {
      setErrorMessage("Insufficient balance.");
      return;
    }

    try {
      const response = await fetch(`/api/holdings/buy?portfolio_id=${portfolioId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: selectedSymbol,
          quantity,
          portfolio_id: portfolioId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to buy stock");


      const newBalance = balance - totalCost;
      onBalanceUpdate(newBalance);
      await dispatch(thunkFetchUserBalance())

      onBuy(selectedSymbol, quantity);
      onClose();
    } catch (error) {
      console.error("Buy failed:", error);
      setErrorMessage(error.message || "Failed to buy stock");
    }
  };

  return (
    <div className="buy-modal-overlay" onClick={onClose}>
      <div className="buy-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Buy Stock</h3>
  
        <label>
          Select stock:
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
          >
            {availableStocks.map((stock) => (
              <option key={stock.id} value={stock.symbol}>
                {stock.symbol} - {stock.name}
              </option>
            ))}
          </select>
        </label>
  
        {selectedSymbol && stockPrices[selectedSymbol] && (
          <p>
            <strong>Current Price:</strong> ${stockPrices[selectedSymbol].toFixed(2)}
          </p>
        )}
  
        <label>
          Number of Shares:
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              const val = e.target.value;
              setQuantity(val === "" ? "" : parseInt(val));
            }}
          />
        </label>
  
        {selectedSymbol && stockPrices[selectedSymbol] && quantity > 0 && (
          <p>
            <strong>Total Cost:</strong> ${(stockPrices[selectedSymbol] * quantity).toFixed(2)}
          </p>
        )}
  
        {errorMessage && <p className="error">{errorMessage}</p>}
  
        <div className="buy-modal-buttons">
          <button onClick={handleBuy}>Confirm Buy</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );  
};

export default BuyStockModal;