import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/PickPage.css';

const REPORT_VIEWER_CONTEXT_KEY = 'reportViewerContext';

function ReportViewerPage({ username, onLogout, onBack }) {
    const reportContext = (() => {
        try {
            const rawValue = localStorage.getItem(REPORT_VIEWER_CONTEXT_KEY);
            return rawValue ? JSON.parse(rawValue) : null;
        } catch (error) {
            console.warn('Unable to read report viewer context:', error);
            return null;
        }
    })();

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
                    <h1>📈 ABS Report viewer</h1>
                </div>
                <div className="content-area">
                    {reportContext?.reportType === 'Delivery Docket' ? (
                        <div className="order-form-section">
                            <div className="order-form-section-title">Delivery Docket Report</div>
                            <div className="order-insight-grid">
                                <div className="order-insight-row"><strong>Order number:</strong> {reportContext.orderNumber}</div>
                                <div className="order-insight-row"><strong>Order ID:</strong> {reportContext.orderId || '-'}</div>
                                <div className="order-insight-row"><strong>Customer:</strong> {reportContext.customer}</div>
                                <div className="order-insight-row"><strong>Company:</strong> {reportContext.company}</div>
                                <div className="order-insight-row"><strong>Store name:</strong> {reportContext.storeName}</div>
                                <div className="order-insight-row"><strong>Status:</strong> {reportContext.status}</div>
                            </div>
                        </div>
                    ) : (
                        <p>Report viewer content will go here.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportViewerPage;
