import { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/LocationsTablePage.css';
import { createStore, getAllStores, updateStore, deleteStore } from '../utils/storeService';

// this page will consume all "store" backend apis
function LocationsTablePage({ username, onLogout, onBack }) {
    const priceGroupPlaceholderOptions = ['Group 1', 'Group 2', 'Group 3'];

    const [showAddForm, setShowAddForm] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
    }, []);

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
            user_store_number: parseInt(formData.userStoreNumber, 10),
            store_name: formData.storeName,
            customer_id: parseInt(formData.customerId, 10),
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2 || '',
            address_line3: formData.addressLine3 || '',
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
        setSelectedLocation(location);
        setFormData({
            userStoreNumber: location.user_store_number || '',
            storeName: location.store_name || '',
            customerId: location.customer_id || '',
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
        });
        setIsEditing(false);
        setShowDetailModal(true);
    };

    const handleEditLocation = () => {
        setIsEditing(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setIsEditing(false);
        setSelectedLocation(null);
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
            user_store_number: parseInt(formData.userStoreNumber, 10),
            store_name: formData.storeName,
            customer_id: parseInt(formData.customerId, 10),
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2 || '',
            address_line3: formData.addressLine3 || '',
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
        if (!window.confirm('Are you sure you want to delete this location?')) {
            return;
        }

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
                    <button onClick={onBack} className="back-button">← Back to Dashboard</button>
                    <h1>📍 Locations Table</h1>
                </div>
                <div className="content-area">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="locations-header">
                        <h2>Location Records</h2>
                        <button 
                            className="add-location-button"
                            onClick={() => setShowAddForm(true)}
                            disabled={loading}
                        >
                            + Add Location
                        </button>
                    </div>

                    {loading && !showAddForm ? (
                        <div className="loading-spinner">
                            <p>Loading locations...</p>
                        </div>
                    ) : locations.length === 0 ? (
                        <p className="empty-state">No locations added yet. Click "Add Location" to get started.</p>
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
                                            <td>{location.user_store_number || '-'}</td>
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
                                                    className="delete-button"
                                                    onClick={() => handleDeleteLocation(location.id || location.location_id)}
                                                    disabled={loading}
                                                >
                                                    Delete
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
                                    <label htmlFor="customerId">Customer ID *</label>
                                    <input
                                        type="number"
                                        id="customerId"
                                        name="customerId"
                                        value={formData.customerId}
                                        onChange={handleInputChange}
                                        placeholder="Enter Customer ID"
                                        required
                                        disabled={loading}
                                    />
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

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="save-button"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Location'}
                                </button>
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
                            <h2>Location Details</h2>
                            <div className="modal-header-actions">
                                {!isEditing && (
                                    <button 
                                        type="button"
                                        className="save-button"
                                        onClick={handleEditLocation}
                                    >
                                        ✏️ Modify
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={closeDetailModal}
                                    aria-label="Close location details"
                                >
                                    ×
                                </button>
                            </div>
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
                                        disabled={!isEditing || loading}
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
                                        disabled={!isEditing || loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="customerId">Customer ID *</label>
                                    <input
                                        type="number"
                                        id="customerId"
                                        name="customerId"
                                        value={formData.customerId}
                                        onChange={handleInputChange}
                                        placeholder="Enter Customer ID"
                                        required
                                        disabled={!isEditing || loading}
                                    />
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
                                        disabled={!isEditing || loading}
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
                                        disabled={!isEditing || loading}
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
                                        disabled={!isEditing || loading}
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
                                        disabled={!isEditing || loading}
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
                                        disabled={!isEditing || loading}
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
                                        disabled={!isEditing || loading}
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
                                        disabled={!isEditing || loading}
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
                                            disabled={!isEditing || loading}
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
                                            disabled={!isEditing || loading}
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
                                            disabled={!isEditing || loading}
                                        >
                                            <option value="">Select retail price group</option>
                                            {priceGroupPlaceholderOptions.map(option => (
                                                <option key={`detail-retail-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-button"
                                        onClick={closeDetailModal}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        className="save-button"
                                        onClick={handleSaveEdit}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            {!isEditing && (
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-button"
                                        onClick={closeDetailModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LocationsTablePage;
