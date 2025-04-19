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
        element: <h1>Webull</h1>,
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
    ],
  },
]);
