// src/pages/StudentDashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Grid, Card, CardContent, LinearProgress,
  Chip, Avatar, Paper, Fade
} from '@mui/material';
import {
  Assignment, CheckCircle, PendingActions,
  TrendingUp, WavingHand
} from '@mui/icons-material';
import DashboardLayout from '../components/Shared/DashboardLayout';
import ProfilePage from '../components/ProfilePage';
import FeedbackPage from '../components/FeedbackPage';
import FeedbackHistory from '../components/Student/FeedbackHistory';
import ChangePasswordPage from '../components/Shared/ChangePasswordPage';
import { fetchFeedbackData } from '../store/feedbackSlice';

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, color, gradient }) => (
  <Card sx={{
    height: '100%',
    borderRadius: 3,
    background: gradient,
    color: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.2 }}>
      {icon}
    </Box>
    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
      <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ opacity: 0.9 }}>
        {title}
      </Typography>
      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

function StudentDashboard() {
  const dispatch = useDispatch();
  const { status, loading, error } = useSelector((state) => state.feedback);
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchFeedbackData(token));
  }, [token, dispatch]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'history':
        return <FeedbackHistory />;
      case 'password':
        return <ChangePasswordPage />;
      default:
        return <ProfilePage />;
    }
  };

  // Calculate stats
  const total = status?.totalAssignments || 0;
  const submitted = status?.submittedCount || 0;
  const pending = status?.pendingCount || 0;
  const progress = total > 0 ? (submitted / total) * 100 : 0;
  const participationRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <DashboardLayout role="student" activeTab={activeTab} setActiveTab={setActiveTab}>
      <Box sx={{ mb: 4 }}>
        {/* Welcome Banner */}
        <Paper sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(to right, #ffffff, #f0f2f5)',
          borderLeft: '6px solid #4caf50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#e8f5e9', color: '#4caf50', width: 56, height: 56 }}>
              <WavingHand fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                {greeting}, {user?.name?.split(' ')[0]}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You have <strong>{pending} pending</strong> feedbacks to complete.
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Anonymous Feedback System"
            color="success"
            variant="outlined"
            icon={<CheckCircle />}
          />
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Pending Feedback"
              value={pending}
              subtitle="Assignments waiting"
              icon={<PendingActions sx={{ fontSize: 100 }} />}
              gradient="linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Completed"
              value={submitted}
              subtitle="Feedbacks submitted"
              icon={<CheckCircle sx={{ fontSize: 100 }} />}
              gradient="linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Participation"
              value={`${participationRate}%`}
              subtitle="Completion rate"
              icon={<TrendingUp sx={{ fontSize: 100 }} />}
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            />
          </Grid>
        </Grid>

        {/* Progress Section */}
        {total > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary">
                Overall Progress
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="primary">
                {submitted} / {total} Completed
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #56ab2f 0%, #a8e063 100%)'
                }
              }}
            />
          </Box>
        )}
      </Box>

      {/* Main Content Area with Fade In */}
      <Fade in={true} timeout={500}>
        <Box>
          {renderContent()}
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

export default StudentDashboard;