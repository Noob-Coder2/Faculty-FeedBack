import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Container, Box, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await forgotPassword(data.email);
            setMessage(response.message);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Forgot Password
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </Typography>

                {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
