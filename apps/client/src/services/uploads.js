import { apiClient } from './apiClient';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, mismo límite que el backend

// Sube una imagen al bucket y devuelve su URL pública.
// Timeout amplio: el default de ky (10s) abortaría subidas de 5MB en
// conexiones lentas.
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { url } = await apiClient
    .post('uploads/images', { body: formData, timeout: 60_000 })
    .json();
  return url;
}
