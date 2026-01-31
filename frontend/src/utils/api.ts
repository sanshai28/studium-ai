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

export const sourcesAPI = {
  upload: async (notebookId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/notebooks/${notebookId}/sources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (notebookId: string) => {
    const response = await api.get(`/notebooks/${notebookId}/sources`);
    return response.data;
  },

  delete: async (sourceId: string) => {
    const response = await api.delete(`/sources/${sourceId}`);
    return response.data;
  },

  download: async (sourceId: string) => {
    const response = await api.get(`/sources/${sourceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const conversationsAPI = {
  create: async (notebookId: string) => {
    const response = await api.post(`/notebooks/${notebookId}/conversations`);
    return response.data;
  },

  getAll: async (notebookId: string) => {
    const response = await api.get(`/notebooks/${notebookId}/conversations`);
    return response.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  delete: async (conversationId: string) => {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  },
};

export default api;
