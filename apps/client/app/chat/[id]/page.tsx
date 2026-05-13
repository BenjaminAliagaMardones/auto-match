'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

function ChatContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const matchId = params?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    if (!matchId) return;
    try {
      const data = await fetchAPI(`/matches/${matchId}/messages`);
      const items: Message[] = data.items || [];
      if (items.length !== messagesCountRef.current) {
        messagesCountRef.current = items.length;
        setMessages(items);
      }
    } catch {
      // Ignorar errores de polling silenciosamente
    }
  }, [matchId]);

  // Carga inicial de mensajes
  useEffect(() => {
    if (!matchId) {
      router.push('/matches');
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAPI(`/matches/${matchId}/messages`);
        const items: Message[] = data.items || [];
        messagesCountRef.current = items.length;
        setMessages(items);
        setError('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [matchId, router]);

  // Polling para nuevos mensajes
  useEffect(() => {
    if (!matchId || isLoading) return;

    pollingIntervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [matchId, isLoading, fetchMessages]);

  const handleSendMessage = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId) return;

    setSendError('');
    setIsSending(true);

    try {
      await fetchAPI(`/matches/${matchId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: newMessage }),
      });
      setNewMessage('');
      await fetchMessages();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            {matchId && (
              <p className="text-xs text-gray-500">Match #{matchId.slice(0, 8)}</p>
            )}
          </div>
          <Link
            href="/matches"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Volver
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Área de mensajes */}
        <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <p className="text-gray-400 text-4xl mb-2">💬</p>
                <p className="text-gray-600">No hay mensajes aún</p>
                <p className="text-gray-500 text-sm mt-1">¡Sé el primero en escribir!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.body}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
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

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="bg-white border-t border-gray-200 p-4 rounded-b-lg shadow-md"
        >
          {sendError && (
            <p className="text-red-600 text-xs mb-2">{sendError}</p>
          )}
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
