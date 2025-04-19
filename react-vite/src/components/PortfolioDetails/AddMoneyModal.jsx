import { useState } from "react";
import "./AddMoneyModal.css";

const AddMoneyModal = ({ portfolioId, onClose, onAddMoney }) => {
  const [amount, setAmount] = useState("");

  const handleAddMoney = () => {
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    try {
        onAddMoney(portfolioId, parseFloat(amount));
        onClose();
    } catch (err) {
        console.error("Failed to add money:", err);
        alert("Failed to add moneu. Please try again.")
        }
    };

  return (
    <div className="modal-overlay">
      <div className="modal">
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