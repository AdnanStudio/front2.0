import api from './api';

// ── Library Service ──────────────────────────────────────────────────────────
// Backend route: /api/library

// ==================== STATS ====================
export const getLibraryStats = async () => {
  const response = await api.get('/library/stats');
  return response.data;
};

// ==================== BOOKS ====================
export const getBooks = async (params) => {
  const response = await api.get('/library/books', { params });
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/library/books/${id}`);
  return response.data;
};

export const addBook = async (bookData) => {
  const response = await api.post('/library/books', bookData);
  return response.data;
};

export const updateBook = async (id, bookData) => {
  const response = await api.put(`/library/books/${id}`, bookData);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/library/books/${id}`);
  return response.data;
};

// ==================== BOOK ISSUES ====================
export const getIssuedBooks = async (params) => {
  const response = await api.get('/library/issues', { params });
  return response.data;
};

export const getIssueById = async (id) => {
  const response = await api.get(`/library/issues/${id}`);
  return response.data;
};

export const issueBook = async (issueData) => {
  const response = await api.post('/library/issues', issueData);
  return response.data;
};

export const returnBook = async (issueId) => {
  const response = await api.put(`/library/issues/${issueId}/return`);
  return response.data;
};

// ==================== FINES ====================
export const getFines = async (params) => {
  const response = await api.get('/library/fines', { params });
  return response.data;
};

export const payFine = async (fineId, paymentData) => {
  const response = await api.put(`/library/fines/${fineId}/pay`, paymentData);
  return response.data;
};

export const waiveFine = async (fineId, waiveData) => {
  const response = await api.put(`/library/fines/${fineId}/waive`, waiveData);
  return response.data;
};

// ==================== STUDENTS (search for library) ====================
export const searchStudents = async (query) => {
  const response = await api.get(`/students/search?q=${query}`);
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

// ==================== REPORTS ====================
export const getLibraryReports = async (params) => {
  const response = await api.get('/library/reports', { params });
  return response.data;
};

const libraryService = {
  getLibraryStats,
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getIssuedBooks,
  getIssueById,
  issueBook,
  returnBook,
  getFines,
  payFine,
  waiveFine,
  searchStudents,
  getStudentById,
  getLibraryReports,
};

export default libraryService;
