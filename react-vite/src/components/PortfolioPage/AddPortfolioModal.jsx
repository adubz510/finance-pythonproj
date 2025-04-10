import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkCreatePortfolio } from "../../redux/portfolio"; 
import "./AddPortfolioModal.css"

function AddPortfolioModal({ onClose }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPortfolio = {
      name,
      balance: parseFloat(balance) || 0,
    };

    dispatch(thunkCreatePortfolio(newPortfolio));
    onClose(); // Close modal after submission
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Portfolio</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Portfolio Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Starting Balance:
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              min="0"
              step="0.01"
            />
          </label>
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default AddPortfolioModal;