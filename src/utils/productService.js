/**
 * Product Service - Handles all product API calls
 */

import { getAuthToken } from './authService';
import { getProductServiceUrl } from './apiConfig';

const API_URL = getProductServiceUrl();

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

const getMultipartAuthHeader = () => {
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

export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_URL}/create_product`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error creating product:', err);
        return { success: false, error: err.message };
    }
};

export const getAllProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching products:', err);
        return { success: false, error: err.message };
    }
};

export const updateProduct = async (productId, updateData) => {
    try {
        const response = await fetch(`${API_URL}/product/${productId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error updating product:', err);
        return { success: false, error: err.message };
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await fetch(`${API_URL}/product/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        return { success: true, message: 'Product deleted successfully' };
    } catch (err) {
        console.error('Error deleting product:', err);
        return { success: false, error: err.message };
    }
};

export const uploadProductFile = async (file) => {
    const uploadPaths = ['/upload_product_data', '/upload_product', '/upload_products'];

    for (let index = 0; index < uploadPaths.length; index += 1) {
        const path = uploadPaths[index];
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}${path}`, {
                method: 'POST',
                headers: getMultipartAuthHeader(),
                body: formData
            });

            if (!response.ok) {
                if (response.status === 404 && index < uploadPaths.length - 1) {
                    continue;
                }

                const errorData = await parseJsonResponse(response);
                throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
            }

            const data = await parseJsonResponse(response);
            return { success: true, data };
        } catch (err) {
            if (index < uploadPaths.length - 1) {
                continue;
            }
            console.error('Error uploading product file:', err);
            return { success: false, error: err.message };
        }
    }

    return { success: false, error: 'Product upload endpoint not found' };
};
