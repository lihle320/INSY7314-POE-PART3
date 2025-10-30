import React, { useState } from 'react';
import { Link } from 'react-router-dom';

//api client
const api = {
    post: async (url, data) => {
        const token = localStorage.getItem('token'); 
        
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api' + url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw { response: { data: responseData, status: response.status } };
        }

        return { data: responseData };
    }
};

const regex = {
    fullName: /^[A-Za-z]+(?:\s[A-Za-z]+)+$/, 
    idNumber: /^\d{13}$/, 
    accountNumber: /^\d{10}$/, 
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
};

export default function Register(){
  const [form,setForm] = useState({
    fullName:'', idNumber:'', accountNumber:'', email:'', password:'', confirmPassword:''
  });
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [strength,setStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!regex.fullName.test(form.fullName)) return 'Full Name must be at least two words (letters only).';
    if (!regex.idNumber.test(form.idNumber)) return 'National ID must be exactly 13 digits.'; 
    if (!regex.accountNumber.test(form.accountNumber)) return 'Account number must be exactly 10 digits.'; 
    if (!regex.email.test(form.email)) return 'Invalid email address.';
    if (!regex.password.test(form.password)) return 'Password must be 8+ chars, including uppercase, lowercase, number, and special character.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const v = validate();
    if (v) { 
      setError(v); 
      setIsLoading(false);
      return; 
    }
    
    try {
        const backendData = {
            name: form.fullName.trim(),          
            userNationalId: form.idNumber.trim(), 
            accountNumber: form.accountNumber.trim(),
            email: form.email.trim(),
            password: form.password
        };

        const response = await api.post('/users/register', backendData); 
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        setSuccess('Registered successfully! Please log in.');
        setForm({ fullName:'', idNumber:'', accountNumber:'', email:'', password:'', confirmPassword:'' });
        setError('');
        
    } catch (err) {
        setError(err?.response?.data?.message || 'Registration failed due to a server error.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="form-card">
        <style>{`
            .form-card { max-width: 450px; margin: 30px auto; padding: 30px; border-radius: 16px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); background-color: #f9fafb; font-family: 'Inter', sans-serif; }
            .form-card h2 { text-align: center; color: #1f2937; margin-bottom: 25px; font-size: 2rem; font-weight: 700; }
            .form-card form { display: flex; flex-direction: column; gap: 12px; }
            .form-card input { padding: 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; }
            .form-card input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
            .btn-primary { padding: 14px; background-color: #3b82f6; color: white; border: none; border-radius: 10px; font-size: 1.1rem; cursor: pointer; font-weight: 600; transition: background-color 0.2s, transform: 0.1s; margin-top: 10px; }
            .btn-primary:hover { background-color: #2563eb; transform: translateY(-1px); }
            .btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; transform: none; }
            .error { color: #dc2626; background-color: #fee2e2; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center; font-weight: 500; }
            .success { color: #059669; background-color: #d1fae5; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center; font-weight: 500; }
            
            .strength-meter { display: flex; gap: 4px; height: 8px; margin-top: 5px; margin-bottom: 5px; }
            .strength-meter .bar { flex-grow: 1; border-radius: 4px; background-color: #e5e7eb; transition: background-color 0.3s; }
            .strength-meter .bar.active:nth-child(1) { background-color: #fca5a5; }
            .strength-meter .bar.active:nth-child(2) { background-color: #fcd34d; }
            .strength-meter .bar.active:nth-child(3) { background-color: #4ade80; }
            .strength-meter .bar.active:nth-child(4) { background-color: #16a34a; }
        `}</style>
      
      <h2>Create Account</h2>
      
      <form onSubmit={submit}>
        <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Full Name (e.g., Jane Doe)" required />
        <input name="idNumber" value={form.idNumber} onChange={onChange} placeholder="National ID (13 digits)" required />
        <input name="accountNumber" value={form.accountNumber} onChange={onChange} placeholder="Account Number (10 digits)" required />
        <input name="email" value={form.email} onChange={onChange} placeholder="Email" required />
        <input type="password" name="password" value={form.password} onChange={onChange} placeholder="Password" required />
        
        <div className="strength-meter">
          <div className={`bar ${strength >= 1 ? 'active' : ''}`}></div>
          <div className={`bar ${strength >= 2 ? 'active' : ''}`}></div>
          <div className="bar active" style={{ backgroundColor: strength >= 3 ? '#4ade80' : '#e5e7eb' }}></div>
          <div className="bar active" style={{ backgroundColor: strength >= 4 ? '#16a34a' : '#e5e7eb' }}></div>
        </div>

        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Confirm Password" required />
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div style={{textAlign: 'center', marginTop: '15px'}}>
        Already have an account? <Link to="/login" style={{color: '#3b82f6', fontWeight: '600', textDecoration: 'none'}}>Login here</Link>
      </div>
    </div>
  );
}