import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
    // Get authentication state and the logout function from your context
    const { isAuthenticated, logout } = useAuth();
    
    // Get the navigate function for redirection after logout
    const navigate = useNavigate();

    const handleLogout = () => {
        // 1. Call the logout function from AuthContext
        logout();
        
        // 2. Redirect the user to the home or login page after successful logout
        navigate('/'); 
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">GlobePay🌐</div>
            <div className="navbar-links">
                {/* Links visible to everyone */}
                <Link to="/">Home</Link>
                
                {/* Links only visible when logged in */}
                {isAuthenticated && (
                    <>
                        <Link to="/payments">Payments</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/profile">Profile</Link>
                    </>
                )}
                
                {/* Conditional Login/Logout Button */}
                {!isAuthenticated ? (
                    // Show Login/Register links when not authenticated
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : (
                    // Show a Logout button when authenticated
                    <button 
                        onClick={handleLogout} 
                        className="navbar-link-button" // Apply a class for styling as a link
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}