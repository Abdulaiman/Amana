import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://amana-server-production.up.railway.app/api', 
  // baseURL: 'http://172.20.10.5:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
