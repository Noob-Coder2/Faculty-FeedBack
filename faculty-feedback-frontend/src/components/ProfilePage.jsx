// src/components/ProfilePage.jsx
import { useSelector } from 'react-redux';
import { Box, Typography, Avatar } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

function ProfilePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Box>
      <Typography variant="h4">Profile</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Avatar sx={{ width: 100, height: 100, mr: 2 }}>
          <FontAwesomeIcon icon={faUser} size="2x" />
        </Avatar>
        <Box>
          <Typography variant="h6">User ID: {user?.userId}</Typography>
          <Typography>Name: {user?.name}</Typography>
          <Typography>Email: {user?.email}</Typography>
          <Typography>Role: {user?.role}</Typography>
          {user?.role === 'student' && (
            <>
              <Typography>Branch: {user?.profile?.branch}</Typography>
              <Typography>Semester: {user?.profile?.semester}</Typography>
              <Typography>Section: {user?.profile?.section}</Typography>
              <Typography>Admission Year: {user?.profile?.admissionYear}</Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePage;