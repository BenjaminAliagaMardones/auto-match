import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';

const CarAvatar = ({ text, unread }) => (
  <div className={`match-avatar-wrapper ${unread ? 'unread' : ''}`}>
    <div className="match-avatar">
      {text ? text.substring(0, 1).toUpperCase() : '?'}
    </div>
  </div>
);

export default function BuyerMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await apiClient.get('matches').json();
        if (res && res.items) {
          setMatches(res.items);
        }
      } catch (error) {
        console.error("Error fetching matches", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleOpenChat = (match) => {
    const matchName = `${match.listing_brand} ${match.listing_model}`;
    const sellerName = match.other_user_email ? match.other_user_email.split('@')[0] : 'Vendedor';
    navigate(`/app/chat/${match.id}`, { state: { matchName, sellerName } });
  };

  return (
    <>
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
                    {matches.length}
                  </div>
                </div>
                <span className="match-name">Matches</span>
              </div>
              {isLoading ? <span style={{padding: '0 1rem'}}>Cargando...</span> : matches.map(match => (
                <div key={match.id} className="match-item" onClick={() => handleOpenChat(match)} style={{ cursor: 'pointer' }}>
                  <CarAvatar text={match.listing_brand} unread={false} />
                  <span className="match-name">{match.listing_brand}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lista de Mensajes */}
        <section className="messages-section">
          <h3 className="section-title">Mensajes</h3>
          <div className="messages-vertical-list">
            {isLoading ? <div style={{padding: '1rem'}}>Cargando mensajes...</div> : matches.length === 0 ? <div style={{padding: '1rem', color: '#888'}}>Aún no tienes matches. ¡Sigue explorando!</div> : matches.map(match => {
              const title = `${match.listing_brand} ${match.listing_model}`;
              return (
                <div 
                  key={match.id} 
                  className="message-row"
                  onClick={() => handleOpenChat(match)}
                  style={{ cursor: 'pointer' }}
                >
                  <CarAvatar text={title} unread={false} />
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-title">{title}</span>
                      <span className="message-time">
                        {new Date(match.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="message-preview-row">
                      <span className="message-text">
                        Toca para abrir el chat con {match.other_user_email ? match.other_user_email.split('@')[0] : 'usuario'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
