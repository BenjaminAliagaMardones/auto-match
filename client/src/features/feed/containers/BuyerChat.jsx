import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MOCK_MESSAGES_DB = {
  1: [
    { id: 1, text: '¡Hola! Estoy interesado en el Corolla.', sender: 'me', time: '10:30 AM' },
    { id: 2, text: '¡Hola! Sí, todavía lo tengo. ¿Te gustaría venir a verlo?', sender: 'them', time: '10:42 AM' },
  ],
  2: [
    { id: 1, text: 'Hola, ¿qué kilometraje tiene el Civic?', sender: 'me', time: 'Ayer' },
    { id: 2, text: 'Tiene 32.000 km.', sender: 'them', time: 'Ayer' },
    { id: 3, text: '¿Es el último precio?', sender: 'me', time: 'Ayer' },
    { id: 4, text: 'El precio es conversable, podemos hablarlo.', sender: 'them', time: 'Ayer' },
  ],
  3: [
    { id: 1, text: 'Hola, hermoso el Mustang.', sender: 'me', time: 'Lun' },
    { id: 2, text: 'Gracias, está impecable. Cualquier duda me avisas.', sender: 'them', time: 'Lun' },
    { id: 3, text: 'Gracias, te aviso cualquier cosa.', sender: 'me', time: 'Lun' },
  ]
};

const CHAT_INFO = {
  1: { name: 'Toyota Corolla XSE', seller: 'Carlos' },
  2: { name: 'Honda Civic Si', seller: 'Ana' },
  3: { name: 'Ford Mustang GT', seller: 'Roberto' },
};

export default function BuyerChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const info = CHAT_INFO[id] || { name: 'Chat Desconocido', seller: 'Usuario' };

  useEffect(() => {
    // Load mock messages for the chat id
    if (MOCK_MESSAGES_DB[id]) {
      setMessages(MOCK_MESSAGES_DB[id]);
    } else {
      setMessages([{ id: 1, text: 'Inicia la conversación.', sender: 'system', time: '' }]);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Genial, lo reviso y te comento. (Simulación de respuesta automática)',
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="feed-page">
      <div className="feed-mobile-container" style={{ backgroundColor: 'var(--cream-dark)' }}>
        
        {/* Chat Header */}
        <header className="chat-header">
          <button className="chat-back-btn" onClick={() => navigate('/buyer/matches')}>
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
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                <div className={`chat-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
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
