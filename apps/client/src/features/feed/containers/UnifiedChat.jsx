import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../hooks/useAuth';

export default function BuyerChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Use state passed from BuyerMatches if available
  const [info, setInfo] = useState({ 
    name: location.state?.matchName || 'Chat', 
    seller: location.state?.sellerName || 'Cargando...' 
  });
  
  const messagesEndRef = useRef(null);

  const { user } = useAuthStore();
  
  const token = sessionStorage.getItem('auth-token');
  const WS_URL = token ? `ws://localhost:8080/api/v1/ws/chat?token=${token}` : null;

  // Cargar historial de mensajes al montar
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await apiClient.get(`matches/${id}/messages`).json();
        if (history && history.items) {
          setMessages(history.items.map(m => ({
            id: m.id,
            text: m.body,
            senderId: m.sender_id,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      } catch (error) {
        console.error("Error cargando historial", error);
      }
    };
    fetchHistory();
  }, [id]);

  // Hook de WebSockets
  const { sendMessage } = useWebSocket(WS_URL, {
    onOpen: () => console.log('WebSocket conectado'),
    onMessage: (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.matchId === id) {
          setMessages((prev) => [...prev, {
            id: msg.id,
            text: msg.text,
            senderId: msg.senderId,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } catch (err) {
        console.error("Error parseando mensaje WS", err);
      }
    },
    shouldReconnect: () => true,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Enviar mensaje real a través del WebSocket
    const payload = JSON.stringify({
      matchId: id,
      text: inputText
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          
          <div className="chat-header-info">
            <div className="chat-avatar-small">
              {info.name.substring(0, 1)}
            </div>
            <div className="chat-title-group">
              <h2 className="chat-name">{info.name}</h2>
              <span className="chat-seller">Vendedor: {info.seller}</span>
            </div>
          </div>

          <button className="chat-options-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </header>

        {/* Messages Area */}
        <main className="chat-messages-area">
          {messages.map(msg => {
            if (msg.sender === 'system') {
              return <div key={msg.id} className="chat-system-msg">{msg.text}</div>;
            }
            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.senderId === user?.id ? 'sent' : 'received'}`}>
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
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>

      </div>
    </div>
  );
}
