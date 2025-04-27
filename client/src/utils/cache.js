// src/utils/cache.js

// In-memory cache for API responses
export const cache = new Map();

export const CACHE_TTL = {
    profile: 60 * 60 * 1000, // 1 hour for user profile
    ratings: 5 * 60 * 1000, // 5 minutes for faculty ratings
    search: 10 * 60 * 1000, // 10 minutes for faculty search
    assignments: 2 * 60 * 1000, // 2 minutes for student assignments
};

// Persistent cache for user profile
const LOCAL_STORAGE_KEY = 'faculty_feedback_cache';

// Cache handling
export const getCacheKey = (method, url, params) => {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
};

export const getCachedResponse = (key, ttl) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    return null;
};

export const setCachedResponse = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

// Local storage for user profile
export const getCachedProfile = () => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL.profile) {
            return data;
        }
    }
    return null;
};

export const setCachedProfile = (data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
};