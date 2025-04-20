import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkAddToUserBalance } from "../../redux/user";
import { useModal } from "../../context/Modal";
import "./AddUserMoneyModal.css";

const AddUserMoneyModal = () => {
  const dispatch = useDispatch();
  const { closeModal } = useModal(); // useModal gives us closeModal directly
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    try {
      const result = await dispatch(thunkAddToUserBalance(numericAmount));

      if (result?.errors) {
        setError("Failed to add money.");
      } else {
        closeModal(); // Close modal on success
      }
    } catch {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="modal">
      <h2>Add Money to Balance</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Amount
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="button-row">
          <button type="submit" className="add-btn">Add Money</button>
          <button type="button" onClick={closeModal} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddUserMoneyModal;