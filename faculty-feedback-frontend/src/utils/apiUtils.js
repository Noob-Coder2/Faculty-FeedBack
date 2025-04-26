import axios from 'axios';
import axiosRetry from 'axios-retry';

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

    return api;
};

export const handleError = (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return { error: true, message };
};