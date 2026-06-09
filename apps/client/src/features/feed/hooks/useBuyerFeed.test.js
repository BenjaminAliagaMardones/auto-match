import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBuyerFeed } from './useBuyerFeed';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '../../../services/apiClient';

// ky devuelve un ResponsePromise (Promise + .json()). Simulamos eso aquí.
function mockKyPost(data = {}) {
  return Object.assign(Promise.resolve(data), {
    json: vi.fn().mockResolvedValue(data),
  });
}

const MOCK_LISTINGS = [
  {
    id: 'listing-1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2021,
    price: 15000,
    vehicle_type: 'SEDÁN',
    description: 'Buen estado',
    photos: [{ url: 'https://example.com/img1.jpg', position: 0 }],
  },
  {
    id: 'listing-2',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2020,
    price: 22000,
    vehicle_type: 'SUV',
    description: '',
    photos: [],
  },
  {
    id: 'listing-3',
    brand: 'Ford',
    model: 'Mustang',
    year: 2022,
    price: 45000,
    vehicle_type: 'Coupé',
    description: '',
    photos: [],
  },
];

describe('useBuyerFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue({ items: MOCK_LISTINGS, count: 3 }),
    });
    apiClient.post.mockReturnValue(mockKyPost({ match_created: false }));
  });

  // ── carga inicial ──────────────────────────────────────────────────────
  describe('carga del feed', () => {
    it('comienza en estado de carga', () => {
      const { result } = renderHook(() => useBuyerFeed());

      expect(result.current.isLoading).toBe(true);
    });

    it('carga los autos desde la API al montar', async () => {
      const { result } = renderHook(() => useBuyerFeed());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.cars).toHaveLength(3);
      expect(apiClient.get).toHaveBeenCalledWith('feed');
    });

    it('mapea brand → make correctamente', async () => {
      const { result } = renderHook(() => useBuyerFeed());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.currentCar.make).toBe('Toyota');
      expect(result.current.currentCar.model).toBe('Corolla');
    });

    it('formatea el precio como string con símbolo', async () => {
      const { result } = renderHook(() => useBuyerFeed());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.currentCar.price).toContain('15');
      expect(result.current.currentCar.price).toContain('US$');
    });

    it('asigna la primera foto disponible', async () => {
      const { result } = renderHook(() => useBuyerFeed());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.currentCar.photo).toBe('https://example.com/img1.jpg');
    });

    it('asigna null como foto cuando no hay fotos', async () => {
      const { result } = renderHook(() => useBuyerFeed());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.nextCar.photo).toBeNull();
    });

    it('muestra error si la API falla', async () => {
      apiClient.get.mockReturnValue({
        json: vi.fn().mockRejectedValue(new Error('Network error')),
      });

      const { result } = renderHook(() => useBuyerFeed());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeTruthy();
      expect(result.current.cars).toHaveLength(0);
    });

    it('maneja respuesta con items vacíos', async () => {
      apiClient.get.mockReturnValue({
        json: vi.fn().mockResolvedValue({ items: [], count: 0 }),
      });

      const { result } = renderHook(() => useBuyerFeed());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.cars).toHaveLength(0);
      expect(result.current.currentCar).toBeUndefined();
    });
  });

  // ── swipe ──────────────────────────────────────────────────────────────
  describe('lógica de swipe', () => {
    it('elimina el primer auto al hacer swipe', async () => {
      const { result } = renderHook(() => useBuyerFeed());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => { result.current.handleSwipe('like'); });

      expect(result.current.cars).toHaveLength(2);
      expect(result.current.currentCar.make).toBe('Mazda');
    });

    it('handleLike llama a la API con dirección "like"', async () => {
      const { result } = renderHook(() => useBuyerFeed());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => { result.current.handleLike(); });

      expect(apiClient.post).toHaveBeenCalledWith('swipes', {
        json: { listing_id: 'listing-1', direction: 'like' },
      });
    });

    it('handleDislike llama a la API con dirección "pass" (no "dislike")', async () => {
      const { result } = renderHook(() => useBuyerFeed());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => { result.current.handleDislike(); });

      expect(apiClient.post).toHaveBeenCalledWith('swipes', {
        json: { listing_id: 'listing-1', direction: 'pass' },
      });
    });

    it('el segundo auto pasa a ser currentCar después del primer swipe', async () => {
      const { result } = renderHook(() => useBuyerFeed());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => { result.current.handleSwipe('dislike'); });

      expect(result.current.currentCar.id).toBe('listing-2');
      expect(result.current.nextCar.id).toBe('listing-3');
    });

    it('currentCar es undefined cuando se agotan todos los autos', async () => {
      const { result } = renderHook(() => useBuyerFeed());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => { result.current.handleSwipe('like'); });
      act(() => { result.current.handleSwipe('like'); });
      act(() => { result.current.handleSwipe('like'); });

      expect(result.current.currentCar).toBeUndefined();
      expect(result.current.cars).toHaveLength(0);
    });

    it('no llama a la API de swipe si no hay auto actual', async () => {
      apiClient.get.mockReturnValue({
        json: vi.fn().mockResolvedValue({ items: [], count: 0 }),
      });

      const { result } = renderHook(() => useBuyerFeed());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => { result.current.handleSwipe('like'); });

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });
});
