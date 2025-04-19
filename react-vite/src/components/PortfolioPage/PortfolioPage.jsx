import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPortfolio } from "../../redux/portfolio";
import { thunkFetchUserBalance } from "../../redux/user";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/Modal";
import AddPortfolioModal from "./AddPortfolioModal";
import DeletePortfolioModal from "./DeletePortfolioModal";

const PortfolioPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const portfolios = useSelector((state) => state.portfolio.portfolios);
  const user = useSelector((state) => state.session.user);
  const userBalance = useSelector((state) => state.user.balance)
  const { setModalContent, setModalVisible } = useModal();

//   const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioValues, setPortfolioValues] = useState({});

  // Fetch current prices for holdings
  useEffect(() => {
    const fetchPortfolioValues = async () => {
      if (!portfolios || portfolios.length === 0) return;

      const values = {};

      for (const portfolio of portfolios) {
        if (!portfolio.holdings) continue;

        let totalHoldingsValue = 0;

        for (const holding of portfolio.holdings) {
          const symbol = holding.stock?.symbol;
          if (!symbol) continue;

          try {
            const res = await fetch(`/api/stocks/${symbol}`);
            if (!res.ok) throw new Error("Failed to fetch price");
            const data = await res.json();
            totalHoldingsValue += data.current_price * holding.quantity;
          } catch (err) {
            console.error(`Failed to fetch price for ${symbol}:`, err);
          }
        }

        values[portfolio.id] = portfolio.balance + totalHoldingsValue;
      }

      setPortfolioValues(values);
    };

    fetchPortfolioValues();
  }, [portfolios]);


  useEffect(() => {
    dispatch(thunkFetchPortfolio());
    dispatch(thunkFetchUserBalance());
  }, [dispatch]);

  const handleCreatePortfolio = () => {
    setModalContent(<AddPortfolioModal />);
    setModalVisible(true);
    };

  const handleDeletePortfolio = (portfolio) => {
    setModalContent(<DeletePortfolioModal
        portfolio={portfolio}
        portfolioValue={portfolioValues[portfolio.id]}/>);
    setModalVisible(true);
    }


  const totalBalance = portfolios?.reduce((sum, p) => sum + p.balance, 0) ?? 0;

  return (
    <div>
      <h1>{user ? `${user.username}'s Portfolios` : "Your Portfolios"}</h1>
      <h2>{userBalance !== null ? `${user.username}'s Balance: $${userBalance.toFixed(2)}` : "Loading balance..."}</h2>
      <p><strong> Total Portfolios Balance:</strong> ${totalBalance.toFixed(2)} </p>

      <button onClick={handleCreatePortfolio}>Add Portfolio</button>

      {portfolios && portfolios.length > 0 ? (
        <div>
          <h2>Portfolio List:</h2>
          <ul>
            {portfolios.map((portfolio) => (
              <li key={portfolio.id}>
                <div>
                  <h3>{portfolio.name}</h3>
                  <p>Portfolio Value: ${portfolioValues[portfolio.id]?.toFixed(2) || portfolio.balance.toFixed(2)}</p>                  <button onClick={() => navigate(`/portfolios/${portfolio.id}`)}>View Portfolio</button>
                  <button onClick={() => handleDeletePortfolio(portfolio)}>Delete Portfolio</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>{`No portfolios found. Click "Add Portfolio" to create one.`}</p>
      )}

      {/* {selectedPortfolio && (
        <div>
          <h3>Selected Portfolio: {selectedPortfolio.name}</h3>
          <p>Balance: ${selectedPortfolio.balance}</p>
        </div>
      )} */}

    </div>
  );
};

export default PortfolioPage;
