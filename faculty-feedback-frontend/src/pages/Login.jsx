// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { login } from '../services/api';

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!userId || !password) {
      setError('Please enter both user ID and password');
      return;
    }

    try {
      const data = await login(userId, password);
      // Store the token in local storage
      localStorage.setItem('token', data.token);
      
      // Decode the token to get the role
      const decoded = jwtDecode(data.token);
      const role = decoded.role;

      // Redirect based on role
      if (role === 'student') {
        navigate('/student-dashboard');
      } else if (role === 'faculty') {
        navigate('/faculty-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setError('Unknown role');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="userId">User ID:</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        Don’t have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default Login;