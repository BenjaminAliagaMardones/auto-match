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

const FEED_ITEMS = [
  { id: 10, brand: 'Toyota', model: 'Corolla', year: 2021, price: 17500, vehicle_type: 'Sedán', photos: [{ url: 'http://img.com/1.jpg' }] },
  { id: 11, brand: 'Mazda', model: 'CX-5', year: 2020, price: 22000, vehicle_type: 'SUV', photos: [] },
  { id: 12, brand: 'Ford', model: 'Mustang', year: 2022, price: 45000, vehicle_type: 'Coupé', photos: null },
];

const mockKyGet = (data) =>
  Object.assign(Promise.resolve(data), { json: vi.fn().mockResolvedValue(data) });

const mockKyPost = (data = {}) =>
  Object.assign(Promise.resolve(data), { json: vi.fn().mockResolvedValue(data) });

beforeEach(() => {
  vi.clearAllMocks();
  apiClient.get.mockReturnValue(mockKyGet(FEED_ITEMS));
  apiClient.post.mockReturnValue(mockKyPost({}));
});

describe('useBuyerFeed — carga del feed', () => {
  it('empieza con isLoading true y cars vacío', () => {
    const { result } = renderHook(() => useBuyerFeed());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.cars).toEqual([]);
  });

  it('llama a GET /feed al montar', async () => {
    renderHook(() => useBuyerFeed());
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('feed'));
  });

  it('isLoading pasa a false después de cargar', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('mapea brand → make correctamente', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    expect(result.current.cars[0].make).toBe('Toyota');
  });

  it('mapea year a string', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    expect(result.current.cars[0].year).toBe('2021');
  });

  it('mapea price a formato US$', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    expect(result.current.cars[0].price).toContain('17');
  });

  it('usa la primera foto si está disponible', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    expect(result.current.cars[0].photo).toBe('http://img.com/1.jpg');
  });

  it('photo es null si photos está vacío', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    expect(result.current.cars[1].photo).toBeNull();
  });
});

describe('useBuyerFeed — lógica de swipe', () => {
  it('handleLike elimina el primer auto', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    act(() => result.current.handleLike());
    expect(result.current.cars.length).toBe(2);
  });

  it('handleDislike elimina el primer auto', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    act(() => result.current.handleDislike());
    expect(result.current.cars.length).toBe(2);
  });

  it('handleLike llama a POST /swipes con direction like', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    act(() => result.current.handleLike());
    expect(apiClient.post).toHaveBeenCalledWith('swipes', {
      json: { listing_id: 10, direction: 'like' },
    });
  });

  it('handleDislike llama a POST /swipes con direction pass', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    act(() => result.current.handleDislike());
    expect(apiClient.post).toHaveBeenCalledWith('swipes', {
      json: { listing_id: 10, direction: 'pass' },
    });
  });

  it('cars queda vacío después de agotar el feed', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    act(() => result.current.handleLike());
    act(() => result.current.handleLike());
    act(() => result.current.handleLike());
    expect(result.current.cars.length).toBe(0);
  });

  it('currentCar es undefined cuando el feed está agotado', async () => {
    const { result } = renderHook(() => useBuyerFeed());
    await waitFor(() => expect(result.current.cars.length).toBe(3));
    act(() => result.current.handleLike());
    act(() => result.current.handleLike());
    act(() => result.current.handleLike());
    expect(result.current.currentCar).toBeUndefined();
  });
});
