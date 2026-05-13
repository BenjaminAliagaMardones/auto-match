'use client';

export function FeedCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
      {/* Imagen */}
      <div className="w-full h-48 bg-gray-300"></div>

      {/* Contenido */}
      <div className="p-6">
        {/* Título */}
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Precio */}
        <div className="h-10 bg-gray-300 rounded w-1/2 mt-6"></div>
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {/* Imagen */}
      <div className="w-full h-48 bg-gray-300"></div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>

        {/* Info pequeña */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>

        {/* Precio */}
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>

        {/* Botones */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {/* Imagen */}
      <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-32"></div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>

        {/* Precio */}
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-3"></div>

        {/* Contacto */}
        <div className="bg-gray-100 rounded p-3 mb-3">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Botón */}
        <div className="w-full h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Mensaje izquierda */}
        <div className="flex justify-start">
          <div className="max-w-xs h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Mensaje derecha */}
        <div className="flex justify-end">
          <div className="max-w-xs h-12 bg-blue-300 rounded-lg animate-pulse"></div>
        </div>

        {/* Mensaje izquierda */}
        <div className="flex justify-start">
          <div className="max-w-xs h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 animate-pulse">
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-24 h-10 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 animate-pulse">
      {/* Campo 1 */}
      <div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Campo 2 */}
      <div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Campo 3 (texto largo) */}
      <div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-6">
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        <div className="flex-1 h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
