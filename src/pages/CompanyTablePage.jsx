import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { getAllCompanies, createCompany, updateCompany, deleteCompany, normalizeCompany } from '../utils/companyService';
import '../styles/SubPage.css';

const initialCompanyForm = {
    companyNo: '',
    ediAddress: '',
    eanPrefix: '',
    gs03Address: '',
    companyName: '',
    externalReference: '',
    abn: '',
    taxRegistrationNumber: '',
    bankAccountName: '',
    bankAccountNumber: '',
    supplierPurchasingInfo: '',
    createStockAdjustment: false,
    stockAdjSendMethod: '',
    supplierCertificateNo: '',
    shopLevel: '',
    streetNo: '',
    streetName: '',
    suburb: '',
    state: '',
    postCode: '',
    countryCode: '',
    userSuppliedShipmentNo: false,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
};

const companyTabs = ['General', 'Contact Details'];

function CompanyTablePage({ username, onLogout, onBack }) {
    const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('General');
    const [companyEntries, setCompanyEntries] = useState([]);
    const [companyForm, setCompanyForm] = useState(initialCompanyForm);
    const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(null);
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [saveError, setSaveError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        setError('');
        const result = await getAllCompanies();
        if (result.success) {
            const data = Array.isArray(result.data) ? result.data : (result.data?.companies || []);
            setCompanyEntries(data.map(normalizeCompany));
        } else {
            setError(result.error || 'Failed to fetch companies');
            setCompanyEntries([]);
        }
        setLoading(false);
    };

    const handleAddCompany = () => {
        setSelectedCompanyIndex(null);
        setCompanyForm(initialCompanyForm);
        setShowAddCompanyDialog(true);
    };

    const handleRowClick = (entry, index) => {
        setSelectedCompanyIndex(index);
        setCompanyForm({ ...entry });
        setActiveTab('General');
        setShowAddCompanyDialog(true);
    };

    const closeAddCompanyDialog = () => {
        setShowAddCompanyDialog(false);
        setActiveTab('General');
        setCompanyForm(initialCompanyForm);
        setSelectedCompanyIndex(null);
        setFormErrors({});
        setSaveError(null);
        setError('');
    };

    const handleFieldChange = (field, value) => {
        setCompanyForm(prev => ({ ...prev, [field]: value }));
        setFormErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validateForm = () => {
        const errors = {};
        if (!companyForm.companyNo.trim()) errors.companyNo = 'Company No is required.';
        if (!companyForm.companyName.trim()) errors.companyName = 'Company Name is required.';
        if (!companyForm.ediAddress.trim()) errors.ediAddress = 'EDI Address is required.';
        if (!companyForm.abn.trim()) {
            errors.abn = 'ABN is required.';
        } else if (!/^\d+$/.test(companyForm.abn)) {
            errors.abn = 'ABN must be numeric.';
        } else if (companyForm.abn.length < 11 || companyForm.abn.length > 14) {
            errors.abn = 'ABN must be between 11 and 14 digits.';
        }
        return errors;
    };

    const handleUpdateCompany = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setActiveTab('General');
            return;
        }
        setSaveError(null);
        setSuccess('');
        const isUpdate = selectedCompanyIndex !== null;
        const payload = {
            ...(!isUpdate && { company_no: companyForm.companyNo }),
            edi_address: companyForm.ediAddress,
            ean_prefix: companyForm.eanPrefix,
            gs03_address: companyForm.gs03Address,
            name: companyForm.companyName,
            explicit_ext_ref: companyForm.externalReference,
            abn: companyForm.abn,
            tax_registration_number: companyForm.taxRegistrationNumber,
            bank_account_name: companyForm.bankAccountName,
            bank_account_number: companyForm.bankAccountNumber,
            supplier_purchasing_info: companyForm.supplierPurchasingInfo,
            create_stock_adj: companyForm.createStockAdjustment ? 1 : 0,
            stock_adj_send_method_key: companyForm.stockAdjSendMethod,
            supplier_certificate_no: companyForm.supplierCertificateNo,
            address1: companyForm.shopLevel,
            street_no: companyForm.streetNo,
            street_name: companyForm.streetName,
            suburb: companyForm.suburb,
            state: companyForm.state,
            postcode: companyForm.postCode,
            country_code: companyForm.countryCode,
            user_supplied_shipment_no: companyForm.userSuppliedShipmentNo ? 1 : 0,
            contact_name: companyForm.contactName,
            contact_phone_no: companyForm.contactPhone,
            contact_email_address: companyForm.contactEmail
        };
        const result = isUpdate
            ? await updateCompany(companyForm.id, payload)
            : await createCompany(payload);
        if (!result.success) {
            setSaveError(result.error || 'Failed to save company. Please try again.');
            return;
        }
        await fetchCompanies();
        closeAddCompanyDialog();
        setSuccess(isUpdate ? 'Company updated successfully!' : 'Company created successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleDeleteCompany = (index) => {
        setConfirmDeleteIndex(index);
    };

    const confirmDelete = async () => {
        const entry = companyEntries[confirmDeleteIndex];
        setConfirmDeleteIndex(null);
        setLoading(true);
        setError('');
        setSuccess('');
        const result = await deleteCompany(entry.id);
        if (result.success) {
            await fetchCompanies();
            setSuccess('Company deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to delete company.');
        }
        setLoading(false);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General':
                return (
                    <div className="customer-tab-panel">
                        <div className="customer-grid-two" style={{ fontSize: '11px' }}>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Company No</label>
                                <input type="text" value={companyForm.companyNo} onChange={e => handleFieldChange('companyNo', e.target.value)} readOnly={selectedCompanyIndex !== null} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px', ...(selectedCompanyIndex !== null ? { backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' } : {}), ...(formErrors.companyNo ? { borderColor: '#e53e3e' } : {}) }} />
                                {formErrors.companyNo && <span style={{ fontSize: '10px', color: '#e53e3e' }}>{formErrors.companyNo}</span>}
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>EDI Address</label>
                                <input type="text" value={companyForm.ediAddress} onChange={e => handleFieldChange('ediAddress', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px', ...(formErrors.ediAddress ? { borderColor: '#e53e3e' } : {}) }} />
                                {formErrors.ediAddress && <span style={{ fontSize: '10px', color: '#e53e3e' }}>{formErrors.ediAddress}</span>}
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>EAN Prefix</label>
                                <input type="text" value={companyForm.eanPrefix} onChange={e => handleFieldChange('eanPrefix', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>GS03 Address</label>
                                <input type="text" value={companyForm.gs03Address} onChange={e => handleFieldChange('gs03Address', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Company Name</label>
                                <input type="text" value={companyForm.companyName} onChange={e => handleFieldChange('companyName', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px', ...(formErrors.companyName ? { borderColor: '#e53e3e' } : {}) }} />
                                {formErrors.companyName && <span style={{ fontSize: '10px', color: '#e53e3e' }}>{formErrors.companyName}</span>}
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>External Reference</label>
                                <input type="text" value={companyForm.externalReference} onChange={e => handleFieldChange('externalReference', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>ABN</label>
                                <input type="text" value={companyForm.abn} onChange={e => handleFieldChange('abn', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px', ...(formErrors.abn ? { borderColor: '#e53e3e' } : {}) }} />
                                {formErrors.abn && <span style={{ fontSize: '10px', color: '#e53e3e' }}>{formErrors.abn}</span>}
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Tax Registration Number</label>
                                <input type="text" value={companyForm.taxRegistrationNumber} onChange={e => handleFieldChange('taxRegistrationNumber', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Bank Account Name</label>
                                <input type="text" value={companyForm.bankAccountName} onChange={e => handleFieldChange('bankAccountName', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Bank Account Number</label>
                                <input type="text" value={companyForm.bankAccountNumber} onChange={e => handleFieldChange('bankAccountNumber', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Supplier Certificate No</label>
                                <input type="text" value={companyForm.supplierCertificateNo} onChange={e => handleFieldChange('supplierCertificateNo', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Supplier Purchasing Info</label>
                                <select value={companyForm.supplierPurchasingInfo} onChange={e => handleFieldChange('supplierPurchasingInfo', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '190px' }}>
                                    <option value=""></option>
                                </select>
                            </div>
                            <div className="customer-field">
                                <label style={{ fontSize: '11px' }}>Stock Adj Send Method</label>
                                <select value={companyForm.stockAdjSendMethod} onChange={e => handleFieldChange('stockAdjSendMethod', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '190px' }}>
                                    <option value=""></option>
                                </select>
                            </div>
                            <div className="customer-field">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <label className="customer-checkline" style={{ fontSize: '11px' }}>
                                        <input type="checkbox" checked={companyForm.createStockAdjustment} onChange={e => handleFieldChange('createStockAdjustment', e.target.checked)} />
                                        Create Stock Adjustment
                                    </label>
                                    <label className="customer-checkline" style={{ fontSize: '11px' }}>
                                        <input type="checkbox" checked={companyForm.userSuppliedShipmentNo} onChange={e => handleFieldChange('userSuppliedShipmentNo', e.target.checked)} />
                                        User Supplied Shipment No
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ border: '1px solid #cbd5e0', borderRadius: '6px', backgroundColor: '#f8fafc', padding: '8px 10px', marginTop: '18px' }}>
                        <div className="customer-block-title" style={{ fontSize: '15px', marginBottom: '4px' }}>Address</div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', alignItems: 'center', marginBottom: '2px' }}>
                            <label style={{ fontSize: '11px', minWidth: '100px' }}>Shop #/Level/Mall:</label>
                            <input type="text" value={companyForm.shopLevel} onChange={e => handleFieldChange('shopLevel', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', flex: 1, maxWidth: '410px', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: '#f8fafc', height: '18px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '11px', marginBottom: '2px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '160px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '11px', minWidth: '60px' }}>Street No:</label>
                                    <input type="text" value={companyForm.streetNo} onChange={e => handleFieldChange('streetNo', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '150px', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: '#f8fafc', height: '18px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '11px', minWidth: '60px' }}>Suburb:</label>
                                    <input type="text" value={companyForm.suburb} onChange={e => handleFieldChange('suburb', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '150px', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: '#f8fafc', height: '18px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '11px', minWidth: '60px' }}>Post Code:</label>
                                    <input type="text" value={companyForm.postCode} onChange={e => handleFieldChange('postCode', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '150px', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: '#f8fafc', height: '18px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '240px', marginLeft: '30px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '11px', minWidth: '80px' }}>Street Name:</label>
                                    <input type="text" value={companyForm.streetName} onChange={e => handleFieldChange('streetName', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '150px', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: '#f8fafc', height: '18px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '11px', minWidth: '80px' }}>State:</label>
                                    <input type="text" value={companyForm.state} onChange={e => handleFieldChange('state', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '150px', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: '#f8fafc', height: '18px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '11px', minWidth: '80px' }}>Country Code:</label>
                                    <input type="text" value={companyForm.countryCode} onChange={e => handleFieldChange('countryCode', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '150px', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: '#f8fafc', height: '18px' }} />
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                );
            case 'Contact Details':
                return (
                    <div className="customer-tab-panel" style={{ fontSize: '11px' }}>
                        <div className="customer-field">
                            <label style={{ fontSize: '11px' }}>Contact Name</label>
                            <input type="text" value={companyForm.contactName} onChange={e => handleFieldChange('contactName', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                        </div>
                        <div className="customer-field">
                            <label style={{ fontSize: '11px' }}>Contact Phone Number</label>
                            <input type="text" value={companyForm.contactPhone} onChange={e => handleFieldChange('contactPhone', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                        </div>
                        <div className="customer-field">
                            <label style={{ fontSize: '11px' }}>Contact Email Address</label>
                            <input type="text" value={companyForm.contactEmail} onChange={e => handleFieldChange('contactEmail', e.target.value)} style={{ fontSize: '11px', padding: '2px 4px', maxWidth: '180px' }} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="page-container">
            <Header username={username} onLogout={onLogout} onDashboard={onBack} />
            <div className="page-content">
                <div className="page-header">
                    <button onClick={onBack} className="back-button split-olive-button">
                        <span className="split-olive-button-text">Back to Dashboard</span>
                        <span className="split-olive-button-icon-wrap" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>
                    <h1>🏢 Company Table</h1>
                </div>
                <div className="content-area">
                    {success && <div className="alert alert-success">{success}</div>}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '14px' }}>Loading companies...</div>
                    ) : error ? (
                        <div style={{ padding: '16px', color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                            {error}
                        </div>
                    ) : companyEntries.length > 0 ? (
                        <>
                            <div className="customers-header">
                                <div className="customers-header-left">
                                    <span className="customer-count">
                                        Total Companies: <strong>{companyEntries.length}</strong>
                                    </span>
                                </div>
                                <div className="customers-header-right">
                                    <button className="add-customer-button split-olive-button" onClick={handleAddCompany}>
                                        <span className="split-olive-button-text">Add Company</span>
                                        <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className="customer-grid-wrap">
                                <table className="customer-grid-table">
                                    <thead>
                                        <tr>
                                            <th>Company No</th>
                                            <th>Company Name</th>
                                            <th>EDI Address</th>
                                            <th>ABN</th>
                                            <th>Bank Account Name</th>
                                            <th>Email Address</th>
                                            <th>Phone Number</th>
                                            <th style={{ textAlign: 'left', width: '90px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyEntries.map((entry, index) => (
                                            <tr key={`${entry.companyNo}-${index}`} onClick={() => handleRowClick(entry, index)} style={{ cursor: 'pointer' }}>
                                                <td>{entry.companyNo}</td>
                                                <td>{entry.companyName}</td>
                                                <td>{entry.ediAddress}</td>
                                                <td>{entry.abn}</td>
                                                <td>{entry.bankAccountName}</td>
                                                <td>
                                                    {entry.contactEmail ? (
                                                        <a
                                                            href={`mailto:${entry.contactEmail}`}
                                                            onClick={e => e.stopPropagation()}
                                                            style={{ color: '#2b6cb0', textDecoration: 'underline' }}
                                                        >
                                                            {entry.contactEmail}
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                <td>{entry.contactPhone || '-'}</td>
                                                <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right', width: '90px' }}>
                                                    <button className="delete-button split-olive-button" onClick={() => handleDeleteCompany(index)}>
                                                        <span className="split-olive-button-text">Delete</span>
                                                        <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="add-customer-section">
                            <h3>Add Company Manually</h3>
                            <button className="add-customer-button split-olive-button" onClick={handleAddCompany}>
                                <span className="split-olive-button-text">Add Company</span>
                                <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showAddCompanyDialog && (
                <div className="modal-overlay">
                    <div className="config-dialog customer-config-dialog">
                        <div className="config-dialog-header">
                            <div>
                                <h1>{selectedCompanyIndex !== null ? 'Modify Company' : 'Add Company'}</h1>
                                <div className="dialog-tabs">
                                    {companyTabs.map(tab => (
                                        <button
                                            key={tab}
                                            type="button"
                                            className={`dialog-tab ${activeTab === tab ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={closeAddCompanyDialog}
                                aria-label="Close add company dialog"
                            >
                                ×
                            </button>
                        </div>
                        <div className="config-dialog-body">
                            <div className="tab-content">
                                {renderTabContent()}
                            </div>
                        </div>
                        <div className="config-dialog-footer">
                            {saveError && (
                                <div style={{ color: '#e53e3e', fontSize: '11px', marginBottom: '6px', padding: '4px 8px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '4px' }}>
                                    {saveError}
                                </div>
                            )}
                            <div className="dialog-actions">
                                <button type="button" className="config-action-button help-action-button">
                                    <span className="config-action-button-text">Help</span>
                                    <span className="config-action-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </span>
                                </button>
                                <button type="button" className="config-action-button" onClick={closeAddCompanyDialog}>
                                    <span className="config-action-button-text">Cancel</span>
                                    <span className="config-action-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button type="button" className="config-action-button" onClick={handleUpdateCompany}>
                                    <span className="config-action-button-text">Update</span>
                                    <span className="config-action-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmDeleteIndex !== null && (
                <div className="modal-overlay">
                    <div className="confirm-delete-dialog">
                        <h3>Delete Company</h3>
                        <p>Are you sure you want to delete this company? This action cannot be undone.</p>
                        <div className="confirm-delete-actions">
                            <button type="button" className="split-olive-button confirm-cancel-button" onClick={() => setConfirmDeleteIndex(null)}>
                                <span className="split-olive-button-text">Cancel</span>
                                <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </button>
                            <button type="button" className="split-olive-button confirm-delete-button" onClick={confirmDelete}>
                                <span className="split-olive-button-text">Delete</span>
                                <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyTablePage;
