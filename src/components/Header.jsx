import '../styles/Header.css';
import headerImage from '../assets/header_image_transparent.png';

function Header({ username, onLogout, onDashboard }) {
    return (
        <header className="app-header">
            <div className="header-left" onClick={onDashboard} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDashboard()}>
                <div className="header-logo-block">
                    <img src={headerImage} alt="GodaamPe" className="header-logo" />
                </div>
            </div>
            <div className="header-right">
                <div className="user-info">
                    <span className="user-info-text">
                        <span className="username-display">{username}</span>
                    </span>
                    <span className="user-info-icon-wrap">
                        <span className="user-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </span>
                    </span>
                </div>
                <button onClick={onLogout} className="logout-button">
                    <span className="logout-button-text">Logout</span>
                    <span className="logout-button-icon-wrap">
                        <span className="logout-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="m17 7 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </span>
                </button>
            </div>
        </header>
    );
}

export default Header;
