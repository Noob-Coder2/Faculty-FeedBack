import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import Login from './pages/Login';
import FacultyRatings from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';

export const ErrorContext = React.createContext();

const App = () => {
  const [error, setError] = useState(null);

  const handleClose = () => setError(null);

  return (
    <ErrorContext.Provider value={{ setError }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/faculty-ratings/:facultyId" element={<FacultyRatings />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/student-dashboard" element={<div>Student Dashboard</div>} />
          <Route path="/" element={<Login />} />
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