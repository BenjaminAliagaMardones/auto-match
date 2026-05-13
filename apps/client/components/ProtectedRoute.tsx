'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

/**
 * Componente que protege una ruta verificando:
 * 1. Que el usuario esté autenticado
 * 2. Que tenga el rol requerido (si se especifica)
 * 
 * Uso:
 * <ProtectedRoute requiredRole="buyer">
 *   <YourComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Sin token, redirigir a login
    if (!user) {
      router.push('/login');
      return;
    }

    // Validar rol si se requiere
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        // Rol no permitido
        if (user.role === 'buyer') {
          router.push('/feed');
        } else if (user.role === 'seller') {
          router.push('/listings');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, isLoading, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}
