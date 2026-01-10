//src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Container, Typography, Tabs, Tab, Paper, Table, TableContainer,
  TableHead, TableBody, TableRow, TableCell, Pagination, CircularProgress,
  Alert, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid,
  Stack, Card, CardContent, IconButton, Chip, Tooltip
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  People as PeopleIcon, School as SchoolIcon, Book as BookIcon,
  Assignment as AssignmentIcon, Feedback as FeedbackIcon, Event as EventIcon
} from '@mui/icons-material';
import {
  getUsers, getClasses, getTeachingAssignments, getSubjects, getFeedbackPeriods,
  createSubject, updateSubject, deleteSubject as deleteSubjectApi,
  createFeedbackPeriod, updateFeedbackPeriod, deleteFeedbackPeriod as deleteFeedbackPeriodApi,
  createUser, updateUser, deleteUser as deleteUserApi, getDashboardStats,
  createClass, updateClass, deleteClass as deleteClassApi,
  createTeachingAssignment, updateTeachingAssignment, deleteTeachingAssignment as deleteAssignmentApi,
  getAllFaculty
} from '../services/api';
import { logout } from '../store/authSlice';
import api from '../services/api';

// Import modal components
import ConfirmDialog from '../components/Admin/ConfirmDialog';
import SubjectFormDialog from '../components/Admin/SubjectFormDialog';
import FeedbackPeriodFormDialog from '../components/Admin/FeedbackPeriodFormDialog';
import UserFormDialog from '../components/Admin/UserFormDialog';
import ClassFormDialog from '../components/Admin/ClassFormDialog';
import AssignmentFormDialog from '../components/Admin/AssignmentFormDialog';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`admin-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon: Icon, title, value, color }) {
  return (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`, color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>{title}</Typography>
          </Box>
          <Icon sx={{ fontSize: 48, opacity: 0.3 }} />
        </Box>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [feedbackPeriods, setFeedbackPeriods] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);

  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [subjectPage, setSubjectPage] = useState(1);
  const [periodPage, setPeriodPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalClassPages, setTotalClassPages] = useState(1);
  const [totalSubjectPages, setTotalSubjectPages] = useState(1);
  const [totalPeriodPages, setTotalPeriodPages] = useState(1);
  const [totalAssignmentPages, setTotalAssignmentPages] = useState(1);

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [periodFormOpen, setPeriodFormOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);

  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [classFormOpen, setClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch functions
  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers(userPage, 10, userSearch, userRoleFilter);
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalUserPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects(subjectPage, 10);
      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      setTotalSubjectPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch subjects');
    }
  };

  const fetchFeedbackPeriods = async () => {
    try {
      const data = await getFeedbackPeriods(periodPage, 10);
      setFeedbackPeriods(Array.isArray(data.feedbackPeriods) ? data.feedbackPeriods : []);
      setTotalPeriodPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch feedback periods');
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await getClasses(classPage);
      setClasses(Array.isArray(data.classes) ? data.classes : []);
      setTotalClassPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch classes');
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await getTeachingAssignments(assignmentPage);
      setAssignments(Array.isArray(data.teachingAssignments) ? data.teachingAssignments : []);
      setTotalAssignmentPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch assignments');
    }
  };

  const fetchAllFaculty = async () => {
    try {
      const data = await getAllFaculty();
      setAllFaculty(data);
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchSubjects(), fetchFeedbackPeriods(), fetchClasses(), fetchAssignments(), fetchAllFaculty()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => { fetchUsers(); }, [userPage, userSearch, userRoleFilter]);
  useEffect(() => { fetchSubjects(); }, [subjectPage]);
  useEffect(() => { fetchFeedbackPeriods(); }, [periodPage]);
  useEffect(() => { fetchClasses(); }, [classPage]);
  useEffect(() => { fetchAssignments(); }, [assignmentPage]);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const handleTabChange = (e, newVal) => { setTabIndex(newVal); setError(''); setSuccess(''); };

  // CRUD handlers
  const handleDeleteConfirm = (type, id, name) => {
    setConfirmMessage(`Are you sure you want to delete "${name}"?`);
    setConfirmAction(() => async () => {
      try {
        if (type === 'subject') { await deleteSubjectApi(id); fetchSubjects(); }
        else if (type === 'period') { await deleteFeedbackPeriodApi(id); fetchFeedbackPeriods(); }
        else if (type === 'user') { await deleteUserApi(id); fetchUsers(); }
        else if (type === 'class') { await deleteClassApi(id); fetchClasses(); }
        else if (type === 'assignment') { await deleteAssignmentApi(id); fetchAssignments(); }
        setSuccess(`${type} deleted successfully`);
        fetchStats();
      } catch (err) {
        setError(err.message || 'Delete failed');
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const handleSubjectSubmit = async (data) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject._id, data);
        setSuccess('Subject updated successfully');
      } else {
        await createSubject(data);
        setSuccess('Subject created successfully');
      }
      fetchSubjects();
      fetchStats();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handlePeriodSubmit = async (data) => {
    try {
      if (editingPeriod) {
        await updateFeedbackPeriod(editingPeriod._id, data);
        setSuccess('Feedback period updated successfully');
      } else {
        await createFeedbackPeriod(data);
        setSuccess('Feedback period created successfully');
      }
      fetchFeedbackPeriods();
      fetchStats();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleUserSubmit = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser._id, data);
        setSuccess('User updated successfully');
      } else {
        await createUser(data);
        setSuccess('User created successfully');
      }
      fetchUsers();
      fetchStats();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleClassSubmit = async (data) => {
    try {
      if (editingClass) {
        await updateClass(editingClass._id, data);
        setSuccess('Class updated successfully');
      } else {
        await createClass(data);
        setSuccess('Class created successfully');
      }
      fetchClasses();
      fetchStats();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleAssignmentSubmit = async (data) => {
    try {
      if (editingAssignment) {
        await updateTeachingAssignment(editingAssignment._id, data);
        setSuccess('Teaching assignment updated successfully');
      } else {
        await createTeachingAssignment(data);
        setSuccess('Teaching assignment created successfully');
      }
      fetchAssignments();
      fetchStats();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      await api.post(`/admin/upload/${type}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(`${type} uploaded successfully!`);
      if (type === 'users') fetchUsers();
      if (type === 'subjects') fetchSubjects();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      const response = await api.get(`/admin/reports/ratings/${type}`, { responseType: 'blob' });
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

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Admin Dashboard</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Overview" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="Users" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Subjects" icon={<BookIcon />} iconPosition="start" />
            <Tab label="Feedback Periods" icon={<EventIcon />} iconPosition="start" />
            <Tab label="Classes" icon={<SchoolIcon />} iconPosition="start" />
            <Tab label="Assignments" icon={<FeedbackIcon />} iconPosition="start" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabIndex} index={0}>
          <Typography variant="h6" gutterBottom>Dashboard Overview</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={PeopleIcon} title="Total Users" value={stats?.users?.total || 0} color="#1976d2" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={SchoolIcon} title="Students" value={stats?.users?.students || 0} color="#2e7d32" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={PeopleIcon} title="Faculty" value={stats?.users?.faculty || 0} color="#ed6c02" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={FeedbackIcon} title="Total Feedbacks" value={stats?.totalFeedbacks || 0} color="#9c27b0" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={BookIcon} title="Subjects" value={stats?.totalSubjects || 0} color="#0288d1" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={SchoolIcon} title="Classes" value={stats?.totalClasses || 0} color="#7b1fa2" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={AssignmentIcon} title="Assignments" value={stats?.totalAssignments || 0} color="#c2185b" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard icon={EventIcon} title="Active Periods" value={stats?.activePeriods || 0} color="#00796b" />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabIndex} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Manage Users</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingUser(null); setUserFormOpen(true); }}>
                Add User
              </Button>
              <Button variant="outlined" component="label">
                Upload CSV
                <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(e, 'users')} />
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Search Users" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Role</InputLabel>
                <Select value={userRoleFilter} label="Filter by Role" onChange={(e) => setUserRoleFilter(e.target.value)}>
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Chip label={user.role} size="small" color={user.role === 'admin' ? 'error' : user.role === 'faculty' ? 'primary' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingUser(user); setUserFormOpen(true); }}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteConfirm('user', user._id, user.name)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalUserPages} page={userPage} onChange={(e, v) => setUserPage(v)} color="primary" />
          </Box>
        </TabPanel>

        {/* Subjects Tab */}
        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Manage Subjects</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingSubject(null); setSubjectFormOpen(true); }}>
                Add Subject
              </Button>
              <Button variant="outlined" component="label">
                Upload CSV
                <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(e, 'subjects')} />
              </Button>
            </Stack>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map(subject => (
                  <TableRow key={subject._id}>
                    <TableCell>{subject.subjectCode}</TableCell>
                    <TableCell>{subject.subjectName}</TableCell>
                    <TableCell>{subject.branch}</TableCell>
                    <TableCell>{subject.semester}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingSubject(subject); setSubjectFormOpen(true); }}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteConfirm('subject', subject._id, subject.subjectName)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalSubjectPages} page={subjectPage} onChange={(e, v) => setSubjectPage(v)} color="primary" />
          </Box>
        </TabPanel>

        {/* Feedback Periods Tab */}
        <TabPanel value={tabIndex} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Manage Feedback Periods</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingPeriod(null); setPeriodFormOpen(true); }}>
              Add Period
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbackPeriods.map(period => (
                  <TableRow key={period._id}>
                    <TableCell>{period.name}</TableCell>
                    <TableCell>{period.semester}</TableCell>
                    <TableCell>{period.year}</TableCell>
                    <TableCell>{new Date(period.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(period.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={period.status || (period.isActive ? 'Active' : 'Inactive')}
                        size="small"
                        color={period.status === 'active' || period.isActive ? 'success' : period.status === 'upcoming' ? 'info' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingPeriod(period); setPeriodFormOpen(true); }}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteConfirm('period', period._id, period.name)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalPeriodPages} page={periodPage} onChange={(e, v) => setPeriodPage(v)} color="primary" />
          </Box>
        </TabPanel>

        {/* Classes Tab */}
        <TabPanel value={tabIndex} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Manage Classes</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingClass(null); setClassFormOpen(true); }}>
                Add Class
              </Button>
              <Button variant="outlined" component="label">
                Upload CSV
                <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(e, 'classes')} />
              </Button>
            </Stack>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map(cls => (
                  <TableRow key={cls._id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls.branch}</TableCell>
                    <TableCell>{cls.semester}</TableCell>
                    <TableCell>{cls.section}</TableCell>
                    <TableCell>{cls.academicYear}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingClass(cls); setClassFormOpen(true); }}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteConfirm('class', cls._id, cls.name)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalClassPages} page={classPage} onChange={(e, v) => setClassPage(v)} color="primary" />
          </Box>
        </TabPanel>

        {/* Assignments Tab */}
        <TabPanel value={tabIndex} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Teaching Assignments</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingAssignment(null); setAssignmentFormOpen(true); }}>
              Add Assignment
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Feedback Period</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map(assignment => (
                  <TableRow key={assignment._id}>
                    <TableCell>{assignment.faculty?.name || 'N/A'}</TableCell>
                    <TableCell>{assignment.subject?.subjectName || 'N/A'}</TableCell>
                    <TableCell>{assignment.class?.name || 'N/A'}</TableCell>
                    <TableCell>{assignment.feedbackPeriod?.name || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingAssignment(assignment); setAssignmentFormOpen(true); }}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteConfirm('assignment', assignment._id, `${assignment.faculty?.name} - ${assignment.subject?.subjectName}`)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalAssignmentPages} page={assignmentPage} onChange={(e, v) => setAssignmentPage(v)} color="primary" />
          </Box>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabIndex} index={6}>
          <Typography variant="h6" gutterBottom>Download Reports</Typography>
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

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Delete"
        message={confirmMessage}
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      <SubjectFormDialog
        open={subjectFormOpen}
        onClose={() => setSubjectFormOpen(false)}
        onSubmit={handleSubjectSubmit}
        initialData={editingSubject}
      />

      <FeedbackPeriodFormDialog
        open={periodFormOpen}
        onClose={() => setPeriodFormOpen(false)}
        onSubmit={handlePeriodSubmit}
        initialData={editingPeriod}
      />

      <UserFormDialog
        open={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        onSubmit={handleUserSubmit}
        initialData={editingUser}
      />

      <ClassFormDialog
        open={classFormOpen}
        onClose={() => setClassFormOpen(false)}
        onSubmit={handleClassSubmit}
        initialData={editingClass}
      />

      <AssignmentFormDialog
        open={assignmentFormOpen}
        onClose={() => setAssignmentFormOpen(false)}
        onSubmit={handleAssignmentSubmit}
        initialData={editingAssignment}
        faculty={allFaculty}
        subjects={subjects}
        classes={classes}
        feedbackPeriods={feedbackPeriods}
      />
    </Container>
  );
}

export default AdminDashboard;
