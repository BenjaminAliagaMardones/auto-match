import ky from 'ky';

const getToken = () => sessionStorage.getItem('auth-token');

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Base del WebSocket derivada de la misma URL de la API (http→ws, https→wss).
// Se resuelve contra el origin para soportar VITE_API_URL relativa (/api/v1)
// en despliegues detrás de un reverse proxy.
const apiUrl = new URL(API_BASE_URL, window.location.origin);
apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
export const WS_BASE_URL = apiUrl.href.replace(/\/$/, '');

export const apiClient = ky.create({
  prefix: API_BASE_URL,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401) {
          sessionStorage.removeItem('auth-token');
          window.location.href = '/auth/login';
        }
      },
    ],
  },
});
