import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';

export default function BuyerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matchCount, setMatchCount] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('matches').json();
        setMatchCount(res.count ?? 0);
      } catch {
        setMatchCount(0);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const displayName = user?.email ? user.email.split('@')[0] : 'Usuario';
  const isSeller = user?.role === 'seller';

  return (
    <>
      <header className="feed-top-nav" style={{ paddingBottom: '1rem', justifyContent: 'center' }}>
        <h1 className="feed-header-title" style={{ fontSize: '1.5rem', fontFamily: 'Inter', fontWeight: 700 }}>Perfil</h1>
      </header>

      <main className="feed-main-area" style={{ alignItems: 'stretch', marginTop: 0, padding: '1.5rem', overflowY: 'auto' }}>

        <div className="profile-user-info">
          <div className="profile-avatar-large">
            {user?.email?.substring(0, 1).toUpperCase() || 'U'}
          </div>
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-email">{user?.email || 'usuario@ejemplo.com'}</p>
          {user?.role && (
            <span className={isSeller ? 'seller-role-tag' : 'buyer-role-tag'}>
              {isSeller ? '🚗 Vendedor' : '🔍 Comprador'}
            </span>
          )}
        </div>

        <div className="profile-stats-row">
          <div className="profile-stat-box">
            <span className="profile-stat-number">
              {matchCount !== null ? matchCount : '—'}
            </span>
            <span className="profile-stat-label">Matches</span>
          </div>
        </div>

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
    </>
  );
}
