import { useState } from 'react';
import DashboardLayout from '../components/Shared/DashboardLayout';
import ProfilePage from '../components/ProfilePage';
import ChangePasswordPage from '../components/Shared/ChangePasswordPage';
import RatingsPage from '../components/RatingsPage';
import FacultyAnalytics from '../components/FacultyAnalytics';
import CommentsPage from '../components/CommentsPage';

function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('analytics'); // Default to analytics for better first impression

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <FacultyAnalytics />;
      case 'ratings':
        return <RatingsPage />;
      case 'comments':
        return <CommentsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'password':
        return <ChangePasswordPage />;
      default:
        return <FacultyAnalytics />;
    }
  };

  return (
    <DashboardLayout role="faculty" activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

export default FacultyDashboard;

