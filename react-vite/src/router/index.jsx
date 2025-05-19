import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import HomePage from '../components/HomePage/HomePage';
import SignupFormPage from '../components/SignupFormPage';
import PortfolioPage from '../components/PortfolioPage/PortfolioPage';
import PortfolioDetails from '../components/PortfolioDetails/PortfolioDetails';
import WatchlistPage from '../components/WatchlistPage/WatchlistPage';
import Layout from './Layout';
import StockDetailPage from '../components/StockDetailPage/StockDetailPage';
import StockListPage from '../components/StockListPage/StockListPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
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
        element: <StockListPage />
      },
      {
        path: "stocks/:symbol",
        element: <StockDetailPage />
      },
      {
        path: "watchlist",
        element: <WatchlistPage />
      },
    ],
  },
]);
