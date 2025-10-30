import React, { useEffect, useState } from 'react';
import api from '../../api';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [filter, payments]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employee/payments');
      setPayments(res.data || []);
      setError('');
    } catch (err) {
      setError('Could not load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    if (filter === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(p => p.status === filter));
    }
  };

  const verifyPayment = async (id) => {
    try {
      await api.post(`/employee/payments/${id}/verify`);
      setSuccess('Payment verified successfully!');
      loadPayments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Verification failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const submitToSwift = async (id) => {
    try {
      await api.post(`/employee/payments/${id}/swift`);
      setSuccess('Payment submitted to SWIFT successfully!');
      loadPayments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'SWIFT submission failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openModal = (payment) => {
    setSelectedPayment(payment);
  };

  const closeModal = () => {
    setSelectedPayment(null);
  };

  if (loading) {
    return <div className="loading-container">Loading payments...</div>;
  }

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h2>Payment Verification Dashboard</h2>
        <p>Review and process customer international payments</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({payments.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({payments.filter(p => p.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified ({payments.filter(p => p.status === 'verified').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({payments.filter(p => p.status === 'completed').length})
        </button>
      </div>

      <div className="payments-grid">
        {filteredPayments.length === 0 ? (
          <p className="no-payments">No payments found for this filter.</p>
        ) : (
          filteredPayments.map(payment => (
            <div key={payment.id} className={`payment-card status-${payment.status}`}>
              <div className="payment-card-header">
                <span className={`status-badge ${payment.status}`}>
                  {payment.status.toUpperCase()}
                </span>
                <span className="payment-date">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">{payment.currency} {payment.amount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Payee:</span>
                  <span className="value">{payment.payeeMasked || '****'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">SWIFT:</span>
                  <span className="value">{payment.swiftCode}</span>
                </div>
              </div>

              <div className="payment-actions">
                <button 
                  className="btn-view" 
                  onClick={() => openModal(payment)}
                >
                  View Details
                </button>
                
                {payment.status === 'pending' && (
                  <button 
                    className="btn-verify" 
                    onClick={() => verifyPayment(payment.id)}
                  >
                    Verify
                  </button>
                )}
                
                {payment.status === 'verified' && (
                  <button 
                    className="btn-swift" 
                    onClick={() => submitToSwift(payment.id)}
                  >
                    Submit to SWIFT
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-detail">
                <strong>Payment ID:</strong> {selectedPayment.id}
              </div>
              <div className="modal-detail">
                <strong>Status:</strong> <span className={`status-badge ${selectedPayment.status}`}>{selectedPayment.status}</span>
              </div>
              <div className="modal-detail">
                <strong>Amount:</strong> {selectedPayment.currency} {selectedPayment.amount}
              </div>
              <div className="modal-detail">
                <strong>Payee Account:</strong> {selectedPayment.payeeAccount}
              </div>
              <div className="modal-detail">
                <strong>SWIFT Code:</strong> {selectedPayment.swiftCode}
              </div>
              <div className="modal-detail">
                <strong>Created:</strong> {new Date(selectedPayment.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}