# Listings (FR-12) — placeholder

A completar por el integrante encargado del módulo de Gestión de Listings.

## Endpoints sugeridos

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/listings` | JWT (seller) | Publicar un vehículo |
| `GET`  | `/api/v1/listings/:id` | público | Detalle de un listing |
| `GET`  | `/api/v1/listings/me` | JWT (seller) | Mis publicaciones |
| `PATCH` | `/api/v1/listings/:id` | JWT (dueño) | Editar |
| `DELETE` | `/api/v1/listings/:id` | JWT (dueño) | Despublicar |
| `POST` | `/api/v1/listings/:id/photos` | JWT (dueño) | Subir foto |

## Campos obligatorios (PDF — FR-12)

- marca
- modelo
- precio
- fotos (al menos 1)

Campos sugeridos adicionales: año, tipo de vehículo, descripción, kilometraje, comuna.

> **Nota:** registrar las rutas dentro del grupo `protected` en `apps/server/cmd/api/main.go` para tener auth automática. Usar `middleware.UserIDFrom(c)` para obtener el `seller_id`.
