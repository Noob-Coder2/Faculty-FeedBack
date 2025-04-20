import axios from 'axios';
import axiosRetry from 'axios-retry';

// In-memory cache
const cache = new Map();
const CACHE_TTL = {
  profile: 60 * 60 * 1000, // 1 hour for user profile
  ratings: 5 * 60 * 1000, // 5 minutes for faculty ratings
  search: 10 * 60 * 1000, // 10 minutes for faculty search
  assignments: 2 * 60 * 1000, // 2 minutes for student assignments
};

// Persistent cache for user profile
const LOCAL_STORAGE_KEY = 'faculty_feedback_cache';

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure retries
axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  },
});

// Add interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cache handling
const getCacheKey = (method, url, params) => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramString}`;
};

const getCachedResponse = (key, ttl) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (key, data, ttl) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Local storage for user profile
const getCachedProfile = () => {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL.profile) {
      return data;
    }
  }
  return null;
};

const setCachedProfile = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
};

// Centralized error handling
const handleError = (error) => {
  const message = error.response?.data?.message || 'An unexpected error occurred';
  throw new Error(message);
};

// API functions with caching and retries
// Authentication APIs
export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const changePassword = async (data) => {
  try {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Admin APIs
export const createUser = async (data) => {
  try {
    const response = await api.post('/admin/users', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getUsers = async (page = 1, limit = 10) => {
  const cacheKey = getCacheKey('GET', '/admin/users', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/users', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateUser = async (userId, data) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createClass = async (data) => {
  try {
    const response = await api.post('/admin/classes', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getClasses = async (page = 1, limit = 10) => {
  const cacheKey = getCacheKey('GET', '/admin/classes', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/classes', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateClass = async (classId, data) => {
  try {
    const response = await api.put(`/admin/classes/${classId}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteClass = async (classId) => {
  try {
    const response = await api.delete(`/admin/classes/${classId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createSubject = async (data) => {
  try {
    const response = await api.post('/admin/subjects', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getSubjects = async (page = 1, limit = 10) => {
  const cacheKey = getCacheKey('GET', '/admin/subjects', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/subjects', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateSubject = async (subjectId, data) => {
  try {
    const response = await api.put(`/admin/subjects/${subjectId}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    const response = await api.delete(`/admin/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createFeedbackPeriod = async (data) => {
  try {
    const response = await api.post('/admin/feedback-periods', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getFeedbackPeriods = async (page = 1, limit = 10) => {
  const cacheKey = getCacheKey('GET', '/admin/feedback-periods', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/feedback-periods', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateFeedbackPeriod = async (periodId, data) => {
  try {
    const response = await api.put(`/admin/feedback-periods/${periodId}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteFeedbackPeriod = async (periodId) => {
  try {
    const response = await api.delete(`/admin/feedback-periods/${periodId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createTeachingAssignment = async (data) => {
  try {
    const response = await api.post('/admin/teaching-assignments', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getTeachingAssignments = async (page = 1, limit = 10) => {
  const cacheKey = getCacheKey('GET', '/admin/teaching-assignments', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/teaching-assignments', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateTeachingAssignment = async (assignmentId, data) => {
  try {
    const response = await api.put(`/admin/teaching-assignments/${assignmentId}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteTeachingAssignment = async (assignmentId) => {
  try {
    const response = await api.delete(`/admin/teaching-assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAdminFacultyRatings = async (facultyId) => {
  const cacheKey = getCacheKey('GET', `/admin/faculty-ratings/${facultyId}`);
  const cached = getCachedResponse(cacheKey, CACHE_TTL.ratings);
  if (cached) return cached;

  try {
    const response = await api.get(`/admin/faculty-ratings/${facultyId}`);
    setCachedResponse(cacheKey, response.data, CACHE_TTL.ratings);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Student APIs
export const getAssignments = async () => {
  const cacheKey = getCacheKey('GET', '/student/assignments');
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/student/assignments');
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const submitFeedback = async (data) => {
  try {
    const response = await api.post('/student/feedback', data);
    // Invalidate related caches
    cache.delete(getCacheKey('GET', '/student/assignments'));
    cache.delete(getCacheKey('GET', '/student/submission-status'));
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getSubmissionStatus = async () => {
  const cacheKey = getCacheKey('GET', '/student/submission-status');
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/student/submission-status');
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getStudentFacultyRatings = async (facultyId) => {
  const cacheKey = getCacheKey('GET', `/student/faculty-ratings/${facultyId}`);
  const cached = getCachedResponse(cacheKey, CACHE_TTL.ratings);
  if (cached) return cached;

  try {
    const response = await api.get(`/student/faculty-ratings/${facultyId}`);
    setCachedResponse(cacheKey, response.data, CACHE_TTL.ratings);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Faculty APIs
export const getFacultyRatings = async () => {
  const cacheKey = getCacheKey('GET', '/faculty/ratings');
  const cached = getCachedResponse(cacheKey, CACHE_TTL.ratings);
  if (cached) return cached;

  try {
    const response = await api.get('/faculty/ratings');
    setCachedResponse(cacheKey, response.data, CACHE_TTL.ratings);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const searchFaculty = async (name) => {
  const cacheKey = getCacheKey('GET', '/faculty/search', { name });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.search);
  if (cached) return cached;

  try {
    const response = await api.get('/faculty/search', { params: { name } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.search);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Profile API
export const getUserProfile = async () => {
  const cacheKey = getCacheKey('GET', '/auth/profile');
  let cached = getCachedResponse(cacheKey, CACHE_TTL.profile);
  if (!cached) {
    cached = getCachedProfile();
  }
  if (cached) return cached;

  try {
    const response = await api.get('/auth/profile');
    setCachedResponse(cacheKey, response.data, CACHE_TTL.profile);
    setCachedProfile(response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};