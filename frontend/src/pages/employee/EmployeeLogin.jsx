import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './EmployeeLogin.css';

export default function EmployeeLogin() {
  const [form, setForm] = useState({ employeeId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = e => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/employees/login', form);
      console.log(' LOGIN RESPONSE:', res.data);
      
      if (res.data.success && res.data.token && res.data.employee) {
        sessionStorage.setItem('token', res.data.token);
        localStorage.setItem('token', res.data.token);
        
        console.log('TOKEN STORED:', {
          sessionStorage: sessionStorage.getItem('token') ? 'YES' : 'NO',
          localStorage: localStorage.getItem('token') ? 'YES' : 'NO',
          tokenPreview: res.data.token.substring(0, 20) + '...'
        });
        
        login(res.data.employee, true);
        
        console.log(' Login successful, navigating to dashboard...');
        navigate('/employee/dashboard');
        
      } else {
        console.error('Login failed - missing token or employee data:', res.data);
        setError('Login failed: No authentication token received');
      }
      
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.error
        || err?.message 
        || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-container">
      <div className="employee-login-card">
        <div className="login-header">
          <h2>Employee Portal</h2>
          <p className="login-subtitle">Secure access for bank employees</p>
        </div>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input 
              id="employeeId"
              name="employeeId" 
              value={form.employeeId}
              onChange={onChange} 
              placeholder="Enter your employee ID" 
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              name="password"
              value={form.password} 
              onChange={onChange} 
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-employee-login" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="login-footer">
          <p className="security-notice">
            🔒 This is a secure employee portal. All access is monitored and logged.
          </p>
          <a href="/" className="back-link">← Back to Customer Portal</a>
        </div>
      </div>
    </div>
  );
}