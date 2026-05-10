# Auth + Perfil

## `POST /api/v1/auth/register`

Crea un usuario nuevo. Público.

**Body**
```json
{
  "email": "ben@uct.cl",
  "password": "secret123",
  "role": "buyer"
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | requerido, formato email |
| `password` | string | requerido, mínimo 6 caracteres |
| `role` | string | requerido, `buyer` o `seller` |

**201 Created**
```json
{
  "id": "9f8d...-...",
  "email": "ben@uct.cl",
  "role": "buyer",
  "created_at": "2026-05-10T15:21:00Z"
}
```

**Errores**
- `400` body inválido / password débil
- `409` email ya registrado

---

## `POST /api/v1/auth/login`

Autentica y devuelve un JWT. Público.

**Body**
```json
{ "email": "ben@uct.cl", "password": "secret123" }
```

**200 OK**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "9f8d...",
    "email": "ben@uct.cl",
    "role": "buyer",
    "created_at": "..."
  }
}
```

**Errores**
- `401` credenciales inválidas (email no existe o password incorrecto)

---

## `GET /api/v1/profile/me`

Devuelve el perfil de preferencias del usuario autenticado. Si aún no fue configurado, devuelve un perfil vacío con `user_id`.

**Auth:** JWT requerido.

**200 OK**
```json
{
  "user_id": "9f8d...",
  "vehicle_type": "suv",
  "budget_min": 5000000,
  "budget_max": 12000000,
  "updated_at": "2026-05-10T15:25:00Z"
}
```

---

## `PUT /api/v1/profile/me`

Actualiza las preferencias del comprador.

**Auth:** JWT requerido.

**Body**
```json
{
  "vehicle_type": "suv",
  "budget_min": 5000000,
  "budget_max": 12000000
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `vehicle_type` | string | opcional |
| `budget_min` | int | opcional, ≥ 0 |
| `budget_max` | int | opcional, ≥ `budget_min` |

**200 OK** — devuelve el perfil actualizado (mismo formato que GET).

**Errores**
- `400` presupuesto inválido
- `401` sin token o token inválido
