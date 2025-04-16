import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPortfolio, thunkUpdateBalance, thunkDeletePortfolio } from "../../redux/portfolio";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/Modal";
import AddPortfolioModal from "./AddPortfolioModal";

const PortfolioPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const portfolios = useSelector((state) => state.portfolio.portfolios);
  const { setModalContent, setModalVisible } = useModal(); // Modal hooks

  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  useEffect(() => {
    dispatch(thunkFetchPortfolio());
  }, [dispatch]);

  const handleCreatePortfolio = () => {
    setModalContent(<AddPortfolioModal />); //set the modal content
    setModalVisible(true); // open the modal
    };

  const handleDeletePortfolio = (portfolioId) => {
    if (window.confirm("Are you sure you want to delete this portfolio? All stocks will be sold.")) {
      dispatch(thunkDeletePortfolio(portfolioId));
    }
  };

  return (
    <div>
      <h1>Your Portfolios</h1>
      <button onClick={handleCreatePortfolio}>Add Portfolio</button>

      {portfolios && portfolios.length > 0 ? (
        <div>
          <h2>Portfolio List:</h2>
          <ul>
            {portfolios.map((portfolio) => (
              <li key={portfolio.id}>
                <div>
                  <h3>{portfolio.name}</h3>
                  <p>Balance: ${portfolio.balance.toFixed(2)}</p>
                  <button onClick={() => navigate(`/portfolios/${portfolio.id}`)}>View Portfolio</button>
                  <button onClick={() => handleDeletePortfolio(portfolio.id)}>Delete Portfolio</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>{`No portfolios found. Click "Add Portfolio" to create one.`}</p>
      )}

      {selectedPortfolio && (
        <div>
          <h3>Selected Portfolio: {selectedPortfolio.name}</h3>
          <p>Balance: ${selectedPortfolio.balance}</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;