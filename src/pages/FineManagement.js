import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllFines, updateFineStatus } from '../services/libraryService';
import './LibraryManagement.css';

const FineManagement = ({ onUpdate }) => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentRemarks, setPaymentRemarks] = useState('');

  useEffect(() => {
    fetchFines();
  }, [filterStatus]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await getAllFines(params);
      setFines(response.data);
    } catch (error) {
      console.error('Error fetching fines:', error);
      toast.error(error.message || 'Failed to fetch fines');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (status) => {
    try {
      await updateFineStatus(selectedFine._id, {
        status: status,
        remarks: paymentRemarks
      });
      toast.success(`Fine marked as ${status.toLowerCase()}`);
      resetPaymentForm();
      fetchFines();
      onUpdate();
    } catch (error) {
      console.error('Error updating fine:', error);
      toast.error(error.message || 'Failed to update fine');
    }
  };

  const openPaymentModal = (fine) => {
    setSelectedFine(fine);
    setShowPaymentModal(true);
  };

  const resetPaymentForm = () => {
    setSelectedFine(null);
    setPaymentRemarks('');
    setShowPaymentModal(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const getTotalPending = () => {
    return fines
      .filter(fine => fine.status === 'Pending')
      .reduce((sum, fine) => sum + fine.amount, 0);
  };

  const getTotalPaid = () => {
    return fines
      .filter(fine => fine.status === 'Paid')
      .reduce((sum, fine) => sum + fine.amount, 0);
  };

  return (
    <div className="fine-management">
      <div className="fine-header">
        <div className="fine-summary">
          <div className="summary-card pending">
            <h3>Pending Fines</h3>
            <p className="amount">৳{getTotalPending()}</p>
          </div>
          <div className="summary-card paid">
            <h3>Collected Fines</h3>
            <p className="amount">৳{getTotalPaid()}</p>
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Waived">Waived</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="fines-table-container">
          <table className="fines-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Book</th>
                <th>Reason</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Paid Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fines.map(fine => (
                <tr key={fine._id}>
                  <td>{formatDate(fine.createdAt)}</td>
                  <td>
                    <div className="student-info">
                      <img 
                        src={fine.student?.profileImage || 'https://via.placeholder.com/40'} 
                        alt={fine.student?.name}
                        className="student-avatar"
                      />
                      <div>
                        <div className="student-name">{fine.student?.name}</div>
                        <div className="student-roll">Roll: {fine.student?.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="book-info-cell">
                      <div className="book-title">{fine.bookIssue?.book?.title}</div>
                      <div className="book-author">{fine.bookIssue?.book?.author}</div>
                    </div>
                  </td>
                  <td>{fine.reason}</td>
                  <td className="amount-cell">৳{fine.amount}</td>
                  <td>
                    <span className={`status-badge status-${fine.status.toLowerCase()}`}>
                      {fine.status}
                    </span>
                  </td>
                  <td>{fine.paidDate ? formatDate(fine.paidDate) : '-'}</td>
                  <td>
                    {fine.status === 'Pending' && (
                      <button 
                        className="btn-pay"
                        onClick={() => openPaymentModal(fine)}
                      >
                        <i className="fas fa-check"></i> Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fines.length === 0 && !loading && (
        <div className="no-data">
          <i className="fas fa-money-bill-wave"></i>
          <p>No fines found</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFine && (
        <div className="modal-overlay" onClick={resetPaymentForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Fine Status</h2>
              <button className="close-btn" onClick={resetPaymentForm}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="payment-details">
              <div className="detail-row">
                <strong>Student:</strong> {selectedFine.student?.name}
              </div>
              <div className="detail-row">
                <strong>Book:</strong> {selectedFine.bookIssue?.book?.title}
              </div>
              <div className="detail-row">
                <strong>Reason:</strong> {selectedFine.reason}
              </div>
              <div className="detail-row">
                <strong>Amount:</strong> <span className="amount-highlight">৳{selectedFine.amount}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Remarks (Optional)</label>
              <textarea
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                rows="3"
                placeholder="Add any payment remarks..."
              ></textarea>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={resetPaymentForm}
              >
                Cancel
              </button>
              <button 
                className="btn-waive"
                onClick={() => handlePaymentSubmit('Waived')}
              >
                <i className="fas fa-times-circle"></i> Waive Fine
              </button>
              <button 
                className="btn-primary"
                onClick={() => handlePaymentSubmit('Paid')}
              >
                <i className="fas fa-check-circle"></i> Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManagement;