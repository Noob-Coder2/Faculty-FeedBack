import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert, CircularProgress, Box } from '@mui/material';
import { checkAuth, selectIsAuthenticated, selectAuth } from './store/authSlice';
import Login from './pages/Login';
import FacultyRatings from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Register from './pages/Register';

const ErrorContext = React.createContext();

// Protected Route component
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useSelector(selectAuth);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleClose = () => setError(null);

  return (
    <ErrorContext.Provider value={{ setError }}>
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" /> : <Register />
          } />
          <Route path="/faculty-ratings/:facultyId" element={
            <ProtectedRoute roles={['faculty', 'admin']}>
              <FacultyRatings />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student-dashboard" element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              {({ user }) => {
                switch (user?.role) {
                  case 'admin':
                    return <Navigate to="/admin-dashboard" />;
                  case 'student':
                    return <Navigate to="/student-dashboard" />;
                  case 'faculty':
                    return <Navigate to={`/faculty-ratings/${user.id}`} />;
                  default:
                    return <Navigate to="/login" />;
                }
              }}
            </ProtectedRoute>
          } />
        </Routes>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Router>
    </ErrorContext.Provider>
  );
};

export default App;