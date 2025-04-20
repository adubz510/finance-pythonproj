import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPortfolio } from "../../redux/portfolio";
import { thunkFetchUserBalance, setUserBalance } from "../../redux/user";
import SellStockModal from "./SellStockModal";
import AddMoneyModal from "./AddMoneyModal";
import BuyStockModal from "./BuyStockModal"
import "./PortfolioDetails.css";

const PortfolioDetails = () => {
  const { portfolioId } = useParams();
  const dispatch = useDispatch();
  const portfolios = useSelector((state) => state.portfolio.portfolios);
  const portfolio = portfolios?.find((p) => p.id === parseInt(portfolioId)) ?? null;
  const user = useSelector((state) => state.session.user);
  const userBalance = useSelector((state) => state.user.balance)


  const [holdingsWithPrices, setHoldingsWithPrices] = useState([]);
//   const [selectedHolding, setSelectedHolding] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [sellSuccessMessage, setSellSuccessMessage] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buySuccessMessage, setBuySuccessMessage] = useState("");
  const [allStocks, setAllStocks] = useState([]);
  const [availableStockPrices, setAvailableStockPrices] = useState({});

  const handleBalanceUpdate = (newBalance) => {
    dispatch(setUserBalance(newBalance));
  };
  

  useEffect(() => {
    if (!portfolio) {
      dispatch(thunkFetchPortfolio());
    }
  }, [dispatch, portfolio]);


  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch(`/api/stocks`);
        const data = await res.json();
        setAllStocks(data);
  
        // Set prices for validation
        const pricesMap = {};
        data.forEach((stock) => {
          pricesMap[stock.symbol] = stock.current_price;
        });
        setAvailableStockPrices(pricesMap);
      } catch (err) {
        console.error("Failed to load stocks", err);
      }
    };
  
    fetchStocks();
  }, []);

  
  useEffect(() => {
    if (user) dispatch(thunkFetchUserBalance());
  }, [dispatch, user]);


  // Fetch current prices for holdings
  useEffect(() => {
    const fetchPrices = async () => {
      if (!portfolio || !portfolio.holdings) return;

      const updatedHoldings = await Promise.all(
        portfolio.holdings.map(async (holding) => {
        //   console.log("HOLDINGS : ", holding)
          const symbol = holding.stock.symbol;

          if (!symbol) {
            console.warn("Missing stock symbol in holding:", holding);
            return {
              ...holding,
              current_price: null,
            };
          }

          try {
            const res = await fetch(`/api/stocks/${symbol}`);
            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();

            return {
              ...holding,
              current_price: data.current_price,
            };
          } catch (err) {
            console.error("Error fetching stock price for", symbol, err);
            return {
              ...holding,
              current_price: null,
            };
          }
        })
      );

      setHoldingsWithPrices(updatedHoldings);
    };

    fetchPrices();
  }, [portfolio]);

   // Calculate the total value of all stocks owned
  const calculateTotalStockValue = () => {
    return holdingsWithPrices.reduce((total, holding) => {
      const stockValue = holding.current_price ? holding.current_price * holding.quantity : 0;
      return total + stockValue;
    }, 0);
  };

  const openSellModal = () => {
    setShowSellModal(true);
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    // setSelectedHolding(null);
  };

  const openAddMoneyModal = () => {
    setShowAddMoneyModal(true);
  };

  const closeAddMoneyModal = () => {
    setShowAddMoneyModal(false);
  };
  const openBuyModal = () => {
    setShowBuyModal(true);
  };
  const closeBuyModal = () => {
    setShowBuyModal(false);
  };


  const sellStock = async (holding, quantity) => {
    if (!holding || !holding.id) {
        console.error("Invalid holding provided:", holding);
        return;
    }

    try {
        console.log("Selling holding:", holding, "quantity:", quantity);
      const res = await fetch(`/api/holdings/${holding.id}/sell?portfolio_id=${holding.portfolio_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Sell failed:", errorData); // 👈 important!
        throw new Error(errorData.error || "Sell failed");
      }

      await dispatch(thunkFetchPortfolio());
      await dispatch(thunkFetchUserBalance());
      closeSellModal();

      setSellSuccessMessage(`Sold ${quantity} share(s) of ${holding.stock.symbol} successfully!`);

      setTimeout(() => {
        setSellSuccessMessage("");
        }, 3000);

    } catch (err) {
      console.error("Error selling stock:", err);
    }
  };

  const addMoney = async (amount, portfolioId) => {
    try {
      const res = await fetch(`/api/portfolios/balance?portfolio_id=${portfolioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add money");
      }

      await dispatch(thunkFetchPortfolio()); // Refresh portfolio data
      closeAddMoneyModal();
    } catch (err) {
      console.error("Error adding money:", err);
      alert(err.message);
    }
  };

  const buyStock = async (symbol, quantity) => {
    try {
          
      await dispatch(thunkFetchPortfolio());
      await dispatch(thunkFetchUserBalance());
      setTimeout(() => {
        closeBuyModal();
      }, 100); // small delay to ensure state updates
      setBuySuccessMessage(`Bought ${quantity} share(s) of ${symbol.toUpperCase()} successfully!`);
      setTimeout(() => setBuySuccessMessage(""), 3000);
    } catch (err) {
      console.error("Buy failed:", err);
      alert(err.message || "Failed to buy stock");
    }
  };

  const stockPrices = {};
    holdingsWithPrices.forEach((h) => {
    if (h.stock && h.stock.symbol) {
        stockPrices[h.stock.symbol] = h.current_price || 0;
        }
    });

  



  if (!portfolio) return <p>Loading portfolio...</p>;

  const totalStockValue = calculateTotalStockValue();
  const totalPortfolioValue = (portfolio.balance || 0) + totalStockValue;

  return (
    <div className="portfolio-details-page">
      <div>
        <h1>{portfolio.name}</h1>
        <h2>
          {userBalance !== null
            ? `${user.username}'s Balance: $${userBalance.toFixed(2)}`
            : "Loading balance..."}
        </h2>
        <p>Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}</p>
      </div>
  
      {sellSuccessMessage && (
        <div className="success-message">{sellSuccessMessage}</div>
      )}
  
      {buySuccessMessage && (
        <div className="success-message">{buySuccessMessage}</div>
      )}
  
      <h2>Stocks Owned</h2>
      {holdingsWithPrices.length > 0 ? (
        <div className="holdings-list">
          {holdingsWithPrices.map((h) => (
            <div className="holding-card" key={h.id}>
              <p><strong>{h.stock.symbol}</strong></p>
              <p>{h.quantity} shares @ ${h.current_price !== null ? h.current_price.toFixed(2) : '...'}</p>
              <p>Total: ${h.current_price !== null ? (h.current_price * h.quantity).toFixed(2) : 'N/A'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-holdings">No holdings in this portfolio.</p>
      )}
  
      <div className="action-buttons">
        <button onClick={openSellModal}>Sell Stocks</button>
        <button onClick={openBuyModal}>Buy Stocks</button>
        <button onClick={openAddMoneyModal}>Add Money</button>
      </div>
  
      {showSellModal && (
        <SellStockModal
          holdings={holdingsWithPrices}
          onClose={closeSellModal}
          onSell={sellStock}
        />
      )}
  
      {showBuyModal && holdingsWithPrices && (
        <BuyStockModal
          portfolioStocks={holdingsWithPrices}
          onClose={closeBuyModal}
          onBuy={buyStock}
          balance={userBalance}
          stockPrices={availableStockPrices}
          portfolioId={portfolio.id}
          availableStocks={allStocks}
          onBalanceUpdate={handleBalanceUpdate}
        />
      )}
  
      {showAddMoneyModal && (
        <AddMoneyModal
          portfolioId={portfolio.id}
          onClose={closeAddMoneyModal}
          onAddMoney={addMoney}
        />
      )}
    </div>
  );
};

export default PortfolioDetails;