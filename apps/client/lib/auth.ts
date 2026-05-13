// Tipos para el contexto de autenticación
export type UserRole = 'buyer' | 'seller' | null;

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

// Funciones utilitarias para auth
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveAuthData(token: string, user: AuthUser) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Decodificar JWT básicamente (sin verificar firma)
export function decodeToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}
