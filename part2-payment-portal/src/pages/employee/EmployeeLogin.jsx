import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { regex } from '../../utils/regex';
import './EmployeeLogin.css';

export default function EmployeeLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.username || !form.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/employee/login', form);
      login(res.data.user, true);
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-container">
      <div className="employee-login-card">
        <div className="employee-login-header">
          <h2>Employee Portal</h2>
          <p>Secure Bank Staff Access</p>
        </div>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-employee-login"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to Staff Portal'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="employee-login-footer">
          <p className="info-text">
            🔒 This portal is for authorized bank employees only
          </p>
        </div>
      </div>
    </div>
  );
}