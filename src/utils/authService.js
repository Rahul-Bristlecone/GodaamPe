/**
 * Auth Service - Manages JWT token storage and retrieval
 */

import { getUserServiceUrl } from './apiConfig';

const AUTH_TOKEN_KEY = 'authToken';
const USERNAME_KEY = 'username';
const CURRENT_PAGE_KEY = 'currentPage';

/**
 * Store JWT token in localStorage
 */
export const setAuthToken = (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Get JWT token from localStorage
 */
export const getAuthToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Store username in localStorage
 */
export const setUsername = (username) => {
    localStorage.setItem(USERNAME_KEY, username);
};

/**
 * Get username from localStorage
 */
export const getUsername = () => {
    return localStorage.getItem(USERNAME_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getAuthToken();
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuth = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
};

/**
 * Logout user by calling backend endpoint and clearing auth data
 */
export const logout = async () => {
    const API_URL = getUserServiceUrl();
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            clearAuth();
            return { success: true, message: 'Logged out successfully' };
        } else {
            const data = await response.json();
            console.error('Logout failed:', data);
            // Still clear auth data even if backend call fails
            clearAuth();
            return { success: false, message: data.message || 'Logout failed' };
        }
    } catch (err) {
        console.error('Logout error:', err);
        // Still clear auth data even if backend call fails
        clearAuth();
        return { success: false, message: err.message };
    }
};

/**
 * Get Authorization header for API requests
 */
export const getAuthHeader = () => {
    const token = getAuthToken();
    if (token) {
        return {
            'Authorization': `Bearer ${token}`
        };
    }
    return {};
};

/**
 * Make authenticated API request
 */
export const authenticatedFetch = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers
    });
};

/**
 * Clears auth and redirects to login when backend indicates token expiry/invalid auth.
 */
export const handleAuthExpiry = (response, errorData) => {
    const status = response?.status;
    const message = String(
        errorData?.message || errorData?.msg || errorData?.detail || ''
    ).toLowerCase();

    const isAuthStatus = status === 401 || status === 403;
    const isJwtStyle422 = status === 422 && (
        message.includes('token') ||
        message.includes('jwt') ||
        message.includes('not enough segments') ||
        message.includes('signature has expired') ||
        message.includes('missing authorization header')
    );

    if (isAuthStatus || isJwtStyle422) {
        clearAuth();
        localStorage.removeItem(CURRENT_PAGE_KEY);
        window.location.reload();
        return true;
    }

    return false;
};
