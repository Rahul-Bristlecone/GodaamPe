/**
 * Store Service - Handles all store/location API calls
 */

import { getAuthToken } from './authService';

const API_URL = 'http://127.0.0.1:5002';

/**
 * Get Authorization header with JWT token
 */
const getAuthHeader = () => {
    const token = getAuthToken();
    if (token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
    return {
        'Content-Type': 'application/json'
    };
};

/**
 * Create a new store/location
 * @param {Object} storeData - Store data object matching StoreSchema
 * @returns {Promise<Object>} - Created store object
 */
export const createStore = async (storeData) => {
    try {
        const response = await fetch(`${API_URL}/create_store`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(storeData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error('Error creating store:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get all stores for the current user
 * @returns {Promise<Object>} - List of stores
 */
export const getAllStores = async () => {
    try {
        const response = await fetch(`${API_URL}/stores`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching stores:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get a specific store by ID
 * @param {string} storeId - Store ID
 * @returns {Promise<Object>} - Store object
 */
export const getStoreById = async (storeId) => {
    try {
        const response = await fetch(`${API_URL}/stores/${storeId}`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching store:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Update a store
 * @param {string} storeId - Store ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated store object
 */
export const updateStore = async (storeId, updateData) => {
    try {
        const response = await fetch(`${API_URL}/stores/${storeId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error('Error updating store:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Delete a store
 * @param {string} storeId - Store ID
 * @returns {Promise<Object>} - Success status
 */
export const deleteStore = async (storeId) => {
    try {
        const response = await fetch(`${API_URL}/stores/${storeId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }

        return { success: true, message: 'Store deleted successfully' };
    } catch (err) {
        console.error('Error deleting store:', err);
        return { success: false, error: err.message };
    }
};
