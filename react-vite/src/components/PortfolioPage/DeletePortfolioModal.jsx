import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkDeletePortfolio } from "../../redux/portfolio";
import { thunkAddToUserBalance } from "../../redux/user";
import "./DeletePortfolioModal.css"

const DeletePortfolioModal = ({ portfolio }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleConfirmDelete = async () => {
    // First, transfer the balance to the user
    if (portfolio.balance > 0) {
      await dispatch(thunkAddToUserBalance(portfolio.balance));
    }

    // Then, delete the portfolio
    await dispatch(thunkDeletePortfolio(portfolio.id));

    closeModal();
  };

  return (
    <div className="delete-portfolio-modal">
      <h2>Delete Portfolio</h2>
      <p>
        Are you sure you want to delete <strong>{portfolio.name}</strong>?<br />
        All stocks will be sold and <strong>${portfolio.balance.toFixed(2)}</strong> will be transferred to your balance.
      </p>
      <div className="modal-buttons">
        <button onClick={handleConfirmDelete} className="confirm-button">
          Yes, Delete Portfolio
        </button>
        <button onClick={closeModal} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeletePortfolioModal;