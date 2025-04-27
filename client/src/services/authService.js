// src/services/authService.js
import axios from 'axios';

// Use your backend's base URL. If running locally, it might be:
const API_URL = 'http://localhost:5001/api'; // <-- Adjust port if needed

// Updated to accept userId instead of email
const login = async (userId, password) => {
  try {
    // Make POST request to the login endpoint, sending userId
    const response = await axios.post(`${API_URL}/auth/login`, { // <-- Adjust endpoint if needed
      userId, // <--- Changed from email
      password,
    });

    // Assuming the backend returns { token: '...', user: {...} } on success
    if (response.data && response.data.token) {
      // Store the token (e.g., in localStorage)
      localStorage.setItem('authToken', response.data.token);
      // Optionally store user info too, or just return it
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      console.log('Login successful:', response.data); // For debugging
      return response.data; // Return the full response data (token, user info)
    } else {
      // Handle cases where response doesn't contain expected data
      throw new Error('Login failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    // Throw the error so the component can catch it and display a message
    // Extract backend error message if available, otherwise use a generic one
    const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
    throw new Error(message);
  }
};

// Logout function remains the same
const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
};

// Export the functions
export const authService = {
  login,
  logout,
  // You can add register, getCurrentUser etc. here later
};