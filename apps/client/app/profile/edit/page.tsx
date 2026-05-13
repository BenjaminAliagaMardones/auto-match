'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface ProfileData {
  email: string;
  role: string;
  vehicle_type?: string;
  budget_min?: number;
  budget_max?: number;
}

function EditProfileContent() {
  const [vehicleType, setVehicleType] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data: ProfileData = await fetchAPI('/profile/me');
        if (data) {
          setVehicleType(data.vehicle_type || '');
          setBudgetMin(data.budget_min?.toString() || '');
          setBudgetMax(data.budget_max?.toString() || '');
        }
      } catch {
        setError('Error al cargar preferencias');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleUpdate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const minVal = budgetMin ? parseInt(budgetMin, 10) : null;
    const maxVal = budgetMax ? parseInt(budgetMax, 10) : null;

    if (budgetMin && (isNaN(minVal!) || minVal! < 0)) {
      setError('El presupuesto mínimo no es válido');
      return;
    }
    if (budgetMax && (isNaN(maxVal!) || maxVal! < 0)) {
      setError('El presupuesto máximo no es válido');
      return;
    }
    if (minVal != null && maxVal != null && minVal > maxVal) {
      setError('El presupuesto máximo debe ser mayor que el mínimo');
      return;
    }

    setIsSaving(true);

    try {
      await fetchAPI('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          vehicle_type: vehicleType || null,
          budget_min: minVal,
          budget_max: maxVal,
        }),
      });

      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <Link href="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Volver a Mi Perfil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Preferencias</h1>
          <p className="text-gray-600 mt-2">Configura tus preferencias de búsqueda para encontrar los vehículos perfectos</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">✓ Preferencias actualizadas correctamente. Redirigiendo...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Tipo de vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vehículo
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="">Cualquier tipo</option>
                <option value="sedan">Sedán</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="pickup">Pickup</option>
                <option value="van">Van</option>
                <option value="otro">Otro</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Déjalo en blanco si quieres ver todos los tipos
              </p>
            </div>

            {/* Rango de presupuesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de Presupuesto (CLP)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Mínimo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Máximo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
              </div>
              {budgetMin && budgetMax && (
                <p className="text-sm text-gray-600 mt-2">
                  Rango: ${parseInt(budgetMin).toLocaleString('es-CL')} - ${parseInt(budgetMax).toLocaleString('es-CL')}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Déjalo en blanco si quieres ver todos los precios
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/profile"
                className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}