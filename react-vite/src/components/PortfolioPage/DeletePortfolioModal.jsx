import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkDeletePortfolio } from "../../redux/portfolio";
import "./DeletePortfolioModal.css"

const DeletePortfolioModal = ({ portfolio, portfolioValue }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleConfirmDelete = async () => {
    //delete the portfolio
    await dispatch(thunkDeletePortfolio(portfolio.id));

    closeModal();
  };

  if (!portfolio) return null; // or show loading/error

  return (
    <div className="delete-portfolio-modal">
      <h2>Sell Portfolio</h2>
      <p>
        Are you sure you want to sell <strong>{portfolio.name}</strong>?<br />
        All stocks will be sold and <strong>${portfolioValue.toFixed(2)}</strong> will be transferred to your balance.
      </p>
      <div className="modal-buttons">
        <button onClick={handleConfirmDelete} className="confirm-button">
          Yes, Sell Portfolio
        </button>
        <button onClick={closeModal} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeletePortfolioModal;