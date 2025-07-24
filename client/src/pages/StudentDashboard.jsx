// src/pages/StudentDashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../components/Shared/DashboardLayout';
import ProfilePage from '../components/ProfilePage';
import FeedbackPage from '../components/FeedbackPage';
import ChangePasswordPage from '../components/Shared/ChangePasswordPage';
import { fetchFeedbackData } from '../store/feedbackSlice';

function StudentDashboard() {
  const dispatch = useDispatch();
  const { status, loading, error } = useSelector((state) => state.feedback);
  const [activeTab, setActiveTab] = useState('profile');
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
      case 'password':
        return <ChangePasswordPage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <DashboardLayout role="student" activeTab={activeTab} setActiveTab={setActiveTab}>
      <div style={{ marginBottom: 24 }}>
        {loading ? (
          <span>Loading summary...</span>
        ) : error ? (
          <span style={{ color: 'red' }}>{error}</span>
        ) : status ? (
          <>
            <strong>Feedback Progress:</strong> {status.submittedCount} / {status.totalAssignments} submitted. Pending: {status.pendingCount}
          </>
        ) : null}
      </div>
      {renderContent()}
    </DashboardLayout>
  );
}

export default StudentDashboard;