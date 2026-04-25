
// FILE PATH: src/services/markService.js
// ============================================================
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Auto-attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log response errors in dev
API.interceptors.response.use(
  res => res,
  err => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[markService] Error:',
        err.response?.status,
        err.response?.data?.message || err.message
      );
    }
    return Promise.reject(err);
  }
);

const markService = {

  // ── Save / upsert one student's marks ─────────────────────
  // POST /api/marks
  saveMarks: (data) =>
    API.post('/marks', data).then(r => r.data),

  // ── Bulk save entire class ─────────────────────────────────
  // POST /api/marks/bulk
  saveBulkMarks: (marksArray) =>
    API.post('/marks/bulk', { marksArray }).then(r => r.data),

  // ── Get all marks (admin/teacher) with filters ─────────────
  // GET /api/marks?className=&examName=&page=&limit=
  getAllMarks: (filters = {}) => {
    // Strip empty values so server doesn't filter on empty strings
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params[k] = v;
    });
    return API.get('/marks', { params }).then(r => r.data);
  },

  // ── Get one student's marks (admin) ───────────────────────
  // GET /api/marks/student/:studentId
  getStudentMarks: (studentId, params = {}) =>
    API.get(`/marks/student/${studentId}`, { params }).then(r => r.data),

  // ── Get current student's own published results ────────────
  // GET /api/marks/my
  getMyMarks: () =>
    API.get('/marks/my').then(r => r.data),

  // ── Single mark by ID ──────────────────────────────────────
  // GET /api/marks/:id
  getMarkById: (id) =>
    API.get(`/marks/${id}`).then(r => r.data),

  // ── Update a mark ─────────────────────────────────────────
  // PUT /api/marks/:id
  updateMark: (id, data) =>
    API.put(`/marks/${id}`, data).then(r => r.data),

  // ── Toggle publish ─────────────────────────────────────────
  // PATCH /api/marks/:id/publish
  togglePublish: (id) =>
    API.patch(`/marks/${id}/publish`).then(r => r.data),

  // ── Publish all for a class ────────────────────────────────
  // POST /api/marks/publish-class
  publishClassResults: (data) =>
    API.post('/marks/publish-class', data).then(r => r.data),

  // ── Delete ─────────────────────────────────────────────────
  // DELETE /api/marks/:id
  deleteMark: (id) =>
    API.delete(`/marks/${id}`).then(r => r.data),

  // ── Class summary stats ────────────────────────────────────
  // GET /api/marks/stats?className=&examName=...
  getClassStats: (params = {}) => {
    const clean = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) clean[k] = v;
    });
    return API.get('/marks/stats', { params: clean }).then(r => r.data);
  },

  // ── Distinct exam list ─────────────────────────────────────
  // GET /api/marks/exams
  getExamList: () =>
    API.get('/marks/exams').then(r => r.data),
};

export default markService;