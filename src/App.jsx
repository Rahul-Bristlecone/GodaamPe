import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PickPage from './pages/PickPage';
import ConfigManagerPage from './pages/ConfigManagerPage';
import SalesManagerPage from './pages/SalesManagerPage';
import ProductTablePage from './pages/ProductTablePage';
import CompanyTablePage from './pages/CompanyTablePage';
import CustomerTablePage from './pages/CustomerTablePage';
import LocationsTablePage from './pages/LocationsTablePage';
import PriceListPage from './pages/PriceListPage';
import AliasManagerPage from './pages/AliasManagerPage';
import LogDisplayPage from './pages/LogDisplayPage';
import StockPage from './pages/StockPage';
import ReportViewerPage from './pages/ReportViewerPage';
import { logout } from './utils/authService';
import './styles/App.css';

const CURRENT_PAGE_KEY = 'currentPage';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Check if auth token exists in localStorage to determine initial login state
        return !!localStorage.getItem('authToken');
    });
    const [loggedInUser, setLoggedInUser] = useState(() => {
        // Get username from localStorage if available
        return localStorage.getItem('username') || '';
    });
    const [authView, setAuthView] = useState('login');
    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem(CURRENT_PAGE_KEY) || 'dashboard';
    });
    const [showConfigModal, setShowConfigModal] = useState(false);

    const handleLoginSuccess = (username) => {
        setLoggedInUser(username);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
        localStorage.setItem(CURRENT_PAGE_KEY, 'dashboard');
        setAuthView('login');
    };

    const handleLogout = async () => {
        // Call backend logout endpoint and clear auth data
        await logout();
        
        // Clear app state
        setIsLoggedIn(false);
        setLoggedInUser('');
        setCurrentPage('dashboard');
        localStorage.removeItem(CURRENT_PAGE_KEY);
        setAuthView('login');
    };

    const handleNavigate = (pageName) => {
        if (pageName === 'Config Manager') {
            setShowConfigModal(true);
        } else {
            setCurrentPage(pageName);
            localStorage.setItem(CURRENT_PAGE_KEY, pageName);
        }
    };

    const handleCloseConfigModal = () => {
        setShowConfigModal(false);
    };

    const handleBackToDashboard = () => {
        setCurrentPage('dashboard');
        localStorage.setItem(CURRENT_PAGE_KEY, 'dashboard');
    };

    const renderPage = () => {
        const pageProps = {
            username: loggedInUser,
            onLogout: handleLogout,
            onBack: handleBackToDashboard
        };

        switch (currentPage) {
            case 'dashboard':
                return (
                    <>
                        <DashboardPage username={loggedInUser} onLogout={handleLogout} onNavigate={handleNavigate} />
                        {showConfigModal && (
                            <ConfigManagerPage
                                onClose={handleCloseConfigModal}
                            />
                        )}
                    </>
                );
            case 'ABS Pick':
                return <PickPage {...pageProps} />;
            case 'Sales Manager':
                return <SalesManagerPage {...pageProps} />;
            case 'Product Table':
                return <ProductTablePage {...pageProps} />;
            case 'Company Table':
                return <CompanyTablePage {...pageProps} />;
            case 'Customer Table':
                return <CustomerTablePage {...pageProps} />;
            case 'Locations Table':
                return <LocationsTablePage {...pageProps} />;
            case 'ABS Price list':
                return <PriceListPage {...pageProps} />;
            case 'ABS Alias manager':
                return <AliasManagerPage {...pageProps} />;
            case 'ABS Log display':
                return <LogDisplayPage {...pageProps} />;
            case 'ABS Stock':
                return <StockPage {...pageProps} />;
            case 'ABS Report viewer':
                return <ReportViewerPage {...pageProps} />;
            default:
                return <DashboardPage username={loggedInUser} onLogout={handleLogout} onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="app">
            {!isLoggedIn ? (
                authView === 'register' ? (
                    <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
                ) : (
                    <LoginPage
                        onLoginSuccess={handleLoginSuccess}
                        onNavigateToRegister={() => setAuthView('register')}
                    />
                )
            ) : (
                renderPage()
            )}
        </div>
    );
}

export default App;