import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import paymentService from '../services/paymentService';
import studentService from '../services/studentService';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  Plus, 
  Upload, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  Filter
} from 'lucide-react';
import './Payments.css';

const Payments = () => {
  const { user } = useSelector((state) => state.auth);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  
  // ✅ Filter State
  const [activeFilter, setActiveFilter] = useState('all');

  const [createForm, setCreateForm] = useState({
    student: '',
    amount: '',
    purpose: 'tuition_fee',
    description: '',
    dueDate: ''
  });

  const [paymentProof, setPaymentProof] = useState({
    transactionId: '',
    remarks: '',
    file: null
  });

  useEffect(() => {
    fetchPayments();
    if (user.role !== 'student') {
      fetchStudents();
    }
  }, [user.role]);

  // ✅ Filter payments when activeFilter or payments change
  useEffect(() => {
    filterPayments();
  }, [activeFilter, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllPayments();
      setPayments(data.data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data.data);
    } catch (error) {
      console.error('Failed to fetch students');
    }
  };

  // ✅ Filter Function
  const filterPayments = () => {
    if (activeFilter === 'all') {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter(payment => payment.status === activeFilter);
      setFilteredPayments(filtered);
    }
  };

  // ✅ Get count by status
  const getStatusCount = (status) => {
    if (status === 'all') return payments.length;
    return payments.filter(p => p.status === status).length;
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();

    try {
      await paymentService.createPaymentRequest(createForm);
      toast.success('Payment request created successfully');
      setShowCreateModal(false);
      setCreateForm({
        student: '',
        amount: '',
        purpose: 'tuition_fee',
        description: '',
        dueDate: ''
      });
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payment request');
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();

    if (!paymentProof.file) {
      toast.error('Please upload payment proof');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentProof.file);
      formData.append('transactionId', paymentProof.transactionId);
      formData.append('remarks', paymentProof.remarks);

      await paymentService.submitPaymentProof(selectedPayment._id, formData);
      toast.success('Payment proof submitted successfully');
      setShowPayModal(false);
      setPaymentProof({ transactionId: '', remarks: '', file: null });
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit payment proof');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await paymentService.updatePaymentStatus(id, { status });
      toast.success('Payment status updated');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Delete single payment
  const handleDeletePayment = async () => {
    try {
      await paymentService.deletePayment(deletePaymentId);
      toast.success('Payment deleted successfully');
      setShowDeleteConfirm(false);
      setDeletePaymentId(null);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete payment');
    }
  };

  // Delete all payments
  const handleDeleteAllPayments = async () => {
    try {
      const result = await paymentService.deleteAllPayments();
      toast.success(result.message || 'All payments deleted successfully');
      setShowDeleteAllConfirm(false);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete all payments');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalAmount = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPaidAmount = () => {
    return payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  return (
    <div className="payments-page">
      <div className="page-header">
        <div className="header-left">
          <CreditCard size={32} />
          <div>
            <h1>Payment Management</h1>
            <p>Manage student payments and fees</p>
          </div>
        </div>
        <div className="header-actions">
          {user.role === 'admin' && payments.length > 0 && (
            <button 
              className="btn-delete-all" 
              onClick={() => setShowDeleteAllConfirm(true)}
            >
              <Trash2 size={20} />
              Delete All
            </button>
          )}
          {user.role !== 'student' && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={20} />
              Create Payment Request
            </button>
          )}
        </div>
      </div>

      {/* Payment Stats */}
      <div className="payment-stats">
        <div className="stat-card total">
          <div className="stat-icon">
            <CreditCard size={30} />
          </div>
          <div className="stat-info">
            <h3>৳{getTotalAmount().toLocaleString()}</h3>
            <p>Total Amount</p>
          </div>
        </div>
        <div className="stat-card paid">
          <div className="stat-icon">
            <CheckCircle size={30} />
          </div>
          <div className="stat-info">
            <h3>৳{getPaidAmount().toLocaleString()}</h3>
            <p>Paid</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={30} />
          </div>
          <div className="stat-info">
            <h3>৳{getPendingAmount().toLocaleString()}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      {/* ✅ Filter Buttons */}
      <div className="filter-container">
        <div className="filter-header">
          <Filter size={20} />
          <h3>Filter by Status</h3>
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
            <span className="filter-count">{getStatusCount('all')}</span>
          </button>
          <button 
            className={`filter-btn pending ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            <Clock size={16} />
            Pending
            <span className="filter-count">{getStatusCount('pending')}</span>
          </button>
          <button 
            className={`filter-btn paid ${activeFilter === 'paid' ? 'active' : ''}`}
            onClick={() => setActiveFilter('paid')}
          >
            <CheckCircle size={16} />
            Paid
            <span className="filter-count">{getStatusCount('paid')}</span>
          </button>
          <button 
            className={`filter-btn rejected ${activeFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveFilter('rejected')}
          >
            <XCircle size={16} />
            Rejected
            <span className="filter-count">{getStatusCount('rejected')}</span>
          </button>
          <button 
            className={`filter-btn overdue ${activeFilter === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveFilter('overdue')}
          >
            <AlertTriangle size={16} />
            Overdue
            <span className="filter-count">{getStatusCount('overdue')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      ) : (
        <div className="payments-grid">
          {filteredPayments.length === 0 ? (
            <div className="no-data">
              {activeFilter === 'all' 
                ? 'No payment requests found' 
                : `No ${activeFilter} payments found`}
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment._id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-info">
                    <h3>৳{payment.amount.toLocaleString()}</h3>
                    <p className="payment-purpose">{payment.purpose.replace('_', ' ')}</p>
                  </div>
                  <span className={`status-badge ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>

                <div className="payment-body">
                  {user.role !== 'student' && (
                    <div className="info-row">
                      <span className="label">Student:</span>
                      <span className="value">{payment.student?.userId?.name}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">Description:</span>
                    <span className="value">{payment.description || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Due Date:</span>
                    <span className="value">{formatDate(payment.dueDate)}</span>
                  </div>
                  {payment.transactionId && (
                    <div className="info-row">
                      <span className="label">Transaction ID:</span>
                      <span className="value">{payment.transactionId}</span>
                    </div>
                  )}
                  {payment.paymentDate && (
                    <div className="info-row">
                      <span className="label">Payment Date:</span>
                      <span className="value">{formatDate(payment.paymentDate)}</span>
                    </div>
                  )}
                </div>

                <div className="payment-actions">
                  {user.role === 'student' && payment.status === 'pending' && (
                    <button
                      className="btn-pay"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPayModal(true);
                      }}
                    >
                      <Upload size={18} />
                      Submit Payment
                    </button>
                  )}

                  {user.role !== 'student' && payment.status === 'paid' && payment.paymentProof && (
                    <>
                      <button
                        className="btn-view"
                        onClick={() => window.open(payment.paymentProof, '_blank')}
                      >
                        <Eye size={18} />
                        View Proof
                      </button>
                      <button
                        className="btn-approve"
                        onClick={() => handleStatusUpdate(payment._id, 'paid')}
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleStatusUpdate(payment._id, 'rejected')}
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </>
                  )}

                  {/* Delete button - Admin only */}
                  {user.role === 'admin' && (
                    <button
                      className="btn-delete"
                      onClick={() => {
                        setDeletePaymentId(payment._id);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Payment Request</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreatePayment}>
                <div className="form-group">
                  <label>Select Student *</label>
                  <select
                    value={createForm.student}
                    onChange={(e) => setCreateForm({ ...createForm, student: e.target.value })}
                    required
                  >
                    <option value="">Choose Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.userId?.name} - {student.studentId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (৳) *</label>
                  <input
                    type="number"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Purpose *</label>
                  <select
                    value={createForm.purpose}
                    onChange={(e) => setCreateForm({ ...createForm, purpose: e.target.value })}
                    required
                  >
                    <option value="tuition_fee">Tuition Fee</option>
                    <option value="exam_fee">Exam Fee</option>
                    <option value="admission_fee">Admission Fee</option>
                    <option value="library_fee">Library Fee</option>
                    <option value="transport_fee">Transport Fee</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Enter description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submit Payment Proof Modal */}
      {showPayModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Payment Proof</h2>
              <button onClick={() => setShowPayModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <h3>Payment Details</h3>
                <div className="detail-row">
                  <span>Amount:</span>
                  <strong>৳{selectedPayment.amount.toLocaleString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Purpose:</span>
                  <strong>{selectedPayment.purpose.replace('_', ' ')}</strong>
                </div>
              </div>

              <form onSubmit={handleSubmitProof}>
                <div className="form-group">
                  <label>Transaction ID *</label>
                  <input
                    type="text"
                    value={paymentProof.transactionId}
                    onChange={(e) => setPaymentProof({ ...paymentProof, transactionId: e.target.value })}
                    placeholder="Enter transaction ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Payment Screenshot *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof({ ...paymentProof, file: e.target.files[0] })}
                    required
                  />
                  <small>Upload screenshot of bank transfer or payment confirmation</small>
                </div>

                <div className="form-group">
                  <label>Remarks</label>
                  <textarea
                    value={paymentProof.remarks}
                    onChange={(e) => setPaymentProof({ ...paymentProof, remarks: e.target.value })}
                    placeholder="Any additional notes"
                    rows="3"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowPayModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Upload size={18} />
                    Submit Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <AlertTriangle size={24} color="#f93e3e" />
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this payment request?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePaymentId(null);
                }}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeletePayment}>
                <Trash2 size={18} />
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteAllConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <AlertTriangle size={24} color="#f93e3e" />
              <h2>Confirm Delete All</h2>
            </div>
            <div className="modal-body">
              <p><strong>Warning!</strong> You are about to delete <strong>ALL {payments.length}</strong> payment requests.</p>
              <p className="warning-text">This action cannot be undone and will permanently remove all payment data.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteAllConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteAllPayments}>
                <Trash2 size={18} />
                Delete All Payments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;