// ....


import axios from 'axios';

const API_URL = 'https://malkhanagarcollege.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Token add করা
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FIX: FormData হলে Content-Type DELETE করো
    // Axios নিজেই সঠিক "multipart/form-data; boundary=xxxx" set করবে
    // Manual set করলে boundary miss হয় → multer req.file পায় না → image save হয় না
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;