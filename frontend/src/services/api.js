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
    if (inMemoryToken) {
      config.headers['Authorization'] = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
