import { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/ProductTablePage.css';
import { createProduct, deleteProduct, getAllProducts, updateProduct, uploadProductFile } from '../utils/productService';

const defaultFormData = {
    productCode: '',
    barcode: '',
    price: '',
    taxRate: '',
    expiryDate: '',
    packSize: '',
    terminated: false,
    hazardous: false,
    allowPickByProduct: false
};

const toBoolean = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
    }
    return false;
};

const normalizeProduct = (product, index = 0) => ({
    id: product.product_id || product.id || `product-${index}`,
    productCode: product.product_code || product.productCode || '',
    barcode: product.barcode || '',
    price: Number(product.price || 0),
    taxRate: Number(product.tax_rate ?? product.taxRate ?? 0),
    expiryDate: product.expiry_date || product.expiryDate || '',
    packSize: product.pack_size || product.packSize || '',
    terminated: toBoolean(product.terminated ?? product.is_terminated),
    hazardous: toBoolean(product.hazardous ?? product.is_hazardous),
    allowPickByProduct: toBoolean(product.allow_pick_by_product ?? product.allowPickByProduct)
});

function ProductTablePage({ username, onLogout, onBack }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditingDetail, setIsEditingDetail] = useState(false);
    const [formData, setFormData] = useState(defaultFormData);
    const [detailFormData, setDetailFormData] = useState(defaultFormData);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');

        const result = await getAllProducts();
        if (result.success) {
            const productsData = Array.isArray(result.data) ? result.data : (result.data?.products || []);
            setProducts(productsData.map((product, index) => normalizeProduct(product, index)));
        } else {
            setError(result.error || 'Failed to fetch products');
            setProducts([]);
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
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|csv)$/i)) {
            setError('Please upload a valid file (TXT or CSV format)');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setDragOver(false);

        const result = await uploadProductFile(file);

        if (result.success) {
            await fetchProducts();
            setSuccess('File uploaded successfully! Product list refreshed.');
            setTimeout(() => setSuccess(''), 3500);
        } else {
            setError(result.error || 'Failed to upload product file. Please try again.');
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

    const handleAddProduct = () => {
        setShowAddForm(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDetailInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDetailFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveProduct = async () => {
        // Validate required fields
        if (!formData.productCode || !formData.barcode || !formData.price || !formData.taxRate || !formData.expiryDate || !formData.packSize) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const payload = {
            product_code: formData.productCode,
            barcode: formData.barcode,
            price: parseFloat(formData.price),
            tax_rate: parseFloat(formData.taxRate),
            expiry_date: formData.expiryDate,
            pack_size: formData.packSize,
            terminated: formData.terminated,
            hazardous: formData.hazardous,
            allow_pick_by_product: formData.allowPickByProduct
        };

        const result = await createProduct(payload);
        if (result.success) {
            await fetchProducts();
            setSuccess('Product added successfully!');
            setFormData(defaultFormData);
            setShowAddForm(false);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to add product. Please try again.');
        }

        setLoading(false);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        setLoading(true);
        setError('');

        const result = await deleteProduct(productId);
        if (result.success) {
            await fetchProducts();
            setSuccess('Product deleted successfully!');
            setTimeout(() => setSuccess(''), 2500);
        } else {
            setError(result.error || 'Failed to delete product.');
        }

        setLoading(false);
    };

    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setDetailFormData({
            productCode: product.productCode || '',
            barcode: product.barcode || '',
            price: product.price || '',
            taxRate: product.taxRate || '',
            expiryDate: product.expiryDate || '',
            packSize: product.packSize || '',
            terminated: !!product.terminated,
            hazardous: !!product.hazardous,
            allowPickByProduct: !!product.allowPickByProduct
        });
        setIsEditingDetail(false);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedProduct(null);
        setIsEditingDetail(false);
        setDetailFormData(defaultFormData);
    };

    const handleEditProduct = () => {
        setIsEditingDetail(true);
    };

    const handleSaveProductEdit = async () => {
        if (!selectedProduct?.id) {
            return;
        }

        if (!detailFormData.barcode || !detailFormData.price || !detailFormData.taxRate || !detailFormData.expiryDate || !detailFormData.packSize) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const payload = {
            barcode: detailFormData.barcode,
            price: parseFloat(detailFormData.price),
            tax_rate: parseFloat(detailFormData.taxRate),
            expiry_date: detailFormData.expiryDate,
            pack_size: detailFormData.packSize,
            terminated: detailFormData.terminated,
            hazardous: detailFormData.hazardous,
            allow_pick_by_product: detailFormData.allowPickByProduct
        };

        const result = await updateProduct(selectedProduct.id, payload);
        if (result.success) {
            await fetchProducts();
            setSuccess('Product updated successfully!');
            setTimeout(() => {
                closeDetailModal();
                setSuccess('');
            }, 1800);
        } else {
            setError(result.error || 'Failed to update product.');
        }

        setLoading(false);
    };

    const handleCancelAddProduct = () => {
        setFormData(defaultFormData);
        setError('');
        setShowAddForm(false);
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
                    <h1>📦 Product Table</h1>
                </div>
                <div className="content-area">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Products Display Section */}
                    {products.length > 0 && (
                        <div className="products-section">
                            <div className="products-header">
                                <div className="products-header-left">
                                    <span className="product-count">
                                        Total Products: <strong>{products.length}</strong>
                                    </span>
                                </div>
                                <div className="products-header-right">
                                    <div className="products-header-actions">
                                        <button
                                            className="file-select-button"
                                            disabled={loading}
                                            onClick={() => document.getElementById('file-input-product').click()}
                                        >
                                            {loading ? 'Uploading...' : '📁 Import Product Data'}
                                        </button>
                                        <button
                                            className="add-product-button"
                                            onClick={handleAddProduct}
                                            disabled={loading}
                                        >
                                            ➕ Add Product
                                        </button>
                                        <button
                                            className="refresh-button"
                                            onClick={fetchProducts}
                                            disabled={loading}
                                        >
                                            🔄 Refresh
                                        </button>
                                        <input
                                            id="file-input-product"
                                            type="file"
                                            className="drag-drop-input"
                                            onChange={handleFileInputChange}
                                            accept=".txt,.csv"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="uploading-spinner">
                                    <p>Loading products...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="empty-state">
                                    No products available. Import or add a product to get started.
                                </div>
                            ) : (
                                <div className="products-table-wrapper">
                                    <table className="products-table">
                                        <thead>
                                            <tr>
                                                <th>Product Code</th>
                                                <th>Barcode</th>
                                                <th>Price</th>
                                                <th>Tax Rate</th>
                                                <th>Expiry Date</th>
                                                <th>Pack Size</th>
                                                <th>Terminated</th>
                                                <th>Hazardous</th>
                                                <th>Allow Pick</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product.id} onClick={() => handleRowClick(product)} style={{ cursor: 'pointer' }}>
                                                    <td>{product.productCode || '-'}</td>
                                                    <td>{product.barcode || '-'}</td>
                                                    <td>{product.price || '-'}</td>
                                                    <td>{product.taxRate}%</td>
                                                    <td>{product.expiryDate || '-'}</td>
                                                    <td>{product.packSize || '-'}</td>
                                                    <td>{product.terminated ? '✓' : '✗'}</td>
                                                    <td>{product.hazardous ? '✓' : '✗'}</td>
                                                    <td>{product.allowPickByProduct ? '✓' : '✗'}</td>
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            className="product-delete-button"
                                                            onClick={() => handleDeleteProduct(product.id)}
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
                    )}

                    {/* Upload Section - Only show when no products */}
                    {products.length === 0 && !loading && (
                        <div className="upload-section compact-upload">
                            <h2>Import Product data or Add New Product</h2>
                            <div
                                className={`drag-drop-zone compact-drag-drop ${dragOver ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input-product').click()}
                            >
                                <div className="drag-drop-icon">📁</div>
                                <p className="drag-drop-text">Drag and drop file here</p>
                                <input
                                    id="file-input-product"
                                    type="file"
                                    className="drag-drop-input"
                                    onChange={handleFileInputChange}
                                    accept=".txt,.csv"
                                    disabled={loading}
                                />
                                <button
                                    className="file-select-button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-input-product').click();
                                    }}
                                >
                                    {loading ? 'Uploading...' : 'Select File'}
                                </button>
                            </div>

                            <div className="or-divider"></div>

                            <div className="add-product-section">
                                <h3>Add Product Manually</h3>
                                <button
                                    className="add-product-button-large"
                                    onClick={handleAddProduct}
                                    disabled={loading}
                                >
                                    ➕ Add New Product
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State - No content yet */}
                    {loading && products.length === 0 && (
                        <div className="uploading-spinner">
                            <p>Loading products...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Product</h2>
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={handleCancelAddProduct}
                                aria-label="Close add product form"
                            >
                                ×
                            </button>
                        </div>
                        {error && <div className="alert alert-error">{error}</div>}
                        <form className="product-form compact-form">
                            {/* Product Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Product Information</div>
                                
                                <div className="form-row form-row-two">
                                    <div className="form-group">
                                        <label htmlFor="productCode">Product Code *</label>
                                        <input
                                            type="text"
                                            id="productCode"
                                            name="productCode"
                                            value={formData.productCode}
                                            onChange={handleInputChange}
                                            placeholder="Enter Product Code"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="barcode">Barcode *</label>
                                        <input
                                            type="text"
                                            id="barcode"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleInputChange}
                                            placeholder="Enter Barcode"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Tax Information */}
                            <div className="form-section">
                                <div className="form-section-title">Pricing & Tax</div>
                                
                                <div className="form-row form-row-two">
                                    <div className="form-group">
                                        <label htmlFor="price">Price *</label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="Enter Price"
                                            step="0.01"
                                            min="0"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="taxRate">Tax Rate (%) *</label>
                                        <input
                                            type="number"
                                            id="taxRate"
                                            name="taxRate"
                                            value={formData.taxRate}
                                            onChange={handleInputChange}
                                            placeholder="Enter Tax Rate"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Details */}
                            <div className="form-section">
                                <div className="form-section-title">Inventory Details</div>
                                
                                <div className="form-row form-row-two">
                                    <div className="form-group">
                                        <label htmlFor="packSize">Pack Size *</label>
                                        <input
                                            type="text"
                                            id="packSize"
                                            name="packSize"
                                            value={formData.packSize}
                                            onChange={handleInputChange}
                                            placeholder="Enter Pack Size (e.g., 10 units)"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="expiryDate">Expiry Date *</label>
                                        <input
                                            type="date"
                                            id="expiryDate"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Attributes */}
                            <div className="form-section">
                                <div className="form-section-title">Product Attributes</div>
                                
                                <div className="checkbox-row">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="terminated"
                                            checked={formData.terminated}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <span>Terminated</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="hazardous"
                                            checked={formData.hazardous}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <span>Hazardous</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="allowPickByProduct"
                                            checked={formData.allowPickByProduct}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <span>Allow Pick by Product</span>
                                    </label>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={handleCancelAddProduct}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="save-button"
                                    onClick={handleSaveProduct}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {showDetailModal && selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Product Details</h2>
                            <div className="modal-header-actions">
                                {!isEditingDetail && (
                                    <button
                                        type="button"
                                        className="product-modify-button"
                                        onClick={handleEditProduct}
                                        disabled={loading}
                                    >
                                        ✏️ Modify
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={closeDetailModal}
                                    aria-label="Close product details"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form className="product-form compact-form">
                            <div className="form-section">
                                <div className="form-section-title">Product Information</div>
                                <div className="form-row form-row-two">
                                    <div className="form-group">
                                        <label htmlFor="detailProductCode">Product Code *</label>
                                        <input
                                            type="text"
                                            id="detailProductCode"
                                            name="productCode"
                                            value={detailFormData.productCode}
                                            disabled
                                        />
                                        <span className="readonly-helper-text">Product code cannot be modified.</span>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="detailBarcode">Barcode *</label>
                                        <input
                                            type="text"
                                            id="detailBarcode"
                                            name="barcode"
                                            value={detailFormData.barcode}
                                            onChange={handleDetailInputChange}
                                            required
                                            disabled={!isEditingDetail || loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">Pricing & Tax</div>
                                <div className="form-row form-row-two">
                                    <div className="form-group">
                                        <label htmlFor="detailPrice">Price *</label>
                                        <input
                                            type="number"
                                            id="detailPrice"
                                            name="price"
                                            value={detailFormData.price}
                                            onChange={handleDetailInputChange}
                                            step="0.01"
                                            min="0"
                                            required
                                            disabled={!isEditingDetail || loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="detailTaxRate">Tax Rate (%) *</label>
                                        <input
                                            type="number"
                                            id="detailTaxRate"
                                            name="taxRate"
                                            value={detailFormData.taxRate}
                                            onChange={handleDetailInputChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            required
                                            disabled={!isEditingDetail || loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">Inventory Details</div>
                                <div className="form-row form-row-two">
                                    <div className="form-group">
                                        <label htmlFor="detailPackSize">Pack Size *</label>
                                        <input
                                            type="text"
                                            id="detailPackSize"
                                            name="packSize"
                                            value={detailFormData.packSize}
                                            onChange={handleDetailInputChange}
                                            required
                                            disabled={!isEditingDetail || loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="detailExpiryDate">Expiry Date *</label>
                                        <input
                                            type="date"
                                            id="detailExpiryDate"
                                            name="expiryDate"
                                            value={detailFormData.expiryDate}
                                            onChange={handleDetailInputChange}
                                            required
                                            disabled={!isEditingDetail || loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">Product Attributes</div>
                                <div className="checkbox-row">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="terminated"
                                            checked={detailFormData.terminated}
                                            onChange={handleDetailInputChange}
                                            disabled={!isEditingDetail || loading}
                                        />
                                        <span>Terminated</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="hazardous"
                                            checked={detailFormData.hazardous}
                                            onChange={handleDetailInputChange}
                                            disabled={!isEditingDetail || loading}
                                        />
                                        <span>Hazardous</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="allowPickByProduct"
                                            checked={detailFormData.allowPickByProduct}
                                            onChange={handleDetailInputChange}
                                            disabled={!isEditingDetail || loading}
                                        />
                                        <span>Allow Pick by Product</span>
                                    </label>
                                </div>
                            </div>

                            {isEditingDetail && (
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
                                        onClick={handleSaveProductEdit}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
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

export default ProductTablePage;
