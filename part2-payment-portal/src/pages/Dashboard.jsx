import React, { useEffect, useState } from 'react';
import api from '../api';
import './Dashboard.css';

export default function Dashboard(){
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/payments');
        setPayments(res.data || []);
      } catch {
        setError('Could not load payments. Please log in.');
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard-card">
      <h2>My Payments</h2>
      { error && <p className="error">{error}</p> }

      {payments.length > 0 ? (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Payee (masked)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>{p.amount}</td>
                <td>{p.currency}</td>
                <td>{p.payeeMasked || '****'}</td>
                <td className={`status ${p.status}`}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No payments found.</p>
      )}
    </div>
  );
}
