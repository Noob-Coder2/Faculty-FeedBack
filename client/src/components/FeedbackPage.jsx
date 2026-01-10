// src/components/FeedbackPage.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Card, CardContent, Button, Grid, CircularProgress,
  Avatar, Chip, Fade, Paper
} from '@mui/material';
import {
  School, Class, Assignment, AccessTime, CheckCircleOutline, RateReview
} from '@mui/icons-material';
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Feedback Assignments</Typography>
          <Typography variant="body1" color="text.secondary">
            Share your thoughts anonymously to help improve teaching quality.
          </Typography>
        </Box>
        <Chip
          icon={<AccessTime />}
          label={`${status.pendingCount} Pending`}
          color={status.pendingCount > 0 ? "warning" : "success"}
          sx={{ mt: { xs: 2, sm: 0 } }}
        />
      </Box>

      {assignments.length === 0 ? (
        <Paper
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: '2px dashed #90caf9'
          }}
        >
          <CheckCircleOutline sx={{ fontSize: 80, color: '#4caf50', mb: 2, opacity: 0.8 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            All Caught Up!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You have no pending feedback assignments. Great job!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={assignment._id}>
              <Fade in={true} timeout={300 + (index * 100)}>
                <Card
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                    },
                    border: '1px solid rgba(0,0,0,0.08)'
                  }}
                >
                  <Box sx={{
                    p: 2,
                    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                    color: 'white'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'white', color: '#00f2fe' }}>
                        {assignment.faculty.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {assignment.faculty.name}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Faculty
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <School color="action" fontSize="small" />
                      <Typography variant="body2" fontWeight="medium">
                        {assignment.subject.subjectName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Class color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Class: {assignment.class.name}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<RateReview />}
                      onClick={() => navigate(`/feedback-form/${assignment._id}`)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
                      }}
                    >
                      Give Feedback
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default FeedbackPage;
