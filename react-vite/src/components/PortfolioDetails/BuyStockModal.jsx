import { useEffect, useState } from "react";
import "./BuyStockModal.css";

const BuyStockModal = ({ onClose, onBuy, balance, stockPrices, portfolioId }) => {
    const [availableStocks, setAvailableStocks] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");


  // Fetch available stocks from the API
  useEffect(() => {
    const fetchAvailableStocks = async () => {
      try {
        const response = await fetch("/api/stocks");
        if (!response.ok) {
          throw new Error("Failed to fetch stocks");
        }
        const data = await response.json();
        setAvailableStocks(data);
        if (data.length > 0) {
          setSelectedSymbol(data[0].symbol);  // Set the first stock as the default
        }
        setLoading(false);
      } catch (error) {
        setFetchError(error.message || "Error fetching stocks");
        setLoading(false);
      }
    };

    fetchAvailableStocks();
  }, []);
    
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

      {errorMessage && <p className="error">{errorMessage}</p>}

      <button onClick={handleBuy}>Confirm Buy</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default BuyStockModal;