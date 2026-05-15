import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <button 
        className={`bottom-nav-item ${isActive('/buyer/feed') ? 'active' : ''}`}
        onClick={() => navigate('/buyer/feed')}
      >
        <span className="bottom-nav-icon">🔥</span>
        <span className="bottom-nav-label">Descubrir</span>
      </button>
      <button 
        className={`bottom-nav-item ${isActive('/buyer/matches') ? 'active' : ''}`}
        onClick={() => navigate('/buyer/matches')}
      >
        <span className="bottom-nav-icon">💬</span>
        <span className="bottom-nav-badge">2</span>
        <span className="bottom-nav-label">Matches</span>
      </button>
      <button 
        className={`bottom-nav-item ${isActive('/buyer/profile') ? 'active' : ''}`}
        onClick={() => navigate('/buyer/profile')}
      >
        <span className="bottom-nav-icon">👤</span>
        <span className="bottom-nav-label">Perfil</span>
      </button>
    </nav>
  );
}
