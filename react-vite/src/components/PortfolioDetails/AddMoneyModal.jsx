import { useState } from "react";
import "./AddMoneyModal.css";

const AddMoneyModal = ({ portfolioId, onClose, onAddMoney }) => {
  const [amount, setAmount] = useState("");

  const handleAddMoney = () => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    // Check if the amount has more than 2 decimal places
  if (amount.includes('.') && amount.split('.')[1].length > 2) {
    alert("Please enter a valid amount with up to 2 decimal places.");
    return;
  }
  if (parsedAmount < 10) {
    alert("The amount must be at least $10.00.");
    return;
  }

    try {
        onAddMoney(parseFloat(amount), portfolioId, onClose);
    } catch (err) {
        console.error("Failed to add money:", err);
        alert("Failed to add moneu. Please try again.")
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Money</h2>
            <label>
              Amount:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                placeholder="Enter amount"
              />
            </label>
      
            <div className="modal-buttons">
              <button onClick={handleAddMoney}>Add Money</button>
              <button className="cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
};

export default AddMoneyModal;