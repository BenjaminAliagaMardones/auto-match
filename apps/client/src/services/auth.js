import { apiClient } from './apiClient';

export const authService = {
    login: async (credentials) => {
        // credentials = { email, password }
        const response = await apiClient.post('auth/login', { json: credentials }).json();

        // Si el backend devuelve un token, lo guardamos en la sesión
        if (response.token) {
            sessionStorage.setItem('auth-token', response.token);
        }
        return response;
    },

    register: async (userData) => {
        return await apiClient.post('auth/register', { json: userData }).json();
    },

    me: async () => {
        return await apiClient.get('auth/me').json();
    },

    logout: () => {
        sessionStorage.removeItem('auth-token');
    }
};