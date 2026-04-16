import { useState } from 'react';
import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/ProductTablePage.css';

function AddProductPage({ username, onLogout, onBack, onProductAdded }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        productCode: '',
        barcode: '',
        price: '',
        taxRate: '',
        expiryDate: '',
        packSize: '',
        terminated: false,
        hazardous: false,
        allowPickByProduct: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        // Validate required fields
        if (!formData.productCode || !formData.barcode || !formData.price || !formData.taxRate || !formData.expiryDate || !formData.packSize) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // TODO: Replace with actual API call to create product
            const product = {
                id: `prod-${Date.now()}`,
                productCode: formData.productCode,
                barcode: formData.barcode,
                price: parseFloat(formData.price),
                taxRate: parseFloat(formData.taxRate),
                expiryDate: formData.expiryDate,
                packSize: formData.packSize,
                terminated: formData.terminated,
                hazardous: formData.hazardous,
                allowPickByProduct: formData.allowPickByProduct
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess('Product added successfully!');
            
            // Reset form
            setFormData({
                productCode: '',
                barcode: '',
                price: '',
                taxRate: '',
                expiryDate: '',
                packSize: '',
                terminated: false,
                hazardous: false,
                allowPickByProduct: false
            });

            // Notify parent and go back
            if (onProductAdded) {
                onProductAdded(product);
            }

            setTimeout(() => {
                onBack();
            }, 1500);
        } catch (err) {
            setError('Failed to add product. Please try again.');
        }

        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({
            productCode: '',
            barcode: '',
            price: '',
            taxRate: '',
            expiryDate: '',
            packSize: '',
            terminated: false,
            hazardous: false,
            allowPickByProduct: false
        });
        setError('');
        onBack();
    };

    return (
        <div className="page-container">
            <Header username={username} onLogout={onLogout} onDashboard={onBack} />
            <div className="page-content">
                <div className="page-header">
                    <button onClick={onBack} className="back-button">← Back to Products</button>
                    <h1>➕ Add New Product</h1>
                </div>
                <div className="content-area product-form-container">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form className="product-form compact-form">
                        {/* Basic Product Information */}
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
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProductPage;
