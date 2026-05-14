'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTokenClaims } from '@/lib/api';

// Páginas en las que NO se muestra la navbar (la propia auth tiene su flujo).
const HIDDEN_PATHS = ['/login', '/register'];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller' | null>(null);

  useEffect(() => {
    const claims = getTokenClaims();
    setRole(claims?.role ?? null);
  }, [pathname]);

  const hasToken = role !== null;

  if (HIDDEN_PATHS.includes(pathname)) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setRole(null);
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-bold text-blue-600">
          AutoMatch
        </Link>

        <div className="flex items-center gap-1 text-sm">
          {hasToken ? (
            <>
              {/* Solo el seller ve "Mis listings" y "Publicar" */}
              {role === 'seller' && (
                <>
                  <NavLink href="/listings" current={pathname}>
                    Mis listings
                  </NavLink>
                  <NavLink href="/listings/new" current={pathname}>
                    Publicar
                  </NavLink>
                </>
              )}
              <NavLink href="/profile" current={pathname}>
                Perfil
              </NavLink>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-md bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" current={pathname}>
                Iniciar sesión
              </NavLink>
              <NavLink href="/register" current={pathname}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: string;
  children: React.ReactNode;
}) {
  const isActive = current === href;
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
