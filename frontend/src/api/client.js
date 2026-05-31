import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';

const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  getMe: () => client.get('/auth/me'),
};

export const vendorAPI = {
  getRestaurants: () => client.get('/vendors?type=restaurant'),
  getServices: () => client.get('/vendors'),
  getVendorDetails: (id) => client.get(`/vendors/${id}`),
};

export const orderAPI = {
  createOrder: (data) => client.post('/orders', data),
  getMyOrders: () => client.get('/orders'),
  getOrderById: (id) => client.get(`/orders/${id}`),
};

export const bookingAPI = {
  createBooking: (data) => client.post('/bookings', data),
  getMyBookings: () => client.get('/bookings'),
};

export default client;
