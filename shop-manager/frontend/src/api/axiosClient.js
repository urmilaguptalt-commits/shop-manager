import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for JWT tokens
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to catch Netlify's HTML fallback (prevents React crash)
axiosClient.interceptors.response.use(
  (response) => {
    // If the API returns HTML instead of JSON, treat it as an error
    if (typeof response.data === 'string' && response.data.toLowerCase().includes('<!doctype html>')) {
      return Promise.reject(new Error('Backend API not found. Received HTML instead of JSON.'));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
