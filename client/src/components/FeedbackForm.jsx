// src/components/FeedbackForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Rating, Button } from '@mui/material';
import { getAssignments, submitFeedback } from '../services/api';
import { useSelector } from 'react-redux';

function FeedbackForm() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const data = await getAssignments(token);
        const assign = data.teachingAssignments.find((a) => a._id === assignmentId);
        setAssignment(assign);
        setRatings(data.ratingParameters.map((param) => ({ ratingParameter: param.id, value: 0 })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId, token]);

  const handleSubmit = async () => {
    try {
      await submitFeedback(token, { teachingAssignment: assignmentId, ratings });
      navigate('/student-dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4">Feedback for {assignment.faculty.name}</Typography>
      <Typography>Subject: {assignment.subject.subjectName}</Typography>
      <Box sx={{ mt: 2 }}>
        {ratings.map((rating, index) => (
          <Box key={rating.ratingParameter} sx={{ mb: 2 }}>
            <Typography>{assignment.ratingParameters[index].questionText}</Typography>
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
        <Button variant="contained" onClick={handleSubmit} disabled={ratings.some((r) => r.value === 0)}>
          Submit Feedback
        </Button>
      </Box>
    </Box>
  );
}

export default FeedbackForm;