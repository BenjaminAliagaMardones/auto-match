import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function BuyerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="feed-page">
      <div className="feed-mobile-container">
        
        {/* Top Navigation */}
        <header className="feed-top-nav" style={{ paddingBottom: '1rem', justifyContent: 'center' }}>
          <h1 className="feed-header-title" style={{ fontSize: '1.5rem', fontFamily: 'Inter', fontWeight: 700 }}>Perfil</h1>
        </header>

        <main className="feed-main-area" style={{ alignItems: 'stretch', marginTop: 0, padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* User Info */}
          <div className="profile-user-info">
            <div className="profile-avatar-large">
              {user?.email?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <h2 className="profile-name">Usuario AutoMatch</h2>
            <p className="profile-email">{user?.email || 'usuario@ejemplo.com'}</p>
          </div>

          {/* Stats Row */}
          <div className="profile-stats-row">
            <div className="profile-stat-box">
              <span className="profile-stat-number">12</span>
              <span className="profile-stat-label">Matches</span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-number">145</span>
              <span className="profile-stat-label">Vistos</span>
            </div>
          </div>

          {/* Settings List */}
          <div className="profile-settings-list">
            <button className="profile-setting-item">
              <div className="profile-setting-icon">⚙️</div>
              <div className="profile-setting-text">Ajustes de cuenta</div>
              <div className="profile-setting-arrow">›</div>
            </button>
            <button className="profile-setting-item">
              <div className="profile-setting-icon">🔍</div>
              <div className="profile-setting-text">Preferencias de búsqueda</div>
              <div className="profile-setting-arrow">›</div>
            </button>
            <button className="profile-setting-item">
              <div className="profile-setting-icon">🔔</div>
              <div className="profile-setting-text">Notificaciones</div>
              <div className="profile-setting-arrow">›</div>
            </button>
            <button className="profile-setting-item">
              <div className="profile-setting-icon">❓</div>
              <div className="profile-setting-text">Ayuda y soporte</div>
              <div className="profile-setting-arrow">›</div>
            </button>
          </div>

          <button className="profile-logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>

        </main>

        <BottomNav />
      </div>
    </div>
  );
}
