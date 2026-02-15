import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getFines, payFine, waiveFine } from '../services/libraryService';

const FineManagement = ({ onUpdate }) => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid, waived
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const response = await getFines();
      setFines(response.data || []);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error fetching fines:', error);
      toast.error('Failed to fetch fines');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId, amount) => {
    const paymentAmount = window.prompt(`Enter payment amount (Fine: ৳${amount}):`);
    
    if (paymentAmount === null) return; // User cancelled
    
    const parsedAmount = parseFloat(paymentAmount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (parsedAmount > amount) {
      toast.error('Payment amount cannot exceed fine amount');
      return;
    }

    try {
      await payFine(fineId, { amount: parsedAmount });
      toast.success('Payment recorded successfully!');
      fetchFines();
    } catch (error) {
      console.error('Error paying fine:', error);
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const handleWaiveFine = async (fineId) => {
    const reason = window.prompt('Enter reason for waiving fine:');
    
    if (!reason) {
      toast.error('Reason is required');
      return;
    }

    try {
      await waiveFine(fineId, { reason });
      toast.success('Fine waived successfully!');
      fetchFines();
    } catch (error) {
      console.error('Error waiving fine:', error);
      toast.error(error.message || 'Failed to waive fine');
    }
  };

  const filteredFines = fines.filter(fine => {
    // Filter by status
    if (filter === 'pending' && fine.status !== 'pending') return false;
    if (filter === 'paid' && fine.status !== 'paid') return false;
    if (filter === 'waived' && fine.status !== 'waived') return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        fine.student?.name.toLowerCase().includes(searchLower) ||
        fine.student?.studentId.toLowerCase().includes(searchLower) ||
        fine.book?.title.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const totalPending = fines
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPaid = fines
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalWaived = fines
    .filter(f => f.status === 'waived')
    .reduce((sum, f) => sum + f.amount, 0);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="fine-management">
      {/* Summary Cards */}
      <div className="fine-summary">
        <div className="summary-card pending">
          <i className="fas fa-clock"></i>
          <div>
            <h4>Pending Fines</h4>
            <p className="amount">৳{totalPending}</p>
            <span className="count">{fines.filter(f => f.status === 'pending').length} fines</span>
          </div>
        </div>

        <div className="summary-card paid">
          <i className="fas fa-check-circle"></i>
          <div>
            <h4>Paid Fines</h4>
            <p className="amount">৳{totalPaid}</p>
            <span className="count">{fines.filter(f => f.status === 'paid').length} fines</span>
          </div>
        </div>

        <div className="summary-card waived">
          <i className="fas fa-times-circle"></i>
          <div>
            <h4>Waived Fines</h4>
            <p className="amount">৳{totalWaived}</p>
            <span className="count">{fines.filter(f => f.status === 'waived').length} fines</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="fine-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by student name, ID, or book title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
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
            className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
            onClick={() => setFilter('paid')}
          >
            Paid
          </button>
          <button
            className={`filter-btn ${filter === 'waived' ? 'active' : ''}`}
            onClick={() => setFilter('waived')}
          >
            Waived
          </button>
        </div>
      </div>

      {/* Fines List */}
      <div className="fines-list">
        {filteredFines.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-money-bill-wave"></i>
            <p>No fines found</p>
          </div>
        ) : (
          <div className="fines-table-container">
            <table className="fines-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Days Overdue</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFines.map(fine => (
                  <tr key={fine._id}>
                    <td>
                      <div className="student-info">
                        <strong>{fine.student?.name}</strong>
                        <span className="text-muted">{fine.student?.studentId}</span>
                      </div>
                    </td>
                    <td>
                      <div className="book-info">
                        <strong>{fine.book?.title}</strong>
                        <span className="text-muted">{fine.book?.author}</span>
                      </div>
                    </td>
                    <td>{new Date(fine.issueDate).toLocaleDateString()}</td>
                    <td>{new Date(fine.dueDate).toLocaleDateString()}</td>
                    <td>
                      {fine.returnDate 
                        ? new Date(fine.returnDate).toLocaleDateString()
                        : <span className="text-muted">Not returned</span>
                      }
                    </td>
                    <td>
                      <span className="badge badge-danger">
                        {fine.daysOverdue} days
                      </span>
                    </td>
                    <td>
                      <strong className="amount-text">৳{fine.amount}</strong>
                    </td>
                    <td>
                      <span className={`status-badge ${fine.status}`}>
                        {fine.status}
                      </span>
                    </td>
                    <td>
                      {fine.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-pay"
                            onClick={() => handlePayFine(fine._id, fine.amount)}
                            title="Pay Fine"
                          >
                            <i className="fas fa-dollar-sign"></i>
                          </button>
                          <button
                            className="btn-icon btn-waive"
                            onClick={() => handleWaiveFine(fine._id)}
                            title="Waive Fine"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                      {fine.status === 'paid' && (
                        <span className="text-success">
                          <i className="fas fa-check"></i> Paid on{' '}
                          {new Date(fine.paidDate).toLocaleDateString()}
                        </span>
                      )}
                      {fine.status === 'waived' && (
                        <span className="text-muted" title={fine.waiveReason}>
                          <i className="fas fa-info-circle"></i> Waived
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FineManagement;
