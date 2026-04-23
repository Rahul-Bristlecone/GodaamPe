import Header from '../components/Header';
import '../styles/DashboardPage.css';

function DashboardPage({ onLogout, username, onNavigate }) {
    const handleCardClick = (cardName) => {
        console.log(`${cardName} card clicked`);
        onNavigate(cardName);
    };

    const cards = [
        { id: 0, title: 'ABS Pick', icon: '📋' },
        { id: 1, title: 'Config Manager', icon: '⚙️' },
        { id: 2, title: 'Sales Manager', icon: '💰' },
        { id: 3, title: 'Product Table', icon: '📦' },
        { id: 4, title: 'Company Table', icon: '🏢' },
        { id: 5, title: 'Customer Table', icon: '👥' },
        { id: 6, title: 'Locations Table', icon: '📍' },
        { id: 7, title: 'ABS Price list', icon: '💵' },
        { id: 8, title: 'ABS Alias manager', icon: '🔖' },
        { id: 9, title: 'ABS Log display', icon: '📋' },
        { id: 10, title: 'ABS Stock', icon: '📊' },
        { id: 11, title: 'ABS Report viewer', icon: '📈' }
    ];

    return (
        <div className="dashboard-container">
            <Header username={username} onLogout={onLogout} onDashboard={() => {}} />
            <div className="dashboard-content">
                <h2 className="welcome-message">
                    Welcome <span className="username-highlight">{username}</span> to the ABS Suite
                </h2>
                <div className="cards-grid">
                    {cards.map(card => (
                        <div 
                            key={card.id} 
                            className="dashboard-card"
                            onClick={() => handleCardClick(card.title)}
                        >
                            <div className="card-icon">{card.icon}</div>
                            <h3 className="card-title">{card.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
