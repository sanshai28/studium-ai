import axios from 'axios';
import config from '../config/env.config';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const authAPI = {
  signup: async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },

  signin: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },
};

export const notebooksAPI = {
  getAll: async () => {
    const response = await api.get('/notebooks');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/notebooks/${id}`);
    return response.data;
  },

  create: async (notebook: { title: string; content: string }) => {
    const response = await api.post('/notebooks', notebook);
    return response.data;
  },

  update: async (id: string, notebook: { title?: string; content?: string }) => {
    const response = await api.put(`/notebooks/${id}`, notebook);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notebooks/${id}`);
    return response.data;
  },
};

export default api;
