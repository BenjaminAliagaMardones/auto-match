const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Lee user_id y role desde el JWT guardado en localStorage.
 * El backend emite tokens HS256 con payload { user_id, role, iss, exp, iat }.
 * Devuelve null si no hay token o si está mal formado/expirado.
 */
export type TokenClaims = {
  user_id: string;
  role: 'buyer' | 'seller';
  exp: number;
};

export function getTokenClaims(): TokenClaims | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload as TokenClaims;
  } catch {
    return null;
  }
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Obtenemos el token del localStorage si estamos en el navegador
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Manejo de respuestas sin contenido (ej. un 204 No Content)
  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en la petición a la API');
  }

  return data;
}