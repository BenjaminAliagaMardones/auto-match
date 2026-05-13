'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Listing {
  id: string;
  brand: string;
  model: string;
  description: string;
  vehicle_type: string;
  price: number;
  year?: number;
  status?: string;
}

function EditListingContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    description: '',
    vehicle_type: '',
    price: 0,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!listingId) {
      router.push('/listings');
      return;
    }

    const loadListing = async () => {
      try {
        setIsLoading(true);
        const data: Listing = await fetchAPI(`/listings/${listingId}`);
        setFormData({
          brand: data.brand || '',
          model: data.model || '',
          description: data.description || '',
          vehicle_type: data.vehicle_type || '',
          price: data.price || 0,
          year: data.year || new Date().getFullYear(),
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar el vehículo');
      } finally {
        setIsLoading(false);
      }
    };

    loadListing();
  }, [listingId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!listingId) return;

    try {
      setIsSaving(true);

      await fetchAPI(`/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          description: formData.description,
          vehicle_type: formData.vehicle_type,
          price: formData.price,
          year: formData.year,
        }),
      });

      setSuccess(true);
      setTimeout(() => router.push('/listings'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/listings" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Volver a Mis Publicaciones
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Vehículo</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">✓ Vehículo actualizado correctamente. Redirigiendo...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Marca y Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Corolla"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el estado, características especiales, etc."
              />
            </div>

            {/* Tipo de vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vehículo *
              </label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecciona un tipo</option>
                <option value="sedan">Sedán</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="pickup">Pickup</option>
                <option value="van">Van</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Precio y Año */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (CLP) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 15000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/listings')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditListingPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <EditListingContent />
    </ProtectedRoute>
  );
}
