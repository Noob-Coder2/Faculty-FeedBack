// src/services/api.js
export const login = async (userId, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

// Admin-specific API calls
export const getUsers = async (token, page = 1) => {
  const response = await fetch(`/api/admin/users?page=${page}&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch users');
  }

  return response.json();
};

export const getClasses = async (token, page = 1) => { // Add page param
  const response = await fetch(`/api/admin/classes?page=${page}&limit=10`, { // Add query params
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch classes');
  }

  return response.json();
};

export const getTeachingAssignments = async (token, page = 1) => { // Add page param
  const response = await fetch(`/api/admin/teaching-assignments?page=${page}&limit=10`, { // Add query params
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch teaching assignments');
  }

  return response.json();
};