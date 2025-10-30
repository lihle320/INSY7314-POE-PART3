import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
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
    sessionStorage.setItem('isEmployee', employeeStatus.toString());
  };

  const logout = () => {
    setUser(null);
    setIsEmployee(false);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isEmployee');
  };

  return (
    <AuthContext.Provider value={{ user, isEmployee, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};