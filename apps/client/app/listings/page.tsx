'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Listing {
  id: string;
  brand: string;
  model: string;
  year?: number;
  price: number;
  vehicle_type?: string;
  status?: string;
}

function ListingsContent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    const loadListings = async () => {
      try {
        const data = await fetchAPI('/listings/me');
        setListings(data.items || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar tus publicaciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, []);

  const handleDelete = async (listingId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) return;

    setDeleteError('');
    setDeleteSuccess('');

    try {
      await fetchAPI(`/listings/${listingId}`, { method: 'DELETE' });
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setDeleteSuccess('Vehículo eliminado correctamente');
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Cargando tus vehículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Publicaciones</h1>
            <p className="text-gray-600 mt-1">
              {listings.length} vehículo{listings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/profile"
              className="rounded-md bg-white border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Volver al Perfil
            </Link>
            <Link
              href="/listings/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Publicar Vehículo
            </Link>
          </div>
        </div>

        {error && <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">{error}</div>}
        {deleteError && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
            {deleteError}
          </div>
        )}
        {deleteSuccess && (
          <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4 text-green-700">
            {deleteSuccess}
          </div>
        )}

        {listings.length === 0 && !error ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <p className="text-gray-500 mb-4 text-lg">Aún no tienes vehículos publicados.</p>
            <Link href="/listings/new" className="text-blue-600 font-semibold hover:underline">
              Sube tu primer auto aquí
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-3xl mb-2">🚗</p>
                    <p className="text-sm">Sin imagen</p>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {listing.brand} {listing.model}
                  </h3>
                  {listing.year && (
                    <p className="text-sm text-gray-500 mb-3">{listing.year}</p>
                  )}
                  <p className="text-2xl font-semibold text-blue-600 mt-auto">
                    ${listing.price.toLocaleString('es-CL')}
                  </p>

                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="flex-1 text-center text-sm bg-blue-50 text-blue-600 py-2 rounded font-medium hover:bg-blue-100 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="flex-1 text-sm bg-red-50 text-red-600 py-2 rounded font-medium hover:bg-red-100 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ListingsContent />
    </ProtectedRoute>
  );
}
