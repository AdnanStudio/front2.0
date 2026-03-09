import api from './api';

const teacherService = {

  // Get all teachers
  getAllTeachers: async (params) => {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  // Get single teacher
  getTeacher: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // ✅ Create teacher — FormData (image সহ) → explicit multipart/form-data
  createTeacher: async (teacherData) => {
    const response = await api.post('/teachers', teacherData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ✅ Update teacher — FormData (image সহ) → explicit multipart/form-data
  updateTeacher: async (id, teacherData) => {
    const response = await api.put(`/teachers/${id}`, teacherData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete teacher
  deleteTeacher: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Get teachers by subject
  getTeachersBySubject: async (subject) => {
    const response = await api.get(`/teachers/subject/${subject}`);
    return response.data;
  },

  // Get logged-in teacher profile
  getTeacherProfile: async () => {
    try {
      const response = await api.get('/teachers/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch teacher profile' };
    }
  },

  // Toggle teacher status
  toggleTeacherStatus: async (id) => {
    const response = await api.put(`/teachers/${id}/status`);
    return response.data;
  }
};

export default teacherService;

// Named exports

export const getTeachers      = teacherService.getAllTeachers;

export const getAllTeachers          = teacherService.getTeacher;
export const createTeacher       = teacherService.createTeacher;
export const updateTeacher       = teacherService.updateTeacher;
export const deleteTeacher       = teacherService.deleteTeacher;
export const getTeachersBySubject = teacherService.getTeachersBySubject;
export const getTeacherProfile   = teacherService.getTeacherProfile;
export const toggleTeacherStatus = teacherService.toggleTeacherStatus;