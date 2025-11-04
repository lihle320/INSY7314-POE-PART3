import React, { useState, useEffect } from 'react';
import './Profile.css';
import api from '../api';
import ProfilePic from '../assets/profile.jpg';

export default function Profile(){
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        //calls the backend to get user profile info
        const res = await api.get('/users/profile');
        setUserProfile(res.data);
        setLoading(false);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load profile. Please log in again.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-card"><p>Loading profile...</p></div>;
  }

  if (error) {
    return <div className="profile-card"><p className="error">{error}</p></div>;
  }

  const user = userProfile || {}; 

  return (
    <div className="profile-card">
      <img src={ProfilePic} alt="User Avatar" className="profile-avatar" />
      
      <h2>{user.name}</h2>
      {user.balance !== undefined && (
        <p className="balance"><strong>Current Balance:</strong> R{user.balance.toFixed(2)}</p>
      )}
      <p><strong>ID Number:</strong> {user.userNationalId}</p>
      <p><strong>Account Number:</strong> {user.accountNumber}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}