import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Container, Box, Alert, Link } from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await resetPassword(token, data.password);
            setMessage(response.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const password = watch('password');

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Reset Password
                </Typography>

                {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="New Password"
                        type="password"
                        id="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            validate: {
                                hasUpperCase: (value) => /[A-Z]/.test(value) || 'Must contain at least one uppercase letter',
                                hasLowerCase: (value) => /[a-z]/.test(value) || 'Must contain at least one lowercase letter',
                                hasNumber: (value) => /[0-9]/.test(value) || 'Must contain at least one number',
                                hasSpecialChar: (value) => /[\W_]/.test(value) || 'Must contain at least one special character',
                            }
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === password || 'Passwords do not match'
                        })}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                    <Box display="flex" justifyContent="center">
                        <Link component={RouterLink} to="/login" variant="body2">
                            Back to Login
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default ResetPassword;
