import api from './api';

const teacherListService = {
  // Get all teachers (public)
  getAllTeachers: async (params) => {
    const response = await api.get('/teacher-list', { params });
    return response.data;
  },

  // Get single teacher
  getTeacher: async (id) => {
    const response = await api.get(`/teacher-list/${id}`);
    return response.data;
  },

  // Create teacher (admin)
  createTeacher: async (formData) => {
    const response = await api.post('/teacher-list', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update teacher (admin)
  updateTeacher: async (id, formData) => {
    const response = await api.put(`/teacher-list/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete teacher (admin)
  deleteTeacher: async (id) => {
    const response = await api.delete(`/teacher-list/${id}`);
    return response.data;
  },

  // Toggle teacher status
  toggleTeacherStatus: async (id) => {
    const response = await api.put(`/teacher-list/${id}/status`);
    return response.data;
  }
};

export default teacherListService;