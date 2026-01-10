// src/components/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Button, TextField, CircularProgress,
  Grid, Card, CardContent, Chip, Divider, IconButton, Fade
} from '@mui/material';
import {
  Person, Email, Badge, School, Class, CalendarToday,
  Edit, Save, Cancel, Logout
} from '@mui/icons-material';
import { fetchProfile, saveProfile, clearProfileState } from '../store/profileSlice';
import { logout } from '../store/authSlice';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { loading, error, success } = useSelector((state) => state.profile);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
    return () => { dispatch(clearProfileState()); };
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleUpdate = async () => {
    await dispatch(saveProfile({ form }));
    setEdit(false);
  };

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  const isStudent = user.role === 'student';
  const roleColor = isStudent ? '#4caf50' : '#2196f3'; // Green for student, Blue for faculty
  const gradient = isStudent
    ? 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column: Avatar & Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 4,
            textAlign: 'center',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{
              background: gradient,
              height: 120,
              mb: -6
            }} />
            <CardContent sx={{ pt: 0 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  border: '4px solid white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  bgcolor: 'white',
                  color: roleColor
                }}
              >
                <Person sx={{ fontSize: 60 }} />
              </Avatar>

              <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>

              <Chip
                label={user.role.toUpperCase()}
                sx={{
                  bgcolor: roleColor,
                  color: 'white',
                  fontWeight: 'bold',
                  mt: 1,
                  px: 1
                }}
              />

              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!edit && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    fullWidth
                    onClick={() => setEdit(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Logout />}
                  fullWidth
                  onClick={handleLogout}
                  sx={{ borderRadius: 2 }}
                >
                  Logout
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Detailed Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                  Account Details
                </Typography>
                {edit && (
                  <Box>
                    <Button
                      startIcon={<Save />}
                      variant="contained"
                      onClick={handleUpdate}
                      sx={{ mr: 1, borderRadius: 2 }}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      variant="text"
                      onClick={() => setEdit(false)}
                      color="inherit"
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              {success && <Typography color="success.main" sx={{ mb: 2 }}>{success}</Typography>}
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Badge color="action" />
                    <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>{user.userId}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Person color="action" />
                    <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                  </Box>
                  {edit ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>{user.name}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Email color="action" />
                    <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
                  </Box>
                  {edit ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>{user.email}</Typography>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                {isStudent ? 'Academic Info' : 'Professional Info'}
              </Typography>

              {isStudent && user.profile ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <School color="action" />
                      <Typography variant="subtitle2" color="text.secondary">Branch</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>{user.profile.branch}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Class color="action" />
                      <Typography variant="subtitle2" color="text.secondary">Semester & Section</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      Sem {user.profile.semester} - Section {user.profile.section}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <CalendarToday color="action" />
                      <Typography variant="subtitle2" color="text.secondary">Admission Year</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>{user.profile.admissionYear}</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <School color="action" />
                      <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>{user.profile?.department || 'N/A'}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Badge color="action" />
                      <Typography variant="subtitle2" color="text.secondary">Designation</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>{user.profile?.designation || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage;
