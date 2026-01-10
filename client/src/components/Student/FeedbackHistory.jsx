import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Alert, Chip, Divider, Skeleton
} from '@mui/material';
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
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Skeleton variant="text" width={300} height={60} sx={{ mb: 4 }} />
                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid size={{ xs: 12 }} key={item}>
                            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                My Feedback History
            </Typography>

            {history.length === 0 ? (
                <Alert severity="info">You haven't submitted any feedback yet.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {history.map((submission) => (
                        <Grid size={{ xs: 12 }} key={submission.id}>
                            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Typography variant="h6" color="primary">
                                                {submission.facultyName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {submission.subjectName}
                                            </Typography>
                                            <Chip
                                                label={submission.period}
                                                size="small"
                                                sx={{ mt: 1, mr: 1, backgroundColor: '#e3f2fd', color: '#1976d2' }}
                                            />
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                Submitted on: {new Date(submission.date).toLocaleDateString()}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 8 }}>
                                            <Typography variant="subtitle2" gutterBottom>Ratings Given:</Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                {submission.ratings.map((rating, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={`${rating.value}/5`}
                                                        color={rating.value >= 4 ? "success" : rating.value >= 3 ? "warning" : "error"}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                ))}
                                            </Box>
                                            {submission.comment && (
                                                <>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                        "{submission.comment}"
                                                    </Typography>
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default FeedbackHistory;
