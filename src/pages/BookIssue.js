import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getIssuedBooks, 
  issueBook, 
  returnBook,
  getBooks,
  searchStudents 
} from '../services/libraryService';

const BookIssue = ({ onUpdate }) => {
  const [activeTab, setActiveTab] = useState('issue');
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    bookId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuedResponse, booksResponse] = await Promise.all([
        getIssuedBooks(),
        getBooks()
      ]);
      
      setIssuedBooks(issuedResponse.data || []);
      setBooks(booksResponse.data || []);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSearch = async (query) => {
    setStudentSearch(query);
    if (query.length < 2) {
      setStudents([]);
      return;
    }

    try {
      const response = await searchStudents(query);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    
    try {
      await issueBook(issueForm);
      toast.success('Book issued successfully!');
      
      setIssueForm({
        studentId: '',
        bookId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: ''
      });
      setStudentSearch('');
      
      fetchData();
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error(error.message || 'Failed to issue book');
    }
  };

  const handleReturn = async (issueId) => {
    if (window.confirm('Confirm book return?')) {
      try {
        await returnBook(issueId);
        toast.success('Book returned successfully!');
        fetchData();
      } catch (error) {
        console.error('Error returning book:', error);
        toast.error(error.message || 'Failed to return book');
      }
    }
  };

  const calculateFine = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    return diffDays * 5; // 5 taka per day
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const availableBooks = books.filter(book => 
    book.available > 0 && 
    book.title.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const filteredIssuedBooks = issuedBooks.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.student?.name.toLowerCase().includes(searchLower) ||
      issue.student?.studentId.toLowerCase().includes(searchLower) ||
      issue.book?.title.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="book-issue">
      {/* Tabs */}
      <div className="issue-tabs">
        <button
          className={`tab-btn ${activeTab === 'issue' ? 'active' : ''}`}
          onClick={() => setActiveTab('issue')}
        >
          <i className="fas fa-hand-holding"></i> Issue Book
        </button>
        <button
          className={`tab-btn ${activeTab === 'issued' ? 'active' : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          <i className="fas fa-list"></i> Issued Books ({issuedBooks.length})
        </button>
      </div>

      {/* Issue Book Form */}
      {activeTab === 'issue' && (
        <div className="issue-form-container">
          <h3>Issue New Book</h3>
          
          <form onSubmit={handleIssue} className="issue-form">
            {/* Student Search */}
            <div className="form-group">
              <label>Student *</label>
              <input
                type="text"
                placeholder="Search student by name or ID..."
                value={studentSearch}
                onChange={(e) => handleStudentSearch(e.target.value)}
                required
              />
              
              {students.length > 0 && (
                <div className="search-results">
                  {students.map(student => (
                    <div
                      key={student._id}
                      className="search-result-item"
                      onClick={() => {
                        setIssueForm(prev => ({ ...prev, studentId: student._id }));
                        setStudentSearch(`${student.name} (${student.studentId})`);
                        setStudents([]);
                      }}
                    >
                      <strong>{student.name}</strong>
                      <span className="student-id">{student.studentId}</span>
                      <span className="student-class">Class {student.class}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Book Search */}
            <div className="form-group">
              <label>Book *</label>
              <input
                type="text"
                placeholder="Search book by title..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
              />
              
              {bookSearch && (
                <div className="search-results">
                  {availableBooks.length === 0 ? (
                    <div className="no-results">No available books found</div>
                  ) : (
                    availableBooks.slice(0, 5).map(book => (
                      <div
                        key={book._id}
                        className="search-result-item"
                        onClick={() => {
                          setIssueForm(prev => ({ ...prev, bookId: book._id }));
                          setBookSearch(book.title);
                        }}
                      >
                        <strong>{book.title}</strong>
                        <span className="book-author">{book.author}</span>
                        <span className="badge-success">Available: {book.available}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Issue Date *</label>
                <input
                  type="date"
                  value={issueForm.issueDate}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, issueDate: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                  min={issueForm.issueDate}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={issueForm.notes}
                onChange={(e) => setIssueForm(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                placeholder="Any additional notes..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              <i className="fas fa-check"></i> Issue Book
            </button>
          </form>
        </div>
      )}

      {/* Issued Books List */}
      {activeTab === 'issued' && (
        <div className="issued-books-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by student name, ID, or book title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredIssuedBooks.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book-open"></i>
              <p>No issued books found</p>
            </div>
          ) : (
            <div className="issued-books-grid">
              {filteredIssuedBooks.map(issue => {
                const fine = issue.status === 'issued' ? calculateFine(issue.dueDate) : 0;
                const overdue = issue.status === 'issued' && isOverdue(issue.dueDate);

                return (
                  <div key={issue._id} className={`issued-book-card ${overdue ? 'overdue' : ''}`}>
                    <div className="card-header">
                      <h4>{issue.book?.title}</h4>
                      <span className={`status-badge ${issue.status}`}>
                        {issue.status}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="info-row">
                        <i className="fas fa-user"></i>
                        <div>
                          <strong>{issue.student?.name}</strong>
                          <span className="text-muted">{issue.student?.studentId}</span>
                        </div>
                      </div>

                      <div className="info-row">
                        <i className="fas fa-book"></i>
                        <div>
                          <span className="text-muted">{issue.book?.author}</span>
                          <span className="text-muted">ISBN: {issue.book?.isbn}</span>
                        </div>
                      </div>

                      <div className="info-row">
                        <i className="fas fa-calendar"></i>
                        <div>
                          <span>Issued: {new Date(issue.issueDate).toLocaleDateString()}</span>
                          <span className={overdue ? 'text-danger' : ''}>
                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {issue.returnDate && (
                        <div className="info-row">
                          <i className="fas fa-check-circle"></i>
                          <span>Returned: {new Date(issue.returnDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {fine > 0 && (
                        <div className="fine-alert">
                          <i className="fas fa-exclamation-triangle"></i>
                          <strong>Fine: ৳{fine}</strong>
                          <span>{Math.ceil((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24))} days overdue</span>
                        </div>
                      )}
                    </div>

                    {issue.status === 'issued' && (
                      <div className="card-footer">
                        <button
                          className="btn btn-success"
                          onClick={() => handleReturn(issue._id)}
                        >
                          <i className="fas fa-undo"></i> Return Book
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookIssue;
