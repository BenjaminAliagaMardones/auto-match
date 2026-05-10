# Endpoints — AutoMatch API

Base URL: `http://localhost:8080/api/v1`

| Módulo | Archivo | Estado |
|---|---|---|
| Auth + Perfil | [auth.md](auth.md) | implementado |
| Listings | [listings.md](listings.md) | placeholder (otro integrante) |
| Feed / Swipe | [feed.md](feed.md) | placeholder (otro integrante) |
| Match + Chat | [match.md](match.md) | placeholder (otro integrante) |

## Autenticación

Todos los endpoints marcados como protegidos requieren el header:

```
Authorization: Bearer <jwt>
```

El token se obtiene desde `POST /auth/login`. Algoritmo: HS256, expiración: 24h.

## Códigos de error

| Status | Significado |
|---|---|
| 400 | Request inválido (validación de body, query, etc.) |
| 401 | Falta token, token inválido, token expirado, credenciales incorrectas |
| 403 | Autenticado pero sin permiso para la acción |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: email ya registrado) |
| 500 | Error interno |

Formato de respuesta de error:

```json
{ "error": "descripción legible" }
```
