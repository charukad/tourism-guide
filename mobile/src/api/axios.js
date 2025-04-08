import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';

// Create an axios instance
const api = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token available, user must login again
          await AsyncStorage.removeItem('authToken');
          return Promise.reject(error);
        }
        
        // Attempt to refresh the token
        const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
          refreshToken,
        });
        
        // Store the new tokens
        const { token, refreshToken: newRefreshToken } = response.data;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the authorization header and retry the request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear auth data and reject with the original error
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;