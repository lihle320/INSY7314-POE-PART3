import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { regex } from '../utils/regex'; 
import './Login.css';

export default function Login(){
  const [form,setForm] = useState({ accountNumber:'', password:'' });
  const [error,setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = e => setForm(s => ({...s, [e.target.name]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Login attempt with:', { 
      accountNumber: form.accountNumber, 
      password: form.password 
    });

   if (!regex.accountNumber.test(form.accountNumber)) { 
      setError('Invalid account number format.'); 
      setIsLoading(false);
      return; 
    }
    if (!form.password) { 
      setError('Password required.'); 
      setIsLoading(false);
      return; 
    }

    try {
      const response = await api.post('/users/login', form);
      
      console.log('Login successful:', response.data);
      
      if (response.data.token) {
        // Store token in both places for compatibility
        localStorage.setItem('token', response.data.token);
        sessionStorage.setItem('token', response.data.token);
        
        // Update AuthContext with user data
        const userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          accountNumber: form.accountNumber
        };
        
        console.log('Calling login() with user data:', userData);
        login(userData, false);
      
        setTimeout(() => {
          console.log('Navigating to dashboard...');
          navigate('/dashboard');
        }, 50); 
      }
    } catch (err) {
      console.error('Login failed:', err);
      console.log('Error details:', {
        status: err?.response?.status,
        message: err?.response?.data?.message,
        data: err?.response?.data
      });
      
      setError(err?.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
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
          placeholder="Account Number (10 digits)" 
          required 
        />
        <input 
          type="password" 
          name="password" 
          value={form.password} 
          onChange={onChange} 
          placeholder="Password" 
          required 
        />
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      { error && <p className="error">{error}</p> }

      <div style={{textAlign: 'center', marginTop: '15px'}}>
        No Account? <Link to="/register" style={{color: '#3b82f6', fontWeight: '600', textDecoration: 'none'}}>Register</Link>
      </div>
    </div>
  );
}