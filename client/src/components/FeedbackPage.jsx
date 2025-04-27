// src/components/FeedbackPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import { getAssignments, getSubmissionStatus } from '../services/api';
import { useSelector } from 'react-redux';

function FeedbackPage() {
  const [assignments, setAssignments] = useState([]);
  const [status, setStatus] = useState({ totalAssignments: 0, submittedCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignData = await getAssignments(token);
        setAssignments(assignData.teachingAssignments);
        const statusData = await getSubmissionStatus(token);
        setStatus(statusData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4">Feedback</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Submission Status: {status.submittedCount} / {status.totalAssignments} submitted
      </Typography>
      <Typography>Pending: {status.pendingCount}</Typography>

      <Typography variant="h5" sx={{ mt: 3 }}>Pending Feedback</Typography>
      <Grid container spacing={2}>
        {assignments.map((assignment) => (
          <Grid item xs={12} sm={6} md={4} key={assignment._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{assignment.faculty.name}</Typography>
                <Typography>Subject: {assignment.subject.subjectName}</Typography>
                <Typography>Class: {assignment.class.name}</Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/feedback-form/${assignment._id}`)}
                  sx={{ mt: 1 }}
                >
                  Provide Feedback
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mt: 3 }}>Completed/Expired Feedback</Typography>
      {/* Placeholder for completed/expired feedback */}
      <Typography>Coming soon...</Typography>
    </Box>
  );
}

export default FeedbackPage;
