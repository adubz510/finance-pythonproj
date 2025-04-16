import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import Layout from './Layout';

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
        Leverage the power of crypto futures trading on Webull. Diversify your portfolio<br /> or 
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
    ],
  },
]);