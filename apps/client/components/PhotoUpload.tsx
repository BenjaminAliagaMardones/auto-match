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
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingPhotos);
  const [manualUrl, setManualUrl] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (photos.length >= maxPhotos) {
        alert(`Máximo ${maxPhotos} fotos permitidas`);
        return;
      }

      // Crear una URL temporal para preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const newPhotos = [...photos, dataUrl];
        const newPreviews = [...previewUrls, dataUrl];

        setPhotos(newPhotos);
        setPreviewUrls(newPreviews);
        onPhotosChange(newPhotos);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;

    if (photos.length >= maxPhotos) {
      alert(`Máximo ${maxPhotos} fotos permitidas`);
      return;
    }

    try {
      new URL(manualUrl); // Validar que sea una URL válida

      const newPhotos = [...photos, manualUrl];
      setPhotos(newPhotos);
      setPreviewUrls(newPhotos);
      onPhotosChange(newPhotos);
      setManualUrl('');
    } catch {
      alert('URL inválida');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    setPhotos(newPhotos);
    setPreviewUrls(newPreviews);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Galería de fotos actuales */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
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
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <div className="space-y-4">
          {/* Subida por archivo */}
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

          {/* O agregar por URL */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O agrega una URL de imagen
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
