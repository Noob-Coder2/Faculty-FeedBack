import axios from 'axios';
import axiosRetry from 'axios-retry';

export const createApiInstance = (onUnauthorized) => {
    // Axios instance with retry logic
    const api = axios.create({
        baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:5001/api',
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true, // Important: needed for cookies
    });

    axiosRetry(api, {
        retries: 3,
        retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
        retryCondition: (error) => {
            return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
        },
    });

    // No need to set Authorization header; cookies are sent automatically
    api.interceptors.request.use((config) => config);

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401 && typeof onUnauthorized === 'function') {
                // Execute the provided unauthorized handler
                onUnauthorized();
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