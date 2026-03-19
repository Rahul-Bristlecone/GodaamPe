import { useState } from 'react';
import LoginPage from './pages/LoginPage';
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

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Check if auth token exists in localStorage to determine initial login state
        return !!localStorage.getItem('authToken');
    });
    const [loggedInUser, setLoggedInUser] = useState(() => {
        // Get username from localStorage if available
        return localStorage.getItem('username') || '';
    });
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleLoginSuccess = (username) => {
        setLoggedInUser(username);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
    };

    const handleLogout = async () => {
        // Call backend logout endpoint and clear auth data
        await logout();
        
        // Clear app state
        setIsLoggedIn(false);
        setLoggedInUser('');
        setCurrentPage('dashboard');
    };

    const handleNavigate = (pageName) => {
        setCurrentPage(pageName);
    };

    const handleBackToDashboard = () => {
        setCurrentPage('dashboard');
    };

    const renderPage = () => {
        const pageProps = {
            username: loggedInUser,
            onLogout: handleLogout,
            onBack: handleBackToDashboard
        };

        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage username={loggedInUser} onLogout={handleLogout} onNavigate={handleNavigate} />;
            case 'ABS Pick':
                return <PickPage {...pageProps} />;
            case 'Config Manager':
                return <ConfigManagerPage {...pageProps} />;
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
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
                renderPage()
            )}
        </div>
    );
}

export default App;