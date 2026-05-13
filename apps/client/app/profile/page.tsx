'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePrefs {
  user_id: string;
  vehicle_type: string;
  budget_min: number | null;
  budget_max: number | null;
  updated_at: string;
}

function ProfilePageContent() {
  const [prefs, setPrefs] = useState<ProfilePrefs | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data: ProfilePrefs = await fetchAPI('/profile/me');
        setPrefs(data);
      } catch {
        setError('Error al cargar preferencias');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col border-b border-gray-100 pb-4">
            <span className="text-sm font-medium text-gray-500">Correo Electrónico</span>
            <span className="text-lg text-gray-900">{user.email}</span>
          </div>

          <div className="flex flex-col border-b border-gray-100 pb-4">
            <span className="text-sm font-medium text-gray-500">Rol de Usuario</span>
            <span className="text-lg capitalize text-gray-900">{user.role}</span>
          </div>

          {user.role === 'seller' && (
            <div className="pt-2 border-b border-gray-100 pb-4">
              <Link
                href="/listings"
                className="inline-block rounded-md bg-green-500 px-4 py-2 text-white font-medium hover:bg-green-600 transition-colors"
              >
                Gestionar mis vehículos
              </Link>
            </div>
          )}

          {prefs && prefs.vehicle_type && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">Preferencias de Búsqueda</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tipo de vehículo:</span>{' '}
                {prefs.vehicle_type || 'No definido'}
              </p>
              {prefs.budget_min != null && prefs.budget_max != null && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Rango de presupuesto:</span>{' '}
                  ${prefs.budget_min.toLocaleString('es-CL')} –{' '}
                  ${prefs.budget_max.toLocaleString('es-CL')}
                </p>
              )}
            </div>
          )}

          <div className="pt-6 flex gap-4">
            <Link
              href="/profile/edit"
              className="flex-1 text-center rounded-md bg-blue-50 px-4 py-2 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
            >
              Editar Preferencias
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-md bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
