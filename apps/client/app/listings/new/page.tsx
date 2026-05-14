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
  });
  // Las URLs van en un campo aparte porque el backend espera string[].
  const [photoInput, setPhotoInput] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const addPhotoURL = () => {
    const url = photoInput.trim();
    if (!url) return;
    if (photoUrls.includes(url)) {
      setError('Esa URL ya fue agregada');
      return;
    }
    setPhotoUrls([...photoUrls, url]);
    setPhotoInput('');
    setError('');
  };

  const removePhotoURL = (i: number) => {
    setPhotoUrls(photoUrls.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (photoUrls.length === 0) {
      setError('Debes agregar al menos una URL de foto');
      return;
    }

    setIsSaving(true);
    try {
      await fetchAPI('/listings', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          photo_urls: photoUrls,
        }),
      });
      router.push('/listings');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al publicar el vehículo');
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
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <input
                type="text"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP) *</label>
              <input
                type="number"
                required
                min={1}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vehículo</label>
            <input
              type="text"
              placeholder="sedan, suv, hatchback..."
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="block w-full rounded-md border border-gray-300 px-3 py-2 h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URLs de fotos * (al menos una)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Pega la URL pública de una imagen (ej: imgur, cloudinary) y haz click en "Agregar".
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                className="block flex-1 rounded-md border border-gray-300 px-3 py-2"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPhotoURL();
                  }
                }}
              />
              <button
                type="button"
                onClick={addPhotoURL}
                className="rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Agregar
              </button>
            </div>

            {photoUrls.length > 0 && (
              <ul className="mt-3 space-y-2">
                {photoUrls.map((url, i) => (
                  <li
                    key={url}
                    className="flex items-center gap-3 rounded-md border border-gray-200 p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`foto ${i + 1}`}
                      className="h-12 w-12 rounded object-cover bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                    <span className="flex-1 truncate text-sm text-gray-600" title={url}>
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhotoURL(i)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              href="/listings"
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
