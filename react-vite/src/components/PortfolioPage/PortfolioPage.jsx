import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkCreatePortfolio, thunkFetchPortfolio, thunkUpdateBalance, thunkDeletePortfolio } from "../../redux/portfolio";

function PortfolioPage() {
  const dispatch = useDispatch();
  const portfolio = useSelector((state) => state.portfolio.portfolio);

  useEffect(() => {
    dispatch(thunkFetchPortfolio());
  }, [dispatch]);

  const addMoney = () => {
    const amount = prompt("Enter amount to add:");
    if (amount) dispatch(thunkUpdateBalance(parseFloat(amount)));
  };

  const deletePortfolio = () => {
    if (window.confirm("Are you sure? This will delete all holdings.")) {
      dispatch(thunkDeletePortfolio());
    }
  };

  if (!portfolio) return <button onClick={() => dispatch(thunkCreatePortfolio())}>Create Portfolio</button>;

  return (
    <div>
      <h1>My Portfolio</h1>
      <p>Balance: ${portfolio.balance.toFixed(2)}</p>
      <button onClick={addMoney}>Add Money</button>
      <button onClick={deletePortfolio} style={{ color: "red" }}>Delete Portfolio</button>
    </div>
  );
}

export default PortfolioPage;