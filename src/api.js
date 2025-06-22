import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api',https://financial-track-l5utci8pv-james-kalus-projects.vercel.app/api
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://financial-track-l5utci8pv-james-kalus-projects.vercel.app/api',
  withCredentials: true,
});

export default api;