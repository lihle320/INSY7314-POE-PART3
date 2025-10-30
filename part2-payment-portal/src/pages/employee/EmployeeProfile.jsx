import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './EmployeeProfile.css';
import ProfilePic from '../../assets/profile.jpg';

export default function EmployeeProfile() {
  const { user } = useAuth();

  // Mock employee data 
  const employee = {
    fullName: user?.fullName || "Bank Employee",
    employeeId: user?.employeeId || "EMP001",
    username: user?.username || "employee",
    email: user?.email || "employee@globepay.com",
    department: user?.department || "International Payments",
    role: user?.role || "Payment Verification Officer",
    joinDate: user?.joinDate || "2023-01-15"
  };

  return (
    <div className="employee-profile-container">
      <div className="employee-profile-card">
        <div className="profile-header">
          <img src={ProfilePic} alt="Employee Avatar" className="employee-avatar" />
          <h2>{employee.fullName}</h2>
          <p className="employee-title">{employee.role}</p>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Personal Information</h3>
            <div className="detail-item">
              <span className="detail-label">Employee ID:</span>
              <span className="detail-value">{employee.employeeId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Username:</span>
              <span className="detail-value">{employee.username}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{employee.email}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Work Information</h3>
            <div className="detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{employee.department}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{employee.role}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Join Date:</span>
              <span className="detail-value">{new Date(employee.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-edit-profile">Edit Profile</button>
          <button className="btn-change-password">Change Password</button>
        </div>
      </div>
    </div>
  );
}