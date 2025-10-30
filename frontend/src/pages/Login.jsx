import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { regex } from '../utils/regex';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ accountNumber: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = e => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!regex.accountNumber.test(form.accountNumber)) {
      setError('Invalid account number');
      return;
    }
    if (!form.password) {
      setError('Password required');
      return;
    }
    try {
      const res = await api.post('/login', form);
      // Store customer authentication (false = not employee)
      login(res.data.user, false);
      navigate('/dashboard');
    } catch {
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <div className="form-card">
      <h2>Welcome Back</h2>
      <form onSubmit={submit}>
        <input 
          name="accountNumber" 
          value={form.accountNumber}
          onChange={onChange} 
          placeholder="Account Number" 
        />
        <input 
          type="password" 
          name="password"
          value={form.password} 
          onChange={onChange} 
          placeholder="Password" 
        />
        <button type="submit" className="btn-primary">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="register-text">
        No Account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}