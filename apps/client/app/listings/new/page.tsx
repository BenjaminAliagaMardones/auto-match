'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

export default function NewListingPage() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    vehicle_type: '',
    description: '',
    mileage: 0,
    comuna: ''
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Llamamos al endpoint de creación de listings
      await fetchAPI('/listings', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      // Si el backend responde bien, redirigimos a una lista de "Mis autos" (que haremos luego)
      // O por ahora, de vuelta al perfil
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Error al publicar el vehículo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Publicar Nuevo Vehículo</h1>
        
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <input
                type="text"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <input
                type="text"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input
                type="number"
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="block w-full rounded-md border border-gray-300 px-3 py-2 h-24"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje (km)</label>
              <input
                type="number"
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.mileage}
                onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
              <input
                type="text"
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.comuna}
                onChange={(e) => setFormData({...formData, comuna: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-md bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSaving ? 'Publicando...' : 'Publicar Vehículo'}
            </button>
            <Link 
              href="/profile" 
              className="flex-1 text-center rounded-md border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}