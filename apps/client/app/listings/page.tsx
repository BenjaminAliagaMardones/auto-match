'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAPI, getTokenClaims } from '@/lib/api';
import { Spinner } from '@/components/Spinner';

type Photo = { id: string; url: string; position: number };
type Listing = {
  id: string;
  brand: string;
  model: string;
  year?: number | null;
  price: number;
  vehicle_type?: string;
  status: 'active' | 'paused' | 'sold';
  photos: Photo[];
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const load = async () => {
    try {
      const data = await fetchAPI('/listings/me');
      setListings(data.items ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus publicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const claims = getTokenClaims();
    if (!claims) {
      router.replace('/login');
      return;
    }
    if (claims.role !== 'seller') {
      router.replace('/profile');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este vehículo? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      await fetchAPI(`/listings/${id}`, { method: 'DELETE' });
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el vehículo');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <Spinner label="Cargando tus vehículos..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis publicaciones</h1>
            <p className="text-sm text-gray-500 mt-1">
              {listings.length} {listings.length === 1 ? 'vehículo' : 'vehículos'} publicado
              {listings.length === 1 ? '' : 's'}
            </p>
          </div>
          <Link
            href="/listings/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Publicar vehículo
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
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
            {listings.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative">
                  {car.photos && car.photos.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={car.photos[0].url}
                      alt={`${car.brand} ${car.model}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-sm">Sin foto</span>
                  )}
                  {car.status !== 'active' && (
                    <span className="absolute top-2 right-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      {car.status === 'paused' ? 'Pausado' : 'Vendido'}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {car.year ? `${car.year} • ` : ''}
                    {car.vehicle_type || 'Sin categoría'}
                  </p>
                  <p className="text-2xl font-semibold text-blue-600 mt-auto">
                    ${car.price?.toLocaleString('es-CL')}
                  </p>

                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleDelete(car.id)}
                      disabled={deletingId === car.id}
                      className="flex-1 text-sm bg-red-50 text-red-600 py-2 rounded font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deletingId === car.id ? 'Eliminando...' : 'Eliminar'}
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
