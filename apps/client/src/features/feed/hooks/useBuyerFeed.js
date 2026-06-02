import { useState, useCallback, useRef } from 'react';
import { buildFeedItems } from '../../ads/hooks/useAdInsertion';

const SAMPLE_CARS = [
  { id: 1, make: 'TOYOTA', model: 'Corolla XSE', year: '2021', price: 'US$ 17.500', km: '42.800 km', location: 'Temuco', type: 'SEDAN', transmission: 'Automatica', match: 94, viewType: 'COROLLA - 3/4 FRONTAL' },
  { id: 2, make: 'MAZDA', model: 'CX-5 Grand Touring', year: '2020', price: 'US$ 22.000', km: '35.000 km', location: 'Padre Las Casas', type: 'SUV', transmission: 'Automatica', match: 88, viewType: 'CX-5 - LATERAL' },
  { id: 3, make: 'FORD', model: 'Mustang GT', year: '2022', price: 'US$ 45.000', km: '15.000 km', location: 'Villarrica', type: 'COUPE', transmission: 'Manual', match: 97, viewType: 'MUSTANG - 3/4 TRASERO' },
  { id: 4, make: 'CHEVROLET', model: 'Tracker Premier', year: '2023', price: 'US$ 25.500', km: '8.500 km', location: 'Pucon', type: 'SUV', transmission: 'Automatica', match: 91, viewType: 'TRACKER - FRONTAL' },
  { id: 5, make: 'VOLKSWAGEN', model: 'Golf GTI', year: '2019', price: 'US$ 28.000', km: '55.000 km', location: 'Temuco', type: 'HATCHBACK', transmission: 'Automatica DSG', match: 85, viewType: 'GOLF - PERFIL' },
  { id: 6, make: 'HONDA', model: 'Civic EX-L', year: '2021', price: 'US$ 21.000', km: '32.000 km', location: 'Lautaro', type: 'SEDAN', transmission: 'Automatica CVT', match: 95, viewType: 'CIVIC - 3/4 FRONTAL' },
  { id: 7, make: 'NISSAN', model: 'Frontier Pro-4X', year: '2024', price: 'US$ 38.000', km: '2.000 km', location: 'Victoria', type: 'PICK-UP', transmission: 'Automatica 4x4', match: 82, viewType: 'FRONTIER - 3/4 TRASERO' },
  { id: 8, make: 'PEUGEOT', model: '208 Allure', year: '2022', price: 'US$ 15.500', km: '28.000 km', location: 'Nueva Imperial', type: 'HATCHBACK', transmission: 'Manual', match: 89, viewType: '208 - FRONTAL' },
  { id: 9, make: 'SUBARU', model: 'Forester Touring', year: '2020', price: 'US$ 26.900', km: '48.000 km', location: 'Angol', type: 'SUV', transmission: 'Automatica AWD', match: 87, viewType: 'FORESTER - LATERAL' },
  { id: 10, make: 'HYUNDAI', model: 'Tucson Limited', year: '2023', price: 'US$ 31.000', km: '12.400 km', location: 'Temuco', type: 'SUV', transmission: 'Automatica', match: 93, viewType: 'TUCSON - 3/4 FRONTAL' },
  { id: 11, make: 'KIA', model: 'Sportage GT Line', year: '2022', price: 'US$ 29.500', km: '24.700 km', location: 'Freire', type: 'SUV', transmission: 'Automatica', match: 90, viewType: 'SPORTAGE - PERFIL' },
  { id: 12, make: 'BMW', model: '320i Sport', year: '2019', price: 'US$ 33.000', km: '61.000 km', location: 'Villarrica', type: 'SEDAN', transmission: 'Automatica', match: 84, viewType: '320I - 3/4 TRASERO' },
  { id: 13, make: 'MERCEDES-BENZ', model: 'GLA 200', year: '2021', price: 'US$ 36.000', km: '39.500 km', location: 'Temuco', type: 'SUV', transmission: 'Automatica', match: 86, viewType: 'GLA - FRONTAL' },
  { id: 14, make: 'AUDI', model: 'A3 Sportback', year: '2020', price: 'US$ 27.800', km: '44.300 km', location: 'Padre Las Casas', type: 'HATCHBACK', transmission: 'Automatica', match: 92, viewType: 'A3 - LATERAL' },
  { id: 15, make: 'SUZUKI', model: 'Jimny GLX', year: '2023', price: 'US$ 24.900', km: '9.800 km', location: 'Pucon', type: 'SUV', transmission: 'Manual 4x4', match: 81, viewType: 'JIMNY - 3/4 FRONTAL' },
  { id: 16, make: 'RENAULT', model: 'Duster Iconic', year: '2022', price: 'US$ 18.900', km: '30.200 km', location: 'Loncoche', type: 'SUV', transmission: 'Manual', match: 83, viewType: 'DUSTER - FRONTAL' },
  { id: 17, make: 'FIAT', model: 'Pulse Audace', year: '2024', price: 'US$ 19.700', km: '4.500 km', location: 'Victoria', type: 'SUV', transmission: 'Automatica', match: 88, viewType: 'PULSE - PERFIL' },
  { id: 18, make: 'MITSUBISHI', model: 'L200 Katana', year: '2021', price: 'US$ 30.500', km: '52.000 km', location: 'Angol', type: 'PICK-UP', transmission: 'Manual 4x4', match: 79, viewType: 'L200 - 3/4 TRASERO' },
  { id: 19, make: 'VOLVO', model: 'XC40 T4', year: '2020', price: 'US$ 34.900', km: '46.000 km', location: 'Temuco', type: 'SUV', transmission: 'Automatica', match: 91, viewType: 'XC40 - FRONTAL' },
  { id: 20, make: 'CHERY', model: 'Tiggo 7 Pro', year: '2023', price: 'US$ 23.400', km: '16.200 km', location: 'Nueva Imperial', type: 'SUV', transmission: 'Automatica', match: 86, viewType: 'TIGGO 7 - LATERAL' },
];

