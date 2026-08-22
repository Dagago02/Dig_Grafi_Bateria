import axios from 'axios';

// Get API URL from env, or default to localhost:8000/api/v1
const API_URL = (import.meta.env.VITE_API_URL) || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
