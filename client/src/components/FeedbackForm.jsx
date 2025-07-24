// src/components/FeedbackForm.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Rating, Button, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { submitFeedbackThunk, fetchFeedbackData, clearFeedbackState } from '../store/feedbackSlice';

function FeedbackForm() {
  const { assignmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const { assignments, ratingParameters, loading, error, success } = useSelector((state) => state.feedback);
  const [ratings, setRatings] = useState([]);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (token) dispatch(fetchFeedbackData(token));
    return () => { dispatch(clearFeedbackState()); };
  }, [token, dispatch]);

  useEffect(() => {
    if (ratingParameters.length > 0) {
      setRatings(ratingParameters.map((param) => ({ ratingParameter: param.id, value: 0 })));
    }
  }, [ratingParameters]);

  const assignment = assignments.find((a) => a._id === assignmentId);

  const handleSubmit = () => {
    if (ratings.some((r) => r.value === 0)) {
      setLocalError('Please provide all 5 ratings.');
      return;
    }
    setLocalError('');
    dispatch(submitFeedbackThunk({ token, payload: { teachingAssignment: assignmentId, ratings } }))
      .then((res) => {
        if (!res.error) setTimeout(() => navigate('/student-dashboard'), 1500);
      });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!assignment) return <Typography color="error">Assignment not found.</Typography>;

  return (
    <Box>
      <Typography variant="h4">Feedback for {assignment.faculty.name}</Typography>
      <Typography>Subject: {assignment.subject.subjectName}</Typography>
      <Box sx={{ mt: 2 }}>
        {ratings.map((rating, index) => (
          <Box key={rating.ratingParameter} sx={{ mb: 2 }}>
            <Typography>{ratingParameters[index]?.questionText || `Question ${index+1}`}</Typography>
            <Rating
              value={rating.value}
              onChange={(e, newValue) =>
                setRatings((prev) =>
                  prev.map((r, i) => (i === index ? { ...r, value: newValue } : r))
                )
              }
              max={5}
            />
          </Box>
        ))}
        <Button variant="contained" onClick={handleSubmit} disabled={loading || ratings.some((r) => r.value === 0)}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
        {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
        {(error || localError) && <Typography color="error" sx={{ mt: 2 }}>{error || localError}</Typography>}
      </Box>
    </Box>
  );
}

export default FeedbackForm;