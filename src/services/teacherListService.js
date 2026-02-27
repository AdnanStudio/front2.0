import api from './api';

// ── Teacher List Service ─────────────────────────────────────────────────────
// Backend route: /api/teacher-list

export const getAllTeachers = async (params) => {
  const response = await api.get('/teacher-list', { params });
  return response.data;
};

export const getTeacherById = async (id) => {
  const response = await api.get(`/teacher-list/${id}`);
  return response.data;
};

export const createTeacher = async (teacherData) => {
  const response = await api.post('/teacher-list', teacherData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateTeacher = async (id, teacherData) => {
  const response = await api.put(`/teacher-list/${id}`, teacherData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteTeacher = async (id) => {
  const response = await api.delete(`/teacher-list/${id}`);
  return response.data;
};

export const toggleTeacherStatus = async (id) => {
  const response = await api.put(`/teacher-list/${id}/status`);
  return response.data;
};

const teacherListService = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  toggleTeacherStatus,
};

export default teacherListService;
