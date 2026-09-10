import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

let inMemoryToken = null;

export const setToken = (token) => {
  inMemoryToken = token;
};

api.interceptors.request.use(
  (config) => {
    const token = inMemoryToken || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
