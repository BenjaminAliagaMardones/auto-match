# Feed / Swipe (FR-03, FR-04) — placeholder

A completar por el integrante encargado del módulo de Feed.

## Endpoints sugeridos

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET`  | `/api/v1/feed` | JWT (buyer) | Próximos N listings ordenados por compatibilidad |
| `POST` | `/api/v1/feed/swipe` | JWT (buyer) | Registrar swipe (`{listing_id, direction: "like"|"pass"}`) |

## Notas

- El feed debe filtrar listings ya swipeados por el comprador.
- Si la dirección es `like`, dispara la creación de un Match (ver `match.md`).
- Para esta entrega, la "compatibilidad" puede ser un orden simple basado en preferencias del perfil (vehicle_type, budget). Las reglas avanzadas RN-01 a RN-06 son del producto final.
