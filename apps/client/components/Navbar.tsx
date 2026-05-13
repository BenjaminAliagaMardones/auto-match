'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar navbar en páginas de auth
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  const isBuyer = user.role === 'buyer';
  const isSeller = user.role === 'seller';

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">AutoMatch</span>
          </Link>

          {/* Menú central */}
          <div className="flex items-center gap-8">
            {/* Para Compradores */}
            {isBuyer && (
              <>
                <Link
                  href="/feed"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/feed'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Feed
                </Link>
                <Link
                  href="/matches"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/matches'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Mis Matches
                </Link>
              </>
            )}

            {/* Para Vendedores */}
            {isSeller && (
              <>
                <Link
                  href="/listings"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/listings'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Mis Publicaciones
                </Link>
                <Link
                  href="/matches"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/matches'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Mis Matches
                </Link>
              </>
            )}

            {/* Perfil (para todos) */}
            <Link
              href="/profile"
              className={`text-sm font-medium transition-colors ${
                pathname === '/profile' || pathname === '/profile/edit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Perfil
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
