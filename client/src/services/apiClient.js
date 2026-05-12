import ky from 'ky';

const getToken = () => sessionStorage.getItem('auth-token');

export const apiClient = ky.create({
    prefixUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    hooks: {
        beforeRequest: [
            (request) => {
                const token = getToken();
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            }
        ],
        afterResponse: [
            async (request, options, response) => {
                if (response.status === 401) {
                    sessionStorage.removeItem('auth-token');
                    window.location.href = '/auth/login';
                }
            }
        ]
    }
});