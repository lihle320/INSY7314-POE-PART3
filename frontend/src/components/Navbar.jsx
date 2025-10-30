import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">GlobePay</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        
        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/payments">Payments</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            {user && <span className="navbar-user">Hi, {user.name}</span>}
            <button onClick={handleLogout} className="btn-nav-logout">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}