'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI, getTokenClaims, type TokenClaims } from '@/lib/api';

type BuyerPrefs = {
  vehicle_type?: string;
  budget_min?: number | null;
  budget_max?: number | null;
};

export default function ProfilePage() {
  const [claims, setClaims] = useState<TokenClaims | null>(null);
  const [prefs, setPrefs] = useState<BuyerPrefs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = getTokenClaims();
    if (!t) {
      router.push('/login');
      return;
    }
    setClaims(t);

    // Solo los buyers tienen preferencias en buyer_profiles.
    // Para sellers no llamamos /profile/me porque no aporta nada útil.
    if (t.role === 'buyer') {
      fetchAPI('/profile/me')
        .then((data) => setPrefs(data))
        .catch(() => {
          localStorage.removeItem('token');
          router.push('/login');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!claims) return null;

  const isSeller = claims.role === 'seller';
  const hasPrefs =
    prefs && (prefs.vehicle_type || prefs.budget_min != null || prefs.budget_max != null);

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col border-b border-gray-100 pb-4">
            <span className="text-sm font-medium text-gray-500">Rol de Usuario</span>
            <span className="text-lg text-gray-900">
              {isSeller ? 'Vendedor' : 'Comprador'}
            </span>
          </div>

          {isSeller ? (
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-3">
                Como vendedor, puedes publicar y gestionar tus vehículos.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/listings"
                  className="rounded-md bg-green-500 px-4 py-2 text-white font-medium hover:bg-green-600 transition-colors"
                >
                  Gestionar mis vehículos
                </Link>
                <Link
                  href="/listings/new"
                  className="rounded-md bg-blue-50 px-4 py-2 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                >
                  + Publicar nuevo
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">Preferencias de búsqueda</h3>
              {hasPrefs ? (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo de vehículo:</span>{' '}
                    {prefs?.vehicle_type || 'No definido'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Presupuesto:</span>{' '}
                    {prefs?.budget_min != null
                      ? `$${prefs.budget_min.toLocaleString('es-CL')}`
                      : '—'}{' '}
                    a{' '}
                    {prefs?.budget_max != null
                      ? `$${prefs.budget_max.toLocaleString('es-CL')}`
                      : '—'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Aún no has configurado tus preferencias.
                </p>
              )}
            </div>
          )}

          <div className="pt-6 flex gap-4 border-t border-gray-100">
            {!isSeller && (
              <Link
                href="/profile/edit"
                className="flex-1 text-center rounded-md bg-blue-50 px-4 py-2 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
              >
                Editar preferencias
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 rounded-md bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
