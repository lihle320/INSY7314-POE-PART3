import React, { useState } from 'react';
import api from '../api';
import { regex } from '../utils/regex';
import './Register.css';

export default function Register(){
  const [form,setForm] = useState({
    fullName:'', idNumber:'', accountNumber:'', email:'', password:'', confirmPassword:''
  });
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [strength,setStrength] = useState(0);

  const onChange = e => {
    setForm(s => ({ ...s, [e.target.name]: e.target.value }));
    if(e.target.name === 'password') evaluateStrength(e.target.value);
  };

  const evaluateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    setStrength(score);
  };

  const validate = () => {
    if (!regex.fullName.test(form.fullName)) return 'Invalid full name';
    if (!regex.idNumber.test(form.idNumber)) return 'Invalid ID number';
    if (!regex.accountNumber.test(form.accountNumber)) return 'Invalid account number';
    if (!regex.email.test(form.email)) return 'Invalid email';
    if (!regex.password.test(form.password)) return 'Weak password';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    try {
      await api.post('/register', form);
      setSuccess('Registered successfully. Please log in.');
      setForm({ fullName:'', idNumber:'', accountNumber:'', email:'', password:'', confirmPassword:'' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-card">
      <h2>Create Account</h2>
      <form onSubmit={submit}>
        <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Full Name" />
        <input name="idNumber" value={form.idNumber} onChange={onChange} placeholder="ID Number" />
        <input name="accountNumber" value={form.accountNumber} onChange={onChange} placeholder="Account Number" />
        <input name="email" value={form.email} onChange={onChange} placeholder="Email" />
        <input type="password" name="password" value={form.password} onChange={onChange} placeholder="Password" />
        
        {/* Password strength bar */}
        <div className="strength-meter">
          <div className={`bar ${strength >= 1 ? 'active' : ''}`}></div>
          <div className={`bar ${strength >= 2 ? 'active' : ''}`}></div>
          <div className={`bar ${strength >= 3 ? 'active' : ''}`}></div>
          <div className={`bar ${strength >= 4 ? 'active' : ''}`}></div>
        </div>

        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Confirm Password" />
        <button type="submit" className="btn-primary">Register</button>
      </form>
      { error && <p className="error">{error}</p> }
      { success && <p className="success">{success}</p> }
    </div>
  );
}
