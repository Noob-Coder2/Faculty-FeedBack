// src/components/FeedbackPage.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Card, CardContent, Button, Grid, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchFeedbackData, clearFeedbackState } from '../store/feedbackSlice';

function FeedbackPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const { assignments, status, loading, error } = useSelector((state) => state.feedback);

  useEffect(() => {
    if (token) dispatch(fetchFeedbackData(token));
    return () => { dispatch(clearFeedbackState()); };
  }, [token, dispatch]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4">Feedback</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Submission Status: {status.submittedCount} / {status.totalAssignments} submitted
      </Typography>
      <Typography>Pending: {status.pendingCount}</Typography>

      <Typography variant="h5" sx={{ mt: 3 }}>Pending Feedback</Typography>
      {assignments.length === 0 ? (
        <Typography>No pending feedback assignments. All done!</Typography>
      ) : (
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
      )}

      <Typography variant="h5" sx={{ mt: 3 }}>Completed/Expired Feedback</Typography>
      {/* Placeholder for completed/expired feedback */}
      <Typography>Coming soon...</Typography>
    </Box>
  );
}

export default FeedbackPage;
