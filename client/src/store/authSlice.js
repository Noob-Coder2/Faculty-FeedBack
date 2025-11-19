// src/store/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, logout as logoutApi } from '../services/api';
import { getUserProfile } from '../services/api';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      // The user profile is now consistently returned on login
      if (!response.user) {
        throw new Error('Login failed: User profile not returned.');
      }
      return { user: response.user };
    } catch (error) {
      // Use the message from the thrown error object
      return rejectWithValue(error.message || 'An unknown error occurred during login.');
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed:', error);
      // We don't reject here because we want to clear the state anyway
    }
  }
);

// Async thunk for checking authentication status on app load
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      // This API call implicitly uses the httpOnly cookie to get the profile
      const profileResponse = await getUserProfile();
      return { user: profileResponse.user };
    } catch (error) {
      // If fetching profile fails (e.g., no cookie, invalid token), reject the thunk
      return rejectWithValue(error.message || 'Session not found.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false, // For specific actions like login button state
    error: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed' - for initial auth check
  },
  reducers: {

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.status = 'succeeded'; // Mark auth as successful after login
        localStorage.setItem('isLoggedIn', 'true');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.status = 'failed';
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'failed'; // Set to failed to prevent checkAuth loop
        localStorage.removeItem('isLoggedIn');
      })
      .addCase(logout.rejected, (state) => {
        // Even if server logout fails, we clear client state
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'failed'; // Set to failed to prevent checkAuth loop
        localStorage.removeItem('isLoggedIn');
      })
      // Initial Auth Check cases
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('isLoggedIn', 'true');
      })
      .addCase(checkAuth.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('isLoggedIn');
      });
  },
});

export const { clearError } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
