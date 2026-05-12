const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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