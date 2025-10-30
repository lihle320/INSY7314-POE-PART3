import React, { useEffect, useState } from 'react';
import api from '../../api';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [filter, payments]);

  const loadPayments = async () => {
    try {
      const res = await api.get('/employees/payments');
      setPayments(res.data || []);
      setLoading(false);
    } catch (err) {
      setError('Could not load payments. Please try again.');
      setLoading(false);
    }
  };

  const filterPayments = () => {
    if (filter === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(p => p.status.toLowerCase() === filter));
    }
  };

  const handleVerify = async (paymentId) => {
    setActionLoading(true);
    try {
      await api.post(`/employees/payments/${paymentId}/verify`);
      await loadPayments();
      setSelectedPayment(null);
      alert('Payment verified successfully');
    } catch (err) {
      alert(err?.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitToSwift = async (paymentId) => {
    if (!window.confirm('Are you sure you want to submit this payment to SWIFT?')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/employees/payments/${paymentId}/swift`);
      await loadPayments();
      setSelectedPayment(null);
      alert('Payment submitted to SWIFT successfully');
    } catch (err) {
      alert(err?.response?.data?.message || 'SWIFT submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (loading) {
    return <div className="dashboard-loading">Loading payments...</div>;
  }

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h2>Payment Verification Dashboard</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">{payments.filter(p => p.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{payments.filter(p => p.status === 'verified').length}</span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{payments.filter(p => p.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="payments-section">
        {filteredPayments.length > 0 ? (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Payee</th>
                <th>SWIFT Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>{payment.customerName || 'N/A'}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.currency}</td>
                  <td>{payment.payeeAccount}</td>
                  <td>{payment.swiftCode}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-payments">No payments found for the selected filter.</p>
        )}
      </div>

      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button className="btn-close" onClick={() => setSelectedPayment(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Transaction ID:</span>
                <span>{selectedPayment.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Customer:</span>
                <span>{selectedPayment.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span>{selectedPayment.amount} {selectedPayment.currency}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payee Account:</span>
                <span>{selectedPayment.payeeAccount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">SWIFT Code:</span>
                <span>{selectedPayment.swiftCode}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                {getStatusBadge(selectedPayment.status)}
              </div>
              <div className="detail-row">
                <span className="detail-label">Created:</span>
                <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="modal-actions">
              {selectedPayment.status === 'pending' && (
                <button 
                  className="btn-verify"
                  onClick={() => handleVerify(selectedPayment.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Verify Payment'}
                </button>
              )}
              {selectedPayment.status === 'verified' && (
                <button 
                  className="btn-swift"
                  onClick={() => handleSubmitToSwift(selectedPayment.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Submitting...' : 'Submit to SWIFT'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}