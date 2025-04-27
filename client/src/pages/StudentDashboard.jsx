// src/pages/StudentDashboard.jsx
import { useState } from 'react';
import DashboardLayout from '../components/Shared/DashboardLayout';
import ProfilePage from '../components/ProfilePage';
import FeedbackPage from '../components/FeedbackPage';
import ChangePasswordPage from '../components/Shared/ChangePasswordPage';

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

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
      {renderContent()}
    </DashboardLayout>
  );
}

export default StudentDashboard;