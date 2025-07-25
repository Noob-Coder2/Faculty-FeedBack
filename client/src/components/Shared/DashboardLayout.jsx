import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Autocomplete, TextField, IconButton, Tabs, Tab } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faComment, faLock, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import { searchFaculty } from '../../services/api';
import PropTypes from 'prop-types';

function DashboardLayout({ role, children, activeTab, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  // const token = useSelector((state) => state.auth.token); // No longer needed

  // Debounced faculty search
  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) {
      setOptions([]);
      setSearchError('');
      return;
    }
    try {
      const results = await searchFaculty(query);
      setOptions(results);
      setSearchError('');
    } catch {
      setSearchError('Failed to search faculty. Please try again.');
      setOptions([]);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel(); // Cleanup debounce on unmount
  }, [searchQuery, debouncedSearch]);

  const handleSelect = (event, value) => {
    if (value) {
      navigate(`/faculty-ratings/${value._id}`);
    }
  };

  const handleLogout = () => {
    // Optionally, call backend logout endpoint to clear cookie
    navigate('/');
  };

  const tabs = [
    { label: 'Profile', icon: faUser, value: 'profile' },
    role === 'student' && { label: 'Feedback', icon: faComment, value: 'feedback' },
    { label: 'Change Password', icon: faLock, value: 'password' },
  ].filter(Boolean);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Tabs
        orientation="vertical"
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={<FontAwesomeIcon icon={tab.icon} />}
            iconPosition="start"
            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
          />
        ))}
      </Tabs>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header with Search Bar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
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
                  placeholder="Search Faculty by Name"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  error={!!searchError}
                  helperText={searchError}
                  sx={{ bgcolor: 'white', borderRadius: 1, mr: 2, width: 300 }}
                />
              )}
              noOptionsText="No faculty found"
              loading={options.length === 0 && searchQuery.length >= 2 && !searchError}
            />
            <IconButton color="inherit" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ mt: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;