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

// Get all teachers (public)
export const getAllTeachers = async () => {
  try {
    const response = await axios.get(`${API_URL}/public/teachers`);
    return response;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    // Return mock data for development
    return {
      data: [
        {
          _id: '1',
          name: 'Dr. Kamal Hossain',
          teacherId: 'T001',
          email: 'kamal@school.com',
          phone: '01711223344',
          designation: 'Head Teacher',
          qualification: 'PhD in Physics',
          department: 'Science',
          subjects: ['Physics', 'General Science'],
          experience: '15 years',
          image: { url: '' },
          status: 'active'
        },
        {
          _id: '2',
          name: 'Ms. Ayesha Rahman',
          teacherId: 'T002',
          email: 'ayesha@school.com',
          phone: '01722334455',
          designation: 'Senior Teacher',
          qualification: 'MA in English Literature',
          department: 'English',
          subjects: ['English'],
          experience: '10 years',
          image: { url: '' },
          status: 'active'
        },
        {
          _id: '3',
          name: 'Mr. Habib Khan',
          teacherId: 'T003',
          email: 'habib@school.com',
          phone: '01733445566',
          designation: 'Assistant Teacher',
          qualification: 'BSc in Mathematics',
          department: 'Mathematics',
          subjects: ['Mathematics'],
          experience: '5 years',
          image: { url: '' },
          status: 'active'
        }
      ]
    };
  }
};

// Get teacher by ID
export const getTeacherById = async (id) => {
  try {
    const response = await api.get(`/teachers/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create teacher (admin only)
export const createTeacher = async (teacherData) => {
  try {
    const response = await api.post('/teachers', teacherData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update teacher (admin only)
export const updateTeacher = async (id, teacherData) => {
  try {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete teacher (admin only)
export const deleteTeacher = async (id) => {
  try {
    const response = await api.delete(`/teachers/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
