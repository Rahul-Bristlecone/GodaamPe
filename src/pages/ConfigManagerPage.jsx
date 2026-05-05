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
                        <p className="section-description">PDT and label printer settings.</p>
                        <div className="form-group full-width">
                            <label>Printer Device</label>
                            <input type="text" placeholder="Enter printer device" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Port</label>
                                <input type="text" placeholder="COM / USB port" />
                            </div>
                            <div className="form-group">
                                <label>Baud Rate</label>
                                <input type="text" placeholder="Printer baud rate" />
                            </div>
                        </div>
                    </div>
                );
            case 'Labels':
                return (
                    <div className="tab-panel">
                        <p className="section-description">Label formatting and print behavior.</p>
                        <div className="form-group full-width">
                            <label>Label Template</label>
                            <input type="text" placeholder="Selected label template" />
                        </div>
                        <div className="checkbox-row">
                            <label><input type="checkbox" /> Show Wholesale Price</label>
                            <label><input type="checkbox" /> Print on Completion</label>
                        </div>
                    </div>
                );
            case 'EDI':
                return (
                    <div className="tab-panel">
                        <p className="section-description">Electronic data interchange configuration.</p>
                        <div className="form-row">
                            <div className="form-group">
                                <label>EDI Endpoint</label>
                                <input type="text" placeholder="Enter EDI URL" />
                            </div>
                            <div className="form-group">
                                <label>Timeout</label>
                                <input type="number" placeholder="Timeout seconds" />
                            </div>
                        </div>
                    </div>
                );
            case 'Splits':
                return (
                    <div className="tab-panel">
                        <p className="section-description">Split order and picking rules.</p>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Split Threshold</label>
                                <input type="number" placeholder="Enter split threshold" />
                            </div>
                        </div>
                    </div>
                );
            case 'New Orders':
                return (
                    <div className="tab-panel">
                        <p className="section-description">New order loading and validation settings.</p>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Order Import Directory</label>
                                <input type="text" placeholder="Enter import path" />
                            </div>
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
