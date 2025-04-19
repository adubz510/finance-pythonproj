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
  const user = useSelector((state) => state.session.user);
  const { setModalContent, setModalVisible } = useModal();

  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  useEffect(() => {
    dispatch(thunkFetchPortfolio());
  }, [dispatch]);

  const handleCreatePortfolio = () => {
    setModalContent(<AddPortfolioModal />);
    setModalVisible(true); 
    };

  const handleDeletePortfolio = (portfolioId, portfolioBalance) => {
    if (window.confirm("Are you sure you want to delete this portfolio? All stocks will be sold.")) {
      dispatch(thunkDeletePortfolio(portfolioId));

      const updatedTotalBalance = user.total_balance + portfolioBalance;
      dispatch(thunkUpdateTotalBalance(updatedTotalBalance))
    }
  };


  const totalBalance = portfolios?.reduce((sum, p) => sum + p.balance, 0) ?? 0;

  return (
    <div>
      <h1>{user ? `${user.username}'s Portfolios` : "Your Portfolios"}</h1>
      <p><strong> Total Balance:</strong> ${totalBalance.toFixed(2)} </p>

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