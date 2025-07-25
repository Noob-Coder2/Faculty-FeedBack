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

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

export const register = async (data) => {
  const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: sanitizeInput(value)
  }), {});
  if (!sanitizedData.userId || !sanitizedData.name || !sanitizedData.email || !sanitizedData.password || !sanitizedData.role) {
    throw { error: true, message: 'All required fields (userId, name, email, password, role) must be provided' };
  }
  if (!['student', 'faculty'].includes(sanitizedData.role)) {
    throw { error: true, message: 'Role must be either student or faculty' };
  }
  try {
    const response = await api.post('/auth/register', sanitizedData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const changePassword = async (data) => {
  if (!data.currentPassword || !data.newPassword) {
    throw { error: true, message: 'Current and new passwords are required' };
  }
  if (typeof data.newPassword !== 'string' || data.newPassword.length < 6) {
    throw { error: true, message: 'New password must be at least 6 characters long' };
  }
  try {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Admin APIs
export const createUser = async (data) => {
  if (!data.userId || !data.name || !data.email || !data.password || !data.role) {
    throw { error: true, message: 'All required fields (userId, name, email, password, role) must be provided' };
  }
  try {
    const response = await api.post('/admin/users', data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getUsers = async (page = 1, limit = 10) => {
  if (page < 1 || limit < 1 || limit > 100) {
    throw { error: true, message: 'Invalid pagination parameters' };
  }
  const cacheKey = getCacheKey('GET', '/admin/users', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/users', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateUser = async (userId, data) => {
  if (!userId) {
    throw { error: true, message: 'User ID is required' };
  }
  try {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteUser = async (userId) => {
  if (!userId) {
    throw { error: true, message: 'User ID is required' };
  }
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createClass = async (data) => {
  if (!data.name || !data.branch || !data.semester || !data.year || !data.section || !data.academicYear) {
    throw { error: true, message: 'All required fields (name, branch, semester, year, section, academicYear) must be provided' };
  }
  try {
    const response = await api.post('/admin/classes', data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getClasses = async (page = 1, limit = 10) => {
  if (page < 1 || limit < 1 || limit > 100) {
    throw { error: true, message: 'Invalid pagination parameters' };
  }
  const cacheKey = getCacheKey('GET', '/admin/classes', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/classes', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateClass = async (classId, data) => {
  if (!classId) {
    throw { error: true, message: 'Class ID is required' };
  }
  try {
    const response = await api.put(`/admin/classes/${classId}`, data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteClass = async (classId) => {
  if (!classId) {
    throw { error: true, message: 'Class ID is required' };
  }
  try {
    const response = await api.delete(`/admin/classes/${classId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createSubject = async (data) => {
  if (!data.subjectCode || !data.subjectName || !data.branch || !data.semester) {
    throw { error: true, message: 'All required fields (subjectCode, subjectName, branch, semester) must be provided' };
  }
  try {
    const response = await api.post('/admin/subjects', data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getSubjects = async (page = 1, limit = 10) => {
  if (page < 1 || limit < 1 || limit > 100) {
    throw { error: true, message: 'Invalid pagination parameters' };
  }
  const cacheKey = getCacheKey('GET', '/admin/subjects', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/subjects', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateSubject = async (subjectId, data) => {
  if (!subjectId) {
    throw { error: true, message: 'Subject ID is required' };
  }
  try {
    const response = await api.put(`/admin/subjects/${subjectId}`, data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteSubject = async (subjectId) => {
  if (!subjectId) {
    throw { error: true, message: 'Subject ID is required' };
  }
  try {
    const response = await api.delete(`/admin/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createFeedbackPeriod = async (data) => {
  if (!data.name || !data.semester || !data.year || !data.startDate || !data.endDate) {
    throw { error: true, message: 'All required fields (name, semester, year, startDate, endDate) must be provided' };
  }
  try {
    const response = await api.post('/admin/feedback-periods', data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFeedbackPeriods = async (page = 1, limit = 10) => {
  if (page < 1 || limit < 1 || limit > 100) {
    throw { error: true, message: 'Invalid pagination parameters' };
  }
  const cacheKey = getCacheKey('GET', '/admin/feedback-periods', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/feedback-periods', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateFeedbackPeriod = async (periodId, data) => {
  if (!periodId) {
    throw { error: true, message: 'Feedback period ID is required' };
  }
  try {
    const response = await api.put(`/admin/feedback-periods/${periodId}`, data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteFeedbackPeriod = async (periodId) => {
  if (!periodId) {
    throw { error: true, message: 'Feedback period ID is required' };
  }
  try {
    const response = await api.delete(`/admin/feedback-periods/${periodId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createTeachingAssignment = async (data) => {
  if (!data.faculty || !data.subject || !data.classId || !data.feedbackPeriod) {
    throw { error: true, message: 'All required fields (faculty, subject, classId, feedbackPeriod) must be provided' };
  }
  try {
    const response = await api.post('/admin/teaching-assignments', data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getTeachingAssignments = async (page = 1, limit = 10) => {
  if (page < 1 || limit < 1 || limit > 100) {
    throw { error: true, message: 'Invalid pagination parameters' };
  }
  const cacheKey = getCacheKey('GET', '/admin/teaching-assignments', { page, limit });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.assignments);
  if (cached) return cached;

  try {
    const response = await api.get('/admin/teaching-assignments', { params: { page, limit } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.assignments);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateTeachingAssignment = async (assignmentId, data) => {
  if (!assignmentId) {
    throw { error: true, message: 'Teaching assignment ID is required' };
  }
  try {
    const response = await api.put(`/admin/teaching-assignments/${assignmentId}`, data);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteTeachingAssignment = async (assignmentId) => {
  if (!assignmentId) {
    throw { error: true, message: 'Teaching assignment ID is required' };
  }
  try {
    const response = await api.delete(`/admin/teaching-assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getAdminFacultyRatings = async (facultyId) => {
  if (!facultyId) {
    throw { error: true, message: 'Faculty ID is required' };
  }
  const cacheKey = getCacheKey('GET', `/admin/faculty-ratings/${facultyId}`);
  const cached = getCachedResponse(cacheKey, CACHE_TTL.ratings);
  if (cached) return cached;

  try {
    const response = await api.get(`/admin/faculty-ratings/${facultyId}`);
    setCachedResponse(cacheKey, response.data, CACHE_TTL.ratings);
    return response.data;
  } catch (error) {
    throw handleError(error);
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
    throw handleError(error);
  }
};

export const submitFeedback = async (data) => {
  if (!data.teachingAssignment || !Array.isArray(data.ratings) || data.ratings.length !== 5) {
    throw { error: true, message: 'Teaching assignment and exactly 5 ratings are required' };
  }
  for (const rating of data.ratings) {
    if (!rating.ratingParameter || !Number.isInteger(rating.value) || rating.value < 1 || rating.value > 5) {
      throw { error: true, message: 'Each rating must have a valid ratingParameter and value (1-5)' };
    }
  }
  try {
    const response = await api.post('/student/feedback', data);
    // Invalidate related caches
    cache.delete(getCacheKey('GET', '/student/assignments'));
    cache.delete(getCacheKey('GET', '/student/submission-status'));
    return response.data;
  } catch (error) {
    throw handleError(error);
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
    throw handleError(error);
  }
};

export const getStudentFacultyRatings = async (facultyId) => {
  if (!facultyId) {
    throw { error: true, message: 'Faculty ID is required' };
  }
  const cacheKey = getCacheKey('GET', `/student/faculty-ratings/${facultyId}`);
  const cached = getCachedResponse(cacheKey, CACHE_TTL.ratings);
  if (cached) return cached;

  try {
    const response = await api.get(`/student/faculty-ratings/${facultyId}`);
    setCachedResponse(cacheKey, response.data, CACHE_TTL.ratings);
    return response.data;
  } catch (error) {
    throw handleError(error);
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
    throw handleError(error);
  }
};

export const searchFaculty = async (name) => {
  if (typeof name !== 'string' || name.trim().length < 2) {
    throw { error: true, message: 'Name must be a string with at least 2 characters' };
  }
  const cacheKey = getCacheKey('GET', '/faculty/search', { name });
  const cached = getCachedResponse(cacheKey, CACHE_TTL.search);
  if (cached) return cached;

  try {
    const response = await api.get('/faculty/search', { params: { name } });
    setCachedResponse(cacheKey, response.data, CACHE_TTL.search);
    return response.data;
  } catch (error) {
    throw handleError(error);
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
    throw handleError(error);
  }
};