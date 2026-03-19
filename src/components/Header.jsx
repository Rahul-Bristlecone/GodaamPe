import '../styles/Header.css';

function Header({ username, onLogout, onDashboard }) {
    return (
        <header className="app-header">
            <div className="header-left">
                <h1 className="app-title" onClick={onDashboard}>ABS Suite</h1>
                <span className="app-subtitle">Advanced Barcoding Solution</span>
            </div>
            <div className="header-right">
                <div className="user-info">
                    <span className="user-icon">👤</span>
                    <span className="username-display">{username}</span>
                </div>
                <button onClick={onLogout} className="logout-button">
                    <span className="logout-icon">🚪</span>
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;
