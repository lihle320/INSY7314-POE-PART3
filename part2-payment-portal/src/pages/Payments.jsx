import React, { useState } from 'react';
import api from '../api';
import { regex } from '../utils/regex';
import './Payments.css';

export default function Payments(){
  const [form,setForm] = useState({ payeeAccount:'', swiftCode:'', currency:'ZAR', amount:'' });
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');

  const onChange = e => setForm(s => ({...s, [e.target.name]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    if (!regex.accountNumber.test(form.payeeAccount)) return setError('Invalid payee account');
    if (!regex.swiftCode.test(form.swiftCode)) return setError('Invalid SWIFT code');
    if (!regex.currency.test(form.currency)) return setError('Invalid currency');
    if (!regex.amount.test(form.amount)) return setError('Invalid amount');

    try {
      await api.post('/payments', form);
      setSuccess('Payment submitted');
      setError('');
      setForm({ payeeAccount:'', swiftCode:'', currency:'ZAR', amount:'' });
    } catch {
      setError('Payment failed');
    }
  };

  return (
    <div className="form-card">
      <h2>Send Payment</h2>
      <form onSubmit={submit}>
        <input name="payeeAccount" value={form.payeeAccount} onChange={onChange} placeholder="Payee Account" />
        <input name="swiftCode" value={form.swiftCode} onChange={onChange} placeholder="SWIFT Code" />
        <input name="currency" value={form.currency} onChange={onChange} placeholder="Currency (ZAR)" />
        <input name="amount" value={form.amount} onChange={onChange} placeholder="Amount (e.g. 100.00)" />
        <button type="submit" className="btn-primary">Submit Payment</button>
      </form>
      { error && <p className="error">{error}</p> }
      { success && <p className="success">{success}</p> }
    </div>
  );
}
