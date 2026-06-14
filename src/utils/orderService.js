/**
 * Order Service - Handles all order API calls
 */

import { getAuthToken } from './authService';
import { getOrderServiceUrl } from './apiConfig';

const API_URL = getOrderServiceUrl();

const getAuthHeader = () => {
    const token = getAuthToken();
    const headers = new Headers();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
};

const getJsonAuthHeader = () => {
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
            throw new Error(errorData?.message || errorData?.msg || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error uploading EDI file:', err);
        return { success: false, error: err.message };
    }
};

export const getAllOrders = async () => {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || errorData?.msg || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching orders:', err);
        return { success: false, error: err.message };
    }
};

export const getOrderById = async (orderId) => {
    try {
        const response = await fetch(`${API_URL}/order/${orderId}`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || errorData?.msg || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching order:', err);
        return { success: false, error: err.message };
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await fetch(`${API_URL}/create_order`, {
            method: 'POST',
            headers: getJsonAuthHeader(),
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || errorData?.msg || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error creating order:', err);
        return { success: false, error: err.message };
    }
};