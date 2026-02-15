import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';

// Create axios instance
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

// Get all trainings (public)
export const getAllTrainings = async () => {
  try {
    const response = await axios.get(`${API_URL}/public/trainings`);
    return response;
  } catch (error) {
    console.error('Error fetching trainings:', error);
    // Return mock data for development
    return {
      data: [
        {
          _id: '1',
          name: 'Digital Teaching Methods',
          description: 'Learn modern digital teaching techniques and tools for effective classroom engagement',
          trainer: 'Dr. Rahman Ahmed',
          trainingType: 'Technology Integration',
          startDate: '2026-02-10',
          endDate: '2026-02-12',
          duration: '3 days',
          venue: 'Training Hall, Main Building',
          phone: '01711223344',
          image: { url: '' },
          status: 'upcoming'
        },
        {
          _id: '2',
          name: 'Effective Classroom Management',
          description: 'Strategies and techniques for better classroom control and student engagement',
          trainer: 'Prof. Sultana Begum',
          trainingType: 'Classroom Management',
          startDate: '2026-03-15',
          endDate: '2026-03-17',
          duration: '3 days',
          venue: 'Conference Room',
          phone: '01722334455',
          image: { url: '' },
          status: 'upcoming'
        },
        {
          _id: '3',
          name: 'Assessment & Evaluation Techniques',
          description: 'Modern approaches to student assessment and fair evaluation methods',
          trainer: 'Dr. Kamal Hossain',
          trainingType: 'Assessment & Evaluation',
          startDate: '2026-04-20',
          endDate: '2026-04-22',
          duration: '3 days',
          venue: 'Auditorium',
          phone: '01733445566',
          image: { url: '' },
          status: 'upcoming'
        }
      ]
    };
  }
};

// Get training by ID
export const getTrainingById = async (id) => {
  try {
    const response = await api.get(`/trainings/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create training (admin only)
export const createTraining = async (trainingData) => {
  try {
    const response = await api.post('/trainings', trainingData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update training (admin only)
export const updateTraining = async (id, trainingData) => {
  try {
    const response = await api.put(`/trainings/${id}`, trainingData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete training (admin only)
export const deleteTraining = async (id) => {
  try {
    const response = await api.delete(`/trainings/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining
};
