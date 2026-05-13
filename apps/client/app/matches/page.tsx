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
  created_at: string;
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
        setMatches(data.items || []);
        setError('');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar los matches';
        setError(msg);
        if (msg.includes('autenticado')) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              Dale &quot;Like&quot; a vehículos en el feed para crear conexiones
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
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-32 flex items-center justify-center">
                    <p className="text-4xl">🚗</p>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Match #{match.id.slice(0, 8)}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(match.created_at).toLocaleDateString('es-CL')}
                    </p>

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
  return (
    <ProtectedRoute>
      <MatchesContent />
    </ProtectedRoute>
  );
}
