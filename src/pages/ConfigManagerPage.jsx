import Header from '../components/Header';
import { useState } from 'react';
import '../styles/SubPage.css';

function ConfigManagerPage({ onClose }) {
    const [activeTab, setActiveTab] = useState('General');

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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General':
                return (
                    <div className="tab-panel compact">
                        <div className="allow-pick-section">
                            <div className="form-row-compact">
                                <label className="inline-label">Allow Pick</label>
                                <input type="number" className="compact-input" placeholder="0" />
                                <span className="compact-text">days before NotBefore date</span>
                            </div>
                            <div className="form-row-compact or-row">
                                <span className="compact-text or-text">or</span>
                                <input type="number" className="compact-input" placeholder="0" />
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
                                <input type="checkbox" style={{ marginRight: '4px' }} />
                                Display Rack Location On Pdt
                            </label>
                        </div>
                        <div className="separator" style={{ margin: '2px 0 0px 0' }}></div>
                        
                        <div style={{ marginTop: '0px', marginBottom: '1px' }}>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '1px', fontSize: '15px' }}>Portable Data Terminal:</label>
                            <div className="form-row" style={{ marginBottom: '0' }}>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>ComPort</label>
                                    <select style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
                                        <option>&lt;none&gt;</option>
                                        <option>COM1</option>
                                        <option>COM2</option>
                                        <option>COM3</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>Speed:</label>
                                    <input type="number" defaultValue="19200" style={{ width: '100%', padding: '2px', fontSize: '11px' }} />
                                </div>
                            </div>
                        </div>
                        <div className="separator" style={{ margin: '2px 0 0px 0' }}></div>
                        
                        <div style={{ marginTop: '0px', marginBottom: '1px' }}>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '1px', fontSize: '15px' }}>Label Printer:</label>
                            <div style={{ marginBottom: '1px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0', fontSize: '13px', fontWeight: '500' }}>
                                    <input type="checkbox" defaultChecked style={{ marginRight: '4px' }} />
                                    Print labels as Microsoft PDF
                                </label>
                            </div>
                            <div className="form-row" style={{ marginBottom: '1px' }}>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>Printer:</label>
                                    <select style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
                                        <option>Intermec</option>
                                        <option>Datamax</option>
                                        <option>Zebra</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label>ComPort</label>
                                    <select style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
                                        <option>LPT</option>
                                        <option>COM1</option>
                                        <option>COM2</option>
                                        <option>USB</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group full-width" style={{ marginBottom: '0' }}>
                                <label>Name</label>
                                <select style={{ width: '100%', padding: '2px', fontSize: '11px' }}>
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
                                    <input type="number" defaultValue="8443" style={{ width: '100%', padding: '2px', fontSize: '11px' }} />
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
                                { label: 'Default SCM Label Format:', value: 'SCMLabel' },
                                { label: 'Default Price Label Format:', value: 'PriceLabel' },
                                { label: 'Ctn Seq Label Format:', value: 'ctnseqlabel' },
                                { label: 'RatioPack Label Format:', value: '' },
                                { label: 'TradeUnit Label Format:', value: 'TUNLabel' },
                                { label: 'Big TradeUnit Label Format:', value: '' },
                                { label: 'Bulk Pallet Label Format:', value: 'BulkLabel' },
                                { label: 'Produce Order Label Format:', value: '' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', marginBottom: '1px', gap: '6px' }}>
                                    <label style={{ width: '42%', marginBottom: '0', whiteSpace: 'nowrap', fontSize: '13px' }}>{label}</label>
                                    <input type="text" defaultValue={value} className="labels-tab-input" style={{ width: '35%', padding: '2px', fontSize: '12px' }} />
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
                            <select style={{ width: '60%', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }}>
                                <option>EDI OUT</option>
                                <option>FTP</option>
                                <option>Email</option>
                            </select>
                        </div>
                        <div className="separator" style={{ margin: '6px 0' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Automatic Imports every</label>
                            <input type="number" defaultValue="15" style={{ width: '60px', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }} />
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
                            <input type="number" defaultValue="4" style={{ width: '60px', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }} />
                        </div>
                    </div>
                );
            case 'New Orders':
                return (
                    <div className="tab-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '4px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>New Order Action:</label>
                            <select style={{ width: '50%', padding: '2px', fontSize: '13px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#f8fafc' }}>
                                <option>Flag Order</option>
                                <option>Auto Accept</option>
                                <option>Hold</option>
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
                        <p className="section-description">Complete order controls and retention.</p>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Show Completed Orders for</label>
                                <input type="number" placeholder="Days" />
                            </div>
                            <div className="form-group">
                                <label>Show Discarded Orders for</label>
                                <input type="number" placeholder="Days" />
                            </div>
                        </div>
                    </div>
                );
            case 'External':
                return (
                    <div className="tab-panel">
                        <p className="section-description">External system interface and access options.</p>
                        <div className="form-group full-width">
                            <label>External Interface URL</label>
                            <input type="text" placeholder="Enter interface endpoint" />
                        </div>
                    </div>
                );
            case 'Shutdown':
                return (
                    <div className="tab-panel">
                        <p className="section-description">Application shutdown and restart behavior.</p>
                        <div className="checkbox-row">
                            <label><input type="checkbox" /> Allow Shutdown from workstation</label>
                            <label><input type="checkbox" /> Prompt before shutdown</label>
                        </div>
                    </div>
                );
            default:
                return <div>Select a tab to view configuration options.</div>;
        }
    };

    return (
        <div className="modal-overlay">
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
                        <button type="button" className="config-action-button">
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
    );
}

export default ConfigManagerPage;
