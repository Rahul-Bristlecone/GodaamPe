import { useState } from 'react';
import '../styles/LoginPage.css';
import { getUserServiceUrl } from '../utils/apiConfig';
import godaamLogo from '../assets/godaampe_brand_logo.png';

const userServiceUrl = getUserServiceUrl();

const parseResponse = async (response) => {
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();

    return text ? { message: text } : {};
};

function RegisterPage({ onNavigateToLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setError('');
        setSuccess('');
    };

    const handleRegister = async () => {
        setError('');
        setSuccess('');

        if (!username.trim() || !password) {
            setError('Username and password are required');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${userServiceUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                })
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                setError(data.message || 'Registration failed. Please try again.');
                return;
            }

            setSuccess(data.message || 'Account created successfully. You can log in now.');
            setUsername('');
            setPassword('');
        } catch (err) {
            setError(`Connection error: ${err.message || 'Unable to connect to server'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !loading) {
            handleRegister();
        }
    };

    return (
        <div className="login-container">
            <div className="auth-left-panel">
                <div className="login-branding">
                    <img src={godaamLogo} alt="GodaamPe" className="brand-logo" />
                    <div className="brand-tagline-box">India's own Supply Chain Tunnel</div>
                </div>

                <div className="auth-footer auth-footer-left">
                    <a href="/faq" className="auth-footer-link">Help &amp; Support</a>
                    <span className="auth-footer-separator">·</span>
                    <a href="/terms" className="auth-footer-link">Terms of Service</a>
                    <span className="auth-footer-separator">·</span>
                    <a href="/privacy" className="auth-footer-link">Privacy Policy</a>
                </div>
            </div>

            <div className="auth-right-panel">
                <div className="auth-page-actions">
                    <button
                        type="button"
                        className="auth-link-btn"
                        onClick={onNavigateToLogin}
                    >
                        Back to Login
                    </button>
                </div>

                <div className="auth-title-block">
                    <h1 className="auth-title">
                        <span className="auth-title-godaam">Godaam</span>
                        <span className="auth-title-pe">Pe</span>
                    </h1>
                </div>

                <div className="login-wrapper">
                    <div className="login-type-tabs register-type-tabs">
                        <div className="login-tab active register-single-tab">
                            <span className="tab-icon">✨</span>
                            <span className="tab-text">Create Account</span>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="login-form register-form-compact">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(event) => {
                                    setUsername(event.target.value);
                                    setError('');
                                    setSuccess('');
                                }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setError('');
                                    setSuccess('');
                                }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div className="button-group">
                            <button type="button" onClick={resetForm} className="cancel-btn" disabled={loading}>
                                Clear
                            </button>
                            <button type="button" onClick={handleRegister} className="login-btn" disabled={loading}>
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;