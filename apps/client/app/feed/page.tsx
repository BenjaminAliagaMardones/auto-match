'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface Listing {
  id: string;
  title: string;
  description: string;
  vehicle_type: string;
  price: number;
  seller_email?: string;
  seller_phone?: string;
  year?: number;
  mileage?: number;
  status: string;
}

function FeedContent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSwipingVisible, setIsSwipingVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Cargar el feed inicial
  useEffect(() => {
    const loadFeed = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAPI('/feed?limit=20');
        setListings(Array.isArray(data) ? data : data.listings || []);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Error al cargar el feed');
        if (err.message?.includes('autenticado') || err.message?.includes('Forbidden')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, [router]);

  const currentListing = listings[currentIndex];

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (!currentListing) return;

    try {
      setIsSwipingVisible(true);

      const response = await fetchAPI('/swipes', {
        method: 'POST',
        body: JSON.stringify({
          listing_id: currentListing.id,
          direction: direction,
        }),
      });

      // Mostrar feedback visual brevemente
      setTimeout(() => {
        setIsSwipingVisible(false);
        setCurrentIndex((prev) => prev + 1);

        // Si se acabaron los listados, mostrar mensaje
        if (currentIndex + 1 >= listings.length) {
          setError('¡Se acabaron los vehículos! Vuelve más tarde.');
        }
      }, 300);

      // Si se creó un match, mostrar notificación
      if (response.match_created || response.MatchCreated) {
        alert('¡Nuevo Match! 🎉 Verifica en Mis Matches');
      }
    } catch (err: any) {
      alert(`Error al procesar swipe: ${err.message}`);
      setIsSwipingVisible(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  if (error === '¡Se acabaron los vehículos! Vuelve más tarde.') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-2xl font-bold text-gray-900 mb-4">🚗 ¡Se acabaron los vehículos!</p>
          <p className="text-gray-600 mb-6">Vuelve más tarde para ver más opciones</p>
          <button
            onClick={() => router.push('/matches')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver mis Matches
          </button>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-2xl font-bold text-gray-900 mb-4">No hay vehículos disponibles</p>
          <p className="text-gray-600">Intenta ajustar tus preferencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feed de Vehículos</h1>
          <p className="text-gray-600 mt-2">
            {currentIndex + 1} de {listings.length}
          </p>
        </div>

        {/* Tarjeta del vehículo actual */}
        <div className="relative h-96 mb-8">
          {currentListing && (
            <div
              className={`bg-white rounded-2xl shadow-xl overflow-hidden h-full transition-all duration-300 ${
                isSwipingVisible ? 'opacity-75 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {/* Imagen del vehículo */}
              <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl mb-2">🚗</p>
                  <p className="text-gray-600 text-sm">Imagen no disponible</p>
                </div>
              </div>

              {/* Información del vehículo */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentListing.title}
                </h2>

                <div className="space-y-2 mb-4">
                  {currentListing.year && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Año:</span> {currentListing.year}
                    </p>
                  )}
                  {currentListing.vehicle_type && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tipo:</span> {currentListing.vehicle_type}
                    </p>
                  )}
                  {currentListing.mileage && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Km:</span> {currentListing.mileage}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-3xl font-bold text-blue-600">
                    ${currentListing.price?.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Descripción corta */}
        {currentListing?.description && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">{currentListing.description}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleSwipe('pass')}
            disabled={isSwipingVisible}
            className="flex-1 py-3 px-4 bg-gray-300 text-gray-800 rounded-full font-bold text-lg hover:bg-gray-400 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
            title="Pasar"
          >
            ✕ Pasar
          </button>
          <button
            onClick={() => handleSwipe('like')}
            disabled={isSwipingVisible}
            className="flex-1 py-3 px-4 bg-red-500 text-white rounded-full font-bold text-lg hover:bg-red-600 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
            title="Like"
          >
            ♥️ Like
          </button>
        </div>

        {/* Info adicional */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Desliza para ver más vehículos</p>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute requiredRole="buyer">
      <FeedContent />
    </ProtectedRoute>
  );
}
