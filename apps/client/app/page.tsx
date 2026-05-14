'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTokenClaims } from '@/lib/api';
import { Spinner } from '@/components/Spinner';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Si ya hay sesión válida, no tiene sentido ver la landing pública.
    if (getTokenClaims()) {
      router.replace('/profile');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return <Spinner label="Verificando sesión..." />;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-gray-50 text-black">
      <main className="flex flex-col items-center text-center p-8">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-4">AutoMatch</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg">
          La plataforma inteligente para conectar compradores y vendedores de vehículos.
        </p>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-white border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Crear Cuenta
          </Link>
        </div>
      </main>
    </div>
  );
}
