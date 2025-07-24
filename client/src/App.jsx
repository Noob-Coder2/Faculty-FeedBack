import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert, CircularProgress, Box } from '@mui/material';

import { checkAuth, selectAuth } from './store/authSlice';
import Login from './pages/Login';
import FacultyRatings from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Register from './pages/Register';

import ErrorContext from './contexts/ErrorContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useSelector(selectAuth);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useSelector(selectAuth);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" />;
    case 'student':
      return <Navigate to="/student-dashboard" />;
    case 'faculty':
      return <Navigate to={`/faculty-ratings/${user.id}`} />;
    default:
      return <Navigate to="/login" />;
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
  const { isAuthenticated, loading, error: authError } = useSelector(selectAuth);
  const { error: feedbackError } = useSelector(state => state.feedback);
  const { error: profileError } = useSelector(state => state.profile);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated && !loading) {
      dispatch(checkAuth()).catch(() => {
        if (isMounted) {
          setError('Failed to verify authentication status');
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [dispatch, isAuthenticated, loading]);

  useEffect(() => {
    // Combine errors from Redux slices
    if (authError) {
      setError(authError);
    } else if (feedbackError) {
      setError(feedbackError);
    } else if (profileError) {
      setError(profileError);
    }
  }, [authError, feedbackError, profileError]);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      <Routes>
        <Route
          path="/login"
          element={
            loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
              </Box>
            ) : isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
              </Box>
            ) : isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/faculty-ratings/:facultyId"
          element={
            <ProtectedRoute roles={['faculty', 'admin']}>
              <FacultyRatings />
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
      </Routes>
      <GlobalErrorSnackbar />
    </ErrorContext.Provider>
  );
};

export default App;