// src/services/api.js

import { createApiInstance, handleError } from '../utils/apiUtils';
import { getCacheKey, getCachedResponse, setCachedResponse, CACHE_TTL, getCachedProfile, setCachedProfile, cache } from '../utils/cache';

const api = createApiInstance();

// API functions with caching and retries
// Authentication APIs

export const login = async (data) => {
  console.log('Received login data:', data);
  if (!data) {
    throw { error: true, message: 'Login data is required' };
  }
  const userId = data.userId ?? '';
  const password = data.password ?? '';
  if (typeof userId !== 'string' || userId.trim() === '') {
    throw { error: true, message: 'User ID is required and must be a non-empty string' };
  }
  if (typeof password !== 'string' || password.trim() === '') {
    throw { error: true, message: 'Password is required and must be a non-empty string' };
  }
  try {
    const response = await api.post('/auth/login', { userId, password });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};


export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
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