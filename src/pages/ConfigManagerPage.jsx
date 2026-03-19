import Header from '../components/Header';
import '../styles/SubPage.css';

function ConfigManagerPage({ username, onLogout, onBack }) {
    return (
        <div className="page-container">
            <Header username={username} onLogout={onLogout} onDashboard={onBack} />
            <div className="page-content">
                <div className="page-header">
                    <button onClick={onBack} className="back-button">← Back to Dashboard</button>
                    <h1>⚙️ Config Manager</h1>
                </div>
                <div className="content-area">
                    <p>Configuration management content will go here.</p>
                </div>
            </div>
        </div>
    );
}

export default ConfigManagerPage;
