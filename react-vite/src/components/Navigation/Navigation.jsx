import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";
import logo from "/src/webull-logo.svg";


const Navigation = () => {
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
        </ul>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="Symbol/Name" />
      </div>
      <div className="auth1-btn">
        <NavLink to="/signup" className="signup-btn">Sign up</NavLink>
        <NavLink to="/login" className="login-btn">Log in</NavLink>
      </div>
    </nav>
  );
};


export default Navigation;

