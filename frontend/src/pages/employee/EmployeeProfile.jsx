import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './EmployeeProfile.css';
import ProfilePic from '../../assets/profile.jpg';
import lock from '../../assets/lock.png';

export default function EmployeeProfile() {
  const { user } = useAuth();

  // Mock employee data. In the full final part of the poe, this would come from the API
  const employeeData = {
    employeeId: user?.employeeId || 'EMP001',
    fullName: user?.name || 'Bank Employee',
    department: user?.department || 'International Payments',
    position: user?.position || 'Payment Verification Officer',
    email: user?.email || 'employee@globepay.com',
    phone: user?.phone || '+27 11 123 4567',
    dateJoined: user?.dateJoined || '2023-01-15',
    accessLevel: user?.accessLevel || 'Level 2 - Payment Verification'
  };

  return (
    <div className="employee-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img src={ProfilePic} alt="Employee Avatar" className="profile-avatar" />
          <div className="profile-title">
            <h2>{employeeData.fullName}</h2>
            <p className="profile-position">{employeeData.position}</p>
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
              <span className="info-label">Department</span>
              <span className="info-value">{employeeData.department}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{employeeData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{employeeData.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date Joined</span>
              <span className="info-value">{new Date(employeeData.dateJoined).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Access Level</span>
              <span className="info-value">{employeeData.accessLevel}</span>
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
            <img src={lock} alt="lock" className="features2"/> All your actions are logged and monitored for security purposes. 
            Please ensure you follow all security protocols and never share your credentials.
          </p>
          <button className="btn-change-password">Change Password</button>
        </div>
      </div>
    </div>
  );
}