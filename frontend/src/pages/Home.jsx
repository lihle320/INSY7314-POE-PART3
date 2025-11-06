import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import logo from '../assets/logo.png';
import security from '../assets/cyber-security.png';
import world from '../assets/pin.png';
import verification from '../assets/search.png';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <img src={logo} alt="GlobePay Logo" className="logo" />
        <h1>Welcome to GlobePay</h1>
        <p>Seamless, secure, and fast international payments. Anytime. Anywhere.</p>
        
        <div className="home-buttons">
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Customer Portal
          </button>
          <button className="btn-secondary" onClick={() => navigate('/employee/login')}>
            Employee Portal
          </button>
        </div>

        <div className="home-info">
          <div className="info-card">
            <img src={security} alt="Security" className="features"/>
            <p>Bank-grade encryption</p>
          </div>
          <div className="info-card">
            <img src={verification} alt="Verification" className="features"/>
            <p>Instant Verification</p>
          </div>
          <div className="info-card">
            <img src={world} alt="Global Coverage" className="features"/>
            <p>Worldwide coverage</p>
          </div>
        </div>
      </div>
    </div>
  );
}