import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const MOCK_MATCHES = [
  { id: 1, name: 'Toyota Corolla XSE', make: 'TOYOTA', unread: true },
  { id: 2, name: 'Mazda CX-5 GT', make: 'MAZDA', unread: false },
  { id: 3, name: 'Ford Mustang GT', make: 'FORD', unread: false },
  { id: 4, name: 'Honda Civic Si', make: 'HONDA', unread: true },
];

const MOCK_MESSAGES = [
  { id: 1, name: 'Toyota Corolla XSE', sender: 'Carlos (Vendedor)', text: '¡Hola! Sí, todavía lo tengo. ¿Te gustaría venir a verlo?', time: '10:42 AM', unread: true },
  { id: 2, name: 'Honda Civic Si', sender: 'Ana (Vendedora)', text: 'El precio es conversable, podemos hablarlo.', time: 'Ayer', unread: true },
  { id: 3, name: 'Ford Mustang GT', sender: 'Tú', text: 'Gracias, te aviso cualquier cosa.', time: 'Lun', unread: false },
];

// Placeholder for matches
const CarAvatar = ({ make, unread }) => (
  <div className={`match-avatar-wrapper ${unread ? 'unread' : ''}`}>
    <div className="match-avatar">
      {make.substring(0, 1)}
    </div>
  </div>
);

export default function BuyerMatches() {
  const navigate = useNavigate();

  const handleOpenChat = (id) => {
    navigate(`/buyer/chat/${id}`);
  };

  return (
    <div className="feed-page">
      <div className="feed-mobile-container">
        
        {/* Top Navigation */}
        <header className="feed-top-nav" style={{ paddingBottom: '1rem' }}>
          <div>
            <h1 className="feed-header-title" style={{ fontSize: '2rem' }}>Matches</h1>
          </div>
          <button className="feed-filter-btn" aria-label="Search" style={{ border: 'none', background: 'var(--cream-dark)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </header>

        <main className="feed-main-area" style={{ alignItems: 'stretch', marginTop: 0, overflowY: 'auto' }}>
          
          {/* Nuevos Matches Horizontales */}
          <section className="matches-section">
            <h3 className="section-title">Nuevos Matches</h3>
            <div className="matches-horizontal-list">
              <div className="matches-scroll-container">
                <div className="match-item likes-you">
                  <div className="match-avatar-wrapper likes-wrapper">
                    <div className="match-avatar likes-avatar">
                      12
                    </div>
                  </div>
                  <span className="match-name">Les gustas</span>
                </div>
                {MOCK_MATCHES.map(match => (
                  <div key={match.id} className="match-item">
                    <CarAvatar make={match.make} unread={match.unread} />
                    <span className="match-name">{match.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Lista de Mensajes */}
          <section className="messages-section">
            <h3 className="section-title">Mensajes</h3>
            <div className="messages-vertical-list">
              {MOCK_MESSAGES.map(msg => (
                <div 
                  key={msg.id} 
                  className="message-row"
                  onClick={() => handleOpenChat(msg.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <CarAvatar make={msg.name} unread={msg.unread} />
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-title">{msg.name}</span>
                      <span className="message-time">{msg.time}</span>
                    </div>
                    <div className="message-preview-row">
                      <span className={`message-text ${msg.unread ? 'unread' : ''}`}>
                        {msg.sender === 'Tú' ? 'Tú: ' : ''}{msg.text}
                      </span>
                      {msg.unread && <div className="message-unread-dot"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
