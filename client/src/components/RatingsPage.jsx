// src/components/RatingsPage.jsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Grid, Chip,
  LinearProgress, Accordion, AccordionSummary, AccordionDetails, Tooltip, Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon, TrendingUp, TrendingDown, TrendingFlat,
  Star, School, Book, Group
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { getFacultyRatings } from '../services/api';

const COLORS = ['#667eea', '#764ba2', '#2af598', '#009efd', '#ff9a9e', '#fecfef'];

// Rating color based on value
const getRatingColor = (rating) => {
  if (rating >= 4.5) return '#4caf50';
  if (rating >= 3.5) return '#8bc34a';
  if (rating >= 2.5) return '#ff9800';
  if (rating >= 1.5) return '#ff5722';
  return '#f44336';
};

// Trend icon component
const TrendIndicator = ({ current, previous }) => {
  const diff = current - previous;
  if (diff > 0.1) return <TrendingUp sx={{ color: '#4caf50', ml: 1 }} />;
  if (diff < -0.1) return <TrendingDown sx={{ color: '#f44336', ml: 1 }} />;
  return <TrendingFlat sx={{ color: '#ff9800', ml: 1 }} />;
};

function RatingsPage() {
  const [ratingsData, setRatingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const data = await getFacultyRatings();
        setRatingsData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch ratings.');
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>My Ratings</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, lg: 6 }} key={i}>
              <Card sx={{ height: 200, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  if (!ratingsData || !ratingsData.ratings || ratingsData.ratings.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>My Ratings</Typography>
        <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3 }}>
          <Star sx={{ fontSize: 60, opacity: 0.8, mb: 2 }} />
          <Typography variant="h6">No ratings available yet</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {ratingsData?.feedbackPeriod?.name ? `Period: ${ratingsData.feedbackPeriod.name}` : 'Waiting for feedback submissions'}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Calculate overall stats
  const allRatings = ratingsData.ratings.flatMap(r =>
    r.ratings.filter(rt => rt.averageRating !== 'N/A').map(rt => parseFloat(rt.averageRating))
  );
  const overallAverage = allRatings.length > 0
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2)
    : 0;
  const totalResponses = ratingsData.ratings[0]?.ratings[0]?.totalResponses || 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Feedback Ratings</Typography>
        <Chip
          icon={<Star />}
          label={`Period: ${ratingsData.feedbackPeriod.name}`}
          color={ratingsData.feedbackPeriod.status === 'active' ? 'success' : 'default'}
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">{overallAverage}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Overall Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)', color: 'white', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Group sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">{totalResponses}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Responses</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: 'white', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Book sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">{ratingsData.ratings.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Subjects Taught</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Subject Rating Cards */}
      {ratingsData.ratings.map((rating, index) => {
        const chartData = rating.ratings
          .filter(r => r.averageRating !== 'N/A')
          .map((r, i) => ({
            name: `Q${i + 1}`,
            fullName: r.parameter,
            value: parseFloat(r.averageRating),
            responses: r.totalResponses
          }));

        const subjectAvg = chartData.length > 0
          ? (chartData.reduce((a, b) => a + b.value, 0) / chartData.length).toFixed(2)
          : 0;

        return (
          <Card
            key={rating.assignmentId}
            sx={{
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }
            }}
          >
            {/* Card Header with gradient */}
            <Box sx={{
              background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]} 0%, ${COLORS[(index + 1) % COLORS.length]} 100%)`,
              p: 2.5,
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{rating.subject.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {rating.subject.code} | {rating.class.name} | Semester {rating.subject.semester}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" fontWeight="bold">{subjectAvg}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>avg rating</Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Bar Chart */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Rating by Parameter
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" domain={[0, 5]} tickCount={6} />
                        <YAxis type="category" dataKey="name" width={40} />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload?.[0]) {
                              const data = payload[0].payload;
                              return (
                                <Paper sx={{ p: 1.5, maxWidth: 250 }}>
                                  <Typography variant="body2" fontWeight="bold">{data.fullName}</Typography>
                                  <Typography variant="body2" color="primary">Rating: {data.value}/5</Typography>
                                  <Typography variant="caption" color="text.secondary">{data.responses} responses</Typography>
                                </Paper>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={getRatingColor(entry.value)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>

                {/* Detailed Ratings List */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Detailed Breakdown
                  </Typography>
                  <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                    {rating.ratings.map((r, i) => (
                      <Box key={i} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Tooltip title={r.parameter} arrow>
                            <Typography variant="body2" sx={{
                              maxWidth: '75%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {r.parameter}
                            </Typography>
                          </Tooltip>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: getRatingColor(parseFloat(r.averageRating)) }}>
                            {r.averageRating}/5
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={r.averageRating !== 'N/A' ? (parseFloat(r.averageRating) / 5) * 100 : 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: getRatingColor(parseFloat(r.averageRating))
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default RatingsPage;