import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      <button 
        className={`bottom-nav-item ${isActive('/app/feed') ? 'active' : ''}`}
        onClick={() => navigate('/app/feed')}
      >
        <span className="bottom-nav-icon">🔍</span>
        <span className="bottom-nav-label">Descubrir</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${isActive('/app/listings') ? 'active' : ''}`}
        onClick={() => navigate('/app/listings')}
      >
        <span className="bottom-nav-icon">🚗</span>
        <span className="bottom-nav-label">Mis Autos</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${isActive('/app/matches') ? 'active' : ''}`}
        onClick={() => navigate('/app/matches')}
      >
        <span className="bottom-nav-icon">💬</span>
        <span className="bottom-nav-label">Mensajes</span>
      </button>

      <button 
        className={`bottom-nav-item ${isActive('/app/profile') ? 'active' : ''}`}
        onClick={() => navigate('/app/profile')}
      >
        <span className="bottom-nav-icon">👤</span>
        <span className="bottom-nav-label">Perfil</span>
      </button>
    </nav>
  );
}
