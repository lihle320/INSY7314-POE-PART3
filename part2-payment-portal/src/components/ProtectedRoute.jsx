import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireEmployee = false }) {
  const { user, isEmployee, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={requireEmployee ? "/employee/login" : "/login"} replace />;
  }

  if (requireEmployee && !isEmployee) {
    return <Navigate to="/login" replace />;
  }

  return children;
}