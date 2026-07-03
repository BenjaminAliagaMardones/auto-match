# Uploads — Imágenes al bucket

Las imágenes de los listings se guardan en un bucket S3-compatible (MinIO en desarrollo, ver `compose.yml`). El flujo del cliente es: subir la imagen → recibir la URL pública → usar esa URL en `photo_urls` al crear el listing.

## Endpoints

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/uploads/images` | JWT | Sube una imagen y devuelve su URL pública |

## `POST /uploads/images`

Request: `multipart/form-data` con el campo `image`.

Restricciones:
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp` (se detecta desde los bytes, no desde el nombre del archivo).
- Tamaño máximo: 5MB (413 si se supera).

Respuesta `201`:

```json
{ "url": "http://localhost:9000/automatch/listings/<uuid>.png" }
```

## MinIO (desarrollo)

- API S3: `http://localhost:9000` (las URLs públicas apuntan aquí)
- Consola web: `http://localhost:9001` (usuario `automatch`, password `automatch-secret`)
- Bucket: `automatch`, se crea automáticamente al arrancar el server con política de lectura pública.

## Chat en tiempo real (WebSocket)

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` (upgrade) | `/api/v1/ws/chat?token=<jwt>` | JWT por query param | Conexión WebSocket para chat de matches |

Mensaje entrante (cliente → server):

```json
{ "matchId": "<uuid>", "text": "hola" }
```

Mensaje saliente (server → ambos participantes del match, incluye eco al remitente):

```json
{ "id": "<uuid>", "matchId": "<uuid>", "senderId": "<uuid>", "text": "hola", "createdAt": "2026-07-03T06:46:12Z" }
```

El mensaje se persiste en la tabla `messages` antes de transmitirse; el historial se recupera con `GET /matches/:id/messages`.
