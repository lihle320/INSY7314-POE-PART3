import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './EmployeeNavbar.css';

export default function EmployeeNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/employee/login');
  };

  return (
    <nav className="employee-navbar">
      <div className="navbar-brand">GlobePay - Employee Portal 💼</div>
      <div className="navbar-links">
        <Link to="/employee/dashboard">Dashboard</Link>
        <Link to="/employee/profile">Profile</Link>
        {user && <span className="navbar-user">Welcome, {user.name}</span>}
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}