'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { clearAuthData } from '@/lib/auth';

function ProfilePageContent() {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchAPI('/profile/me');
        setProfile(data);
      } catch (err: any) {
        setError('Sesión expirada o no autorizada');
        clearAuthData();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 p-8">
        <p className="text-xl text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex flex-col border-b border-gray-100 pb-4">
            <span className="text-sm font-medium text-gray-500">Correo Electrónico</span>
            <span className="text-lg text-gray-900">{profile.email}</span>
          </div>
          
          <div className="flex flex-col border-b border-gray-100 pb-4">
            <span className="text-sm font-medium text-gray-500">Rol de Usuario</span>
            <span className="text-lg capitalize text-gray-900">{profile.role}</span>
          </div>
          
          {profile.role === 'seller' && (
            <div className="pt-4 border-b border-gray-100 pb-4">
              <Link 
                href="/listings"
                className="inline-block rounded-md bg-green-500 px-4 py-2 text-white font-medium hover:bg-green-600 transition-colors"
              >
                Gestionar mis vehículos
              </Link>
            </div>
          )}

          {profile.vehicle_type && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">Preferencias de Búsqueda</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tipo de vehículo:</span> {profile.vehicle_type || 'No definido'}
              </p>
              {profile.budget_min && profile.budget_max && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Rango de presupuesto:</span> ${profile.budget_min} - ${profile.budget_max}
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