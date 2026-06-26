import Header from '../components/Header';
import { useRef, useState, useEffect } from 'react';
import { saveAbsConfiguration, getAbsConfiguration } from '../utils/absConfigService';
import '../styles/SubPage.css';

function ConfigManagerPage({ onClose }) {
    const [activeTab, setActiveTab] = useState('General');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateStatus, setUpdateStatus] = useState('idle');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [tabDrafts, setTabDrafts] = useState({});
    const dialogRef = useRef(null);

    const tabs = [
        'General',
        'PDT / Label Printer',
        'Labels',
        'EDI',
        'Splits',
        'New Orders',
        'Complete Order',
        'External',
        'Shutdown'
    ];

    const ABS_CONFIG_FIELDS = new Set([
        'DAYSBEFORENOTBEFORE', 'DAYSBEFORENOTAFTER', 'ALLOWHANDPICK', 'ALLOWOVERPICK', 'ALLOWPICKBYPRODWOSCAN',
        'THIRDPARTYPACKER', 'INVGENMETHOD', 'HIGHLIGHTDAYS', 'DAYSTOSHOW', 'DAYSTOSHOWDISCARDED',
        'DAYSTOSHOWCANCELLED', 'ALLOWORDERFORWARDING', 'SHOWCOSTPRICE', 'DISPLAYRACKLOCNONPDT', 'PDTCOMPORT',
        'PDTCOMSPEED', 'PRINTASMICROSOFTPDF', 'PRINTERNAME', 'PRINTERCOMPORT', 'LABELPRINTERNAME', 'MC3000PORTNO',
        'SCMLABELFORMAT', 'PRICELABELFORMAT', 'CTNLABELFORMAT', 'RATIOPACKLABELFORMAT', 'TRADEUNITLABELFORMAT',
        'TRADEUNITLABELFORMAT2', 'BULKPALLETLABELFORMAT', 'PRODUCEORDERLABELFORMAT', 'ALLOWTUNPREFIX0AND9',
        'DEFAULTSENDMETHODKEY', 'CHECKEVERYMINUTES', 'ALLOWSPLITBYSTORE', 'MAXIMUMSPLITS', 'NEWORDERACTION',
        'DISPLAYNEWORDERFLAG', 'CLEARNEWORDFLGONCMD', 'CLEARNEWORDFLGONDISP', 'CLEARNEWORDFLGONPRNT',
        'COMPLETEQN1REQ', 'COMPLETEQN2REQ', 'COMPLETEQN3REQ', 'COMPLETEQN4REQ', 'COMPLETEQN5REQ', 'COMPLETEPWREQ',
        'ACCTCONFREQ', 'ALLOWACCTORDVALIDATION', 'EXTDLLNAME', 'AUTOIMPORTEXTORD', 'BACKUPAFTERSHUTDOWN',
        'BACKUPCOMMAND', 'BACKUPPROGRAM'
    ]);

    const DIRECT_KEY_MAP = {
        orderConfirmation: 'ACCTCONFREQ',
        allowValidation: 'ALLOWACCTORDVALIDATION',
        autoImport: 'AUTOIMPORTEXTORD',
        backupAfterShutdown: 'BACKUPAFTERSHUTDOWN'
    };

    const LABEL_KEY_MAP = {
        'allow pick': 'DAYSBEFORENOTBEFORE',
        'highlight for': 'HIGHLIGHTDAYS',
        'show completed orders for': 'DAYSTOSHOW',
        'show discarded orders up to': 'DAYSTOSHOWDISCARDED',
        'show cancelled orders up to': 'DAYSTOSHOWCANCELLED',
        'allow hand pick': 'ALLOWHANDPICK',
        'allow over pick': 'ALLOWOVERPICK',
        'allow virtual pick': 'ALLOWPICKBYPRODWOSCAN',
        'third party packer': 'THIRDPARTYPACKER',
        'invoice number generation method': 'INVGENMETHOD',
        'allow order forwarding': 'ALLOWORDERFORWARDING',
        'show wholesale price': 'SHOWCOSTPRICE',
        'display rack location on pdt': 'DISPLAYRACKLOCNONPDT',
        'speed': 'PDTCOMSPEED',
        'mc scanner port no': 'MC3000PORTNO',
        'default sendmethod': 'DEFAULTSENDMETHODKEY',
        'automatic imports every': 'CHECKEVERYMINUTES',
        'allow split by store': 'ALLOWSPLITBYSTORE',
        'maximum splits per order': 'MAXIMUMSPLITS',
        'new order action': 'NEWORDERACTION',
        'display new order flag': 'DISPLAYNEWORDERFLAG',
        'clear new order flag on display': 'CLEARNEWORDFLGONDISP',
        'clear new order flag on print': 'CLEARNEWORDFLGONPRNT',
        'clear new order flag on command': 'CLEARNEWORDFLGONCMD',
        'ask question 1': 'COMPLETEQN1REQ',
        'ask question 2': 'COMPLETEQN2REQ',
        'ask question 3': 'COMPLETEQN3REQ',
        'ask question 4': 'COMPLETEQN4REQ',
        'ask question 5': 'COMPLETEQN5REQ',
        'level 3 password req': 'COMPLETEPWREQ',
        'order confirmation required': 'ACCTCONFREQ',
        'allow order validation by acct system': 'ALLOWACCTORDVALIDATION',
        'external system dll name': 'EXTDLLNAME',
        'automatically import from external system': 'AUTOIMPORTEXTORD',
        'backup after shutdown': 'BACKUPAFTERSHUTDOWN',
        'backup program': 'BACKUPPROGRAM',
        'backup command': 'BACKUPCOMMAND'
    };

    const sanitizeAbsConfigPayload = (source) => {
        if (!source || typeof source !== 'object') {
            return {};
        }

        return Object.entries(source).reduce((acc, [key, value]) => {
            if (!ABS_CONFIG_FIELDS.has(key)) {
                return acc;
            }

            if (value === undefined || value === null) {
                return acc;
            }

            if (typeof value === 'string' && value.trim() === '') {
                return acc;
            }

            acc[key] = value;
            return acc;
        }, {});
    };

    // Fetch configuration data on component mount
    useEffect(() => {
        fetchAndLoadConfiguration();
    }, []);

    // Populate form fields when tab changes
    useEffect(() => {
        populateFormFieldsWithData(tabDrafts.__fetched || {});
    }, [activeTab, tabDrafts]);

    const fetchAndLoadConfiguration = async () => {
        const result = await getAbsConfiguration();
        if (result.success && result.data) {
            const fetchedData = Array.isArray(result.data) ? (result.data[0] || {}) : result.data;
            setTabDrafts((prev) => ({
                ...prev,
                __fetched: sanitizeAbsConfigPayload(fetchedData)
            }));
            setUpdateStatus('idle');
            setUpdateMessage('');
        } else {
            const errorMessage = result.error || 'Failed to fetch configuration.';
            console.warn('Failed to fetch ABS configuration:', errorMessage);
            setUpdateStatus('error');
            setUpdateMessage(errorMessage);
            setShowSuccessDialog(false);
        }
    };

    const populateFormFieldsWithData = (data) => {
        if (!data || typeof data !== 'object') {
            return;
        }

        // Wait for DOM to be ready
        setTimeout(() => {
            const fields = dialogRef.current?.querySelectorAll('input, select, textarea');
            if (!fields) {
                return;
            }

            fields.forEach((field, index) => {
                const key = makeFieldKey(field, index);
                if (!key || !ABS_CONFIG_FIELDS.has(key) || !(key in data)) {
                    return;
                }

                const value = data[key];
                if (field.type === 'checkbox') {
                    field.checked = value === 1 || value === true || value === '1';
                } else if (field.type === 'radio') {
                    if (field.value === String(value)) {
                        field.checked = true;
                    }
                } else if (field.tagName === 'SELECT') {
                    field.value = value || '';
                } else {
                    field.value = value || '';
                }
            });
        }, 0);
    };

    const normalizeKey = (value) => (value || '').toString().trim().toLowerCase().replace(/[:\[\]]/g, '').replace(/\s+/g, ' ');

    const makeFieldKey = (element, index) => {
        const directKey = element.name || element.id || element.getAttribute('aria-label');
        if (directKey) {
            const mappedDirect = DIRECT_KEY_MAP[directKey] || directKey.toUpperCase();
            return mappedDirect;
        }

        const labelText = element.closest('label')?.textContent?.trim()
            || element.parentElement?.querySelector('label')?.textContent?.trim()
            || element.placeholder
            || `field_${index + 1}`;

        const normalizedLabel = normalizeKey(labelText);
        if (LABEL_KEY_MAP[normalizedLabel]) {
            return LABEL_KEY_MAP[normalizedLabel];
        }

        return labelText
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    const collectActiveTabValues = () => {
        const container = dialogRef.current?.querySelector('.tab-content');
        if (!container) {
            return {};
        }

        const fields = container.querySelectorAll('input, select, textarea');
        const values = {};

        fields.forEach((field, index) => {
            if (field.disabled) {
                return;
            }

            if (field.type === 'radio' && !field.checked) {
                return;
            }

            const key = makeFieldKey(field, index) || `field_${index + 1}`;
            if (!ABS_CONFIG_FIELDS.has(key)) {
                return;
            }

            if (field.type === 'checkbox') {
                values[key] = field.checked ? 1 : 0;
                return;
            }

            if (field.type === 'number') {
                if (field.value === '') {
                    return;
                }
                values[key] = Number(field.value);
                return;
            }

            if (field.type === 'text' || field.tagName === 'TEXTAREA') {
                if (field.value.trim() === '') {
                    return;
                }
            }

            if (field.tagName === 'SELECT' && field.getAttribute('data-type') === 'number') {
                values[key] = Number(field.value);
                return;
            }

            values[key] = field.value;
        });

        return values;
    };

    const mergeAllTabValues = () => {
        const currentTabValues = collectActiveTabValues();
        const allDrafts = {
            ...tabDrafts,
            [activeTab]: currentTabValues
        };

        const mergedValues = Object.entries(allDrafts)
            .filter(([key, value]) => key === '__fetched' || (value && typeof value === 'object'))
            .map(([, value]) => value)
            .reduce((acc, tabValues) => ({
            ...acc,
            ...tabValues
        }), {});

        return sanitizeAbsConfigPayload(mergedValues);
    };

    const handleTabChange = (nextTab) => {
        const currentTabValues = collectActiveTabValues();
        setTabDrafts((prev) => ({
            ...prev,
            [activeTab]: currentTabValues
        }));
        setActiveTab(nextTab);
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        setUpdateStatus('idle');
        setUpdateMessage('');

        const payload = mergeAllTabValues();

        const result = await saveAbsConfiguration(payload);

        if (result.success) {
            setUpdateStatus('success');
            setUpdateMessage('Configuration settings saved successfully.');
            setShowSuccessDialog(true);
        } else {
            setUpdateStatus('error');
            setUpdateMessage(result.error || 'Failed to save configuration.');
            setShowSuccessDialog(false);
        }

        setIsUpdating(false);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General':
                return (
                    <div className="tab-panel compact">
                        <div className="allow-pick-section">
                            <div className="form-row-compact">
                                <label className="inline-label">Allow Pick</label>
                                <input type="number" name="DAYSBEFORENOTBEFORE" className="compact-input" placeholder="0" />
                                <span className="compact-text">days before NotBefore date</span>
                            </div>
                            <div className="form-row-compact or-row">
                                <span className="compact-text or-text">or</span>
                                <input type="number" name="DAYSBEFORENOTAFTER" className="compact-input" placeholder="0" />
                                <span className="compact-text">days before NotAfter date</span>
                            </div>
                            <span className="note-text">whichever is the earlier, minus deliv days.</span>
                        </div>
                        <div className="form-row-compact">
                            <label className="checkbox-compact"><input type="checkbox" /> Allow hand pick</label>
                            <label className="checkbox-compact"><input type="checkbox" /> Allow Over Pick</label>
                        </div>
                        <div className="form-row-compact">
                            <label className="checkbox-compact"><input type="checkbox" /> Allow Virtual Pick</label>
                            <label className="checkbox-compact"><input type="checkbox" /> Third Party Packer</label>
                        </div>
                        <div className="form-group full-width">
                            <label className="compact-label">Invoice Number Generation Method</label>
                            <select className="compact-select invoice-method-select">
                                <option>ABS Generated</option>
                                <option>User Keyed-in (duplicates not allowed)</option>
                                <option>Import via Account Interface</option>
                            </select>
                        </div>
                        <div className="separator"></div>
                        <div className="form-row-compact">
                            <label className="inline-label">Highlight for</label>
                            <input type="number" className="compact-input" placeholder="0" />
                            <span className="compact-text">days before headline</span>
                        </div>
                        <div className="form-row-compact">
                            <label className="inline-label">Show Completed Orders for</label>
                            <input type="number" className="compact-input" placeholder="0" />
                            <span className="compact-text">days.</span>
                        </div>
                        <div className="form-row-compact">
                            <label className="inline-label">Show Discarded Orders up to</label>
                            <input type="number" className="compact-input" placeholder="0" />
                            <span className="compact-text">days old.</span>
                        </div>
                        <div className="form-row-compact">
                            <label className="inline-label">Show Cancelled Orders up to</label>
                            <input type="number" className="compact-input" placeholder="0" />
                            <span className="compact-text">days old.</span>
                        </div>
                        <div className="form-row-compact">
                            <label className="checkbox-compact"><input type="checkbox" /> Allow Order Forwarding</label>
                            <label className="checkbox-compact"><input type="checkbox" /> Show Wholesale Price</label>
                        </div>
                    </div>
                );
            case 'PDT / Label Printer':
                return (
                    <div className="tab-panel">
                        <div style={{ marginBottom: '0px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0', fontSize: '13px', fontWeight: '500' }}>
                                <input type="checkbox" name="DISPLAYRACKLOCNONPDT" style={{ marginRight: '4px' }} />
                                Display Rack Location On Pdt
                            </label>
                        </div>
                        <div className="separator" style={{ margin: '2px 0 0px 0' }}></div>
                        
                        <div style={{ marginTop: '0px', marginBottom: '1px' }}>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '1px', fontSize: '15px' }}>Portable Data Terminal:</label>
                            <div className="form-row" style={{ marginBottom: '0' }}>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>ComPort</label>
                                        <select name="PDTCOMPORT" style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
                                        <option>&lt;none&gt;</option>
                                        <option>COM1</option>
                                        <option>COM2</option>
                                        <option>COM3</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>Speed:</label>
                                        <input type="number" name="PDTCOMSPEED" defaultValue="19200" style={{ width: '100%', padding: '2px', fontSize: '11px' }} />
                                </div>
                            </div>
                        </div>
                        <div className="separator" style={{ margin: '2px 0 0px 0' }}></div>
                        
                        <div style={{ marginTop: '0px', marginBottom: '1px' }}>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '1px', fontSize: '15px' }}>Label Printer:</label>
                            <div style={{ marginBottom: '1px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0', fontSize: '13px', fontWeight: '500' }}>
                                    <input type="checkbox" name="PRINTASMICROSOFTPDF" defaultChecked style={{ marginRight: '4px' }} />
                                    Print labels as Microsoft PDF
                                </label>
                            </div>
                            <div className="form-row" style={{ marginBottom: '1px' }}>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>Printer:</label>
                                    <select name="PRINTERNAME" style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
                                        <option>Intermec</option>
                                        <option>Datamax</option>
                                        <option>Zebra</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>ComPort</label>
                                    <select name="PRINTERCOMPORT" style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
                                        <option>LPT</option>
                                        <option>COM1</option>
                                        <option>COM2</option>
                                        <option>USB</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group full-width" style={{ marginBottom: '0' }}>
                                <label>Name</label>
                                <select name="LABELPRINTERNAME" style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
                                    <option>Datamax-O'Neil M-4206 Mark II</option>
                                    <option>Intermec ThermaLink</option>
                                    <option>Zebra ZPL</option>
                                </select>
                            </div>
                        </div>
                        <div className="separator" style={{ margin: '2px 0 0px 0' }}></div>
                        
                        <div style={{ marginTop: '0px' }}>
                            <div className="form-row" style={{ marginBottom: '0' }}>
                                <div className="form-group" style={{ marginBottom: '0', width: '50%' }}>
                                    <label>MC Scanner Port No</label>
                                    <input type="text" name="MC3000PORTNO" defaultValue="8443" style={{ width: '100%', padding: '2px', fontSize: '11px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Labels':
                return (
                    <div className="tab-panel">
                        <div style={{ marginBottom: '2px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0', fontSize: '13px' }}>
                                <input type="checkbox" style={{ marginRight: '4px' }} />
                                SCM Preprints Required
                            </label>
                        </div>
                        <div className="separator" style={{ margin: '2px 0 0px 0' }}></div>

                        <div style={{ marginTop: '0px' }}>
                            {[
                                { label: 'Default SCM Label Format:', name: 'SCMLABELFORMAT', value: 'SCMLabel' },
                                { label: 'Default Price Label Format:', name: 'PRICELABELFORMAT', value: 'PriceLabel' },
                                { label: 'Ctn Seq Label Format:', name: 'CTNLABELFORMAT', value: 'ctnseqlabel' },
                                { label: 'RatioPack Label Format:', name: 'RATIOPACKLABELFORMAT', value: '' },
                                { label: 'TradeUnit Label Format:', name: 'TRADEUNITLABELFORMAT', value: 'TUNLabel' },
                                { label: 'Big TradeUnit Label Format:', name: 'TRADEUNITLABELFORMAT2', value: '' },
                                { label: 'Bulk Pallet Label Format:', name: 'BULKPALLETLABELFORMAT', value: 'BulkLabel' },
                                { label: 'Produce Order Label Format:', name: 'PRODUCEORDERLABELFORMAT', value: '' },
                            ].map(({ label, name, value }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', marginBottom: '1px', gap: '6px' }}>
                                    <label style={{ width: '42%', marginBottom: '0', whiteSpace: 'nowrap', fontSize: '13px' }}>{label}</label>
                                    <input type="text" name={name} defaultValue={value} className="labels-tab-input" style={{ width: '35%', padding: '2px', fontSize: '12px' }} />
                                </div>
                            ))}
                        </div>

                        <div className="separator" style={{ margin: '3px 0 2px 0' }}></div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0', fontSize: '13px' }}>
                                <input type="checkbox" defaultChecked style={{ marginRight: '4px' }} />
                                Allow TUN Prefix values 0 and 9
                            </label>
                        </div>
                    </div>
                );
            case 'EDI':
                return (
                    <div className="tab-panel">
                        <div style={{ marginBottom: '6px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>Default SendMethod</label>
                            <select name="DEFAULTSENDMETHODKEY" style={{ width: '60%', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }}>
                                <option value="EDI OUT">EDI OUT</option>
                                <option value="FTP">FTP</option>
                                <option value="EMAIL">Email</option>
                            </select>
                        </div>
                        <div className="separator" style={{ margin: '6px 0' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Automatic Imports every</label>
                            <input type="number" name="CHECKEVERYMINUTES" defaultValue="15" style={{ width: '60px', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }} />
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>minutes.</span>
                        </div>
                    </div>
                );
            case 'Splits':
                return (
                    <div className="tab-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '12px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Allow Split by Store</label>
                            <input type="checkbox" style={{ marginBottom: '0' }} />
                        </div>
                        <div className="separator" style={{ margin: '4px 0 10px 0' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Maximum Splits Per Order:</label>
                            <input type="number" name="MAXIMUMSPLITS" defaultValue="4" style={{ width: '60px', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }} />
                        </div>
                    </div>
                );
            case 'New Orders':
                return (
                    <div className="tab-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '4px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>New Order Action:</label>
                            <select name="NEWORDERACTION" data-type="number" style={{ width: '50%', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }}>
                                <option value="1">Flag Order</option>
                                <option value="2">Auto Accept</option>
                                <option value="3">Hold</option>
                            </select>
                        </div>
                        <div className="separator" style={{ margin: '3px 0' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>Display New Order Flag</label>
                            <input type="checkbox" />
                        </div>
                        <div className="separator" style={{ margin: '2px 0' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>Clear New Order Flag on Display:</label>
                            <input type="checkbox" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>Clear New Order Flag on Print:</label>
                            <input type="checkbox" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>Clear New Order Flag on Command:</label>
                            <input type="checkbox" />
                        </div>
                    </div>
                );
            case 'Complete Order':
                return (
                    <div className="tab-panel">
                        <div style={{ paddingTop: '8px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ marginBottom: '0', fontSize: '13px' }}>Ask Question 1</label>
                                    <input type="checkbox" />
                                </div>
                                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>[Does the number of cartons to dispatch....]</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ marginBottom: '0', fontSize: '13px' }}>Ask Question 2</label>
                                    <input type="checkbox" />
                                </div>
                                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>[Does the carton contents report match...]</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ marginBottom: '0', fontSize: '13px' }}>Ask Question 3</label>
                                    <input type="checkbox" />
                                </div>
                                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>[Are all the prices on the order correct?]</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ marginBottom: '0', fontSize: '13px' }}>Ask Question 4</label>
                                    <input type="checkbox" />
                                </div>
                                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>[Will the goods be delivered on time?]</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ marginBottom: '0', fontSize: '13px' }}>Ask Question 5</label>
                                    <input type="checkbox" />
                                </div>
                                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>[Have other retailer requirements been met?]</span>
                            </div>
                            <div className="separator" style={{ margin: '8px 0' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ marginBottom: '0', fontSize: '13px' }}>Level 3 Password Req:</label>
                                <input type="checkbox" defaultChecked />
                            </div>
                        </div>
                    </div>
                );
            case 'External':
                return (
                    <div className="tab-panel">
                        <div style={{ paddingTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <input type="checkbox" id="orderConfirmation" style={{ marginRight: '8px' }} />
                                <label htmlFor="orderConfirmation" style={{ marginBottom: '0', fontSize: '13px' }}>Order Confirmation Required</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <input type="checkbox" id="allowValidation" defaultChecked style={{ marginRight: '8px' }} />
                                <label htmlFor="allowValidation" style={{ marginBottom: '0', fontSize: '13px' }}>Allow Order Validation by Acct System</label>
                            </div>
                            <div className="separator" style={{ margin: '8px 0' }}></div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>External System DLL name:</label>
                                <input type="text" name="EXTDLLNAME" className="config-text-input" style={{ width: '50%', padding: '6px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', transition: 'all 0.2s ease' }} />
                            </div>
                            <div className="separator" style={{ margin: '8px 0' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                                <input type="checkbox" id="autoImport" defaultChecked style={{ marginRight: '8px' }} />
                                <label htmlFor="autoImport" style={{ marginBottom: '0', fontSize: '13px' }}>Automatically Import from External System</label>
                            </div>
                        </div>
                    </div>
                );
            case 'Shutdown':
                return (
                    <div className="tab-panel">
                        <div style={{ paddingTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <label htmlFor="backupAfterShutdown" style={{ marginBottom: '0', fontSize: '13px', marginRight: '12px' }}>Backup after shutdown</label>
                                <input type="checkbox" id="backupAfterShutdown" style={{ marginBottom: '0' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Backup Program</label>
                                <input
                                    type="text"
                                    name="BACKUPPROGRAM"
                                    className="config-text-input"
                                    style={{ width: '60%', padding: '6px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', transition: 'all 0.2s ease' }}
                                />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Backup Command</label>
                                <input
                                    type="text"
                                    name="BACKUPCOMMAND"
                                    className="config-text-input"
                                    style={{ width: '60%', padding: '6px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', transition: 'all 0.2s ease' }}
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div>Select a tab to view configuration options.</div>;
        }
    };

    return (
        <div className="modal-overlay" ref={dialogRef}>
            <div className="config-dialog abspick-config-dialog">
                <div className="config-dialog-header">
                    <div>
                        <h1>AbsPick Configuration</h1>
                        <p className="dialog-note">Configure AbsPick settings for the application.</p>
                        <div className="dialog-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`dialog-tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => handleTabChange(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={onClose}
                        aria-label="Close configuration dialog"
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
                    {updateStatus === 'error' && updateMessage && (
                        <div className="alert alert-error" style={{ marginBottom: '12px' }}>{updateMessage}</div>
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
                        <button type="button" className="config-action-button" onClick={onClose}>
                            <span className="config-action-button-text">Cancel</span>
                            <span className="config-action-button-icon-wrap" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>
                        <button type="button" className="config-action-button" onClick={handleUpdate} disabled={isUpdating}>
                            <span className="config-action-button-text">{isUpdating ? 'Updating...' : 'Update'}</span>
                            <span className="config-action-button-icon-wrap" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {showSuccessDialog && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Configuration save confirmation"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1200
                    }}
                >
                    <div
                        style={{
                            width: 'min(90vw, 360px)',
                            backgroundColor: '#ffffff',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.2)',
                            padding: '14px 14px 12px'
                        }}
                    >
                        <div style={{ fontSize: '16px', fontWeight: 500, color: '#6d28d9', marginBottom: '8px' }}>
                            Save Complete
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#374151', lineHeight: 1.4 }}>
                            Configuration settings saved successfully.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setShowSuccessDialog(false)}
                                style={{
                                    minWidth: '72px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    border: '1px solid #7e9146',
                                    backgroundColor: '#7e9146',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConfigManagerPage;
