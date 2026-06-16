/**
 * Upload Service - Handles file upload and order import API calls
 */

import { getAuthToken, handleAuthExpiry } from './authService';
import { getStoreServiceUrl } from './apiConfig';

const API_URL = getStoreServiceUrl();

/**
 * Get Authorization header with JWT token
 */
const getAuthHeader = () => {
    const token = getAuthToken();
    const headers = new Headers();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
};

const parseJsonResponse = async (response) => {
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch (err) {
        console.warn('Unable to parse JSON response:', err, text);
        return null;
    }
};

/**
 * Upload EDI file for order import
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} - Response with imported order details
 */
export const uploadEDIFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload_edi`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: formData
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            handleAuthExpiry(response, errorData);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error uploading file:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get all orders
 * @returns {Promise<Object>} - List of all orders
 */
export const getAllOrders = async () => {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            handleAuthExpiry(response, errorData);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching orders:', err);
        return { success: false, error: err.message };
    }
};
