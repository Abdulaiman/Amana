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

// Handle Global Errors (401, 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403 && 
        (error.response.data.message.toLowerCase().includes('banned') || error.response.data.message.includes('suspended'))) {
        // Redirect to Banned Page
        window.location.href = '/banned';
    }
    return Promise.reject(error);
  }
);

export default api;
