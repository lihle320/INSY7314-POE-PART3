import React, { useEffect, useState } from 'react';
import api from '../api';
import './Dashboard.css';

export default function Dashboard(){
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        setCurrentUser(userName);
      //if the user has no token, they are not logged in and cant view transactions
        if (!token) {
          setError('Please log in to view transactions.');
          setIsLoading(false);
          return;
        }
        //calls the method to get transaction history from backend
        const res = await api.get('/payments/history'); 
        const paymentsData = res.data.history || res.data.payments || res.data || [];
        //grabs infomation about each transaction coming in and coming and formats it for display
        const meaningfulTransactions = paymentsData.map(payment => {
          const isOutgoing = (payment.fromUser && payment.fromUser.includes(userName)) || 
                            (payment.type && payment.type.includes('Sent')) ||
                            (payment.type && payment.type.includes('Debit'));

          const isIncoming = (payment.toUser && payment.toUser.includes(userName)) || 
                            (payment.type && payment.type.includes('Received')) ||
                            (payment.type && payment.type.includes('Credit'));

          return {
            id: payment._id || payment.id,
            date: payment.createdAt || payment.date || new Date().toISOString(),
            type: isOutgoing ? 'sent' : isIncoming ? 'received' : 'transfer',
            amount: payment.amount,
            originalAmount: payment.originalAmount || payment.amount,
            currency: payment.currency || 'ZAR',
            accountNumber: payment.accountNumber || payment.counterpartyAccount,
            status: payment.status || 'completed',
            description: payment.description || 'Payment transfer',
            direction: isOutgoing ? 'out' : 'in'
          };
        });

        // Sort by date, newest first
        meaningfulTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(meaningfulTransactions);
        
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load transaction history.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboard();
  }, []);

  // Calculate totals
  const totalSent = transactions
    .filter(t => t.direction === 'out')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalReceived = transactions
    .filter(t => t.direction === 'in')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <h2>Transaction History</h2>
        <p>Loading your transactions...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2>Transaction History</h2>
      
      {error && <p className="error">{error}</p>}

      {/* Summary Cards */}
      {transactions.length > 0 && (
        <div className="summary-cards">
          <div className="summary-card sent">
            <h3>Total Sent</h3>
            <p className="amount">-{totalSent.toFixed(2)} ZAR</p>
            <span className="count">{transactions.filter(t => t.direction === 'out').length} transactions</span>
          </div>
          <div className="summary-card received">
            <h3>Total Received</h3>
            <p className="amount">+{totalReceived.toFixed(2)} ZAR</p>
            <span className="count">{transactions.filter(t => t.direction === 'in').length} transactions</span>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 ? (
        <div className="transactions-section">
          <h3>All Transactions</h3>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount (ZAR)</th>
                <th>Original</th>
                <th>Account</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr key={t.id || index} className={`transaction-row ${t.direction}`}>
                  <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`type-badge ${t.type}`}>
                      {t.type === 'sent' ? 'Sent' : 'Received'}
                    </span>
                  </td>
                  <td className={`amount ${t.direction}`}>
                    {t.direction === 'out' ? '-' : '+'}{parseFloat(t.amount).toFixed(2)} ZAR
                  </td>
                  <td className="original-amount">
                    {parseFloat(t.originalAmount).toFixed(2)} {t.currency}
                  </td>
                  <td className="account-number">
                    {t.accountNumber ? `****${t.accountNumber.slice(-4)}` : 'N/A'}
                  </td>
                  <td className={`status ${t.status}`}>
                    {t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="empty-state">
            <p>No transactions yet</p>
            <p>Make your first payment to see transaction history here.</p>
          </div>
        )
      )}
    </div>
  );
}