import React from 'react';
import './Profile.css';
import ProfilePic from '../assets/profile.jpg';

export default function Profile(){
  // Mock user data 
  const user = {
    fullName: "Thabiso Mahlangu",
    idNumber: "1234567890123",
    accountNumber: "1234567890",
    email: "tmahlangu01@gmail.com"
  };

  return (
    <div className="profile-card">
      <img src={ProfilePic} alt="User Avatar" className="profile-avatar" />
      
      <h2>{user.fullName}</h2>
      <p><strong>ID Number:</strong> {user.idNumber}</p>
      <p><strong>Account Number:</strong> {user.accountNumber}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}
