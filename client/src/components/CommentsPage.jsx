// src/components/CommentsPage.jsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, CircularProgress, Alert, Grid,
    Chip, TextField, FormControl, InputLabel, Select, MenuItem, Paper, Avatar
} from '@mui/material';
import { Comment, FormatQuote, FilterList, SentimentSatisfied, SentimentDissatisfied, SentimentNeutral } from '@mui/icons-material';
import api from '../services/api';

// Sentiment based on comment length and keywords (simple heuristic)
const getSentiment = (comment) => {
    const positiveWords = ['great', 'excellent', 'good', 'helpful', 'best', 'amazing', 'wonderful', 'fantastic', 'clear', 'love'];
    const negativeWords = ['bad', 'poor', 'boring', 'unclear', 'difficult', 'hard', 'confusing', 'worst', 'terrible'];

    const lowerComment = comment.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerComment.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerComment.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
};

const SentimentIcon = ({ sentiment }) => {
    if (sentiment === 'positive') return <SentimentSatisfied sx={{ color: '#4caf50' }} />;
    if (sentiment === 'negative') return <SentimentDissatisfied sx={{ color: '#f44336' }} />;
    return <SentimentNeutral sx={{ color: '#ff9800' }} />;
};

function CommentsPage() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ subject: '', period: '' });

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                const response = await api.get('/faculty/comments');
                setComments(response.data.comments || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load comments');
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, []);

    // Get unique subjects and periods for filtering
    const subjects = [...new Set(comments.map(c => c.subject))];
    const periods = [...new Set(comments.map(c => c.period))];

    // Filtered comments
    const filteredComments = comments.filter(c => {
        if (filter.subject && c.subject !== filter.subject) return false;
        if (filter.period && c.period !== filter.period) return false;
        return true;
    });

    // Count sentiments
    const sentimentCounts = filteredComments.reduce((acc, c) => {
        const s = getSentiment(c.text);
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Student Comments
                </Typography>
                <Chip icon={<Comment />} label={`${filteredComments.length} comments`} color="primary" />
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white', borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <SentimentSatisfied sx={{ fontSize: 36, opacity: 0.8 }} />
                            <Typography variant="h4" fontWeight="bold">{sentimentCounts.positive || 0}</Typography>
                            <Typography variant="body2">Positive</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)', color: 'white', borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <SentimentNeutral sx={{ fontSize: 36, opacity: 0.8 }} />
                            <Typography variant="h4" fontWeight="bold">{sentimentCounts.neutral || 0}</Typography>
                            <Typography variant="body2">Neutral</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)', color: 'white', borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <SentimentDissatisfied sx={{ fontSize: 36, opacity: 0.8 }} />
                            <Typography variant="h4" fontWeight="bold">{sentimentCounts.negative || 0}</Typography>
                            <Typography variant="body2">Needs Attention</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <FilterList color="action" />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Subject</InputLabel>
                        <Select value={filter.subject} label="Subject" onChange={(e) => setFilter({ ...filter, subject: e.target.value })}>
                            <MenuItem value="">All Subjects</MenuItem>
                            {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Period</InputLabel>
                        <Select value={filter.period} label="Period" onChange={(e) => setFilter({ ...filter, period: e.target.value })}>
                            <MenuItem value="">All Periods</MenuItem>
                            {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Comments List */}
            {filteredComments.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Comment sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No comments found</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Student comments will appear here once feedback is submitted
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {filteredComments.map((comment, index) => {
                        const sentiment = getSentiment(comment.text);
                        return (
                            <Grid size={{ xs: 12 }} key={comment.id || index}>
                                <Card sx={{
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${sentiment === 'positive' ? '#4caf50' : sentiment === 'negative' ? '#f44336' : '#ff9800'}`,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateX(4px)' }
                                }}>
                                    <CardContent sx={{ display: 'flex', gap: 2 }}>
                                        <Avatar sx={{
                                            bgcolor: sentiment === 'positive' ? '#e8f5e9' : sentiment === 'negative' ? '#ffebee' : '#fff3e0',
                                            color: sentiment === 'positive' ? '#4caf50' : sentiment === 'negative' ? '#f44336' : '#ff9800'
                                        }}>
                                            <FormatQuote />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 1 }}>
                                                        "{comment.text}"
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        <Chip size="small" label={comment.subject} variant="outlined" />
                                                        <Chip size="small" label={comment.class} variant="outlined" />
                                                        <Chip size="small" label={comment.period} color="primary" variant="outlined" />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                                    <SentimentIcon sentiment={sentiment} />
                                                </Box>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                {new Date(comment.date).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}

export default CommentsPage;
