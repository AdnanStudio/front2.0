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

// Get all club members (public)
export const getAllMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}/public/clubs`);
    return response;
  } catch (error) {
    console.error('Error fetching club members:', error);
    // Return mock data for development
    return {
      data: [
        {
          _id: '1',
          name: 'Science Club',
          description: 'Exploring the wonders of science through experiments and projects',
          category: 'Science & Technology',
          advisor: 'Dr. Kamal Hossain',
          president: 'Rafiq Ahmed (Class 10)',
          members: 25,
          image: { url: '' },
          status: 'active'
        },
        {
          _id: '2',
          name: 'Debate Club',
          description: 'Developing critical thinking and public speaking skills',
          category: 'Debate & Public Speaking',
          advisor: 'Ms. Ayesha Rahman',
          president: 'Sohel Rana (Class 9)',
          members: 18,
          image: { url: '' },
          status: 'active'
        },
        {
          _id: '3',
          name: 'Art Club',
          description: 'Expressing creativity through various art forms',
          category: 'Arts & Culture',
          advisor: 'Mr. Habib Khan',
          president: 'Meena Das (Class 8)',
          members: 15,
          image: { url: '' },
          status: 'active'
        },
        {
          _id: '4',
          name: 'Sports Club',
          description: 'Promoting physical fitness and sportsmanship',
          category: 'Sports',
          advisor: 'Mr. Rahim Ahmed',
          president: 'Karim Khan (Class 10)',
          members: 30,
          image: { url: '' },
          status: 'active'
        }
      ]
    };
  }
};

// Get club by ID
export const getClubById = async (id) => {
  try {
    const response = await api.get(`/clubs/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create club (admin only)
export const createClub = async (clubData) => {
  try {
    const response = await api.post('/clubs', clubData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update club (admin only)
export const updateClub = async (id, clubData) => {
  try {
    const response = await api.put(`/clubs/${id}`, clubData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete club (admin only)
export const deleteClub = async (id) => {
  try {
    const response = await api.delete(`/clubs/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllMembers,
  getClubById,
  createClub,
  updateClub,
  deleteClub
};
