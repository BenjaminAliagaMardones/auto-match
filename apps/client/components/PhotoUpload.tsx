'use client';

import { useState } from 'react';

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void;
  existingPhotos?: string[];
  maxPhotos?: number;
}

export function PhotoUpload({
  onPhotosChange,
  existingPhotos = [],
  maxPhotos = 5,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [manualUrl, setManualUrl] = useState('');

  const updatePhotos = (next: string[]) => {
    setPhotos(next);
    onPhotosChange(next);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const available = maxPhotos - photos.length;
    if (available <= 0) {
      return;
    }

    const toProcess = Array.from(files).slice(0, available);

    const readAll = toProcess.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readAll).then((dataUrls) => {
      const next = [...photos, ...dataUrls].slice(0, maxPhotos);
      updatePhotos(next);
    });

    e.currentTarget.value = '';
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    if (photos.length >= maxPhotos) return;

    try {
      new URL(manualUrl);
      updatePhotos([...photos, manualUrl]);
      setManualUrl('');
    } catch {
      // URL inválida — no la agregamos
    }
  };

  const removePhoto = (index: number) => {
    updatePhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((url, index) => (
            <div key={index} className="relative">
              <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subir Imágenes ({photos.length}/{maxPhotos})
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={photos.length >= maxPhotos}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes seleccionar múltiples imágenes a la vez
            </p>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O agrega una URL de imagen
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddManualUrl())}
                placeholder="https://ejemplo.com/foto.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                disabled={!manualUrl.trim() || photos.length >= maxPhotos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">📸 Agrega al menos una foto de tu vehículo</p>
        </div>
      )}
    </div>
  );
}
