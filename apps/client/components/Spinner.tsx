export function Spinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
        aria-label="Cargando"
      />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
