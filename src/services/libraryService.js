import api from './api';

// ==================== BOOK SERVICES ====================

// Get all books
export const getAllBooks = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/library/books${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single book
export const getBook = async (id) => {
  try {
    const response = await api.get(`/library/books/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new book
export const createBook = async (bookData) => {
  try {
    const formData = new FormData();
    
    Object.keys(bookData).forEach(key => {
      if (key === 'bookImage' && bookData[key] instanceof File) {
        formData.append('bookImage', bookData[key]);
      } else {
        formData.append(key, bookData[key]);
      }
    });

    const response = await api.post('/library/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update book
export const updateBook = async (id, bookData) => {
  try {
    const formData = new FormData();
    
    Object.keys(bookData).forEach(key => {
      if (key === 'bookImage' && bookData[key] instanceof File) {
        formData.append('bookImage', bookData[key]);
      } else {
        formData.append(key, bookData[key]);
      }
    });

    const response = await api.put(`/library/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete book
export const deleteBook = async (id) => {
  try {
    const response = await api.delete(`/library/books/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== ISSUE/RETURN SERVICES ====================

// Issue book
export const issueBook = async (issueData) => {
  try {
    const response = await api.post('/library/issue', issueData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Return book
export const returnBook = async (issueId, returnData) => {
  try {
    const response = await api.put(`/library/return/${issueId}`, returnData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all issues
export const getAllIssues = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/library/issues${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== FINE SERVICES ====================

// Get all fines
export const getAllFines = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/library/fines${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update fine status
export const updateFineStatus = async (fineId, statusData) => {
  try {
    const response = await api.put(`/library/fines/${fineId}`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== STATISTICS SERVICE ====================

// Get library statistics
export const getLibraryStats = async () => {
  try {
    const response = await api.get('/library/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};