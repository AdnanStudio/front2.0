import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getBooks, 
  addBook, 
  updateBook, 
  deleteBook 
} from '../services/libraryService';

const BookInventory = ({ onUpdate }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publicationYear: '',
    quantity: '',
    rack: '',
    description: ''
  });

  const categories = [
    'Science', 'Mathematics', 'Literature', 'History', 
    'Geography', 'Computer Science', 'Physics', 'Chemistry',
    'Biology', 'English', 'Bengali', 'General Knowledge',
    'Fiction', 'Non-Fiction', 'Reference', 'Other'
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await getBooks();
      setBooks(response.data || []);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBook) {
        await updateBook(editingBook._id, formData);
        toast.success('Book updated successfully!');
      } else {
        await addBook(formData);
        toast.success('Book added successfully!');
      }
      
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error(error.message || 'Failed to save book');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      quantity: book.quantity,
      rack: book.rack || '',
      description: book.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
        toast.success('Book deleted successfully!');
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publicationYear: '',
      quantity: '',
      rack: '',
      description: ''
    });
    setEditingBook(null);
    setShowForm(false);
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || book.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="book-inventory">
      {/* Header */}
      <div className="inventory-header">
        <h2>📚 Book Inventory</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus"></i> Add New Book
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="book-form-container">
          <div className="form-header">
            <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
            <button className="btn-close" onClick={resetForm}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Publication Year</label>
                <input
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Rack Number</label>
                <input
                  type="text"
                  name="rack"
                  value={formData.rack}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingBook ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="books-table-container">
        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-book"></i>
            <p>No books found</p>
          </div>
        ) : (
          <table className="books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Publisher</th>
                <th>Year</th>
                <th>Quantity</th>
                <th>Available</th>
                <th>Rack</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td><span className="badge">{book.category}</span></td>
                  <td>{book.publisher || '-'}</td>
                  <td>{book.publicationYear || '-'}</td>
                  <td>{book.quantity}</td>
                  <td>
                    <span className={`availability ${book.available > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {book.available || 0}
                    </span>
                  </td>
                  <td>{book.rack || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(book)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(book._id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BookInventory;
