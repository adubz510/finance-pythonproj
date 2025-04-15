import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
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
        path: "stocks",
        element: <StockListPage/>
      },
      { path: "stocks/:symbol",
        element: <StockDetailPage/>
      }
    ],
  },
]);
