import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactUseWebSocket from 'react-use-websocket';

// react-use-websocket es CJS puro: según el bundler, el default import llega
// como el hook o como el objeto del módulo. Este shim cubre ambos casos.
const useWebSocket = ReactUseWebSocket.default ?? ReactUseWebSocket;
import { apiClient, WS_BASE_URL } from '../../../services/apiClient';
import { useAuth } from '../../../hooks/useAuth';

export default function BuyerChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const [info, setInfo] = useState({
    name: location.state?.matchName || 'Chat',
    seller: location.state?.sellerName || '',
  });

  // Si se entra directo por URL (o tras un refresh) no hay location.state:
  // recuperar el nombre del auto y del otro usuario desde /matches.
  useEffect(() => {
    if (location.state?.matchName) return;
    apiClient
      .get('matches')
      .json()
      .then((res) => {
        const match = (res.items ?? []).find((m) => m.id === id);
        if (match) {
          setInfo({
            name: `${match.listing_brand || ''} ${match.listing_model || ''}`.trim() || 'Chat',
            seller: match.other_user_email ? match.other_user_email.split('@')[0] : '',
          });
        }
      })
      .catch(() => {});
  }, [id, location.state]);

  const messagesEndRef = useRef(null);

  const { user } = useAuth();

  const token = sessionStorage.getItem('auth-token');
  const WS_URL = token ? `${WS_BASE_URL}/ws/chat?token=${token}` : null;

  // Cargar historial de mensajes al montar
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // El backend responde { items, count } con campos en snake_case
        const history = await apiClient.get(`matches/${id}/messages`).json();
        const fetched = (history.items ?? []).map((m) => ({
          id: m.id,
          text: m.body,
          senderId: m.sender_id,
          time: new Date(m.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        // Conservar mensajes que llegaron por WS mientras cargaba el
        // historial (merge por id, el historial primero).
        setMessages((prev) => {
          const seen = new Set(fetched.map((m) => m.id));
          return [...fetched, ...prev.filter((m) => !seen.has(m.id))];
        });
      } catch (error) {
        console.error('Error cargando historial', error);
      }
    };
    fetchHistory();
  }, [id]);

  // Hook de WebSockets
  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => console.log('WebSocket conectado'),
    onMessage: (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.matchId === id) {
          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              text: msg.text,
              senderId: msg.senderId,
              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ]);
        }
      } catch (err) {
        console.error('Error parseando mensaje WS', err);
      }
    },
    shouldReconnect: () => true,
  });

  const isConnected = readyState === 1; // WebSocket.OPEN

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;

    // Enviar mensaje real a través del WebSocket
    const payload = JSON.stringify({
      matchId: id,
      text: inputText,
    });
    sendMessage(payload);

    setInputText('');
  };

  return (
    <div className="feed-page">
      <div className="feed-mobile-container" style={{ backgroundColor: 'var(--cream-dark)' }}>
        {/* Chat Header */}
        <header className="chat-header">
          <button className="chat-back-btn" onClick={() => navigate('/app/matches')}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>

          <div className="chat-header-info">
            <div className="chat-avatar-small">{info.name.substring(0, 1)}</div>
            <div className="chat-title-group">
              <h2 className="chat-name">{info.name}</h2>
              <span className="chat-seller">
                {isConnected ? (
                  <>
                    <span className="chat-status-dot online" aria-hidden="true" />
                    {info.seller ? `Con ${info.seller}` : 'En línea'}
                  </>
                ) : (
                  <>
                    <span className="chat-status-dot" aria-hidden="true" />
                    Conectando…
                  </>
                )}
              </span>
            </div>
          </div>

          <div style={{ width: '24px' }} aria-hidden="true" />
        </header>

        {/* Messages Area */}
        <main className="chat-messages-area">
          {messages.length === 0 && (
            <div className="chat-system-msg">
              Hiciste match con este auto. ¡Rompe el hielo y pregunta por él! 👋
            </div>
          )}
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="chat-system-msg">
                  {msg.text}
                </div>
              );
            }
            return (
              <div
                key={msg.id}
                className={`chat-bubble-wrapper ${msg.senderId === user?.id ? 'sent' : 'received'}`}
              >
                <div className={`chat-bubble ${msg.senderId === user?.id ? 'sent' : 'received'}`}>
                  {msg.text}
                </div>
                <span className="chat-bubble-time">{msg.time}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <form className="chat-input-area" onSubmit={handleSend}>
          <button type="button" className="chat-attach-btn">
            +
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder={isConnected ? 'Escribe un mensaje...' : 'Conectando…'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputText.trim() || !isConnected}
            aria-label="Enviar mensaje"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
