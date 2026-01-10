import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Autocomplete, TextField, IconButton, Tabs, Tab,
  Drawer, useTheme, useMediaQuery
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faComment, faLock, faSignOutAlt, faStar, faChartLine, faBars, faHistory, faComments
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import debounce from 'lodash/debounce';
import { searchFaculty } from '../../services/api';
import { logout } from '../../store/authSlice';
import PropTypes from 'prop-types';

const DRAWER_WIDTH = 240;

function DashboardLayout({ role, children, activeTab, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Debounced faculty search
  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) {
      setOptions([]);
      setSearchError('');
      return;
    }
    try {
      const results = await searchFaculty(query);
      setOptions(results.data);
      setSearchError('');
    } catch {
      setSearchError('Failed to search faculty. Please try again.');
      setOptions([]);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleSelect = (event, value) => {
    if (value) {
      console.log('Selected faculty:', value);
    }
  };

  const tabs = [
    { label: 'Profile', icon: faUser, value: 'profile' },
    role === 'student' && { label: 'Give Feedback', icon: faComment, value: 'feedback' },
    role === 'student' && { label: 'History', icon: faHistory, value: 'history' },
    role === 'faculty' && { label: 'Analytics', icon: faChartLine, value: 'analytics' },
    role === 'faculty' && { label: 'My Ratings', icon: faStar, value: 'ratings' },
    role === 'faculty' && { label: 'Comments', icon: faComments, value: 'comments' },
    { label: 'Change Password', icon: faLock, value: 'password' },
  ].filter(Boolean);

  const drawerContent = (
    <Box sx={{ height: '100%', pt: 2 }}>
      <Tabs
        orientation="vertical"
        value={activeTab}
        onChange={handleTabChange}
        aria-label="dashboard navigation tabs"
        sx={{
          '& .MuiTab-root': {
            alignItems: 'flex-start',
            pl: 3,
            minHeight: 48,
            textTransform: 'none'
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={<FontAwesomeIcon icon={tab.icon} style={{ marginRight: '10px', width: 20 }} />}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <FontAwesomeIcon icon={faBars} />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Faculty Feedback System - {role.charAt(0).toUpperCase() + role.slice(1)}
          </Typography>

          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.name}
            onChange={handleSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Search Faculty"
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  mr: 2,
                  width: { xs: 150, sm: 300 },
                  '& .MuiOutlinedInput-root': { paddingRight: '30px !important' }
                }}
              />
            )}
            noOptionsText="No faculty found"
            loading={options.length === 0 && searchQuery.length >= 2 && !searchError}
          />

          <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          <Toolbar /> {/* Spacer for AppBar */}
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8 // Add margin top for fixed AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

DashboardLayout.propTypes = {
  role: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default DashboardLayout;
