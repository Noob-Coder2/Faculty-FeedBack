// src/components/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Autocomplete, TextField, IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';

function DashboardLayout({ role, children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  // Debounced faculty search
  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) return;
    try {
      const response = await fetch(`/api/faculty/search?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();
      setOptions(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  }, 300);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setOptions([]);
    }
  }, [searchQuery]);

  const handleSelect = (event, value) => {
    if (value) {
      navigate(`/faculty-ratings/${value._id}`);
    }
  };

  const handleLogout = () => {
    // Logout logic here
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
                sx={{ bgcolor: 'white', borderRadius: 1, mr: 2, width: 300 }}
              />
            )}
            noOptionsText="No faculty found"
            loading={options.length === 0 && searchQuery.length >= 2}
          />
          <IconButton color="inherit" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;