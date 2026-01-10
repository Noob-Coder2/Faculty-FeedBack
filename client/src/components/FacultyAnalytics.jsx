import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Alert, useTheme, Skeleton
} from '@mui/material';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import api from '../services/api';

function FacultyAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const theme = useTheme();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/faculty/analytics');
                setAnalytics(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Skeleton variant="text" width={300} height={60} sx={{ mb: 4 }} />
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[1, 2, 3].map((item) => (
                        <Grid size={{ xs: 12, md: 4 }} key={item}>
                            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!analytics) return <Alert severity="info">No analytics data available</Alert>;

    const { trendData, departmentAverage } = analytics;
    const currentRating = trendData.length > 0 ? trendData[trendData.length - 1].averageRating : 0;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 4 }}>
                Performance Analytics
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Current Rating</Typography>
                            <Typography variant="h3" fontWeight="bold">{currentRating}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Latest Feedback Period</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2, background: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Department Average</Typography>
                            <Typography variant="h3" fontWeight="bold">{departmentAverage}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Across all faculty</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2, background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Trend</Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {trendData.length > 1
                                    ? (currentRating - trendData[trendData.length - 2].averageRating).toFixed(2)
                                    : '0.00'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Change from last period</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Overall Ratings Over Time</Typography>
                            <Box sx={{ height: 400, width: '100%' }}>
                                <ResponsiveContainer>
                                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis domain={[0, 5]} />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="averageRating"
                                            stroke={theme.palette.primary.main}
                                            fillOpacity={1}
                                            fill="url(#colorRating)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default FacultyAnalytics;
