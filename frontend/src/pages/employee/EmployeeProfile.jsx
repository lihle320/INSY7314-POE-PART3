import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import './EmployeeProfile.css';
import lockImage from '../../assets/lock.png';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees/profile');
      setEmployeeData(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching employee profile:', err);
      setError('Failed to load profile data');
      // Fallback to user data from auth context
      if (user) {
        setEmployeeData({
          _id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          createdAt: user.createdAt
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="employee-profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="employee-profile-container">
        <div className="profile-error">
          <div className="error-icon">⚠️</div>
          <h3>Profile Not Available</h3>
          <p>{error || 'Unable to load employee profile'}</p>
          <button onClick={fetchEmployeeProfile} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {employeeData.name ? employeeData.name.charAt(0).toUpperCase() : 'E'}
          </div>
          <div className="profile-title">
            <h2>{employeeData.name || 'Employee'}</h2>
            <p className="profile-position" style={{color : 'white'}}>Payment Verification Officer</p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Employee ID</span>
              <span className="info-value">{employeeData.employeeId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{employeeData.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">{employeeData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Department</span>
              <span className="info-value">International Payments</span>
            </div>
            <div className="info-item">
              <span className="info-label">Position</span>
              <span className="info-value">Payment Verification Officer</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date Joined</span>
              <span className="info-value">{formatDate(employeeData.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>System Access</h3>
          <div className="access-permissions">
            <div className="permission-item">
              <span className="permission-icon">✓</span>
              <span>View customer payment transactions</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">✓</span>
              <span>Verify payment details</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">✓</span>
              <span>Submit verified payments to SWIFT</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">✓</span>
              <span>View transaction history</span>
            </div>
          </div>
        </div>

        <div className="profile-section security-section">
          <h3>Security Information</h3>
          <p className="security-notice">
            All your actions are logged and monitored for security purposes. 
            Please ensure you follow all security protocols and never share your credentials.
          </p>
           <img src={lockImage} alt="lock" className="features2"/> 
        </div>
      </div>
    </div>
  );
}