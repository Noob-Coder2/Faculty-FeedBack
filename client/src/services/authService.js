import { createApiInstance, handleError } from './apiUtils';
import { store } from '../store/store';
import { logoutUser } from '../store/authSlice';

// Create API instance with onUnauthorized callback
const api = createApiInstance(() => {
    store.dispatch(logoutUser());
    window.location.href = '/login';
});

const login = async (userId, password) => {
    try {
        // Make POST request to the login endpoint
        const response = await api.post('/auth/login', {
            userId,
            password,
        });

        if (response.data && response.data.token) {
            console.log('Login successful:', response.data); // For debugging
            return response.data; // Return the full response data (token, user info)
        } else {
            throw { error: true, message: 'Login failed: Invalid response format' };
        }
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);
        throw handleError(error);
    }
};

// Logout function
const logout = async () => {
    try {
        // Call backend to clear cookie
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error.response ? error.response.data : error.message);
    } finally {
        store.dispatch(logoutUser());
        window.location.href = '/login';
    }
};

// Export the functions
export const authService = {
    login,
    logout,
};