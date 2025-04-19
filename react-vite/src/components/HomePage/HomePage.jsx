import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import './HomePage.css';

export default function HomePage() {
    const user = useSelector((state) => state.session.user);

    return (
        <div className="home-container">
            <h1>TRADE <br /> CRYPTO FUTURES</h1>
            <p>
                Leverage the power of crypto futures trading on Webull. Diversify your portfolio or
                leverage cryptocurrency market movements with our seamless, low-cost futures platform.
            </p>
            {user ? (
                <Link to="/portfolio">
                    <button className="go-dashboard-btn">Go to Portfolio</button>
                </Link>
            ) : (
                <Link to="/signup">
                    <button className="get-started-btn">Get Started</button>
                </Link>
            )}
        </div>
    );
}
