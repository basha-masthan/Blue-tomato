import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('vendor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('vendor_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  toggleOnline: () => api.patch('/auth/toggle-online'),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  updateAddresses: (data) => api.patch('/profile/addresses', data),
  getBankDetails: () => api.get('/profile/bank-details'),
  updateBankDetails: (data) => api.patch('/profile/bank-details', data),
  getDocuments: () => api.get('/profile/documents'),
  updateDocuments: (data) => api.patch('/profile/documents', data),
  getDashboardStats: () => api.get('/profile/dashboard-stats'),
};

export const serviceAPI = {
  getAll: (category) => api.get(`/services${category ? `?category=${category}` : ''}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.patch(`/services/${id}`, data),
  toggle: (id) => api.patch(`/services/${id}/toggle`),
  delete: (id) => api.delete(`/services/${id}`),
};

export const orderAPI = {
  getAll: (status) => api.get(`/orders${status ? `?status=${status}` : ''}`),
  getById: (id) => api.get(`/orders/${id}`),
  accept: (id) => api.patch(`/orders/${id}/accept`),
  decline: (id) => api.patch(`/orders/${id}/decline`),
  complete: (id) => api.patch(`/orders/${id}/complete`),
  getHistory: () => api.get('/orders/history'),
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  getSummary: () => api.get('/transactions/summary'),
};

export const uploadAPI = {
  uploadBase64: (image, folder) => api.post('/uploads/upload-base64', { image, folder }),
  upload: (formData) => {
    return api.post('/uploads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
