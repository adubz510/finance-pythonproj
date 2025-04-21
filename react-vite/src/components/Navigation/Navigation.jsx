import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import LogoutButton from "../Navigation/LogoutButton";
import "./Navigation.css";
import logo from "/src/webull-logo.svg";

const Navigation = () => {
    const user = useSelector(state => state.session.user);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            setToastMessage("Please enter a stock symbol or name.");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        const res = await fetch(`/api/stocks/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (res.ok && data.length > 0) {
            navigate(`/stocks/${data[0].symbol}`);
        } else {
            setToastMessage("❌ Stock not found.");
            setTimeout(() => setToastMessage(""), 3000);
        }

        setQuery("");
        setResults([]);
        setShowDropdown(false);
    };

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        const delay = setTimeout(async () => {
            setLoading(true);
            const res = await fetch(`/api/stocks/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data);
            setLoading(false);
            setShowDropdown(true);
        }, 300);

        return () => clearTimeout(delay);
    }, [query]);

    const handleSelect = (symbol) => {
        navigate(`/stocks/${symbol}`);
        setQuery("");
        setResults([]);
        setShowDropdown(false);
    };

    return (
        <nav className="webull-navbar">
            <div className="nav-left">
                <img
                    className="logo-img"
                    src="https://raw.githubusercontent.com/2fasvg/2fasvg.github.io/master/assets/img/logo/webull.com/webull.com.svg"
                    alt="Webull Logo"
                    width="40"
                    height="40"
                />
                <span className="brand">Webull</span>
            </div>

            <div className="nav-middle">
                <ul className="nav-links">
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/stocks">Stocks</NavLink></li>
                    {user && (
                        <>
                            <li><NavLink to="/portfolio">Portfolio</NavLink></li>
                            <li><NavLink to="/watchlist">Watchlist</NavLink></li>
                        </>
                    )}
                </ul>
            </div>

            <div className="search-bar">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Symbol/Name"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    />
                    <button type="submit">Search</button>
                </form>

                {/* 🔽 Dropdown Suggestions */}
                {showDropdown && (
                    <ul className="search-dropdown">
                        {loading ? (
                            <li className="loading-spinner">🔄 Loading...</li>
                        ) : results.length > 0 ? (
                            results.map((stock) => (
                                <li
                                    key={stock.id}
                                    onClick={() => handleSelect(stock.symbol)}
                                    className="search-suggestion"
                                >
                                    {stock.symbol} - {stock.name}
                                </li>
                            ))
                        ) : (
                            <li className="no-results">No results found.</li>
                        )}
                    </ul>
                )}

                {/* 🔔 Toast Notification */}
                {toastMessage && (
                    <div className="toast-message under-search">{toastMessage}</div>
                )}
            </div>

            <div className="auth1-btn">
                {!user ? (
                    <>
                        <NavLink to="/signup" className="signup-btn">Sign up</NavLink>
                        <NavLink to="/login" className="login-btn">Log in</NavLink>
                    </>
                ) : (
                    <LogoutButton />
                )}
            </div>
        </nav>
    );


};

export default Navigation;
