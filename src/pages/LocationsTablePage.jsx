import { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/LocationsTablePage.css';
import { createStore, getAllStores, updateStore, deleteStore } from '../utils/storeService';
import { getAllCustomers } from '../utils/customerService';

// this page will consume all "store" backend apis
function LocationsTablePage({ username, onLogout, onBack }) {
    const priceGroupPlaceholderOptions = ['Group 1', 'Group 2', 'Group 3'];

    const [showAddForm, setShowAddForm] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [originalFormData, setOriginalFormData] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [customerOptions, setCustomerOptions] = useState([]);

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleLocationFile(file);
    };
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleLocationFile(file);
    };
    const handleLocationFile = (file) => {
        // TODO: implement location file upload
        setError('File upload for locations is not yet supported.');
    };
    const [formData, setFormData] = useState({
        userStoreNumber: '',
        storeName: '',
        customerId: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        pinCode: '',
        stateCode: '',
        countryCode: '',
        shippingTime: '',
        contractPriceGroup: '',
        promoPriceGroup: '',
        retailPriceGroup: ''
    });

    // Fetch locations on component mount
    useEffect(() => {
        fetchLocations();
        fetchCustomersForDropdown();
    }, []);

    const fetchCustomersForDropdown = async () => {
        const result = await getAllCustomers();
        if (!result.success) {
            setCustomerOptions([]);
            return;
        }

        const customers = Array.isArray(result.data) ? result.data : (result.data?.customers || []);
        const options = customers
            .map((customer, index) => {
                const id = customer.customer_id || customer.id;
                const name = customer.name || customer.customerName || customer.customer_name;
                const customerNo = customer.customer_no || customer.customerNumber;
                const displayName = name || customerNo || `Customer ${index + 1}`;

                if (!id) {
                    return null;
                }

                return {
                    id: String(id),
                    label: customerNo ? `${displayName} (${customerNo})` : displayName
                };
            })
            .filter(Boolean);

        setCustomerOptions(options);
    };

    const fetchLocations = async () => {
        setLoading(true);
        setError('');
        const result = await getAllStores();
        
        if (result.success) {
            // Ensure data is an array
            const storesData = Array.isArray(result.data) ? result.data : (result.data?.stores || []);
            setLocations(storesData);
        } else {
            setError(result.error || 'Failed to fetch locations');
            setLocations([]);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getAddressPreviewLines = (location) => {
        return [location.address_line1, location.address_line2, location.address_line3]
            .filter(Boolean)
            .slice(0, 2);
    };

    const handleSave = async () => {
        // Validate required fields
        if (!formData.userStoreNumber || !formData.storeName || !formData.customerId || !formData.addressLine1 || !formData.pinCode || !formData.stateCode || !formData.countryCode || !formData.shippingTime) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        // Prepare payload - adjust field names to match backend schema
        // Convert numeric fields to proper types
        const payload = {
            store_number: parseInt(formData.userStoreNumber, 10),
            store_name: formData.storeName,
            customer_id: parseInt(formData.customerId, 10),
            address_line1: formData.addressLine1,
            ...(formData.addressLine2 ? { address_line2: formData.addressLine2 } : {}),
            ...(formData.addressLine3 ? { address_line3: formData.addressLine3 } : {}),
            pin_code: formData.pinCode,
            state_code: formData.stateCode,
            country_code: formData.countryCode,
            shipping_time: parseInt(formData.shippingTime, 10)
        };

        const result = await createStore(payload);
        
        if (result.success) {
            setSuccess('Location added successfully!');
            
            // Reset form and close
            setFormData({
                userStoreNumber: '',
                storeName: '',
                customerId: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                pinCode: '',
                stateCode: '',
                countryCode: '',
                shippingTime: '',
                contractPriceGroup: '',
                promoPriceGroup: '',
                retailPriceGroup: ''
            });
            setShowAddForm(false);
            
            // Refresh locations list
            await fetchLocations();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to add location');
        }

        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({
            userStoreNumber: '',
            storeName: '',
            customerId: '',
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            pinCode: '',
            stateCode: '',
            countryCode: '',
            shippingTime: '',
            contractPriceGroup: '',
            promoPriceGroup: '',
            retailPriceGroup: ''
        });
        setError('');
        setShowAddForm(false);
    };

    const handleRowClick = (location) => {
        const data = {
            userStoreNumber: location.store_number || location.user_store_number || '',
            storeName: location.store_name || '',
            customerId: location.customer_id ? String(location.customer_id) : '',
            addressLine1: location.address_line1 || '',
            addressLine2: location.address_line2 || '',
            addressLine3: location.address_line3 || '',
            pinCode: location.pin_code || '',
            stateCode: location.state_code || '',
            countryCode: location.country_code || '',
            shippingTime: location.shipping_time || '',
            contractPriceGroup: '',
            promoPriceGroup: '',
            retailPriceGroup: ''
        };
        setSelectedLocation(location);
        setFormData(data);
        setOriginalFormData(data);
        setShowDetailModal(true);
    };

    const hasDetailChanges = originalFormData
        ? Object.keys(originalFormData).some(k => String(formData[k]) !== String(originalFormData[k]))
        : false;

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedLocation(null);
        setOriginalFormData(null);
        setFormData({
            userStoreNumber: '',
            storeName: '',
            customerId: '',
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            pinCode: '',
            stateCode: '',
            countryCode: '',
            shippingTime: '',
            contractPriceGroup: '',
            promoPriceGroup: '',
            retailPriceGroup: ''
        });
        setError('');
    };

    const handleSaveEdit = async () => {
        // Validate required fields
        if (!formData.userStoreNumber || !formData.storeName || !formData.customerId || !formData.addressLine1 || !formData.pinCode || !formData.stateCode || !formData.countryCode || !formData.shippingTime) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        // Prepare payload
        const payload = {
            store_number: parseInt(formData.userStoreNumber, 10),
            store_name: formData.storeName,
            customer_id: parseInt(formData.customerId, 10),
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2 || null,
            address_line3: formData.addressLine3 || null,
            pin_code: formData.pinCode,
            state_code: formData.stateCode,
            country_code: formData.countryCode,
            shipping_time: parseInt(formData.shippingTime, 10)
        };

        const result = await updateStore(selectedLocation.store_id || selectedLocation.id, payload);
        
        if (result.success) {
            setSuccess('Location updated successfully!');
            await fetchLocations();
            setTimeout(() => {
                closeDetailModal();
                setSuccess('');
            }, 2000);
        } else {
            setError(result.error || 'Failed to update location');
        }

        setLoading(false);
    };

    const handleDeleteLocation = async (id) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = async () => {
        const id = confirmDeleteId;
        setConfirmDeleteId(null);
        setLoading(true);
        setError('');
        const result = await deleteStore(id);
        if (result.success) {
            setSuccess('Location deleted successfully!');
            await fetchLocations();
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to delete location');
        }
        setLoading(false);
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
                    <h1>📍 Locations Table</h1>
                </div>
                <div className="content-area">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {locations.length > 0 && (
                        <div className="locations-header">
                            <div className="locations-header-left">
                                <span className="location-count">
                                    Total Stores: <strong>{locations.length}</strong>
                                </span>
                            </div>
                            <div className="locations-header-right">
                                <div className="locations-header-actions">
                                <button 
                                    className="add-location-button split-olive-button"
                                    onClick={() => setShowAddForm(true)}
                                    disabled={loading}
                                >
                                    <span className="split-olive-button-text">Add Location</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button
                                    className="refresh-button split-olive-button"
                                    onClick={fetchLocations}
                                    disabled={loading}
                                >
                                    <span className="split-olive-button-text">Refresh</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading && !showAddForm ? (
                        <div className="loading-spinner">
                            <p>Loading locations...</p>
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="upload-section compact-upload">
                            <h2>Import Location data or Add New Location</h2>
                            <div
                                className={`drag-drop-zone compact-drag-drop ${dragOver ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input-location').click()}
                            >
                                <div className="drag-drop-icon">📁</div>
                                <p className="drag-drop-text">Drag and drop file here</p>
                                <input
                                    id="file-input-location"
                                    type="file"
                                    className="drag-drop-input"
                                    onChange={handleFileInputChange}
                                    accept=".txt,.csv"
                                    disabled={loading}
                                />
                                <button
                                    className="file-select-button split-olive-button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-input-location').click();
                                    }}
                                >
                                    <span className="split-olive-button-text">{loading ? 'Uploading...' : 'Select File'}</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m7 9 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>

                            <div className="or-divider"></div>

                            <div className="add-location-section">
                                <h3>Add Location Manually</h3>
                                <button
                                    className="add-location-button-large split-olive-button"
                                    onClick={() => setShowAddForm(true)}
                                    disabled={loading}
                                >
                                    <span className="split-olive-button-text">Add New Location</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="locations-table-wrapper">
                            <table className="locations-table">
                                <thead>
                                    <tr>
                                        <th>Store Number</th>
                                        <th>Store Name</th>
                                        <th>Customer ID</th>
                                        <th>Address</th>
                                        <th>Pin Code</th>
                                        <th>State</th>
                                        <th>Country</th>
                                        <th>Shipping Time</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.map(location => (
                                        <tr 
                                            key={location.store_id || location.id}
                                            onClick={() => handleRowClick(location)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>{location.store_number || location.user_store_number || '-'}</td>
                                            <td>{location.store_name || '-'}</td>
                                            <td>{location.customer_id || '-'}</td>
                                            <td>
                                                <div className="address-cell">
                                                    {getAddressPreviewLines(location).map((line, index) => (
                                                        <div key={`${location.store_id || location.id}-address-${index}`}>{line}</div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{location.pin_code || '-'}</td>
                                            <td>{location.state_code || '-'}</td>
                                            <td>{location.country_code || '-'}</td>
                                            <td>{location.shipping_time || '-'}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    className="delete-button split-olive-button"
                                                    onClick={() => handleDeleteLocation(location.store_id || location.id)}
                                                    disabled={loading}
                                                >
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
                    )}
                </div>
            </div>

            {/* Add Location Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Location</h2>
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={handleCancel}
                                aria-label="Close add location form"
                            >
                                ×
                            </button>
                        </div>
                        {error && <div className="alert alert-error">{error}</div>}
                        <form className="location-form compact-form">
                            <div className="form-row form-row-three">
                                <div className="form-group">
                                    <label htmlFor="userStoreNumber">Store Number *</label>
                                    <input
                                        type="number"
                                        id="userStoreNumber"
                                        name="userStoreNumber"
                                        value={formData.userStoreNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter Store Number"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="storeName">Store Name *</label>
                                    <input
                                        type="text"
                                        id="storeName"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Store Name"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="customerId">Customer Name *</label>
                                    <select
                                        id="customerId"
                                        name="customerId"
                                        value={formData.customerId}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select customer</option>
                                        {customerOptions.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="addressLine1">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        id="addressLine1"
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address Line 1"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="addressLine2">Address Line 2</label>
                                    <input
                                        type="text"
                                        id="addressLine2"
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address Line 2 (optional)"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="addressLine3">Address Line 3</label>
                                    <input
                                        type="text"
                                        id="addressLine3"
                                        name="addressLine3"
                                        value={formData.addressLine3}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address Line 3 (optional)"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-row form-row-four">
                                <div className="form-group">
                                    <label htmlFor="pinCode">Pin Code *</label>
                                    <input
                                        type="text"
                                        id="pinCode"
                                        name="pinCode"
                                        value={formData.pinCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter Pin Code"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="stateCode">State Code *</label>
                                    <input
                                        type="text"
                                        id="stateCode"
                                        name="stateCode"
                                        value={formData.stateCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter State Code"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="countryCode">Country Code *</label>
                                    <input
                                        type="text"
                                        id="countryCode"
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter Country Code"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="shippingTime">Shipping Time (hours) *</label>
                                    <input
                                        type="number"
                                        id="shippingTime"
                                        name="shippingTime"
                                        value={formData.shippingTime}
                                        onChange={handleInputChange}
                                        placeholder="Enter Shipping Time in hours"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">Location wise prices</div>
                                <div className="form-row form-row-three">
                                    <div className="form-group">
                                        <label htmlFor="contractPriceGroup">Contract price group</label>
                                        <select
                                            id="contractPriceGroup"
                                            name="contractPriceGroup"
                                            value={formData.contractPriceGroup}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select contract price group</option>
                                            {priceGroupPlaceholderOptions.map(option => (
                                                <option key={`contract-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="promoPriceGroup">Promo price group</label>
                                        <select
                                            id="promoPriceGroup"
                                            name="promoPriceGroup"
                                            value={formData.promoPriceGroup}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select promo price group</option>
                                            {priceGroupPlaceholderOptions.map(option => (
                                                <option key={`promo-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="retailPriceGroup">Retail Price group</label>
                                        <select
                                            id="retailPriceGroup"
                                            name="retailPriceGroup"
                                            value={formData.retailPriceGroup}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select retail price group</option>
                                            {priceGroupPlaceholderOptions.map(option => (
                                                <option key={`retail-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions add-location-form-actions">
                                <button type="button" className="split-olive-button location-form-action-button location-form-help-button">
                                    <span className="split-olive-button-text">Help</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </span>
                                </button>
                                <div className="add-location-form-actions-right">
                                    <button 
                                        type="button" 
                                        className="split-olive-button location-form-action-button"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        <span className="split-olive-button-text">Cancel</span>
                                        <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </button>
                                    <button 
                                        type="button" 
                                        className="split-olive-button location-form-action-button"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        <span className="split-olive-button-text">{loading ? 'Saving...' : 'Save Location'}</span>
                                        <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Location Detail Modal */}
            {showDetailModal && selectedLocation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Modify Location details</h2>
                            <button
                                type="button"
                                className="modal-close-button location-add-close-button"
                                onClick={closeDetailModal}
                                aria-label="Close location details"
                            >
                                ×
                            </button>
                        </div>
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        
                        <form className="location-form compact-form">
                            <div className="form-row form-row-three">
                                <div className="form-group">
                                    <label htmlFor="userStoreNumber">Store Number *</label>
                                    <input
                                        type="number"
                                        id="userStoreNumber"
                                        name="userStoreNumber"
                                        value={formData.userStoreNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter Store Number"
                                        required
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="storeName">Store Name *</label>
                                    <input
                                        type="text"
                                        id="storeName"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Store Name"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="customerId">Customer Name *</label>
                                    <select
                                        id="customerId"
                                        name="customerId"
                                        value={formData.customerId}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select customer</option>
                                        {customerOptions.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="addressLine1">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        id="addressLine1"
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address Line 1"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="addressLine2">Address Line 2</label>
                                    <input
                                        type="text"
                                        id="addressLine2"
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address Line 2 (optional)"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="addressLine3">Address Line 3</label>
                                    <input
                                        type="text"
                                        id="addressLine3"
                                        name="addressLine3"
                                        value={formData.addressLine3}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address Line 3 (optional)"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-row form-row-four">
                                <div className="form-group">
                                    <label htmlFor="pinCode">Pin Code *</label>
                                    <input
                                        type="text"
                                        id="pinCode"
                                        name="pinCode"
                                        value={formData.pinCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter Pin Code"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="stateCode">State Code *</label>
                                    <input
                                        type="text"
                                        id="stateCode"
                                        name="stateCode"
                                        value={formData.stateCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter State Code"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="countryCode">Country Code *</label>
                                    <input
                                        type="text"
                                        id="countryCode"
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter Country Code"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="shippingTime">Shipping Time (hours) *</label>
                                    <input
                                        type="number"
                                        id="shippingTime"
                                        name="shippingTime"
                                        value={formData.shippingTime}
                                        onChange={handleInputChange}
                                        placeholder="Enter Shipping Time in hours"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">Location wise prices</div>
                                <div className="form-row form-row-three">
                                    <div className="form-group">
                                        <label htmlFor="contractPriceGroup">Contract price group</label>
                                        <select
                                            id="contractPriceGroup"
                                            name="contractPriceGroup"
                                            value={formData.contractPriceGroup}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            <option value="">Select contract price group</option>
                                            {priceGroupPlaceholderOptions.map(option => (
                                                <option key={`detail-contract-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="promoPriceGroup">Promo price group</label>
                                        <select
                                            id="promoPriceGroup"
                                            name="promoPriceGroup"
                                            value={formData.promoPriceGroup}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            <option value="">Select promo price group</option>
                                            {priceGroupPlaceholderOptions.map(option => (
                                                <option key={`detail-promo-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="retailPriceGroup">Retail Price group</label>
                                        <select
                                            id="retailPriceGroup"
                                            name="retailPriceGroup"
                                            value={formData.retailPriceGroup}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            <option value="">Select retail price group</option>
                                            {priceGroupPlaceholderOptions.map(option => (
                                                <option key={`detail-retail-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions add-location-form-actions">
                                    <button type="button" className="split-olive-button location-form-action-button location-form-help-button">
                                        <span className="split-olive-button-text">Help</span>
                                        <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div className="add-location-form-actions-right">
                                        <button
                                            type="button"
                                            className="split-olive-button location-form-action-button"
                                            onClick={closeDetailModal}
                                            disabled={loading}
                                        >
                                            <span className="split-olive-button-text">Close</span>
                                            <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className="split-olive-button location-form-action-button"
                                            onClick={handleSaveEdit}
                                            disabled={loading || !hasDetailChanges}
                                        >
                                            <span className="split-olive-button-text">{loading ? 'Saving...' : 'Save Changes'}</span>
                                            <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {confirmDeleteId !== null && (
                <div className="modal-overlay">
                    <div className="confirm-delete-dialog">
                        <h3>Delete Location</h3>
                        <p>Are you sure you want to delete this location? This action cannot be undone.</p>
                        <div className="confirm-delete-actions">
                            <button
                                type="button"
                                className="split-olive-button confirm-cancel-button"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                <span className="split-olive-button-text">Cancel</span>
                                <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </button>
                            <button
                                type="button"
                                className="split-olive-button confirm-delete-button"
                                onClick={confirmDelete}
                            >
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

export default LocationsTablePage;
