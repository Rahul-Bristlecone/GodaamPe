import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { createCustomer, deleteCustomer, getAllCustomers, normalizeCustomer, updateCustomer } from '../utils/customerService';
import '../styles/SubPage.css';

const initialCustomerForm = {
    customerNumber: '',
    customerName: '',
    externalReference: '',
    abn: '',
    ediAddress: '',
    orderNoRecycleDays: '270',
    shipmentDays: '',
    cancelOrderDays: '',
    gs02Address: '',
    gs03Address: '',
    rpoGs03Address: '',
    sendMethod: 'SendPath',
    messageReleaseNumber: '',
    x12LineTerminator: '',
};

function CustomerTablePage({ username, onLogout, onBack }) {
    const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('General');
    const [customerForm, setCustomerForm] = useState(initialCustomerForm);
    const [customerEntries, setCustomerEntries] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [saveError, setSaveError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const customerTabs = ['General', 'EDI', 'Prices', 'Labels', 'RPOs', 'FA', 'POAs', 'ASNs', 'Invoice', 'Track Usage'];

    const fetchCustomers = async () => {
        setLoading(true);
        setError('');

        const result = await getAllCustomers();
        if (result.success) {
            const data = Array.isArray(result.data) ? result.data : (result.data?.customers || []);
            setCustomerEntries(data.map((customer, index) => normalizeCustomer(customer, index)));
        } else {
            setError(result.error || 'Failed to fetch customers');
            setCustomerEntries([]);
        }

        setLoading(false);
    };

    useEffect(() => {
        let isMounted = true;

        const loadCustomers = async () => {
            const result = await getAllCustomers();
            if (!isMounted) {
                return;
            }

            if (result.success) {
                const data = Array.isArray(result.data) ? result.data : (result.data?.customers || []);
                setCustomerEntries(data.map((customer, index) => normalizeCustomer(customer, index)));
            } else {
                setError(result.error || 'Failed to fetch customers');
                setCustomerEntries([]);
            }

            setLoading(false);
        };

        loadCustomers();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleAddCustomer = () => {
        setSelectedCustomerId(null);
        setCustomerForm(initialCustomerForm);
        setFormErrors({});
        setSaveError('');
        setActiveTab('General');
        setShowAddCustomerDialog(true);
    };

    const handleRowClick = (entry) => {
        setSelectedCustomerId(entry.id);
        setCustomerForm({
            ...initialCustomerForm,
            ...entry,
        });
        setFormErrors({});
        setSaveError('');
        setActiveTab('General');
        setShowAddCustomerDialog(true);
    };

    const closeAddCustomerDialog = () => {
        setShowAddCustomerDialog(false);
        setActiveTab('General');
        setCustomerForm(initialCustomerForm);
        setSelectedCustomerId(null);
        setFormErrors({});
        setSaveError('');
    };

    const handleCustomerFieldChange = (field, value) => {
        setCustomerForm(prev => ({
            ...prev,
            [field]: value,
        }));
        setFormErrors(prev => ({
            ...prev,
            [field]: undefined,
        }));
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!customerForm.customerNumber.trim()) {
            nextErrors.customerNumber = 'Customer Number is required.';
        }

        if (!customerForm.customerName.trim()) {
            nextErrors.customerName = 'Customer Name is required.';
        }

        if (customerForm.abn.trim() && !/^\d+$/.test(customerForm.abn.trim())) {
            nextErrors.abn = 'ABN must be numeric.';
        }

        return nextErrors;
    };

    const handleUpdateCustomer = async () => {
        const nextErrors = validateForm();
        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            setActiveTab('General');
            return;
        }

        setSaveError('');
        setError('');
        setSuccess('');
        setLoading(true);

        const isUpdate = selectedCustomerId !== null;
        const payload = {
            ...(!isUpdate && { customer_no: customerForm.customerNumber.trim() }),
            name: customerForm.customerName.trim(),
            explicit_ext_ref: customerForm.externalReference.trim() || null,
            abn: customerForm.abn.trim() || null,
            edi_address: customerForm.ediAddress.trim() || null,
            order_no_recycle_days: customerForm.orderNoRecycleDays ? Number(customerForm.orderNoRecycleDays) : null,
            shipment_days: customerForm.shipmentDays.trim() || null,
            cancel_order_days: customerForm.cancelOrderDays ? Number(customerForm.cancelOrderDays) : null,
            gs02_address: customerForm.gs02Address.trim() || null,
            gs03_address: customerForm.gs03Address.trim() || null,
            rpo_gs03_address: customerForm.rpoGs03Address.trim() || null,
            send_method_key: customerForm.sendMethod.trim() || null,
            message_release_number: customerForm.messageReleaseNumber.trim() || null,
            x12_line_terminator: customerForm.x12LineTerminator.trim() || null,
        };

        const result = isUpdate
            ? await updateCustomer(selectedCustomerId, payload)
            : await createCustomer(payload);

        if (!result.success) {
            setSaveError(result.error || 'Failed to save customer. Please try again.');
            setLoading(false);
            return;
        }

        await fetchCustomers();
        closeAddCustomerDialog();
        setSuccess(isUpdate ? 'Customer updated successfully!' : 'Customer created successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setLoading(false);
    };

    const handleDeleteCustomer = (customerId) => {
        setConfirmDeleteId(customerId);
    };

    const confirmDelete = async () => {
        const customerId = confirmDeleteId;
        setConfirmDeleteId(null);
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await deleteCustomer(customerId);
        if (result.success) {
            await fetchCustomers();
            setSuccess('Customer deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to delete customer.');
        }

        setLoading(false);
    };

    const InfoDot = () => <span className="customer-info-dot" aria-hidden="true">i</span>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General':
                return (
                    <div className="customer-tab-panel">
                        <div className="customer-grid-two general-compact-grid">
                            <div className="customer-field">
                                <label>Customer Number</label>
                                <input
                                    type="text"
                                    value={customerForm.customerNumber}
                                    onChange={e => handleCustomerFieldChange('customerNumber', e.target.value)}
                                    readOnly={selectedCustomerId !== null}
                                    style={selectedCustomerId !== null ? { backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' } : undefined}
                                />
                                {formErrors.customerNumber && <span style={{ fontSize: '10px', color: '#e53e3e' }}>{formErrors.customerNumber}</span>}
                            </div>
                            <div className="customer-field">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    value={customerForm.customerName}
                                    onChange={e => handleCustomerFieldChange('customerName', e.target.value)}
                                />
                                {formErrors.customerName && <span style={{ fontSize: '10px', color: '#e53e3e' }}>{formErrors.customerName}</span>}
                            </div>

                            <div className="customer-field">
                                <label>External Reference</label>
                                <input type="text" value={customerForm.externalReference} onChange={e => handleCustomerFieldChange('externalReference', e.target.value)} />
                            </div>
                            <div className="customer-field">
                                <label>ABN</label>
                                <input
                                    type="text"
                                    value={customerForm.abn}
                                    onChange={e => handleCustomerFieldChange('abn', e.target.value)}
                                />
                                {formErrors.abn && <span style={{ fontSize: '10px', color: '#e53e3e' }}>{formErrors.abn}</span>}
                            </div>

                            <div className="customer-field">
                                <label>Order No Recycle Days</label>
                                <input type="text" value={customerForm.orderNoRecycleDays} onChange={e => handleCustomerFieldChange('orderNoRecycleDays', e.target.value)} />
                            </div>
                            <div className="customer-field">
                                <label>
                                    Shipment Days <InfoDot />
                                </label>
                                <input
                                    type="text"
                                    value={customerForm.shipmentDays}
                                    onChange={e => handleCustomerFieldChange('shipmentDays', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="customer-inline-line due-date-inline-row">
                            <label>Don't Cancel Order After Due Date For</label>
                            <input type="text" value={customerForm.cancelOrderDays} onChange={e => handleCustomerFieldChange('cancelOrderDays', e.target.value)} className="small-inline-input due-date-days-input" />
                            <span>Days</span>
                        </div>

                        <div className="customer-inline-line">
                            <label>GTIN Interpretation Method</label>
                            <select defaultValue="Default" className="inline-select">
                                <option>Default</option>
                                <option>Strict</option>
                            </select>
                        </div>

                        <div className="customer-inline-line">
                            <label>Retailer Customisation Format</label>
                            <select defaultValue="Aldi South Group" className="inline-select">
                                <option>Aldi South Group</option>
                                <option>Default</option>
                            </select>
                        </div>

                        <div className="customer-inline-line">
                            <label className="customer-checkline">
                                <input type="checkbox" defaultChecked />
                                Allow Sharing Product Retailer Values
                            </label>
                            <select defaultValue="The same retailer" className="inline-select">
                                <option>The same retailer</option>
                                <option>Across all retailers</option>
                            </select>
                        </div>

                        <div className="customer-validation-group">
                            <label className="customer-checkline customer-validation-title">
                                <input type="checkbox" defaultChecked />
                                Perform Product Retailer Validation with
                            </label>
                            <div className="customer-validation-options">
                                <label className="customer-checkline">
                                    <input type="checkbox" /> Trade Unit Validation <InfoDot />
                                </label>
                                <label className="customer-checkline">
                                    <input type="checkbox" /> Pack Size Validation <InfoDot />
                                </label>
                                <label className="customer-checkline">
                                    <input type="checkbox" /> Pallet Validation <InfoDot />
                                </label>
                            </div>
                        </div>

                        <div className="customer-grid-two checks-grid">
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Allow Change Order Details</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Hand Pick</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Back Order</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Virtual Pick</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Allow Delivery Dates Change</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Over Pick</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Allow Part Shipment</label>
                            <label className="customer-checkline"><input type="checkbox" /> Force Prices to 1</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Over Shipment</label>
                            <label className="customer-checkline"><input type="checkbox" /> Price with Tax in ANSI Orders</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Allow Reject Whole Order</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Repetitive NAD Segments</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Allowances and Charges <InfoDot /></label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Auto Create RatioPack</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Change Pack Size</label>
                        </div>
                    </div>
                );
            case 'EDI':
                return (
                    <div className="customer-tab-panel edi-tab-panel">
                        <div className="customer-grid-two">
                            <div className="customer-field">
                                <label>EDI Address</label>
                                <input
                                    type="text"
                                    value={customerForm.ediAddress}
                                    onChange={e => handleCustomerFieldChange('ediAddress', e.target.value)}
                                />
                            </div>
                            <div className="customer-field"><label>Incoming GS02 Address</label><input type="text" value={customerForm.gs02Address} onChange={e => handleCustomerFieldChange('gs02Address', e.target.value)} /></div>
                            <div className="customer-field"><label>GS03 Address</label><input type="text" value={customerForm.gs03Address} onChange={e => handleCustomerFieldChange('gs03Address', e.target.value)} /></div>
                            <div className="customer-field"><label>RPO GS03 Address</label><input type="text" value={customerForm.rpoGs03Address} onChange={e => handleCustomerFieldChange('rpoGs03Address', e.target.value)} /></div>
                            <div className="customer-field"><label>Send Method</label><input type="text" value={customerForm.sendMethod} onChange={e => handleCustomerFieldChange('sendMethod', e.target.value)} /></div>
                            <div className="customer-field"><label>Message Release Number</label><input type="text" value={customerForm.messageReleaseNumber} onChange={e => handleCustomerFieldChange('messageReleaseNumber', e.target.value)} /></div>
                            <div className="customer-field"><label>X12 Line Terminator (if non-standard)</label><input type="text" value={customerForm.x12LineTerminator} onChange={e => handleCustomerFieldChange('x12LineTerminator', e.target.value)} /></div>
                        </div>

                        <div className="customer-block-title">Order Change before Picking</div>
                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" /> User Must Accept Order Change</label>
                            <label className="customer-checkline"><input type="checkbox" /> Order Change is Whole Order</label>
                            <label className="customer-checkline"><input type="checkbox" /> Delivery Location Value 'DTS' Makes the Order Direct to Store</label>
                            <label className="customer-checkline"><input type="checkbox" /> Price in Order Includes Tax</label>
                        </div>

                        <div className="customer-block-title">Order Change after Picking</div>
                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Allow Updated PO Import</label>
                        </div>
                    </div>
                );
            case 'Prices':
                return (
                    <div className="customer-tab-panel">
                        <label className="customer-checkline"><input type="checkbox" /> Select Price Groups as per the Locations</label>
                        <div className="customer-hint">Hint: Go to Customer {'>'} Show Locations</div>

                        <div className="customer-field"><label>Contract Price Group</label><select defaultValue="<none>"><option>&lt;none&gt;</option></select></div>
                        <div className="customer-field"><label>Promo Price Group</label><select defaultValue=""><option></option></select></div>

                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Check Order Prices</label>
                            <label className="customer-checkline"><input type="checkbox" /> Check Tax Rates <InfoDot /></label>
                            <label className="customer-checkline"><input type="checkbox" /> Do Not Validate Tax <InfoDot /></label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Edit Cost Price</label>
                            <label className="customer-checkline"><input type="checkbox" /> Edit Tax Rate</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Import Price Details from Price Table</label>
                        </div>

                        <div className="customer-hint">Hint: If price details are not sent by trading partner in the Purchase Order</div>

                        <div className="customer-field"><label>Retail Price Group</label><select defaultValue="<none>"><option>&lt;none&gt;</option></select></div>
                    </div>
                );
            case 'Labels':
                return (
                    <div className="customer-tab-panel">
                        <div className="labels-inline-rows">
                            <div className="labels-inline-row">
                                <label>Shipment Labelling:</label>
                                <select defaultValue="Carton Labelling">
                                    <option>Carton Labelling</option>
                                </select>
                            </div>
                            <div className="labels-inline-row">
                                <label>SCM Label Format:</label>
                                <input type="text" defaultValue="ALDISG-SCMLabel" />
                            </div>
                            <div className="labels-inline-row">
                                <label>Price Label Format:</label>
                                <input type="text" defaultValue="" />
                            </div>
                        </div>

                        <div className="customer-stack-checks labels-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Print Price Labels</label>
                            <label className="customer-checkline indent"><input type="checkbox" /> Blank page between products</label>
                            <label className="customer-checkline indent"><input type="checkbox" /> Print GE Keycode on Price Labels</label>
                            <label className="customer-checkline indent"><input type="checkbox" /> Print Department No on SCM Labels</label>
                            <label className="customer-checkline indent"><input type="checkbox" /> Print QR From Contract No</label>
                        </div>
                    </div>
                );
            case 'RPOs':
                return (
                    <div className="customer-tab-panel rpo-tab-panel">
                        <div className="customer-inline-line rpo-format-row"><label>RPO Format</label><select defaultValue=""><option></option></select></div>
                        <div className="customer-inline-line rpo-range-row">
                            <label>RPO Sequence No Range:</label>
                            <input className="tiny-inline-input" type="text" defaultValue="" />
                            <span>to</span>
                            <input className="tiny-inline-input" type="text" defaultValue="" />
                        </div>

                        <div className="customer-stack-checks rpo-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Aperak Required</label>
                            <label className="customer-checkline"><input type="checkbox" /> Fn Acknowledgment Required</label>
                        </div>
                    </div>
                );
            case 'FA':
                return (
                    <div className="customer-tab-panel">
                        <div className="customer-field narrow"><label>Create FnAcks...</label><select defaultValue=""><option></option></select></div>

                        <div className="customer-block-title">Create FnAcks for...</div>
                        <div className="customer-stack-checks indented">
                            <label className="customer-checkline"><input type="checkbox" /> Direct to Store orders</label>
                            <label className="customer-checkline"><input type="checkbox" /> Distribution Centre orders</label>
                            <label className="customer-checkline"><input type="checkbox" /> Cross Dock orders</label>
                        </div>

                        <div className="customer-field narrow"><label>FnAcks Format</label><select defaultValue=""><option></option></select></div>
                    </div>
                );
            case 'POAs':
                return (
                    <div className="customer-tab-panel">
                        <div className="customer-field narrow"><label>Create Prod POAs</label><select defaultValue="Never"><option>Never</option></select></div>
                        <div className="customer-field narrow"><label>Create Test POAs</label><select defaultValue="Never"><option>Never</option></select></div>
                        <div className="customer-field narrow"><label>POA Format</label><select defaultValue="<not defined>"><option>&lt;not defined&gt;</option></select></div>

                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Automatically Generate POA</label>
                            <label className="customer-checkline"><input type="checkbox" /> Comments required when changing order</label>
                            <label className="customer-checkline"><input type="checkbox" /> Comments required when rejecting order</label>
                            <label className="customer-checkline"><input type="checkbox" /> Block changes to order after sending POA</label>
                            <label className="customer-checkline"><input type="checkbox" /> Fn Acknowledgment Required</label>
                            <label className="customer-checkline"><input type="checkbox" /> Aperak Required</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Delivery Dates Change at Line Level</label>
                        </div>
                    </div>
                );
            case 'ASNs':
                return (
                    <div className="customer-tab-panel">
                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Create ASN for Production Order</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Create ASN for Test Order</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Allow Distribution Centre ASN</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Cross Dock ASN</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Direct To Store ASN</label>
                            <label className="customer-checkline indent"><input type="checkbox" /> Generate multiple ASN numbers for DTS orders</label>
                            <label className="customer-checkline"><input type="checkbox" /> Fn Acknowledgment Required</label>
                        </div>

                        <div className="customer-field narrow"><label>ASN Format</label><select defaultValue="Aldi South Group DesAdv"><option>Aldi South Group DesAdv</option></select></div>

                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Aperak Required</label>
                            <label className="customer-checkline"><input type="checkbox" /> User Supplied Shipment No</label>
                            <label className="customer-checkline"><input type="checkbox" /> Include Product Gross Weight</label>
                        </div>
                    </div>
                );
            case 'Invoice':
                return (
                    <div className="customer-tab-panel invoice-tab-panel">
                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Consolidate Invoice details for split orders</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Allow Distribution Centre Invoice</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Cross Dock Invoice</label>
                            <label className="customer-checkline"><input type="checkbox" /> Allow Direct to Store Invoice</label>
                            <label className="customer-checkline indent"><input type="checkbox" /> Generate multiple Invoice numbers for DTS orders</label>
                            <label className="customer-checkline"><input type="checkbox" defaultChecked /> Allow Credit Note <InfoDot /></label>
                            <label className="customer-checkline"><input type="checkbox" /> Aperak Required</label>
                            <label className="customer-checkline"><input type="checkbox" /> Fn Acknowledgment Required</label>
                        </div>

                        <div className="customer-grid-two">
                            <div className="customer-field"><label>Invoice Format</label><select defaultValue="ALDI South Group Invoice"><option>ALDI South Group Invoice</option></select></div>
                            <div className="customer-field"><label>Debtor's Account Number</label><input type="text" defaultValue="" /></div>
                            <div className="customer-field inline-split">
                                <label>Payment Due (Days)</label>
                                <input type="text" defaultValue="" className="tiny-inline-input" />
                            </div>
                            <div className="customer-field invoice-option-group">
                                <label className="customer-checkline"><input type="checkbox" /> Allow Discounts</label>
                                <div className="customer-radio-row invoice-radio-group">
                                    <label><input type="radio" name="discountMode" /> As Percentage</label>
                                    <label><input type="radio" name="discountMode" defaultChecked /> As Amount</label>
                                </div>
                            </div>
                            <div className="customer-stack-checks compact">
                                <label className="customer-checkline"><input type="checkbox" /> Generate Invoice on Order Completion</label>
                                <label className="customer-checkline"><input type="checkbox" defaultChecked /> Invoice Payment Terms</label>
                                <label className="customer-checkline"><input type="checkbox" /> Invoice Payment Allowances and Charges</label>
                            </div>
                            <div className="customer-field invoice-option-group">
                                <label className="customer-checkline"><input type="checkbox" /> Allow Surcharges</label>
                                <div className="customer-radio-row invoice-radio-group">
                                    <label><input type="radio" name="surchargeMode" /> As Percentage</label>
                                    <label><input type="radio" name="surchargeMode" defaultChecked /> As Amount</label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Track Usage':
                return (
                    <div className="customer-tab-panel">
                        <div className="customer-stack-checks">
                            <label className="customer-checkline"><input type="checkbox" /> Track number of POs imported in a day</label>
                            <label className="customer-checkline"><input type="checkbox" /> Track number of POAs sent in a day</label>
                            <label className="customer-checkline"><input type="checkbox" /> Track number of ASNs sent in a day</label>
                            <label className="customer-checkline"><input type="checkbox" /> Track number of Invoice sent in a day</label>
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
                    <h1>👥 Customer Table</h1>
                </div>
                <div className="content-area">
                    {loading && <div className="upload-message upload-info">Loading customers...</div>}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="upload-message upload-success">{success}</div>}
                    {customerEntries.length > 0 ? (
                        <>
                            <div className="customers-header">
                                <div className="customers-header-left">
                                    <span className="customer-count">
                                        Total Customers: <strong>{customerEntries.length}</strong>
                                    </span>
                                </div>
                                <div className="customers-header-right">
                                    <button
                                        className="add-customer-button split-olive-button"
                                        onClick={handleAddCustomer}
                                    >
                                        <span className="split-olive-button-text">Add Customer</span>
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
                                            <th>Customer No.</th>
                                            <th>Customer Name</th>
                                            <th>EDI Address</th>
                                            <th>ABN</th>
                                            <th>Shipment Days</th>
                                            <th>Contract Price Group</th>
                                            <th>Shipment Labelling</th>
                                            <th style={{ textAlign: 'left', width: '90px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerEntries.map((entry, index) => (
                                            <tr key={entry.id || `${entry.customerNumber}-${index}`} onClick={() => handleRowClick(entry)} style={{ cursor: 'pointer' }}>
                                                <td>{entry.customerNumber}</td>
                                                <td>{entry.customerName}</td>
                                                <td>{entry.ediAddress}</td>
                                                <td>{entry.abn}</td>
                                                <td>{entry.shipmentDays}</td>
                                                <td>{entry.contractPriceGroup}</td>
                                                <td>{entry.shipmentLabelling}</td>
                                                <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right', width: '90px' }}>
                                                    <button className="delete-button split-olive-button" onClick={() => handleDeleteCustomer(entry.id)}>
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
                            <h3>Add Customer Manually</h3>
                            <button
                                className="add-customer-button split-olive-button"
                                onClick={handleAddCustomer}
                            >
                                <span className="split-olive-button-text">Add Customer</span>
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

            {showAddCustomerDialog && (
                <div className="modal-overlay">
                    <div className="config-dialog customer-config-dialog">
                        <div className="config-dialog-header">
                            <div>
                                <h1>{selectedCustomerId !== null ? 'Edit Customer' : 'Add Customer'}</h1>
                                <div className="dialog-tabs">
                                    {customerTabs.map(tab => (
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
                                onClick={closeAddCustomerDialog}
                                aria-label="Close add customer dialog"
                            >
                                ×
                            </button>
                        </div>

                        <div className="config-dialog-body">
                            {saveError && <div className="upload-message upload-error">{saveError}</div>}
                            <div className="tab-content">
                                {renderTabContent()}
                            </div>
                        </div>

                        <div className="config-dialog-footer">
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
                                <button type="button" className="config-action-button" onClick={closeAddCustomerDialog}>
                                    <span className="config-action-button-text">Cancel</span>
                                    <span className="config-action-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button type="button" className="config-action-button" onClick={handleUpdateCustomer} disabled={loading}>
                                    <span className="config-action-button-text">{selectedCustomerId !== null ? 'Update' : 'Create'}</span>
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

            {confirmDeleteId !== null && (
                <div className="modal-overlay">
                    <div className="confirm-delete-dialog">
                        <h3>Delete Customer</h3>
                        <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
                        <div className="confirm-delete-actions">
                            <button type="button" className="split-olive-button confirm-cancel-button" onClick={() => setConfirmDeleteId(null)}>
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

export default CustomerTablePage;
