import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import EmployeeNavbar from './components/EmployeeNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Payments from './pages/Payments';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EmployeeLogin from './pages/employee/EmployeeLogin';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';

function AppContent() {
  const location = useLocation();
  const isEmployeeRoute = location.pathname.startsWith('/employee');

  return (
    <div className="app">
      {isEmployeeRoute ? <EmployeeNavbar /> : <Navbar />}
      
      <main style={{ padding: '1rem', minHeight: '75vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Protected Routes */}
          <Route path="/payments" element={
            <ProtectedRoute><Payments /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Employee Routes */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/dashboard" element={
            <ProtectedRoute requireEmployee={true}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee/profile" element={
            <ProtectedRoute requireEmployee={true}>
              <EmployeeProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}