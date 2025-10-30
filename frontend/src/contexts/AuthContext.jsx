import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = sessionStorage.getItem('user');
    const storedIsEmployee = sessionStorage.getItem('isEmployee');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsEmployee(storedIsEmployee === 'true');
    }
    setLoading(false);
  }, []);

  const login = (userData, employeeStatus = false) => {
    setUser(userData);
    setIsEmployee(employeeStatus);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('isEmployee', employeeStatus);
  };

  const logout = () => {
    setUser(null);
    setIsEmployee(false);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isEmployee');
  };

  const value = {
    user,
    isEmployee,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;