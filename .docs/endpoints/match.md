# Match + Chat (FR-19) — placeholder

A completar por el integrante encargado del módulo de Match y Comunicación.

## Endpoints sugeridos

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET`  | `/api/v1/matches` | JWT | Listado de matches del usuario (como buyer o como seller) |
| `GET`  | `/api/v1/matches/:id/messages` | JWT (parte del match) | Historial de chat |
| `POST` | `/api/v1/matches/:id/messages` | JWT (parte del match) | Enviar mensaje (`{body}`) |

## Notas

- Match se crea automáticamente cuando un buyer hace swipe `like` sobre un listing activo.
- Para esta entrega, el chat puede ser HTTP polling (no es necesario WebSocket).
- Validar que el remitente sea el buyer del match o el seller del listing asociado.
