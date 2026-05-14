'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface Match {
  id: string;
  buyer_id: string;
  listing_id: string;
  listing_title?: string;
  listing_price?: number;
  seller_email?: string;
  buyer_email?: string;
  created_at: string;
  has_messages?: number;
}

function MatchesContent() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAPI('/matches');
        setMatches(Array.isArray(data) ? data : data.items || data.matches || []);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Error al cargar los matches');
        if (err.message?.includes('autenticado')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tus matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Matches</h1>
          <p className="text-gray-600 mt-2">
            {matches.length} {matches.length === 1 ? 'conexión' : 'conexiones'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-2xl mb-4">💭</p>
            <p className="text-gray-600 text-lg mb-6">Aún no tienes matches</p>
            <p className="text-gray-500 mb-6">
              Dale "Like" a vehículos en el feed para crear conexiones
            </p>
            {user?.role === 'buyer' && (
              <Link
                href="/feed"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ir al Feed
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <Link key={match.id} href={`/chat/${match.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  {/* Tarjeta del vehículo */}
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-32 flex items-center justify-center">
                    <p className="text-4xl">🚗</p>
                  </div>

                  {/* Información */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                      {match.listing_title || 'Vehículo'}
                    </h3>

                    {match.listing_price && (
                      <p className="text-2xl font-bold text-blue-600 mb-3">
                        ${match.listing_price.toLocaleString('es-CL')}
                      </p>
                    )}

                    {/* Información del contacto */}
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">CONTACTO</p>
                      {user?.role === 'buyer' ? (
                        <p className="text-sm text-gray-700 truncate">
                          {match.seller_email || 'Vendedor'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-700 truncate">
                          {match.buyer_email || 'Comprador'}
                        </p>
                      )}
                    </div>

                    {/* Fecha del match */}
                    <p className="text-xs text-gray-500">
                      {new Date(match.created_at).toLocaleDateString('es-CL')}
                    </p>

                    {/* Badge de mensajes */}
                    {match.has_messages && (
                      <div className="mt-3 inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        ✓ {match.has_messages} mensaje{match.has_messages > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="px-4 pb-4">
                    <button
                      className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/chat/${match.id}`);
                      }}
                    >
                      Chatear
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  return (
    <ProtectedRoute>
      <MatchesContent />
    </ProtectedRoute>
  );
}
