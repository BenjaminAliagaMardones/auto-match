'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface MatchInfo {
  id: string;
  buyer_id: string;
  listing_id: string;
  listing_title?: string;
  listing_price?: number;
  seller_email?: string;
  buyer_email?: string;
  seller_phone?: string;
  buyer_phone?: string;
  created_at: string;
}

function ChatContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const matchId = params?.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar información del match
  useEffect(() => {
    const loadMatchInfo = async () => {
      try {
        // Obtener información del match desde la lista de matches
        const matchesData = await fetchAPI('/matches');
        const matches = Array.isArray(matchesData) ? matchesData : matchesData.items || [];
        const match = matches.find((m: any) => m.id === matchId);
        if (match) {
          setMatchInfo(match);
        }
      } catch (err: any) {
        console.error('Error al cargar info del match:', err);
      }
    };

    loadMatchInfo();
  }, [matchId]);

  // Cargar mensajes inicialmente
  useEffect(() => {
    const loadMessages = async () => {
      if (!matchId) return;

      try {
        setIsLoading(true);
        const data = await fetchAPI(`/matches/${matchId}/messages`);
        setMessages(Array.isArray(data) ? data : data.items || []);
        setLastFetch(Date.now());
        setError('');
      } catch (err: any) {
        setError(err.message || 'Error al cargar mensajes');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [matchId]);

  // HTTP Polling para nuevos mensajes
  useEffect(() => {
    if (!matchId || isLoading) return;

    const pollMessages = async () => {
      try {
        const data = await fetchAPI(`/matches/${matchId}/messages`);
        const newMessages = Array.isArray(data) ? data : data.items || [];

        // Solo actualizar si hay mensajes nuevos
        if (newMessages.length > messages.length) {
          setMessages(newMessages);
        }
      } catch (err) {
        console.error('Error en polling:', err);
      }
    };

    // Polling cada 3 segundos
    pollingIntervalRef.current = setInterval(pollMessages, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [matchId, messages.length, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !matchId) return;

    try {
      setIsSending(true);
      await fetchAPI(`/matches/${matchId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: newMessage }),
      });

      setNewMessage('');

      // Cargar mensajes nuevamente
      const data = await fetchAPI(`/matches/${matchId}/messages`);
      setMessages(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      alert(`Error al enviar mensaje: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const getContactInfo = () => {
    if (!user || !matchInfo) return null;

    if (user.id === matchInfo.buyer_id) {
      // El usuario es el comprador, mostrar info del vendedor
      return {
        name: 'Vendedor',
        email: matchInfo.seller_email,
        phone: matchInfo.seller_phone,
      };
    } else {
      // El usuario es el vendedor, mostrar info del comprador
      return {
        name: 'Comprador',
        email: matchInfo.buyer_email,
        phone: matchInfo.buyer_phone,
      };
    }
  };

  const contactInfo = getContactInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-md border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {matchInfo?.listing_title || 'Chat'}
            </h1>
            {matchInfo?.listing_price && (
              <p className="text-sm text-gray-600">
                ${matchInfo.listing_price.toLocaleString('es-CL')}
              </p>
            )}
          </div>
          <Link
            href="/matches"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Volver
          </Link>
        </div>

        {/* Información del contacto */}
        {contactInfo && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Información de contacto del {contactInfo.name.toLowerCase()}:
            </p>
            <div className="space-y-1">
              {contactInfo.email && (
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Email:</span> {contactInfo.email}
                </p>
              )}
              {contactInfo.phone && (
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Teléfono:</span> {contactInfo.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Área de mensajes */}
        <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-400 text-4xl mb-2">💬</p>
                <p className="text-gray-600">No hay mensajes aún</p>
                <p className="text-gray-500 text-sm mt-1">¡Sé el primero en escribir!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwnMessage = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input de mensaje */}
        <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4 rounded-b-lg shadow-md">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={isSending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}
