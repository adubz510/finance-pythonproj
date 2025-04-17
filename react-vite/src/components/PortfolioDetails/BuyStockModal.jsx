import { useState } from "react";
import "./BuyStockModal.css";

const BuyStockModal = ({ portfolioStocks, onClose, onBuy, balance, stockPrices, portfolioId }) => {
  const [selectedSymbol, setSelectedSymbol] = useState(
    portfolioStocks.length > 0 ? portfolioStocks[0].stock.symbol : ""
  );
  const [quantity, setQuantity] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBuy = async () => {
    if (!selectedSymbol || quantity <= 0) {
      setErrorMessage("Invalid buy parameters.");
      return;
    }

    // Get the price of the selected stock
    const stockPrice = stockPrices[selectedSymbol];

    // Check if user has enough balance
    const totalCost = stockPrice * quantity;
    if (totalCost > balance) {
      setErrorMessage("Insufficient balance.");
      return;
    }

    try {
      // Call the onBuy function to handle the buy action (API call)
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings/buy`, {
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

      // After successful buy, update the portfolio data
      onBuy(selectedSymbol, quantity);  // You might want to call a function to update Redux state
      onClose();  // Optionally, close after successful buy
    } catch (error) {
      console.error("Buy failed:", error);
      setErrorMessage(error.message || "Failed to buy stock");
    }
  };

  return (
    <div className="modal">
      <h2>Buy Stock</h2>

      <label>
        Select stock:
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
        >
          {portfolioStocks.map((h) => (
            <option key={h.id} value={h.stock.symbol}>
              {h.stock.symbol}
            </option>
          ))}
        </select>
      </label>

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

      {errorMessage && <p className="error">{errorMessage}</p>}

      <button onClick={handleBuy}>Confirm Buy</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default BuyStockModal;