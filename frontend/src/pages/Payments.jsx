import React, { useState } from 'react';
import api from '../api';
import { regex } from '../utils/regex';
import './Payments.css';

export default function Payments(){
  const [form,setForm] = useState({ 
    recipientAccountNumber: '', 
    swiftCode: '',
    currency: 'ZAR',
    amount: '', 
    description: '' 
  });
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onChange = e => setForm(s => ({...s, [e.target.name]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // Validation (Web Dev Simplified ,2019
    if (!regex.accountNumber.test(form.recipientAccountNumber)) {
      setError('Recipient account number must be exactly 10 digits');
      setIsLoading(false);
      return;
    }
    if (!regex.swiftCode.test(form.swiftCode)) {
      setError('SWIFT code must be 8-11 characters (e.g., ABCDUSXX)');
      setIsLoading(false);
      return;
    }
    if (!regex.amount.test(form.amount)) {
      setError('Invalid amount format (e.g., 100.00)');
      setIsLoading(false);
      return;
    }
//takes all info inputted from the form and sends it to the backend
    try {
      const paymentData = {
        recipientAccountNumber: form.recipientAccountNumber,
        swiftCode: form.swiftCode,
        currency: form.currency,
        amount: parseFloat(form.amount),
        description: form.description || 'International payment transfer'
      };
      
      const res = await api.post('/payments/pay', paymentData);
      //successfully made payment
      setSuccess(res.data.message || 'Payment submitted successfully!');
      setForm({ 
        recipientAccountNumber: '', 
        swiftCode: '',
        currency: 'ZAR',
        amount: '', 
        description: '' 
      });
      //failed to make payment
    } catch (err) {
      setError(err?.response?.data?.message || 'Payment failed. Please check the details and ensure sufficient balance.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Send International Payment</h2>
      <form onSubmit={submit}>
        <input 
          name="recipientAccountNumber" 
          value={form.recipientAccountNumber} 
          onChange={onChange} 
          placeholder="Recipient Account Number (10 digits)" 
          required 
        />
        <input 
          name="swiftCode" 
          value={form.swiftCode} 
          onChange={onChange} 
          placeholder="SWIFT/BIC Code (e.g., ABCDUSXX)" 
          required 
        />
        <select 
          name="currency" 
          value={form.currency} 
          onChange={onChange} 
          required
        >
          <option value="ZAR">South African Rand (ZAR)</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="GBP">British Pound (GBP)</option>
          <option value="JPY">Japanese Yen (JPY)</option>
        </select>
        <input 
          name="amount" 
          value={form.amount} 
          onChange={onChange} 
          placeholder="Amount (e.g., 100.00)" 
          required 
        />
        <input 
          name="description" 
          value={form.description} 
          onChange={onChange} 
          placeholder="Description (optional)" 
        />
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Submit Payment'}
        </button>
      </form>
      { error && <p className="error">{error}</p> }
      { success && <p className="success">{success}</p> }
    </div>
  );
}