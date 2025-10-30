import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { regex } from '../../utils/regex';
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

    // Validate employee ID (assuming numeric format)
    if (!form.employeeId || form.employeeId.length < 4) {
      setError('Invalid employee ID format');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/employees/login', form);
      
      // Store employee authentication
      login(res.data.employee, true);
      
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Check credentials.');
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
            />
          </div>

          <button type="submit" className="btn-employee-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {error && <p className="error">{error}</p>}
        
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
