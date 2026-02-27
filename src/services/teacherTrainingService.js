import api from './api';

// ── Teacher Training Service ─────────────────────────────────────────────────
// Backend route: /api/teacher-trainings

export const getAllTrainings = async () => {
  const response = await api.get('/teacher-trainings');
  return response.data;
};

export const getTrainingById = async (id) => {
  const response = await api.get(`/teacher-trainings/${id}`);
  return response.data;
};

export const createTraining = async (trainingData) => {
  const response = await api.post('/teacher-trainings', trainingData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateTraining = async (id, trainingData) => {
  const response = await api.put(`/teacher-trainings/${id}`, trainingData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteTraining = async (id) => {
  const response = await api.delete(`/teacher-trainings/${id}`);
  return response.data;
};

export const toggleTrainingStatus = async (id) => {
  const response = await api.put(`/teacher-trainings/${id}/status`);
  return response.data;
};

const teacherTrainingService = {
  getAllTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  toggleTrainingStatus,
};

export default teacherTrainingService;
