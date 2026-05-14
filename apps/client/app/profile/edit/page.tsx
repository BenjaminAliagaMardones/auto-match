'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI, getTokenClaims } from '@/lib/api';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';

type BuyerProfileResponse = {
  user_id: string;
  vehicle_type?: string;
  budget_min?: number | null;
  budget_max?: number | null;
};

export default function EditProfilePage() {
  const [vehicleType, setVehicleType] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const claims = getTokenClaims();
    if (!claims) {
      router.replace('/login');
      return;
    }
    // Las preferencias solo aplican a compradores.
    if (claims.role !== 'buyer') {
      router.replace('/profile');
      return;
    }

    (async () => {
      try {
        const data = (await fetchAPI('/profile/me')) as BuyerProfileResponse;
        setVehicleType(data.vehicle_type ?? '');
        setBudgetMin(data.budget_min != null ? String(data.budget_min) : '');
        setBudgetMax(data.budget_max != null ? String(data.budget_max) : '');
      } catch {
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const min = budgetMin === '' ? null : parseInt(budgetMin);
    const max = budgetMax === '' ? null : parseInt(budgetMax);

    if (min != null && max != null && min > max) {
      setError('El presupuesto mínimo no puede ser mayor al máximo');
      return;
    }

    setIsSaving(true);
    try {
      await fetchAPI('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          vehicle_type: vehicleType.trim(),
          budget_min: min,
          budget_max: max,
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Spinner label="Cargando tus preferencias..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="border-b border-gray-100 px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Actualizar preferencias</h1>
          <p className="mt-1 text-sm text-gray-500">
            Estas preferencias se usan para ordenar el feed de vehículos según tu perfil.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 p-8">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Preferencias actualizadas. Redirigiendo...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de vehículo
            </label>
            <input
              type="text"
              placeholder="ej. suv, sedan, camioneta"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto mínimo (CLP)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto máximo (CLP)
              </label>
              <input
                type="number"
                min={budgetMin || 0}
                placeholder="0"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-md bg-blue-600 py-2.5 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link
              href="/profile"
              className="flex-1 text-center rounded-md border border-gray-300 py-2.5 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
