'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadListings = async () => {
      try {
        // Consumimos el endpoint de las publicaciones del usuario logueado
        const data = await fetchAPI('/listings/me');
        
        // Dependiendo de cómo el backend de Go envíe la respuesta, ajustamos el array
        setListings(Array.isArray(data) ? data : data.listings || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar tus publicaciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black"><p className="text-lg">Cargando tus vehículos...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Mis Publicaciones</h1>
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
              <div key={car.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                  {/* Espacio reservado para la foto del auto */}
                  <span>Sin foto</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900">{car.brand} {car.model}</h3>
                  <p className="text-sm text-gray-500 mb-3">{car.year} • {car.mileage || 0} km</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-auto">
                    ${car.price?.toLocaleString('es-CL')}
                  </p>
                  
                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <button className="flex-1 text-sm bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200 transition-colors">
                      Editar
                    </button>
                    <button className="flex-1 text-sm bg-red-50 text-red-600 py-2 rounded font-medium hover:bg-red-100 transition-colors">
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