import api from './api';

const teacherTrainingService = {
  // Get all trainings (public)
  getAllTrainings: async (params) => {
    const response = await api.get('/teacher-trainings', { params });
    return response.data;
  },

  // Get single training
  getTraining: async (id) => {
    const response = await api.get(`/teacher-trainings/${id}`);
    return response.data;
  },

  // Create training (admin)
  createTraining: async (formData) => {
    const response = await api.post('/teacher-trainings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update training (admin)
  updateTraining: async (id, formData) => {
    const response = await api.put(`/teacher-trainings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete training (admin)
  deleteTraining: async (id) => {
    const response = await api.delete(`/teacher-trainings/${id}`);
    return response.data;
  },

  // Toggle training status
  toggleTrainingStatus: async (id) => {
    const response = await api.put(`/teacher-trainings/${id}/status`);
    return response.data;
  }
};

export default teacherTrainingService;