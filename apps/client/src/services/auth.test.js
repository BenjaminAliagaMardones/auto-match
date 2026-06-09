import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth';

vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { apiClient } from './apiClient';

describe('authService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  // ── login ──────────────────────────────────────────────────────────────
  describe('login', () => {
    it('almacena el token en sessionStorage cuando el login es exitoso', async () => {
      apiClient.post.mockReturnValue({
        json: vi.fn().mockResolvedValue({
          token: 'jwt-test-token',
          user: { id: '1', email: 'test@test.com', role: 'buyer' },
        }),
      });

      await authService.login({ email: 'test@test.com', password: '123456' });

      expect(sessionStorage.getItem('auth-token')).toBe('jwt-test-token');
    });

    it('retorna la respuesta completa del servidor', async () => {
      const mockResponse = {
        token: 'jwt-test-token',
        user: { id: '1', email: 'test@test.com', role: 'buyer' },
      };
      apiClient.post.mockReturnValue({ json: vi.fn().mockResolvedValue(mockResponse) });

      const result = await authService.login({ email: 'test@test.com', password: '123456' });

      expect(result).toEqual(mockResponse);
    });

    it('llama al endpoint correcto con las credenciales', async () => {
      apiClient.post.mockReturnValue({ json: vi.fn().mockResolvedValue({ token: 'token' }) });
      const credentials = { email: 'test@test.com', password: '123456' };

      await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('auth/login', { json: credentials });
    });

    it('no almacena token si la respuesta no lo incluye', async () => {
      apiClient.post.mockReturnValue({ json: vi.fn().mockResolvedValue({ user: null }) });

      await authService.login({ email: 'test@test.com', password: 'wrong' });

      expect(sessionStorage.getItem('auth-token')).toBeNull();
    });
  });

  // ── register ───────────────────────────────────────────────────────────
  describe('register', () => {
    it('llama al endpoint de registro con los datos del usuario', async () => {
      const userData = { email: 'nuevo@test.com', password: '123456', role: 'buyer' };
      apiClient.post.mockReturnValue({
        json: vi.fn().mockResolvedValue({ id: '2', email: userData.email, role: userData.role }),
      });

      await authService.register(userData);

      expect(apiClient.post).toHaveBeenCalledWith('auth/register', { json: userData });
    });

    it('no almacena token al registrarse', async () => {
      apiClient.post.mockReturnValue({
        json: vi.fn().mockResolvedValue({ id: '2', email: 'nuevo@test.com' }),
      });

      await authService.register({ email: 'nuevo@test.com', password: '123456', role: 'seller' });

      expect(sessionStorage.getItem('auth-token')).toBeNull();
    });

    it('retorna los datos del usuario creado', async () => {
      const newUser = { id: '3', email: 'seller@test.com', role: 'seller' };
      apiClient.post.mockReturnValue({ json: vi.fn().mockResolvedValue(newUser) });

      const result = await authService.register({ email: 'seller@test.com', password: '123456', role: 'seller' });

      expect(result).toEqual(newUser);
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('elimina el token de sessionStorage', () => {
      sessionStorage.setItem('auth-token', 'token-existente');

      authService.logout();

      expect(sessionStorage.getItem('auth-token')).toBeNull();
    });

    it('no lanza error si no hay token guardado', () => {
      expect(() => authService.logout()).not.toThrow();
    });
  });

  // ── me ─────────────────────────────────────────────────────────────────
  describe('me', () => {
    it('llama al endpoint correcto para obtener el usuario actual', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: 'buyer' };
      apiClient.get.mockReturnValue({ json: vi.fn().mockResolvedValue(mockUser) });

      const result = await authService.me();

      expect(apiClient.get).toHaveBeenCalledWith('auth/me');
      expect(result).toEqual(mockUser);
    });
  });
});
