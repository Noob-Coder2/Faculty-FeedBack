//src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Container, Typography, Tabs, Tab, Paper, Table, TableContainer,
  TableHead, TableBody, TableRow, TableCell, Pagination, CircularProgress,
  Alert, Button
} from '@mui/material';
import { getUsers, getClasses, getTeachingAssignments } from '../services/api';
import { logoutUser } from '../store/authSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalClassPages, setTotalClassPages] = useState(1);
  const [totalAssignmentPages, setTotalAssignmentPages] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const usersData = await getUsers(userPage);
        setUsers(Array.isArray(usersData.users) ? usersData.users : []);
        setTotalUserPages(usersData.pagination?.totalPages || 1);

        const classesData = await getClasses(classPage);
        setClasses(Array.isArray(classesData.classes) ? classesData.classes : []);
        setTotalClassPages(classesData.pagination?.totalPages || 1);

        const assignmentsData = await getTeachingAssignments(assignmentPage);
        setAssignments(Array.isArray(assignmentsData.teachingAssignments) ? assignmentsData.teachingAssignments : []);
        setTotalAssignmentPages(assignmentsData.pagination?.totalPages || 1);

      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userPage, classPage, assignmentPage]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handlePageChange = (type, newPage) => {
    if (type === 'users') setUserPage(newPage);
    if (type === 'classes') setClassPage(newPage);
    if (type === 'assignments') setAssignmentPage(newPage);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="admin dashboard tabs">
            <Tab label="Users" id="admin-tab-0" />
            <Tab label="Classes" id="admin-tab-1" />
            <Tab label="Teaching Assignments" id="admin-tab-2" />
          </Tabs>
        </Box>

        {/* Users Panel */}
        <TabPanel value={tabIndex} index={0}>
          <Typography variant="h6" gutterBottom>Manage Users</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalUserPages}
              page={userPage}
              onChange={(e, value) => handlePageChange('users', value)}
              color="primary"
            />
          </Box>
        </TabPanel>

        {/* Classes Panel */}
        <TabPanel value={tabIndex} index={1}>
          <Typography variant="h6" gutterBottom>Manage Classes</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Section</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map(cls => (
                  <TableRow key={cls._id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls.branch}</TableCell>
                    <TableCell>{cls.semester}</TableCell>
                    <TableCell>{cls.section}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalClassPages}
              page={classPage}
              onChange={(e, value) => handlePageChange('classes', value)}
              color="primary"
            />
          </Box>
        </TabPanel>

        {/* Assignments Panel */}
        <TabPanel value={tabIndex} index={2}>
          <Typography variant="h6" gutterBottom>Manage Teaching Assignments</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Feedback Period</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map(assignment => (
                  <TableRow key={assignment._id}>
                    <TableCell>{assignment.faculty.name}</TableCell>
                    <TableCell>{assignment.subject.subjectName}</TableCell>
                    <TableCell>{assignment.class.name}</TableCell>
                    <TableCell>{assignment.feedbackPeriod.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalAssignmentPages}
              page={assignmentPage}
              onChange={(e, value) => handlePageChange('assignments', value)}
              color="primary"
            />
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default AdminDashboard;