const SAMPLE_ADS = [
  {
    id: 'insurance-mapfre',
    title: 'Seguro automotriz flexible',
    brand: 'AutoMatch Protege',
    description: 'Cotiza cobertura para tu proximo auto con asistencia en ruta y pago mensual.',
    callToAction: 'Ver seguro',
    category: 'Seguro automotriz',
    targetUrl: 'https://example.com/seguro-auto',
    visualLabel: 'PROTECCION',
  },
  {
    id: 'financing-smart',
    title: 'Financiamiento vehicular',
    brand: 'Credito Match',
    description: 'Simula cuotas segun pie, plazo y presupuesto antes de contactar al vendedor.',
    callToAction: 'Simular credito',
    category: 'Financiamiento',
    targetUrl: 'https://example.com/financiamiento-auto',
    visualLabel: 'CUOTAS',
  },
  {
    id: 'maintenance-plus',
    title: 'Mantencion cerca de ti',
    brand: 'Taller Plus Temuco',
    description: 'Agenda diagnostico, cambio de aceite o revision precompra con talleres aliados.',
    callToAction: 'Agendar revision',
    category: 'Taller mecanico',
    targetUrl: 'https://example.com/taller-auto',
    visualLabel: 'SERVICIO',
  },
];

export function useBuyerFeed() {
  const [items, setItems] = useState(() => buildFeedItems(SAMPLE_CARS, SAMPLE_ADS));
  const exitDirectionRef = useRef(null);
  const currentItem = items[0];
  const nextItem = items[1];

  const handleAdOpen = useCallback((ad) => {
    // TODO: use targetUrl real, register ad click, and redirect when GAM/business flow is ready.
    console.log('TODO open ad target', ad);
  }, []);

  const handleSwipe = useCallback((direction) => {
    if (!currentItem) {
      return;
    }

    exitDirectionRef.current = direction;

    if (currentItem.type === 'ad' && direction === 'like') {
      handleAdOpen(currentItem.ad);
    }

    if (currentItem.type === 'ad' && direction === 'dislike') {
      // TODO: register ad skip/impression events when analytics is ready.
    }

    setItems((prev) => prev.slice(1));
  }, [currentItem, handleAdOpen]);

  const handleLike = () => handleSwipe('like');
  const handleDislike = () => handleSwipe('dislike');

  return {
    items,
    currentItem,
    nextItem,
    currentCar: currentItem?.type === 'vehicle' ? currentItem.vehicle : null,
    nextCar: nextItem?.type === 'vehicle' ? nextItem.vehicle : null,
    handleSwipe,
    handleLike,
    handleDislike,
    handleAdOpen,
    exitDirectionRef,
  };
}
