import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert, CircularProgress, Box } from '@mui/material';

import { checkAuth, selectAuth } from './store/authSlice';
import Login from './pages/Login';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

import ErrorContext from './contexts/ErrorContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useSelector(selectAuth);

  // If not authenticated, redirect to login.
  // This check is now reliable because it runs after the initial auth check is complete.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user's role is not included, redirect to their default home page.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user, isAuthenticated } = useSelector(selectAuth);

  // This component will only be rendered after the initial auth check.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect authenticated users to their respective dashboards.
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'student':
      return <Navigate to="/student-dashboard" replace />;
    case 'faculty':
      return <Navigate to="/faculty-dashboard" replace />;
    default:
      // Fallback to login if role is somehow invalid.
      return <Navigate to="/login" replace />;
  }
};

const GlobalErrorSnackbar = () => {
  const { error, setError } = React.useContext(ErrorContext);
  const handleClose = () => setError(null);

  return (
    <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  );
};

const App = () => {
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { isAuthenticated, status, error: authError } = useSelector(selectAuth);
  const { error: feedbackError } = useSelector(state => state.feedback);
  const { error: profileError } = useSelector(state => state.profile);

  useEffect(() => {
    // Only run the initial authentication check if the status is 'idle' AND the user was previously logged in.
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (status === 'idle' && isLoggedIn) {
      dispatch(checkAuth());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Combine errors from different Redux slices into one state for the snackbar.
    if (authError) setError(authError);
    else if (feedbackError) setError(feedbackError);
    else if (profileError) setError(profileError);
  }, [authError, feedbackError, profileError]);

  // While the initial authentication check is running, show a loading screen.
  // This prevents premature redirects and ensures the auth state is known before rendering routes.
  // MODIFIED: Only show loading if status is 'loading', OR if status is 'idle' AND we are about to check auth.
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (status === 'loading' || (status === 'idle' && isLoggedIn)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Once the auth status is 'succeeded' or 'failed', render the main application routes.
  return (
    <ErrorContext.Provider value={{ error, setError }}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password/:token"
          element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />}
        />
        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoute roles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GlobalErrorSnackbar />
    </ErrorContext.Provider>
  );
};

export default App;
