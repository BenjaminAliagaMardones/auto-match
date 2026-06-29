import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth';

vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { apiClient } from './apiClient';

const mockPost = (data) =>
  Object.assign(Promise.resolve(data), { json: vi.fn().mockResolvedValue(data) });

const mockGet = (data) =>
  Object.assign(Promise.resolve(data), { json: vi.fn().mockResolvedValue(data) });

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('authService.login', () => {
  it('llama al endpoint correcto', async () => {
    apiClient.post.mockReturnValue(mockPost({ token: 'abc' }));
    await authService.login({ email: 'a@b.com', password: '123' });
    expect(apiClient.post).toHaveBeenCalledWith('auth/login', { json: { email: 'a@b.com', password: '123' } });
  });

  it('guarda el token en sessionStorage cuando el servidor lo devuelve', async () => {
    apiClient.post.mockReturnValue(mockPost({ token: 'mytoken' }));
    await authService.login({ email: 'a@b.com', password: '123' });
    expect(sessionStorage.getItem('auth-token')).toBe('mytoken');
  });

  it('no guarda token si la respuesta no lo incluye', async () => {
    apiClient.post.mockReturnValue(mockPost({ user: { id: 1 } }));
    await authService.login({ email: 'a@b.com', password: '123' });
    expect(sessionStorage.getItem('auth-token')).toBeNull();
  });

  it('devuelve la respuesta completa del servidor', async () => {
    const serverResponse = { token: 'tok', user: { id: 1, email: 'a@b.com' } };
    apiClient.post.mockReturnValue(mockPost(serverResponse));
    const result = await authService.login({ email: 'a@b.com', password: '123' });
    expect(result).toEqual(serverResponse);
  });
});

describe('authService.register', () => {
  it('llama al endpoint correcto con los datos del usuario', async () => {
    apiClient.post.mockReturnValue(mockPost({ id: 1 }));
    const userData = { email: 'new@user.com', password: 'pass', role: 'buyer' };
    await authService.register(userData);
    expect(apiClient.post).toHaveBeenCalledWith('auth/register', { json: userData });
  });

  it('no guarda token en sessionStorage', async () => {
    apiClient.post.mockReturnValue(mockPost({ id: 1 }));
    await authService.register({ email: 'x@y.com', password: '123' });
    expect(sessionStorage.getItem('auth-token')).toBeNull();
  });

  it('devuelve la respuesta del servidor', async () => {
    const serverResponse = { id: 42, email: 'new@user.com' };
    apiClient.post.mockReturnValue(mockPost(serverResponse));
    const result = await authService.register({ email: 'new@user.com', password: 'pass' });
    expect(result).toEqual(serverResponse);
  });
});

describe('authService.logout', () => {
  it('elimina el token de sessionStorage', () => {
    sessionStorage.setItem('auth-token', 'sometoken');
    authService.logout();
    expect(sessionStorage.getItem('auth-token')).toBeNull();
  });

  it('no lanza error si no hay token guardado', () => {
    expect(() => authService.logout()).not.toThrow();
  });
});

describe('authService.me', () => {
  it('llama al endpoint correcto', async () => {
    apiClient.get.mockReturnValue(mockGet({ id: 1, email: 'a@b.com' }));
    await authService.me();
    expect(apiClient.get).toHaveBeenCalledWith('auth/me');
  });

  it('devuelve los datos del usuario', async () => {
    const user = { id: 5, email: 'me@test.com', role: 'buyer' };
    apiClient.get.mockReturnValue(mockGet(user));
    const result = await authService.me();
    expect(result).toEqual(user);
  });
});
