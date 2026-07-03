import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

function toCard(item) {
  return {
    id: item.id,
    make: item.brand,
    model: item.model,
    year: item.year ? String(item.year) : 'N/D',
    price: `US$ ${item.price.toLocaleString('es-CL')}`,
    type: item.vehicle_type || 'Vehículo',
    photo: item.photos?.[0]?.url ?? null,
    km: null,
    transmission: null,
    location: null,
    match: null,
    viewType: null,
  };
}

export function useBuyerFeed() {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const exitDirectionRef = useRef(null);

  useEffect(() => {
    apiClient
      .get('feed')
      .json()
      .then((res) => {
        // El backend responde { items, count }
        setCars((res.items ?? []).map(toCard));
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const handleSwipe = useCallback((direction) => {
    exitDirectionRef.current = direction;
    setCars((prev) => {
      const carId = prev[0]?.id;
      if (carId) {
        const apiDirection = direction === 'like' ? 'like' : 'pass';
        apiClient
          .post('swipes', { json: { listing_id: carId, direction: apiDirection } })
          .catch((err) => console.error('Error registrando swipe', err));
      }
      return prev.slice(1);
    });
  }, []);

  const handleLike = useCallback(() => handleSwipe('like'), [handleSwipe]);
  const handleDislike = useCallback(() => handleSwipe('dislike'), [handleSwipe]);

  return {
    cars,
    currentCar: cars[0],
    nextCar: cars[1],
    isLoading,
    error,
    handleSwipe,
    handleLike,
    handleDislike,
    exitDirectionRef,
  };
}
