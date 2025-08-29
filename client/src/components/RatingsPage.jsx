// src/components/RatingsPage.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert, TableContainer, Paper, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFacultyRatings } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

function RatingsPage() {
  const [ratingsData, setRatingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        setError('');
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
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (!ratingsData || !ratingsData.ratings || ratingsData.ratings.length === 0) {
    return (
      <>
        <Typography variant="h4" gutterBottom>My Ratings</Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          No ratings are available for the current feedback period.
          {ratingsData?.feedbackPeriod?.name && ` (Period: ${ratingsData.feedbackPeriod.name})`}
        </Alert>
      </>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Feedback Ratings</Typography>
      <Typography variant="h6" gutterBottom>
        Feedback Period: {ratingsData.feedbackPeriod.name} ({ratingsData.feedbackPeriod.status})
      </Typography>
      {ratingsData.ratings.map((rating) => {
        const chartData = rating.ratings
          .filter(r => r.averageRating !== 'N/A')
          .map(r => ({
            name: r.parameter.split(' ').pop(), // Use last word for shorter label
            value: parseFloat(r.averageRating)
          }));

        return (
          <Card key={rating.assignmentId} sx={{ mt: 3, mb: 3 }} variant="outlined">
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                {rating.subject.name} ({rating.subject.code})
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Class: {rating.class.name} | Semester: {rating.subject.semester}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <TableContainer component={Paper}>
                    <Table size="small" aria-label="ratings table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Parameter</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Average Rating</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Responses</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rating.ratings.map((r) => (
                          <TableRow key={r.parameter}>
                            <TableCell component="th" scope="row">
                              {r.parameter}
                            </TableCell>
                            <TableCell align="right">{r.averageRating}</TableCell>
                            <TableCell align="right">{r.totalResponses}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={5}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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
