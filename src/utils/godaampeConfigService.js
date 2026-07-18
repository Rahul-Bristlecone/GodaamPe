/**
 * GodaamPe Configuration Service - Handles global configuration API calls
 */

import { getAuthToken, handleAuthExpiry } from './authService';
import { getGodaamPeConfigServiceUrl } from './apiConfig';

const API_URL = getGodaamPeConfigServiceUrl();

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

const buildApiErrorMessage = (response, errorData) => {
    if (!errorData) {
        return `Error: ${response.status} ${response.statusText}`;
    }

    if (typeof errorData.message === 'string' && errorData.message.trim()) {
        return errorData.message;
    }

    if (typeof errorData.detail === 'string' && errorData.detail.trim()) {
        return errorData.detail;
    }

    if (errorData.errors && typeof errorData.errors === 'object') {
        const validationSummary = Object.entries(errorData.errors)
            .flatMap(([field, messages]) => {
                const list = Array.isArray(messages) ? messages : [messages];
                return list
                    .filter((msg) => typeof msg === 'string' && msg.trim())
                    .map((msg) => `${field}: ${msg}`);
            })
            .join(' | ');

        if (validationSummary) {
            return validationSummary;
        }
    }

    return `Error: ${response.status} ${response.statusText}`;
};

const normalizeNetworkErrorMessage = (err) => {
    const message = String(err?.message || '').trim();
    if (!message) {
        return 'Error: 502 Bad Gateway';
    }

    const normalized = message.toLowerCase();
    const isNetworkFailure =
        normalized === 'failed to fetch'
        || normalized.includes('networkerror')
        || normalized.includes('network request failed')
        || normalized.includes('fetch failed')
        || normalized.includes('load failed');

    return isNetworkFailure ? 'Error: 502 Bad Gateway' : message;
};

export const getGodaamPeConfiguration = async () => {
    try {
        const endpoint = `${API_URL}/glbconfig`;
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            handleAuthExpiry(response, errorData);
            throw new Error(buildApiErrorMessage(response, errorData));
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching GodaamPe configuration:', err);
        return { success: false, error: normalizeNetworkErrorMessage(err) };
    }
};

export const saveGodaamPeConfiguration = async (payload) => {
    try {
        const endpoint = `${API_URL}/glbconfig`;
        const requestOptions = {
            method: 'POST',
            headers: getAuthHeader()
        };

        let response = await fetch(endpoint, {
            ...requestOptions,
            body: JSON.stringify(payload)
        });

        // Some GodaamPe backends expect flattened values instead of { tab, values }.
        if (response.status === 422 && payload?.values && typeof payload.values === 'object') {
            response = await fetch(endpoint, {
                ...requestOptions,
                body: JSON.stringify(payload.values)
            });
        }

        // Other variants still require tab but flattened in same object.
        if (response.status === 422 && payload?.values && typeof payload.values === 'object') {
            response = await fetch(endpoint, {
                ...requestOptions,
                body: JSON.stringify({
                    tab: payload.tab,
                    ...payload.values
                })
            });
        }

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            handleAuthExpiry(response, errorData);
            throw new Error(buildApiErrorMessage(response, errorData));
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error saving GodaamPe configuration:', err);
        return { success: false, error: normalizeNetworkErrorMessage(err) };
    }
};
