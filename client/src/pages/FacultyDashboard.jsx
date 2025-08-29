// src/pages/FacultyDashboard.jsx
import { useState } from 'react';
import DashboardLayout from '../components/Shared/DashboardLayout';
import ProfilePage from '../components/ProfilePage';
import ChangePasswordPage from '../components/Shared/ChangePasswordPage';
import RatingsPage from '../components/RatingsPage';

function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('ratings');

  const renderContent = () => {
    switch (activeTab) {
      case 'ratings':
        return <RatingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'password':
        return <ChangePasswordPage />;
      default:
        return <RatingsPage />;
    }
  };

  return (
    <DashboardLayout role="faculty" activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

export default FacultyDashboard;
