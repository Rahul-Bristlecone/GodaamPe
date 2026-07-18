import Header from '../components/Header';
import '../styles/SubPage.css';

function PriceListPage({ username, onLogout, onBack }) {
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
                    <h1>💵 GodaamPe Price list</h1>
                </div>
                <div className="content-area">
                    <p>Price list management content will go here.</p>
                </div>
            </div>
        </div>
    );
}

export default PriceListPage;
