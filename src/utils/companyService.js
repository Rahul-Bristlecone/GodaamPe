/**
 * Company Service - Handles all company API calls
 */

import { getAuthToken } from './authService';
import { getCompanyServiceUrl } from './apiConfig';

const API_URL = getCompanyServiceUrl();

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

export const normalizeCompany = (company) => ({
    id: company.company_id || company.id,
    companyNo: company.company_no || company.companyNo || '',
    ediAddress: company.edi_address || company.ediAddress || '',
    eanPrefix: company.ean_prefix || company.eanPrefix || '',
    gs03Address: company.gs03_address || company.gs03Address || '',
    companyName: company.name || company.companyName || '',
    externalReference: company.explicit_ext_ref || company.externalReference || '',
    abn: company.abn || '',
    taxRegistrationNumber: company.tax_registration_number || company.taxRegistrationNumber || '',
    bankAccountName: company.bank_account_name || company.bankAccountName || '',
    bankAccountNumber: company.bank_account_number || company.bankAccountNumber || '',
    supplierPurchasingInfo: company.supplier_purchasing_info || company.supplierPurchasingInfo || '',
    createStockAdjustment: company.create_stock_adj || company.createStockAdjustment || false,
    stockAdjSendMethod: company.stock_adj_send_method_key || company.stockAdjSendMethod || '',
    supplierCertificateNo: company.supplier_certificate_no || company.supplierCertificateNo || '',
    shopLevel: company.address1 || company.shopLevel || '',
    streetNo: company.street_no || company.streetNo || '',
    streetName: company.street_name || company.streetName || '',
    suburb: company.suburb || '',
    state: company.state || '',
    postCode: company.postcode || company.postCode || '',
    countryCode: company.country_code || company.countryCode || '',
    userSuppliedShipmentNo: company.user_supplied_shipment_no || company.userSuppliedShipmentNo || false,
    contactName: company.contact_name || company.contactName || '',
    contactPhone: company.contact_phone_no || company.contactPhone || '',
    contactEmail: company.contact_email_address || company.contactEmail || ''
});

export const getAllCompanies = async () => {
    try {
        const response = await fetch(`${API_URL}/companies`, {
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
        console.error('Error fetching companies:', err);
        return { success: false, error: err.message };
    }
};

export const createCompany = async (companyData) => {
    try {
        const response = await fetch(`${API_URL}/create_company`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(companyData)
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error creating company:', err);
        return { success: false, error: err.message };
    }
};

export const updateCompany = async (companyId, companyData) => {
    try {
        const response = await fetch(`${API_URL}/company/${companyId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(companyData)
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await parseJsonResponse(response);
        return { success: true, data };
    } catch (err) {
        console.error('Error updating company:', err);
        return { success: false, error: err.message };
    }
};

export const deleteCompany = async (companyId) => {
    try {
        const response = await fetch(`${API_URL}/company/${companyId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new Error(errorData?.message || `Error: ${response.status} ${response.statusText}`);
        }

        return { success: true, message: 'Company deleted successfully' };
    } catch (err) {
        console.error('Error deleting company:', err);
        return { success: false, error: err.message };
    }
};
