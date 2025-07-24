// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import feedbackReducer from './feedbackSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    feedback: feedbackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in actions (e.g., errors, dates)
        ignoredActions: ['profile/fetchProfile/rejected', 'profile/saveProfile/rejected', 'feedback/fetchFeedbackData/rejected', 'feedback/submitFeedback/rejected', 'auth/login/rejected', 'auth/check/rejected'],
        ignoredPaths: ['auth.error', 'profile.error', 'feedback.error'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production', // Enable Redux DevTools in development
});
