import { useState, useCallback, useRef } from 'react';

// Datos de ejemplo
const SAMPLE_CARS = [
  {
    id: 1,
    make: 'TOYOTA',
    model: 'Corolla XSE',
    year: '2021',
    price: 'US$ 17.500',
    km: '42.800 km',
    location: 'Temuco',
    type: 'SEDÁN',
    transmission: 'Automática',
    match: 94,
    viewType: 'COROLLA - 3/4 FRONTAL',
  },
  {
    id: 2,
    make: 'MAZDA',
    model: 'CX-5 Grand Touring',
    year: '2020',
    price: 'US$ 22.000',
    km: '35.000 km',
    location: 'Padre Las Casas',
    type: 'SUV',
    transmission: 'Automática',
    match: 88,
    viewType: 'CX-5 - LATERAL',
  },
  {
    id: 3,
    make: 'FORD',
    model: 'Mustang GT',
    year: '2022',
    price: 'US$ 45.000',
    km: '15.000 km',
    location: 'Villarrica',
    type: 'Coupé',
    transmission: 'Manual',
    match: 97,
    viewType: 'MUSTANG - 3/4 TRASERO',
  },
  {
    id: 4,
    make: 'CHEVROLET',
    model: 'Tracker Premier',
    year: '2023',
    price: 'US$ 25.500',
    km: '8.500 km',
    location: 'Pucón',
    type: 'SUV',
    transmission: 'Automática',
    match: 91,
    viewType: 'TRACKER - FRONTAL',
  },
  {
    id: 5,
    make: 'VOLKSWAGEN',
    model: 'Golf GTI',
    year: '2019',
    price: 'US$ 28.000',
    km: '55.000 km',
    location: 'Temuco',
    type: 'Hatchback',
    transmission: 'Automática (DSG)',
    match: 85,
    viewType: 'GOLF - PERFIL',
  },
  {
    id: 6,
    make: 'HONDA',
    model: 'Civic EX-L',
    year: '2021',
    price: 'US$ 21.000',
    km: '32.000 km',
    location: 'Lautaro',
    type: 'Sedán',
    transmission: 'Automática (CVT)',
    match: 95,
    viewType: 'CIVIC - 3/4 FRONTAL',
  },
  {
    id: 7,
    make: 'NISSAN',
    model: 'Frontier Pro-4X',
    year: '2024',
    price: 'US$ 38.000',
    km: '2.000 km',
    location: 'Victoria',
    type: 'Pick-up',
    transmission: 'Automática 4x4',
    match: 82,
    viewType: 'FRONTIER - 3/4 TRASERO',
  },
  {
    id: 8,
    make: 'PEUGEOT',
    model: '208 Allure',
    year: '2022',
    price: 'US$ 15.500',
    km: '28.000 km',
    location: 'Nueva Imperial',
    type: 'Hatchback',
    transmission: 'Manual',
    match: 89,
    viewType: '208 - FRONTAL',
  },
];

export function useBuyerFeed() {
  const [cars, setCars] = useState(SAMPLE_CARS);
  const exitDirectionRef = useRef(null);

  const handleSwipe = useCallback((direction) => {
    exitDirectionRef.current = direction;
    setCars((prev) => prev.slice(1));
  }, []);

  const handleLike = () => handleSwipe('like');
  const handleDislike = () => handleSwipe('dislike');

  return {
    cars,
    currentCar: cars[0],
    nextCar: cars[1],
    handleSwipe,
    handleLike,
    handleDislike,
    exitDirectionRef
  };
}
