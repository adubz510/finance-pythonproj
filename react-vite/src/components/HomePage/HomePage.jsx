import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-container">
      <h1>TRADE <br /> CRYPTO FUTURES</h1>
      <p>
        Leverage the power of crypto futures trading on Webull. Diversify your portfolio or
        leverage cryptocurrency market movements with our seamless, low-cost futures platform.
      </p>
      <div className="button-group">
        <Link to="/login">
          <button>Log In</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
}
