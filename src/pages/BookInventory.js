import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllBooks, createBook, updateBook, deleteBook } from '../services/libraryService';
import './LibraryManagement.css';

const BookInventory = ({ onUpdate }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: '',
    totalQuantity: '',
    shelf: '',
    description: '',
    bookImage: null,
    status: 'Active'
  });

  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 
    'History', 'Geography', 'Literature', 'Reference', 'Other'
  ];

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, filterCategory]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;

      const response = await getAllBooks(params);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error(error.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, bookImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBook) {
        await updateBook(editingBook._id, formData);
        toast.success('Book updated successfully!');
      } else {
        await createBook(formData);
        toast.success('Book added successfully!');
      }
      
      resetForm();
      fetchBooks();
      onUpdate();
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
      publishedYear: book.publishedYear || '',
      totalQuantity: book.totalQuantity,
      shelf: book.shelf || '',
      description: book.description || '',
      bookImage: null,
      status: book.status
    });
    setImagePreview(book.bookImage);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(id);
        toast.success('Book deleted successfully!');
        fetchBooks();
        onUpdate();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error(error.message || 'Failed to delete book');
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
      publishedYear: '',
      totalQuantity: '',
      shelf: '',
      description: '',
      bookImage: null,
      status: 'Active'
    });
    setImagePreview(null);
    setEditingBook(null);
    setShowModal(false);
  };

  return (
    <div className="book-inventory">
      <div className="inventory-header">
        <div className="search-filter">
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Add New Book
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book._id} className="book-card">
              <div className="book-image">
                <img src={book.bookImage} alt={book.title} />
                <span className={`status-badge ${book.status.toLowerCase()}`}>
                  {book.status}
                </span>
              </div>
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-author">By {book.author}</p>
                <p className="book-isbn">ISBN: {book.isbn}</p>
                <p className="book-category">
                  <i className="fas fa-tag"></i> {book.category}
                </p>
                <div className="book-quantity">
                  <span>Available: {book.availableQuantity}/{book.totalQuantity}</span>
                </div>
                <div className="book-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(book)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(book._id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {books.length === 0 && !loading && (
        <div className="no-data">
          <i className="fas fa-book"></i>
          <p>No books found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Book Image</label>
                  <div className="image-upload">
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

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
                  <label>Published Year</label>
                  <input
                    type="number"
                    name="publishedYear"
                    value={formData.publishedYear}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Total Quantity *</label>
                  <input
                    type="number"
                    name="totalQuantity"
                    value={formData.totalQuantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Shelf</label>
                  <input
                    type="text"
                    name="shelf"
                    value={formData.shelf}
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

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookInventory;