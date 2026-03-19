import { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/PickPage.css';
import { uploadEDIFile, getAllOrders } from '../utils/uploadService';

function PickPage({ username, onLogout, onBack }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

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
        if (window.confirm('Are you sure you want to refresh the orders list?')) {
            fetchOrders();
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setTimeout(() => setSelectedOrder(null), 300);
    };

    return (
        <div className="page-container">
            <Header username={username} onLogout={onLogout} onDashboard={onBack} />
            <div className="page-content">
                <div className="page-header">
                    <button onClick={onBack} className="back-button">← Back to Dashboard</button>
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
                                        Total Orders: <strong>{orders.length}</strong>
                                    </span>
                                </div>
                                <div className="orders-header-center">
                                    <h2>Imported Orders</h2>
                                </div>
                                <div className="orders-header-right">
                                    <div className="orders-header-actions">
                                        <button
                                            className="file-select-button"
                                            disabled={loading}
                                            onClick={() => document.getElementById('file-input').click()}
                                        >
                                            {loading ? 'Uploading...' : '📁 Upload File'}
                                        </button>
                                        <button
                                            className="refresh-button"
                                            onClick={handleClearOrders}
                                            disabled={loading}
                                        >
                                            🔄 Refresh
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

                            {loading ? (
                                <div className="uploading-spinner">
                                    <p>Loading orders...</p>
                                </div>
                            ) : (
                                <div className="orders-table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Store ID</th>
                                                <th>User ID</th>
                                                <th>Total Amount</th>
                                                <th>Status</th>
                                                <th>Items</th>
                                                <th>Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, index) => (
                                                <tr 
                                                    key={order.order_id || index}
                                                    onClick={() => handleOrderClick(order)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td>{order.order_id || '-'}</td>
                                                    <td>{order.store_id || '-'}</td>
                                                    <td>{order.user_id || '-'}</td>
                                                    <td>
                                                        {order.currency} {order.total_amount ? order.total_amount.toFixed(2) : '-'}
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            backgroundColor: getStatusColor(order.order_status),
                                                            color: 'white'
                                                        }}>
                                                            {order.order_status || 'pending'}
                                                        </span>
                                                    </td>
                                                    <td>{order.items && order.items.length > 0 ? order.items.length : '0'} item(s)</td>
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
                                <p className="drag-drop-text">Drag and drop your order file here</p>
                                <p className="drag-drop-subtext">or click to select a file</p>
                                <input
                                    id="file-input"
                                    type="file"
                                    className="drag-drop-input"
                                    onChange={handleFileInputChange}
                                    accept=".txt,.csv,.edi"
                                    disabled={loading}
                                />
                                <button
                                    className="file-select-button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-input').click();
                                    }}
                                >
                                    {loading ? 'Uploading...' : 'Select File'}
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
                        <button className="order-details-close" onClick={closeOrderModal}>✕</button>
                        
                        <div className="order-details-header">
                            <h2>Order #{selectedOrder.order_id}</h2>
                            <span className="order-details-status" style={{ backgroundColor: getStatusColor(selectedOrder.order_status) }}>
                                {selectedOrder.order_status.toUpperCase()}
                            </span>
                        </div>

                        <div className="order-details-grid">
                            <div className="order-detail-item">
                                <span className="order-detail-label">Order ID</span>
                                <span className="order-detail-value">{selectedOrder.order_id}</span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Store ID</span>
                                <span className="order-detail-value">{selectedOrder.store_id}</span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">User ID</span>
                                <span className="order-detail-value">{selectedOrder.user_id}</span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Total Amount</span>
                                <span className="order-detail-value">
                                    {selectedOrder.currency} {selectedOrder.total_amount ? selectedOrder.total_amount.toFixed(2) : '-'}
                                </span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Created At</span>
                                <span className="order-detail-value">
                                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}
                                </span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Updated At</span>
                                <span className="order-detail-value">
                                    {selectedOrder.updated_at ? new Date(selectedOrder.updated_at).toLocaleString() : '-'}
                                </span>
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

                        <button className="close-modal-button" onClick={closeOrderModal}>Close</button>
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
    if (statusLower === 'completed' || statusLower === 'success' || statusLower === 'delivered') {
        return '#48bb78';
    } else if (statusLower === 'pending' || statusLower === 'processing' || statusLower === 'open') {
        return '#ed8936';
    } else if (statusLower === 'error' || statusLower === 'failed' || statusLower === 'cancelled') {
        return '#f56565';
    }
    return '#667eea';
}

export default PickPage;
