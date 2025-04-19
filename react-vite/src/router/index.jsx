import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import PortfolioPage from '../components/PortfolioPage/PortfolioPage';
import PortfolioDetails from '../components/PortfolioDetails/PortfolioDetails';
import WatchlistPage from '../components/WatchlistPage/WatchlistPage';
import Layout from './Layout';
import StockDetailPage from '../pages/StockDetailPage';
import StockListPage from '../pages/StockListPage';
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: 
        <div className="home-container">
        <h1>TRADE <br /> CRYPTO FUTURES</h1>
        <p>
        Leverage the power of crypto futures trading on Webull. Diversify your portfolio or 
        leverage cryptocurrency market movements with our seamless, low-cost futures platform.
        </p>
        <button>Get Started</button>
        </div>
      },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
      {
        path: "portfolio",
        element: <PortfolioPage />,
      },
      {
        path: "portfolios/:portfolioId",
        element: <PortfolioDetails />
      },
      {
        path: "stocks",
        element: <StockListPage/>
      },
      { path: "stocks/:symbol",
        element: <StockDetailPage/>
      },
      {
        path: "watchlist",
        element: <WatchlistPage />
      },
    ],
  },
]);
