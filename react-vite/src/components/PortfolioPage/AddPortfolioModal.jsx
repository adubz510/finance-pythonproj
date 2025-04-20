import { useState } from "react";
import { thunkCreatePortfolio } from "../../redux/portfolio";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./AddPortfolioModal.css"; // Create this CSS file for styling

function AddPortfolioModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal(); // Hook to close the modal
  const [name, setName] = useState(""); // Portfolio name
  const [balance, setBalance] = useState(""); // Portfolio balance
  const [errors, setErrors] = useState({}); // For validation errors

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !balance) {
      setErrors({ message: "Both name and balance are required" });
      return;
    }

    const portfolioData = {
      name,
      balance: parseFloat(balance), // Ensure balance is a number
    };

    const serverResponse = await dispatch(thunkCreatePortfolio(portfolioData));

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      closeModal(); // Close the modal upon success
    }
  };

  return (
    <div className="modal">
      <h2>Create Portfolio</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Portfolio Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Growth Fund"
            required
          />
        </label>
  
        <label>
          Starting Balance
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 1000"
            required
          />
        </label>
  
        {errors.message && <p>{errors.message}</p>}
  
        <button type="submit">Create Portfolio</button>
      </form>
    </div>
  );}

export default AddPortfolioModal;