// src/components/Student/FeedbackHistory.jsx
import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Alert, Chip, Divider, Skeleton,
    Avatar, Paper, Fade
} from '@mui/material';
import {
    EventNote, Subject, Class, Star, Comment
} from '@mui/icons-material';
import api from '../../services/api';

function FeedbackHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/student/history');
                setHistory(response.data.history);
            } catch (err) {
                console.error(err);
                setError('Failed to load feedback history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Feedback History</Typography>
                {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={150} sx={{ mb: 2, borderRadius: 2 }} />
                ))}
            </Box>
        );
    }

    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                My Feedback History
            </Typography>

            {history.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <EventNote sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        No feedback submissions found yet.
                    </Typography>
                </Paper>
            ) : (
                <Box sx={{ position: 'relative', pl: { xs: 2, md: 4 } }}>
                    {/* Vertical Line */}
                    <Box sx={{
                        position: 'absolute',
                        left: { xs: 8, md: 16 },
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor: 'divider'
                    }} />

                    {history.map((submission, index) => (
                        <Fade in={true} timeout={300 + (index * 100)} key={submission.id}>
                            <Box sx={{ mb: 4, position: 'relative' }}>
                                {/* Timeline Dot */}
                                <Box sx={{
                                    position: 'absolute',
                                    left: { xs: -24, md: -34 },
                                    top: 20,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    border: '4px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }} />

                                <Card sx={{
                                    borderRadius: 3,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateX(4px)' }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                    {submission.facultyName.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {submission.facultyName}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', flexWrap: 'wrap' }}>
                                                        <Subject fontSize="small" />
                                                        <Typography variant="body2">{submission.subjectName}</Typography>
                                                        <span style={{ margin: '0 4px' }}>•</span>
                                                        <Class fontSize="small" />
                                                        <Typography variant="body2">{submission.className || 'Class'}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={submission.period}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontWeight: 'medium' }}
                                            />
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            Rated Parameters:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                            {submission.ratings.map((rating, idx) => (
                                                <Chip
                                                    key={idx}
                                                    icon={<Star fontSize="small" />}
                                                    label={`${rating.parameter}: ${rating.value}/5`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: rating.value >= 4 ? '#e8f5e9' : rating.value >= 3 ? '#fff3e0' : '#ffebee',
                                                        color: rating.value >= 4 ? '#2e7d32' : rating.value >= 3 ? '#ef6c00' : '#c62828',
                                                        fontWeight: 'medium'
                                                    }}
                                                />
                                            ))}
                                        </Box>

                                        {submission.comment && (
                                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, display: 'flex', gap: 2 }}>
                                                <Comment color="action" fontSize="small" sx={{ mt: 0.5 }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                        Your Comment
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                        "{submission.comment}"
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        )}

                                        <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'right', color: 'text.secondary' }}>
                                            Submitted on {new Date(submission.date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Fade>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default FeedbackHistory;
