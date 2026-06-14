import { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/PickPage.css';
import { uploadEDIFile, getAllOrders } from '../utils/orderService';
import { getAllStores } from '../utils/storeService';

function PickPage({ username, onLogout, onBack }) {
    const importStatusTabs = ['Rejected', 'Unpicked', 'Downloading', 'Picking', 'Partially Filled', 'Filled', 'Completed'];
    const orderStatusOptions = ['pending', 'cancelled', 'outstanding', 'discarded', 'downloading', 'Picking', 'complete'];
    const poaStatusOptions = ['POA sent', 'POA not sent'];
    const carrierOptions = ['Select carrier', 'DHL', 'FedEx', 'Blue Dart', 'Delhivery'];
    const todayDate = getTodayDateString();
    const defaultOrderFormData = {
        orderStatus: 'pending',
        shipByDate: todayDate,
        notAfter: todayDate,
        notBefore: todayDate,
        dontPickBefore: todayDate,
        poaStatus: 'POA not sent',
        carrier: 'Select carrier',
        consignmentNoteNumber: ''
    };

    const [orders, setOrders] = useState([]);
    const [activeImportTab, setActiveImportTab] = useState('Unpicked');
    const [storesById, setStoresById] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderKey, setSelectedOrderKey] = useState('');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderDrafts, setOrderDrafts] = useState({});
    const [orderFormData, setOrderFormData] = useState({
        orderStatus: 'pending',
        shipByDate: todayDate,
        notAfter: todayDate,
        notBefore: todayDate,
        dontPickBefore: todayDate,
        poaStatus: 'POA not sent',
        carrier: 'Select carrier',
        consignmentNoteNumber: ''
    });

    const fetchStoresForLookup = async () => {
        const result = await getAllStores();
        if (!result.success) {
            return;
        }

        const storesList = Array.isArray(result.data) ? result.data : (result.data?.stores || []);
        const nextStoresById = storesList.reduce((accumulator, store) => {
            const storeId = store.store_id || store.id;
            if (storeId) {
                accumulator[storeId] = store.store_name || store.name || '';
            }
            return accumulator;
        }, {});

        setStoresById(nextStoresById);
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        const result = await getAllOrders();

        if (result.success) {
            const ordersList = Array.isArray(result.data) ? result.data : (result.data?.orders || []);
            setOrders(ordersList);
        } else {
            setError(result.error || 'Failed to fetch orders');
            setOrders([]);
        }
        setLoading(false);
    };

    // Fetch orders on component mount
    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            setLoading(true);
            setError('');

            const [ordersResult, storesResult] = await Promise.all([
                getAllOrders(),
                getAllStores()
            ]);

            if (!isMounted) {
                return;
            }

            if (ordersResult.success) {
                const ordersList = Array.isArray(ordersResult.data) ? ordersResult.data : (ordersResult.data?.orders || []);
                setOrders(ordersList);
            } else {
                setError(ordersResult.error || 'Failed to fetch orders');
                setOrders([]);
            }

            if (storesResult.success) {
                const storesList = Array.isArray(storesResult.data) ? storesResult.data : (storesResult.data?.stores || []);
                const nextStoresById = storesList.reduce((accumulator, store) => {
                    const storeId = store.store_id || store.id;
                    if (storeId) {
                        accumulator[storeId] = store.store_name || store.name || '';
                    }
                    return accumulator;
                }, {});

                setStoresById(nextStoresById);
            }

            setLoading(false);
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        // Validate file type
        const allowedTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel'];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|csv|edi)$/i)) {
            setError('Please upload a valid file (TXT, CSV, or EDI format)');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setDragOver(false);

        const result = await uploadEDIFile(file);

        if (result.success) {
            // File uploaded successfully, refetch orders from the API
            setSuccess('File uploaded successfully! Loading orders...');
            await fetchOrders();
            setTimeout(() => setSuccess(''), 4000);
        } else {
            setError(result.error || 'Failed to upload file. Please try again.');
        }

        setLoading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const files = e.dataTransfer.files;
        handleFileUpload(files);
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        handleFileUpload(files);
    };

    const handleClearOrders = () => {
        fetchOrders();
        fetchStoresForLookup();
    };

    const getOrderKey = (order, index = 0) => {
        return `${order.order_id || 'order'}-${order.store_id || 'store'}-${index}`;
    };

    const getSavedOrderDraft = (orderKey) => {
        const savedDraft = orderDrafts[orderKey];
        if (!savedDraft) {
            return undefined;
        }

        const mergedDraft = {
            ...defaultOrderFormData,
            ...savedDraft
        };

        if (isPastDate(mergedDraft.shipByDate, todayDate)) {
            return {
                ...mergedDraft,
                orderStatus: 'cancelled'
            };
        }

        return mergedDraft;
    };

    const getDisplayOrderStatus = (order, index) => {
        return getSavedOrderDraft(getOrderKey(order, index))?.orderStatus || order.order_status || 'pending';
    };

    const getDisplayShipByDate = (order, index) => {
        return getSavedOrderDraft(getOrderKey(order, index))?.shipByDate || defaultOrderFormData.shipByDate;
    };

    const getDisplayNotAfterDate = (order, index) => {
        return getSavedOrderDraft(getOrderKey(order, index))?.notAfter || defaultOrderFormData.notAfter;
    };

    const getDisplayStoreName = (order) => {
        return order.store_name || storesById[order.store_id] || 'Unknown Store';
    };

    const handleOrderClick = (order, index) => {
        const orderKey = getOrderKey(order, index);
        setSelectedOrder(order);
        setSelectedOrderKey(orderKey);
        setOrderFormData(getSavedOrderDraft(orderKey) || defaultOrderFormData);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setTimeout(() => {
            setSelectedOrder(null);
            setSelectedOrderKey('');
            setOrderFormData(defaultOrderFormData);
        }, 300);
    };

    const handleOrderFormChange = (e) => {
        const { name, value } = e.target;
        setOrderFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'shipByDate'
                ? { orderStatus: isPastDate(value, todayDate) ? 'cancelled' : 'pending' }
                : {})
        }));
    };

    const handleSaveOrderChanges = () => {
        if (!selectedOrderKey) {
            return;
        }

        const nextOrderFormData = isPastDate(orderFormData.shipByDate, todayDate)
            ? { ...orderFormData, orderStatus: 'cancelled' }
            : orderFormData;

        setOrderDrafts(prev => ({
            ...prev,
            [selectedOrderKey]: nextOrderFormData
        }));

        if (selectedOrder) {
            setSelectedOrder(prev => prev ? ({
                ...prev,
                order_status: nextOrderFormData.orderStatus
            }) : prev);
        }

        setSuccess('Order changes saved locally.');
        setTimeout(() => setSuccess(''), 2500);
        closeOrderModal();
    };

    const hasOrderChanges = selectedOrderKey && JSON.stringify(orderFormData) !== JSON.stringify(getSavedOrderDraft(selectedOrderKey) || defaultOrderFormData);
    const selectedOrderStoreName = selectedOrder ? (selectedOrder.store_name || storesById[selectedOrder.store_id] || 'Unknown Store') : '';
    const isOrderStatusLocked = isPastDate(orderFormData.shipByDate, todayDate);

    const getStatusBadgeStyle = (status) => ({
        backgroundColor: getStatusColor(status),
        color: getStatusTextColor(status)
    });

    const getImportTabStatusClass = (tab) => {
        const tabSlug = tab.toLowerCase().replace(/\s+/g, '-');
        return `status-${tabSlug}`;
    };

    const shouldShowOrderForActiveTab = (order, index) => {
        const orderStatus = (getDisplayOrderStatus(order, index) || '').toLowerCase();
        if (orderStatus === 'pending') {
            return activeImportTab === 'Unpicked';
        }
        return true;
    };

    const visibleOrders = orders.reduce((accumulator, order, index) => {
        if (shouldShowOrderForActiveTab(order, index)) {
            accumulator.push({ order, sourceIndex: index });
        }
        return accumulator;
    }, []);

    return (
        <div className="page-container pick-page">
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
                    <h1>📋 Order Import</h1>
                </div>
                <div className="content-area">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Orders Display Section */}
                    {orders.length > 0 && (
                        <div className="orders-section">
                            <div className="orders-header">
                                <div className="orders-header-left">
                                    <span className="order-count">
                                        Total Orders: <strong>{visibleOrders.length}</strong>
                                    </span>
                                </div>
                                <div className="orders-header-center">
                                </div>
                                <div className="orders-header-right">
                                    <div className="orders-header-actions">
                                        <button
                                            className="file-select-button split-olive-button"
                                            disabled={loading}
                                            onClick={() => document.getElementById('file-input').click()}
                                        >
                                            <span className="split-olive-button-text">{loading ? 'Uploading...' : 'Upload File'}</span>
                                            <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="m7 9 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                        <button
                                            className="refresh-button split-olive-button"
                                            onClick={handleClearOrders}
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
                                        <input
                                            id="file-input"
                                            type="file"
                                            className="drag-drop-input"
                                            onChange={handleFileInputChange}
                                            accept=".txt,.csv,.edi"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="import-status-tabs" aria-label="ABSPick import status tabs" role="tablist">
                                {importStatusTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        className={`import-status-tab ${getImportTabStatusClass(tab)} ${activeImportTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveImportTab(tab)}
                                        role="tab"
                                        aria-selected={activeImportTab === tab}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="uploading-spinner">
                                    <p>Loading orders...</p>
                                </div>
                            ) : visibleOrders.length === 0 ? (
                                <div className="empty-state">
                                    No orders available for the selected tab.
                                </div>
                            ) : (
                                <div className="orders-table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Store Name</th>
                                                <th>Ship by Date</th>
                                                <th>Not After Date</th>
                                                <th>Status</th>
                                                <th>Items</th>
                                                <th>Total Amount</th>
                                                <th>Order Creation Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleOrders.map(({ order, sourceIndex }) => (
                                                <tr 
                                                    key={order.order_id || sourceIndex}
                                                    onClick={() => handleOrderClick(order, sourceIndex)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td>{order.order_id || '-'}</td>
                                                    <td>{getDisplayStoreName(order)}</td>
                                                    <td>
                                                        {formatDisplayDate(getDisplayShipByDate(order, sourceIndex))}
                                                    </td>
                                                    <td>
                                                        {formatDisplayDate(getDisplayNotAfterDate(order, sourceIndex))}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className="order-status-badge"
                                                            style={getStatusBadgeStyle(getDisplayOrderStatus(order, sourceIndex))}
                                                        >
                                                            {getDisplayOrderStatus(order, sourceIndex)}
                                                        </span>
                                                    </td>
                                                    <td>{order.items && order.items.length > 0 ? order.items.length : '0'} item(s)</td>
                                                    <td>
                                                        {order.currency} {order.total_amount ? order.total_amount.toFixed(2) : '-'}
                                                    </td>
                                                    <td>
                                                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Section - Only show when no orders */}
                    {orders.length === 0 && !loading && (
                        <div className="upload-section">
                            <h2>Upload Order File</h2>
                            <div
                                className={`drag-drop-zone ${dragOver ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <div className="drag-drop-icon">📁</div>
                                <p className="drag-drop-text">Drag and drop your orders file here</p>
                                <input
                                    id="file-input"
                                    type="file"
                                    className="drag-drop-input"
                                    onChange={handleFileInputChange}
                                    accept=".txt,.csv,.edi"
                                    disabled={loading}
                                />
                                <button
                                    className="file-select-button split-olive-button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-input').click();
                                    }}
                                >
                                    <span className="split-olive-button-text">{loading ? 'Uploading...' : 'Select File'}</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m7 9 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State - No content yet */}
                    {loading && orders.length === 0 && (
                        <div className="uploading-spinner">
                            <p>Loading orders...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="order-details-modal" onClick={closeOrderModal}>
                    <div className="order-details-content" onClick={(e) => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <div className="order-modal-title-block">
                                <h2>Modify Order</h2>
                                <p className="order-modal-subtitle">Order #{selectedOrder.order_id}</p>
                            </div>
                            <div className="order-store-name-block">
                                <div className="order-modal-meta-label">Store name</div>
                                <div className="order-modal-meta-value">{selectedOrderStoreName}</div>
                            </div>
                            <div className="order-modal-header-actions">
                                <span className="order-details-status order-status-badge" style={getStatusBadgeStyle(orderFormData.orderStatus)}>
                                    {(orderFormData.orderStatus || 'pending').toUpperCase()}
                                </span>
                                <button className="order-details-close" onClick={closeOrderModal} aria-label="Close modify order form">×</button>
                            </div>
                        </div>

                        <div className="order-form compact-order-form">
                            <div className="order-form-section">
                                <div className="order-form-section-title">Order Summary</div>
                                <div className="order-form-row order-form-row-two">
                                    <div className="order-form-group">
                                        <label>Order ID</label>
                                        <div className="order-readonly-value">{selectedOrder.order_id}</div>
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="carrier">Carrier</label>
                                        <select
                                            id="carrier"
                                            className="order-detail-input"
                                            name="carrier"
                                            value={orderFormData.carrier}
                                            onChange={handleOrderFormChange}
                                        >
                                            {carrierOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="order-form-row order-form-row-two">
                                    <div className="order-form-group">
                                        <label>Order Date</label>
                                        <div className="order-readonly-value">
                                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}
                                        </div>
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="consignmentNoteNumber">Consignment note number</label>
                                        <input
                                            id="consignmentNoteNumber"
                                            type="text"
                                            className="order-detail-input"
                                            name="consignmentNoteNumber"
                                            value={orderFormData.consignmentNoteNumber}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="order-form-section">
                                <div className="order-form-section-title">Order Controls</div>
                                <div className="order-controls-grid">
                                    <div className="order-form-group">
                                        <label htmlFor="shipByDate">Ship by</label>
                                        <input
                                            id="shipByDate"
                                            type="date"
                                            className="order-detail-input"
                                            name="shipByDate"
                                            value={orderFormData.shipByDate}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="notAfter">Not after</label>
                                        <input
                                            id="notAfter"
                                            type="date"
                                            className="order-detail-input"
                                            name="notAfter"
                                            value={orderFormData.notAfter}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="orderStatus">Status</label>
                                        <select
                                            id="orderStatus"
                                            className="order-detail-input"
                                            name="orderStatus"
                                            value={orderFormData.orderStatus}
                                            onChange={handleOrderFormChange}
                                            disabled={isOrderStatusLocked}
                                        >
                                            {orderStatusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="notBefore">Not before</label>
                                        <input
                                            id="notBefore"
                                            type="date"
                                            className="order-detail-input"
                                            name="notBefore"
                                            value={orderFormData.notBefore}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="dontPickBefore">Don't pick before</label>
                                        <input
                                            id="dontPickBefore"
                                            type="date"
                                            className="order-detail-input"
                                            name="dontPickBefore"
                                            value={orderFormData.dontPickBefore}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="poaStatus">POA status</label>
                                        <select
                                            id="poaStatus"
                                            className="order-detail-input"
                                            name="poaStatus"
                                            value={orderFormData.poaStatus}
                                            onChange={handleOrderFormChange}
                                        >
                                            {poaStatusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="order-items-section">
                                <h3>Order Items ({selectedOrder.items.length})</h3>
                                <div className="order-items-list">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="order-item-card">
                                            <strong>{item.product_name || item.name || `Item ${index + 1}`}</strong>
                                            <div>
                                                {item.product_code && <div><strong>Code:</strong> {item.product_code}</div>}
                                                {item.quantity && <div><strong>Quantity:</strong> {item.quantity}</div>}
                                                {item.unit_price && <div><strong>Unit Price:</strong> {selectedOrder.currency} {item.unit_price}</div>}
                                                {item.total_price && <div><strong>Total:</strong> {selectedOrder.currency} {item.total_price}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="order-form-actions">
                            <button type="button" className="order-help-button split-olive-button">
                                <span className="split-olive-button-text">Help</span>
                                <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </span>
                            </button>
                            <div className="order-form-actions-right">
                                <button className="close-modal-button split-olive-button" onClick={closeOrderModal}>
                                    <span className="split-olive-button-text">Close</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button className="save-order-button split-olive-button" onClick={handleSaveOrderChanges} disabled={!hasOrderChanges}>
                                    <span className="split-olive-button-text">Save Changes</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="m20 6-11 11-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Helper function to get status badge color
 */
function getStatusColor(status) {
    if (!status) return '#a0aec0';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'cancelled') {
        return '#f56565';
    } else if (statusLower === 'pending') {
        return '#ed8936';
    } else if (statusLower === 'outstanding') {
        return '#48bb78';
    } else if (statusLower === 'downloading') {
        return '#b794f4';
    } else if (statusLower === 'picking') {
        return '#ecc94b';
    } else if (statusLower === 'discarded') {
        return '#a0aec0';
    } else if (statusLower === 'completed' || statusLower === 'complete') {
        return '#4299e1';
    }
    return '#667eea';
}

function getStatusTextColor(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'picking') {
        return '#2d3748';
    }
    return '#ffffff';
}

function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isPastDate(dateValue, todayDate) {
    return Boolean(dateValue) && dateValue < todayDate;
}

function formatDisplayDate(dateValue) {
    if (!dateValue) {
        return '-';
    }

    const normalizedDate = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(normalizedDate.getTime())) {
        return dateValue;
    }

    return normalizedDate.toLocaleDateString();
}

export default PickPage;
