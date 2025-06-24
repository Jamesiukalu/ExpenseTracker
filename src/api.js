import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api',
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://finanacetrackerapi-production.up.railway.app/api',
  withCredentials: true,
});

export default api;