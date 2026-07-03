import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth';

// Mock de la dependencia apiClient para evitar realizar peticiones HTTP reales durante las pruebas.
// Se interceptan los métodos post y get devolviendo mocks (vi.fn()) controlables.
vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { apiClient } from './apiClient';

// Helper para simular una respuesta exitosa de un método POST.
// Devuelve una promesa resuelta con el objeto que implementa la función .json(),
// la cual a su vez resuelve con los datos de respuesta mockeados.
const mockPost = (data) =>
  Object.assign(Promise.resolve(data), { json: vi.fn().mockResolvedValue(data) });

// Helper para simular una respuesta exitosa de un método GET, de forma análoga a mockPost.
const mockGet = (data) =>
  Object.assign(Promise.resolve(data), { json: vi.fn().mockResolvedValue(data) });

// Configuración previa a cada test individual.
// Garantiza el aislamiento de las pruebas limpiando el historial de llamados de los mocks
// y vaciando el sessionStorage.
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

// Pruebas unitarias para el método login de authService.
describe('authService.login', () => {
  // Caso 1: Verificar que se llame al endpoint REST '/auth/login' con los parámetros correctos.
  it('llama al endpoint correcto', async () => {
    apiClient.post.mockReturnValue(mockPost({ token: 'abc' }));
    await authService.login({ email: 'a@b.com', password: '123' });
    expect(apiClient.post).toHaveBeenCalledWith('auth/login', {
      json: { email: 'a@b.com', password: '123' },
    });
  });

  // Caso 2: Verificar que si el servidor retorna un token JWT, se guarde en sessionStorage para mantener la sesión.
  it('guarda el token en sessionStorage cuando el servidor lo devuelve', async () => {
    apiClient.post.mockReturnValue(mockPost({ token: 'mytoken' }));
    await authService.login({ email: 'a@b.com', password: '123' });
    expect(sessionStorage.getItem('auth-token')).toBe('mytoken');
  });

  // Caso 3: Verificar que no se guarde nada en sessionStorage si la respuesta HTTP no contiene un token.
  it('no guarda token si la respuesta no lo incluye', async () => {
    apiClient.post.mockReturnValue(mockPost({ user: { id: 1 } }));
    await authService.login({ email: 'a@b.com', password: '123' });
    expect(sessionStorage.getItem('auth-token')).toBeNull();
  });

  // Caso 4: Verificar que el método retorne la respuesta completa del servidor (ej. datos de usuario y token).
  it('devuelve la respuesta completa del servidor', async () => {
    const serverResponse = { token: 'tok', user: { id: 1, email: 'a@b.com' } };
    apiClient.post.mockReturnValue(mockPost(serverResponse));
    const result = await authService.login({ email: 'a@b.com', password: '123' });
    expect(result).toEqual(serverResponse);
  });
});

// Pruebas unitarias para el método register de authService.
describe('authService.register', () => {
  // Caso 1: Verificar que se llame al endpoint REST '/auth/register' enviando el payload del usuario.
  it('llama al endpoint correcto con los datos del usuario', async () => {
    apiClient.post.mockReturnValue(mockPost({ id: 1 }));
    const userData = { email: 'new@user.com', password: 'pass', role: 'buyer' };
    await authService.register(userData);
    expect(apiClient.post).toHaveBeenCalledWith('auth/register', { json: userData });
  });

  // Caso 2: Verificar que el registro no inicie sesión automáticamente (no debe guardar token).
  it('no guarda token en sessionStorage', async () => {
    apiClient.post.mockReturnValue(mockPost({ id: 1 }));
    await authService.register({ email: 'x@y.com', password: '123' });
    expect(sessionStorage.getItem('auth-token')).toBeNull();
  });

  // Caso 3: Verificar que retorne el objeto con la respuesta del servidor (ej. ID de usuario creado).
  it('devuelve la respuesta del servidor', async () => {
    const serverResponse = { id: 42, email: 'new@user.com' };
    apiClient.post.mockReturnValue(mockPost(serverResponse));
    const result = await authService.register({ email: 'new@user.com', password: 'pass' });
    expect(result).toEqual(serverResponse);
  });
});

// Pruebas unitarias para el método logout de authService.
describe('authService.logout', () => {
  // Caso 1: Verificar que se remueva el token almacenado al cerrar sesión.
  it('elimina el token de sessionStorage', () => {
    sessionStorage.setItem('auth-token', 'sometoken');
    authService.logout();
    expect(sessionStorage.getItem('auth-token')).toBeNull();
  });

  // Caso 2: Verificar robustez, asegurando que no lance errores si se cierra sesión sin haber una activa.
  it('no lanza error si no hay token guardado', () => {
    expect(() => authService.logout()).not.toThrow();
  });
});

// Pruebas unitarias para el método me (obtener perfil actual del usuario autenticado).
describe('authService.me', () => {
  // Caso 1: Verificar que se llame al endpoint REST '/auth/me' por método GET.
  it('llama al endpoint correcto', async () => {
    apiClient.get.mockReturnValue(mockGet({ id: 1, email: 'a@b.com' }));
    await authService.me();
    expect(apiClient.get).toHaveBeenCalledWith('auth/me');
  });

  // Caso 2: Verificar que retorne la información del usuario obtenida del servidor.
  it('devuelve los datos del usuario', async () => {
    const user = { id: 5, email: 'me@test.com', role: 'buyer' };
    apiClient.get.mockReturnValue(mockGet(user));
    const result = await authService.me();
    expect(result).toEqual(user);
  });
});
