// src/components/shared/ChangePasswordPage.jsx
import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { changePassword } from '../../services/api';
import { useSelector } from 'react-redux';

function ChangePasswordPage() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const token = useSelector((state) => state.auth.token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(token, formData);
      setFormData({ currentPassword: '', newPassword: '' });
      alert('Password changed successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Change Password</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Current Password"
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained">Change Password</Button>
      </form>
    </Box>
  );
}

export default ChangePasswordPage;