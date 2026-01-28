import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllIssues, issueBook, returnBook } from '../services/libraryService';
import { getAllBooks } from '../services/libraryService';
import api from '../services/api'; // ✅ Direct API call use করব
import './LibraryManagement.css';

const BookIssue = ({ onUpdate }) => {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [issueFormData, setIssueFormData] = useState({
    bookId: '',
    studentId: '',
    dueDate: ''
  });

  const [returnFormData, setReturnFormData] = useState({
    remarks: ''
  });

  useEffect(() => {
    fetchIssues();
    fetchBooks();
    fetchStudents();
  }, [filterStatus]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await getAllIssues(params);
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error(error.message || 'Failed to fetch book issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await getAllBooks({ status: 'Active' });
      setBooks(response.data.filter(book => book.availableQuantity > 0));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      // ✅ Direct API call দিয়ে students fetch করছি
      const response = await api.get('/students');
      setStudents(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await issueBook(issueFormData);
      toast.success('Book issued successfully!');
      resetIssueForm();
      fetchIssues();
      fetchBooks();
      onUpdate();
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error(error.message || 'Failed to issue book');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await returnBook(selectedIssue._id, returnFormData);
      toast.success(response.message);
      resetReturnForm();
      fetchIssues();
      onUpdate();
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.message || 'Failed to return book');
    }
  };

  const openReturnModal = (issue) => {
    setSelectedIssue(issue);
    setShowReturnModal(true);
  };

  const resetIssueForm = () => {
    setIssueFormData({
      bookId: '',
      studentId: '',
      dueDate: ''
    });
    setShowIssueModal(false);
  };

  const resetReturnForm = () => {
    setReturnFormData({ remarks: '' });
    setSelectedIssue(null);
    setShowReturnModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Issued':
        return 'status-issued';
      case 'Returned':
        return 'status-returned';
      case 'Overdue':
        return 'status-overdue';
      default:
        return '';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="book-issue">
      <div className="issue-header">
        <div className="filter-section">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Issued">Issued</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowIssueModal(true)}>
          <i className="fas fa-plus"></i> Issue New Book
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="issues-table-container">
          <table className="issues-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => {
                const daysRemaining = calculateDaysRemaining(issue.dueDate);
                return (
                  <tr key={issue._id}>
                    <td>
                      <div className="student-info">
                        <img 
                          src={issue.student?.profileImage || 'https://via.placeholder.com/40'} 
                          alt={issue.student?.name}
                          className="student-avatar"
                        />
                        <div>
                          <div className="student-name">{issue.student?.name}</div>
                          <div className="student-roll">Roll: {issue.student?.rollNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="book-info-cell">
                        <div className="book-title">{issue.book?.title}</div>
                        <div className="book-author">{issue.book?.author}</div>
                      </div>
                    </td>
                    <td>{formatDate(issue.issueDate)}</td>
                    <td>
                      <div>
                        {formatDate(issue.dueDate)}
                        {issue.status === 'Issued' && (
                          <div className={`days-remaining ${daysRemaining < 0 ? 'overdue' : daysRemaining <= 3 ? 'warning' : ''}`}>
                            {daysRemaining < 0 
                              ? `${Math.abs(daysRemaining)} days overdue` 
                              : daysRemaining === 0 
                              ? 'Due today' 
                              : `${daysRemaining} days left`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{issue.returnDate ? formatDate(issue.returnDate) : '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>{issue.fine > 0 ? `৳${issue.fine}` : '-'}</td>
                    <td>
                      {(issue.status === 'Issued' || issue.status === 'Overdue') && (
                        <button 
                          className="btn-return"
                          onClick={() => openReturnModal(issue)}
                        >
                          <i className="fas fa-undo"></i> Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {issues.length === 0 && !loading && (
        <div className="no-data">
          <i className="fas fa-book-open"></i>
          <p>No book issues found</p>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="modal-overlay" onClick={resetIssueForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Issue New Book</h2>
              <button className="close-btn" onClick={resetIssueForm}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleIssueSubmit}>
              <div className="form-group">
                <label>Select Student *</label>
                <select
                  value={issueFormData.studentId}
                  onChange={(e) => setIssueFormData(prev => ({ ...prev, studentId: e.target.value }))}
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} - Roll: {student.rollNumber} - Class: {student.class}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Book *</label>
                <select
                  value={issueFormData.bookId}
                  onChange={(e) => setIssueFormData(prev => ({ ...prev, bookId: e.target.value }))}
                  required
                >
                  <option value="">Choose a book...</option>
                  {books.map(book => (
                    <option key={book._id} value={book._id}>
                      {book.title} - {book.author} (Available: {book.availableQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={issueFormData.dueDate}
                  onChange={(e) => setIssueFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <small className="field-hint">Usually 14 days from issue date</small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetIssueForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Book Modal */}
      {showReturnModal && selectedIssue && (
        <div className="modal-overlay" onClick={resetReturnForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Return Book</h2>
              <button className="close-btn" onClick={resetReturnForm}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="return-details">
              <div className="detail-row">
                <strong>Student:</strong> {selectedIssue.student?.name}
              </div>
              <div className="detail-row">
                <strong>Book:</strong> {selectedIssue.book?.title}
              </div>
              <div className="detail-row">
                <strong>Issue Date:</strong> {formatDate(selectedIssue.issueDate)}
              </div>
              <div className="detail-row">
                <strong>Due Date:</strong> {formatDate(selectedIssue.dueDate)}
              </div>
              {calculateDaysRemaining(selectedIssue.dueDate) < 0 && (
                <div className="detail-row overdue-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <strong>Overdue by {Math.abs(calculateDaysRemaining(selectedIssue.dueDate))} days</strong>
                  <p>Fine will be calculated: ৳{Math.abs(calculateDaysRemaining(selectedIssue.dueDate)) * 5}</p>
                </div>
              )}
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className="form-group">
                <label>Remarks (Optional)</label>
                <textarea
                  value={returnFormData.remarks}
                  onChange={(e) => setReturnFormData({ remarks: e.target.value })}
                  rows="3"
                  placeholder="Any remarks about the book condition..."
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetReturnForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookIssue;