import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Box, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useState } from 'react';

const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});

function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { userId: '', password: '' },
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Login Payload:', data); // Debug payload
      setServerError(null);
      const result = await dispatch(loginUser(data)).unwrap();
      const role = result.user.role; // Backend returns role
      // No need to store user info in localStorage; Redux handles state
      navigate(`/${role}-dashboard`);
    } catch (err) {
      setServerError(err.message || 'Failed to login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="User ID"
              fullWidth
              margin="normal"
              error={!!errors.userId}
              helperText={errors.userId?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>
        <Box display="flex" justifyContent="space-between" width="100%" sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot Password?
          </Link>
          <Link component={RouterLink} to="/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </form>
    </Box>
  );
}

export default Login;