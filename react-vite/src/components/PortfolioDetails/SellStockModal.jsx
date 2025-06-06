import { useState } from "react";
import "./SellStockModal.css";

const SellStockModal = ({ holdings, onClose, onSell }) => {
    const [selectedHoldingId, setSelectedHoldingId] = useState(
      holdings.length > 0 ? holdings[0].id : null
    );
    const [quantity, setQuantity] = useState(0);
  
    const handleSell = () => {
      const holding = holdings.find((h) => h.id === parseInt(selectedHoldingId));
      if (!holding) {
        console.error("No holding found for ID:", selectedHoldingId)
        return;
      }

      onSell(holding, quantity);
    };

        return (
            <div className="modal-overlay" onClick={onClose}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Sell Stock</h2>
          
                <label>
                  Select stock:
                  <select
                    value={selectedHoldingId}
                    onChange={(e) => setSelectedHoldingId(e.target.value)}
                  >
                    {holdings.map((holding) => (
                      <option key={holding.id} value={holding.id}>
                        {holding.stock.symbol}
                      </option>
                    ))}
                  </select>
                </label>
          
                <label>
                  Number of Stocks:
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuantity(val === "" ? "" : parseInt(val));
                    }}
                  />
                </label>
                
                <div className="sell-modal-buttons">
                <button onClick={handleSell} className="confirm-button">Confirm Sell</button>
                <button onClick={onClose} className="cancel-button">Cancel</button>
                </div>
              </div>
            </div>
          );
          };
  
  export default SellStockModal;