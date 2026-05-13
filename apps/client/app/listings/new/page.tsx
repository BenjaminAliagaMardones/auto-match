'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function NewListingContent() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    vehicle_type: '',
    description: '',
    mileage: 0,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (photos.length === 0) {
      setError('Debes agregar al menos una foto');
      return;
    }

    if (!formData.brand || !formData.model || formData.price === 0) {
      setError('Completa todos los campos requeridos');
      return;
    }

    setIsSaving(true);

    try {
      await fetchAPI('/listings', {
        method: 'POST',
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          price: formData.price,
          vehicle_type: formData.vehicle_type,
          description: formData.description,
          photo_urls: photos,
        }),
      });

      alert('¡Vehículo publicado exitosamente!');
      router.push('/listings');
    } catch (err: any) {
      setError(err.message || 'Error al publicar el vehículo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/listings" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Volver a Mis Publicaciones
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Publicar Nuevo Vehículo</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fotos del Vehículo *
              </label>
              <PhotoUpload
                onPhotosChange={setPhotos}
                maxPhotos={5}
              />
            </div>

            {/* Marca y Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Toyota"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Corolla"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>

            {/* Año y Precio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (CLP) *
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 15000000"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Tipo de vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vehículo
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
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

            {/* Kilometraje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilometraje
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 50000"
                min="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el estado general, características especiales, historial de mantenimiento, etc."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/listings"
                className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isSaving ? 'Publicando...' : 'Publicar Vehículo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <NewListingContent />
    </ProtectedRoute>
  );
}