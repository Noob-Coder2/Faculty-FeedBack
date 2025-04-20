// src/components/RatingsPage.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { getFacultyRatings } from '../services/api';
import { useSelector } from 'react-redux';

function RatingsPage() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const data = await getFacultyRatings(token);
        setRatings(data.ratings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, [token]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4">My Ratings</Typography>
      {ratings.map((rating) => (
        <Box key={rating.assignmentId} sx={{ mt: 2 }}>
          <Typography variant="h6">
            {rating.subject.name} - {rating.class.name}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                <TableCell>Average Rating</TableCell>
                <TableCell>Total Responses</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rating.ratings.map((r) => (
                <TableRow key={r.parameter}>
                  <TableCell>{r.parameter}</TableCell>
                  <TableCell>{r.averageRating}</TableCell>
                  <TableCell>{r.totalResponses}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Box>
  );
}

export default RatingsPage;
