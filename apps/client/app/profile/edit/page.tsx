'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

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
    const loadPreferences = async () => {
      try {
        const data = await fetchAPI('/profile/me');
        if (data.preferences) {
          setVehicleType(data.preferences.vehicle_type || '');
          setBudgetMin(data.preferences.budget_min?.toString() || '');
          setBudgetMax(data.preferences.budget_max?.toString() || '');
        }
      } catch (err: any) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSaving(true);
    
    try {
      await fetchAPI('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          vehicle_type: vehicleType,
          budget_min: parseInt(budgetMin) || 0,
          budget_max: parseInt(budgetMax) || 0,
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Actualizar Preferencias</h1>
        
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">¡Perfil actualizado! Redirigiendo...</div>}
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo</label>
            <input
              type="text"
              placeholder="ej. suv, sedan, camioneta"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Mínimo</label>
              <input
                type="number"
                min="0"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Máximo</label>
              <input
                type="number"
                min={budgetMin || 0}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link 
              href="/profile" 
              className="flex-1 text-center rounded-md border border-gray-300 py-2 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}