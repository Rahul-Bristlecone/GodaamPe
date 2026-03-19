import { useState } from 'react';
import '../styles/LoginPage.css';

const API_URL = 'http://127.0.0.1:5001';

function LoginPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState('company');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        
        if (!username.trim() || !password) {
            setError('Username and password are required');
            return;
        }

        setLoading(true);
        try {
            const requestBody = {
                username: username.trim(),
                password: password
            };
            
            console.log('Sending login request to:', `${API_URL}/login`);
            console.log('Request body:', requestBody);

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Content-Type': response.headers.get('Content-Type')
            });

            // Try to parse response even if status is not ok
            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch (parseErr) {
                console.error('Failed to parse response:', parseErr);
                setError('Server returned invalid response');
                setLoading(false);
                return;
            }

            if (response.ok && data.Token) {
                // Store JWT token in localStorage
                localStorage.setItem('authToken', data.Token);
                localStorage.setItem('username', data.username);
                
                onLoginSuccess(data.username);
            } else {
                console.log('Login failed - status:', response.status, 'data:', data);
                setError(data.message || 'Login failed. Invalid credentials.');
            }
        } catch (err) {
            console.error('Login error details:', err);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            setError(`Connection error: ${err.message || 'Unable to connect to server'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setUsername('');
        setPassword('');
        setError('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleLogin();
        }
    };

    const switchLoginType = (type) => {
        setLoginType(type);
        setUsername('');
        setPassword('');
        setError('');
    };

    return (
        <div className="login-container">
            <div className="login-branding">
                <h1 className="brand-title">ABS Suite</h1>
                <p className="brand-subtitle">Advanced Barcoding Solution</p>
            </div>

            <div className="login-wrapper">
                <div className="login-type-tabs">
                    <div 
                        className={`login-tab ${loginType === 'company' ? 'active' : ''}`}
                        onClick={() => switchLoginType('company')}
                    >
                        <span className="tab-icon">🏢</span>
                        <span className="tab-text">Supplier Login</span>
                    </div>
                    <div 
                        className={`login-tab ${loginType === 'support' ? 'active' : ''}`}
                        onClick={() => switchLoginType('support')}
                    >
                        <span className="tab-icon">🛠️</span>
                        <span className="tab-text">Support Login</span>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="login-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    <div className="button-group">
                        <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                        <button onClick={handleLogin} className="login-btn">Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
