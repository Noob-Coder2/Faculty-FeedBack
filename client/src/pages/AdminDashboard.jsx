//src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Container, Typography, Tabs, Tab, Paper, Table, TableContainer,
  TableHead, TableBody, TableRow, TableCell, Pagination, CircularProgress,
  Alert, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Stack
} from '@mui/material';
import { getUsers, getClasses, getTeachingAssignments } from '../services/api';
import { logout } from '../store/authSlice';
import api from '../services/api'; // Import raw api instance for file uploads and downloads

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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalClassPages, setTotalClassPages] = useState(1);
  const [totalAssignmentPages, setTotalAssignmentPages] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers(userPage, 10, userSearch, userRoleFilter);
      setUsers(Array.isArray(usersData.users) ? usersData.users : []);
      setTotalUserPages(usersData.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchUsers();

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

  // Re-fetch users when search/filter changes
  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError('');
    setSuccess('');
  };

  const handlePageChange = (type, newPage) => {
    if (type === 'users') setUserPage(newPage);
    if (type === 'classes') setClassPage(newPage);
    if (type === 'assignments') setAssignmentPage(newPage);
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await api.post(`/admin/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(`${type} uploaded successfully!`);
      // Refresh data
      if (type === 'users') fetchUsers();
      // if (type === 'classes') fetchClasses(); // Add fetchClasses if needed
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      const response = await api.get(`/admin/reports/ratings/${type}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ratings-report.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download report');
    }
  };

  if (loading && !users.length) {
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
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="admin dashboard tabs">
            <Tab label="Users" id="admin-tab-0" />
            <Tab label="Classes" id="admin-tab-1" />
            <Tab label="Teaching Assignments" id="admin-tab-2" />
            <Tab label="Reports" id="admin-tab-3" />
          </Tabs>
        </Box>

        {/* Users Panel */}
        <TabPanel value={tabIndex} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Manage Users</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" component="label">
                Upload Users CSV
                <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(e, 'users')} />
              </Button>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search Users"
                variant="outlined"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={userRoleFilter}
                  label="Filter by Role"
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Manage Classes</Typography>
            <Button variant="contained" component="label">
              Upload Classes CSV
              <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(e, 'classes')} />
            </Button>
          </Box>
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

        {/* Reports Panel */}
        <TabPanel value={tabIndex} index={3}>
          <Typography variant="h6" gutterBottom>Reports</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={() => downloadReport('pdf')}>
              Export Ratings PDF
            </Button>
            <Button variant="contained" color="success" onClick={() => downloadReport('excel')}>
              Export Ratings Excel
            </Button>
          </Stack>
        </TabPanel>

      </Paper>
    </Container>
  );
}

export default AdminDashboard;
