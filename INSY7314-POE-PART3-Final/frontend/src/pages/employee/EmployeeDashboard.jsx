import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { user, isEmployee } = useAuth();

  useEffect(() => {
    console.log('Dashboard Debug:');
    console.log('Is Employee:', isEmployee);
    
    loadPendingTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [filter, transactions]);

  const loadPendingTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees/transactions/pending');
      console.log('Pending transactions loaded:', res.data.transactions?.length);
      setTransactions(res.data.transactions || []);
      setError('');
    } catch (err) {
      console.error('Error loading pending transactions:', err);
      setError('Could not load pending transactions. Please try again.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllTransactions = async () => {
    try {
      setLoading(true);
      
      const res = await api.get('/employees/transactions/all');
      console.log('All transactions loaded:', res.data.transactions?.length);
      setTransactions(res.data.transactions || []);
      setError('');
    } catch (err) {
      console.error('Error loading all transactions:', err);
      setError('Could not load all transactions. Please try again.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    
    if (newFilter === 'pending') {
      loadPendingTransactions();
    } else if (newFilter === 'all') {
      loadAllTransactions();
    }
  };

  const filterTransactions = () => {
    if (filter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.status.toLowerCase() === filter));
    }
  };

  const handleApprove = async (transactionId) => {
    if (!window.confirm('Are you sure you want to APPROVE this transaction? Funds will be transferred.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/employees/transactions/approve/${transactionId}`);
      if (filter === 'pending') {
        await loadPendingTransactions();
      } else {
        await loadAllTransactions();
      }
      setSelectedTransaction(null);
      alert('Transaction approved successfully! Funds have been transferred.');
    } catch (err) {
      console.error('Approve error:', err);
      alert(err?.response?.data?.message || 'Approval failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (transactionId) => {
    if (!window.confirm('Are you sure you want to REJECT this transaction?')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/employees/transactions/reject/${transactionId}`);
      if (filter === 'pending') {
        await loadPendingTransactions();
      } else {
        await loadAllTransactions();
      }
      setSelectedTransaction(null);
      alert('Transaction rejected successfully!');
    } catch (err) {
      console.error('Reject error:', err);
      alert(err?.response?.data?.message || 'Rejection failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="employee-dashboard">
        <div className="dashboard-loading">
          {filter === 'pending' ? 'Loading pending transactions...' : 'Loading all transactions...'}
        </div>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h2>International Payment Approval Dashboard</h2>
        <p className="dashboard-subtitle">Review and approve/reject international transactions</p>
        
        <div className="dashboard-stats">
          <div className="stat-card pending">
            <span className="stat-number">
              {transactions.filter(t => t.status === 'pending').length}
            </span>
            <span className="stat-label">Pending Approval</span>
          </div>
          <div className="stat-card total">
            <span className="stat-number">{transactions.length}</span>
            <span className="stat-label">Total Displayed</span>
          </div>
          <div className="stat-card all">
            <span className="stat-number">
              {filter === 'all' ? transactions.length : 'N/A'}
            </span>
            <span className="stat-label">All Transactions</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All Transactions
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => handleFilterChange('pending')}
        >
          Pending Approval
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => handleFilterChange(filter)} className="btn-retry">
            Retry
          </button>
        </div>
      )}

      <div className="transactions-section">
        {filteredTransactions.length > 0 ? (
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Sender</th>
                  <th>Sender Account</th>
                  <th>Original Amount</th>
                  <th>Currency</th>
                  <th>ZAR Amount</th>
                  <th>Recipient Account</th>
                  <th>SWIFT Code</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="transaction-row">
                    <td className="transaction-id">{transaction.transactionId}</td>
                    <td className="sender-name">{transaction.senderName}</td>
                    <td className="sender-account">{transaction.senderAccount}</td>
                    <td className="original-amount">
                      {transaction.originalAmount} {transaction.currency}
                    </td>
                    <td className="currency">{transaction.currency}</td>
                    <td className="zar-amount">
                      ZAR {transaction.convertedAmountZAR}
                    </td>
                    <td className="recipient-account">{transaction.recipientAccount}</td>
                    <td className="swift-code">{transaction.swiftCode}</td>
                    <td className="transaction-date">{formatDate(transaction.date)}</td>
                    <td className="status-cell">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-view-details"
                        onClick={() => setSelectedTransaction(transaction)}
                        title="View details"
                      >
                        Details
                      </button>
                      {transaction.status === 'pending' && (
                        <div className="action-buttons">
                          <button 
                            className="btn-approve-small"
                            onClick={() => handleApprove(transaction.id)}
                            disabled={actionLoading}
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button 
                            className="btn-reject-small"
                            onClick={() => handleReject(transaction.id)}
                            disabled={actionLoading}
                            title="Reject"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-transactions">
            <p>No {filter === 'pending' ? 'pending' : ''} transactions found.</p>
            {filter === 'pending' && transactions.length === 0 && (
              <p className="no-data-hint">
                There are currently no pending international transactions requiring approval.
              </p>
            )}
          </div>
        )}
      </div>

     {selectedTransaction && (
        <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button 
                className="btn-close" 
                onClick={() => setSelectedTransaction(null)}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{selectedTransaction.transactionId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sender:</span>
                  <span className="detail-value">{selectedTransaction.senderName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sender Account:</span>
                  <span className="detail-value">{selectedTransaction.senderAccount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Original Amount:</span>
                  <span className="detail-value">
                    {selectedTransaction.originalAmount} {selectedTransaction.currency}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Exchange Rate:</span>
                  <span className="detail-value">{selectedTransaction.exchangeRate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ZAR Amount:</span>
                  <span className="detail-value">ZAR {selectedTransaction.convertedAmountZAR}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Recipient Account:</span>
                  <span className="detail-value">{selectedTransaction.recipientAccount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">SWIFT Code:</span>
                  <span className="detail-value">{selectedTransaction.swiftCode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    {getStatusBadge(selectedTransaction.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date Submitted:</span>
                  <span className="detail-value">{formatDate(selectedTransaction.date)}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedTransaction.status === 'pending' && (
                <>
                  <button 
                    className="btn-approve"
                    onClick={() => handleApprove(selectedTransaction.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : '✓ Approve Transaction'}
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(selectedTransaction.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : '✗ Reject Transaction'}
                  </button>
                </>
              )}
              {selectedTransaction.status !== 'pending' && (
                <p className="action-note">
                  This transaction has already been {selectedTransaction.status}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}