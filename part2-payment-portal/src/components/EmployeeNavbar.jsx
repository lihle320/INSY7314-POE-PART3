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
      <div className="employee-navbar-brand">
        GlobePay - Staff Portal
      </div>
      <div className="employee-navbar-links">
        <Link to="/employee/dashboard">Dashboard</Link>
        <Link to="/employee/profile">Profile</Link>
        {user && (
          <button onClick={handleLogout} className="logout-btn">
            Logout ({user.fullName || user.username})
          </button>
        )}
      </div>
    </nav>
  );
}