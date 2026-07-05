import axios from 'axios';
import axiosRetry from 'axios-retry';

let store;
let logoutAction;

export const injectStore = (_store, _logoutAction) => {
    store = _store;
    logoutAction = _logoutAction;
};

export const createApiInstance = (onUnauthorized) => {
    // Axios instance with retry logic
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
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
            if (error.response?.status === 401) {
                if (typeof onUnauthorized === 'function') {
                    // Execute the provided unauthorized handler
                    onUnauthorized();
                }
                // Dispatch logout action if store is available
                if (store && logoutAction) {
                    store.dispatch(logoutAction());
                }
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