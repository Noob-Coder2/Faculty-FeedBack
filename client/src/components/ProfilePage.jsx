// src/components/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Avatar, Button, TextField, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { fetchProfile, saveProfile, clearProfileState } from '../store/profileSlice';
import { logoutUser } from '../store/authSlice';


function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { user, loading, error, success } = useSelector((state) => state.profile);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (token) dispatch(fetchProfile(token));
    return () => { dispatch(clearProfileState()); };
  }, [token, dispatch]);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
  }, [user]);

  // Prevent rendering if not authenticated (after hooks)
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  const handleUpdate = () => {
    dispatch(saveProfile({ token, form }));
    setEdit(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!user) return null;

  return (
    <Box>
      <Typography variant="h4">Profile</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Avatar sx={{ width: 100, height: 100, mr: 2 }}>
          <FontAwesomeIcon icon={faUser} size="2x" />
        </Avatar>
        <Box>
          {edit ? (
            <>
              <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} sx={{ mb: 1 }} />
              <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} sx={{ mb: 1 }} />
              <Button onClick={handleUpdate} variant="contained" sx={{ mr: 1 }}>Save</Button>
              <Button onClick={() => setEdit(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <Typography variant="h6">User ID: {user.userId}</Typography>
              <Typography>Name: {user.name}</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Role: {user.role}</Typography>
              {user.role === 'student' && user.profile && (
                <>
                  <Typography>Branch: {user.profile.branch}</Typography>
                  <Typography>Semester: {user.profile.semester}</Typography>
                  <Typography>Section: {user.profile.section}</Typography>
                  <Typography>Admission Year: {user.profile.admissionYear}</Typography>
                </>
              )}
              <Button onClick={() => setEdit(true)} sx={{ mt: 1, mr: 1 }}>Edit</Button>
              <Button color="error" onClick={() => { dispatch(logoutUser()); window.location.href = '/login'; }} sx={{ mt: 1 }}>Logout</Button>
            </>
          )}
          {success && <Typography color="success.main">{success}</Typography>}
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePage;