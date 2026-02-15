import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ==================== LIBRARY STATS ====================
export const getLibraryStats = async () => {
  try {
    const response = await api.get('/library/stats');
    return response;
  } catch (error) {
    console.error('Error fetching library stats:', error);
    // Return mock data for development
    return {
      data: {
        totalBooks: 0,
        availableBooks: 0,
        issuedBooks: 0,
        overdueBooks: 0,
        todayReturns: 0,
        pendingFines: 0
      }
    };
  }
};

// ==================== BOOKS ====================
export const getBooks = async () => {
  try {
    const response = await api.get('/library/books');
    return response;
  } catch (error) {
    console.error('Error fetching books:', error);
    // Return empty array for development
    return { data: [] };
  }
};

export const getBookById = async (id) => {
  try {
    const response = await api.get(`/library/books/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const addBook = async (bookData) => {
  try {
    const response = await api.post('/library/books', bookData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const response = await api.put(`/library/books/${id}`, bookData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteBook = async (id) => {
  try {
    const response = await api.delete(`/library/books/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== BOOK ISSUES ====================
export const getIssuedBooks = async () => {
  try {
    const response = await api.get('/library/issues');
    return response;
  } catch (error) {
    console.error('Error fetching issued books:', error);
    return { data: [] };
  }
};

export const issueBook = async (issueData) => {
  try {
    const response = await api.post('/library/issues', issueData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const returnBook = async (issueId) => {
  try {
    const response = await api.put(`/library/issues/${issueId}/return`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getIssueById = async (id) => {
  try {
    const response = await api.get(`/library/issues/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== FINES ====================
export const getFines = async () => {
  try {
    const response = await api.get('/library/fines');
    return response;
  } catch (error) {
    console.error('Error fetching fines:', error);
    return { data: [] };
  }
};

export const payFine = async (fineId, paymentData) => {
  try {
    const response = await api.put(`/library/fines/${fineId}/pay`, paymentData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const waiveFine = async (fineId, waiveData) => {
  try {
    const response = await api.put(`/library/fines/${fineId}/waive`, waiveData);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== STUDENTS ====================
export const searchStudents = async (query) => {
  try {
    const response = await api.get(`/students/search?q=${query}`);
    return response;
  } catch (error) {
    console.error('Error searching students:', error);
    return { data: [] };
  }
};

export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== REPORTS ====================
export const getLibraryReports = async (params) => {
  try {
    const response = await api.get('/library/reports', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const exportLibraryData = async (type) => {
  try {
    const response = await api.get(`/library/export/${type}`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getLibraryStats,
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getIssuedBooks,
  issueBook,
  returnBook,
  getIssueById,
  getFines,
  payFine,
  waiveFine,
  searchStudents,
  getStudentById,
  getLibraryReports,
  exportLibraryData,
};
