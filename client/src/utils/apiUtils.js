// src/services/apiUtils.js

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export const createApiInstance = () => {
    // Axios instance with retry logic
    const api = axios.create({
        baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:5001/api',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    axiosRetry(api, {
        retries: 3,
        retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
        retryCondition: (error) => {
            return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
        },
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    api.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            useDispatch(logout()); // Clear Redux
            window.location.href = '/login'; // Redirect
          }
          return Promise.reject(error);
        }
      );

    return api;
};

export const handleError = (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return { error: true, message };
};