import api from './api';

// Get class students for mark entry (with existing marks)
export const getClassStudentsForMark = (classId, examType, examYear) =>
  api.get(`/marks/class/${classId}/students`, { params: { examType, examYear } });

// Get all marks for a class
export const getClassMarks = (classId, params) =>
  api.get(`/marks/class/${classId}`, { params });

// Get marks of a single student
export const getStudentMarks = (studentId, params) =>
  api.get(`/marks/student/${studentId}`, { params });

// Get single mark record
export const getMark = (id) => api.get(`/marks/${id}`);

// Save single student mark
export const saveMark = (data) => api.post('/marks', data);

// Save bulk marks (entire class)
export const saveBulkMarks = (data) => api.post('/marks/bulk', data);

// Publish marks
export const publishMarks = (data) => api.put('/marks/publish', data);

// Unpublish marks
export const unpublishMarks = (data) => api.put('/marks/unpublish', data);

// Delete mark
export const deleteMark = (id) => api.delete(`/marks/${id}`);

// Get stats
export const getMarkStats = (classId, params) =>
  api.get(`/marks/stats/${classId}`, { params });

// Get admit card data
export const getAdmitCardData = (classId, params) =>
  api.get(`/marks/admit-card/${classId}`, { params });

// Get result sheet data
export const getResultSheetData = (classId, params) =>
  api.get(`/marks/result-sheet/${classId}`, { params });
