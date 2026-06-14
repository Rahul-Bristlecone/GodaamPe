/**
 * Customer Service - Handles all customer API calls
 */

import { getAuthToken } from './authService';
import { getCustomerServiceUrl } from './apiConfig';

const API_URL = getCustomerServiceUrl();

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

export const normalizeCustomer = (customer, index = 0) => ({
    id: customer.customer_id || customer.id || `customer-${index}`,
    customerNumber: customer.customer_no || customer.customerNumber || '',
    customerName: customer.name || customer.customerName || '',
    ediAddress: customer.edi_address || customer.ediAddress || '',
    abn: customer.abn || '',
    shipmentDays: customer.shipment_days || customer.shipmentDays || '',
    contractPriceGroup: customer.contract_price_grp_key ?? customer.contractPriceGroup ?? '',
    shipmentLabelling: customer.shipment_labelling ?? customer.shipmentLabelling ?? '',
    externalReference: customer.explicit_ext_ref || customer.externalReference || '',
    orderNoRecycleDays: String(customer.order_no_recycle_days ?? customer.orderNoRecycleDays ?? '270'),
    cancelOrderDays: String(customer.cancel_order_days ?? customer.cancelOrderDays ?? ''),
    gs02Address: customer.gs02_address || customer.gs02Address || '',
    gs03Address: customer.gs03_address || customer.gs03Address || '',
    rpoGs03Address: customer.rpo_gs03_address || customer.rpoGs03Address || '',
    sendMethod: customer.send_method_key || customer.sendMethod || 'SendPath',
    messageReleaseNumber: customer.message_release_number || customer.messageReleaseNumber || '',
    x12LineTerminator: customer.x12_line_terminator || customer.x12LineTerminator || ''
});

export const getAllCustomers = async () => {
    try {
        const response = await fetch(`${API_URL}/customers`, {
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
        console.error('Error fetching customers:', err);
        return { success: false, error: err.message };
    }
};

export const createCustomer = async (customerData) => {
    try {
        const response = await fetch(`${API_URL}/create_customer`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || errorData?.msg || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error creating customer:', err);
        return { success: false, error: err.message };
    }
};

export const updateCustomer = async (customerId, customerData) => {
    try {
        const response = await fetch(`${API_URL}/customer/${customerId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || errorData?.msg || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error updating customer:', err);
        return { success: false, error: err.message };
    }
};

export const deleteCustomer = async (customerId) => {
    try {
        const response = await fetch(`${API_URL}/customer/${customerId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || errorData?.msg || `Error: ${response.status} ${response.statusText}`);
        }

        return { success: true, message: 'Customer deleted successfully' };
    } catch (err) {
        console.error('Error deleting customer:', err);
        return { success: false, error: err.message };
    }
};