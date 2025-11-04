import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireEmployee = false }) {
  const { isAuthenticated, isEmployee, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={requireEmployee ? "/employee/login" : "/login"} replace />;
  }

  if (requireEmployee && !isEmployee) {
    return <Navigate to="/employee/login" replace />;
  }

  if (!requireEmployee && isEmployee) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}