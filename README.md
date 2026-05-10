# AutoMatch

Plataforma de matchmaking para vehículos usados. Proyecto universitario, asignatura **Diseño de Software** (UCT).

Esta primera entrega cubre el módulo de **Autenticación y Perfil** (FR-01, FR-02) sobre una **arquitectura en capas** con varios patrones de diseño aplicados (ver [`apps/server/docs/PATTERNS.md`](apps/server/docs/PATTERNS.md)).

## Layout (monorepo)

```
.
├── apps/
│   ├── server/          → backend Go + Gin
│   └── client/          → frontend (placeholder)
├── .docs/
│   └── endpoints/       → contrato de la API por módulo
├── compose.yml          → docker compose (postgres + server)
├── Makefile
└── README.md
```

## Stack

- **Backend:** Go 1.26 + Gin
- **DB:** PostgreSQL 16
- **Auth:** JWT (HS256) + bcrypt
- **Frontend:** a definir (React/Next sugerido en el PDF)
- **Infra:** Docker Compose

## Levantar el proyecto

```bash
make up
```

Esto arranca:
- `postgres` en `localhost:5432`
- `server` en `localhost:8080`

Las migraciones SQL en `apps/server/migrations/` se ejecutan automáticamente la primera vez.

### Sin Docker

```bash
cp .env.example apps/server/.env  # ajustar si hace falta
make server-tidy
make server-run
```

## Probar la API

Con el stack arriba, abrir en el navegador:

**[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)**

Ahí están todos los endpoints documentados, se pueden ejecutar desde la UI. Para los protegidos:
1. Hacer `POST /auth/register` y luego `POST /auth/login`.
2. Copiar el `token` de la respuesta.
3. Click en el botón **Authorize** (arriba a la derecha) y pegar `Bearer <token>`.
4. Ya se pueden ejecutar `GET /profile/me` y `PUT /profile/me`.

## Endpoints

Ver [`.docs/endpoints/`](.docs/endpoints/) para documentación en markdown, o el Swagger UI arriba.

| Módulo | Estado |
|---|---|
| [Auth + Perfil](.docs/endpoints/auth.md) | implementado |
| [Listings](.docs/endpoints/listings.md) | placeholder |
| [Feed / Swipe](.docs/endpoints/feed.md) | placeholder |
| [Match + Chat](.docs/endpoints/match.md) | placeholder |

## Smoke test rápido

```bash
# 1. Registrar
curl -X POST localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ben@uct.cl","password":"secret123","role":"buyer"}'

# 2. Login
TOKEN=$(curl -s -X POST localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ben@uct.cl","password":"secret123"}' | jq -r .token)

# 3. Mi perfil
curl localhost:8080/api/v1/profile/me -H "Authorization: Bearer $TOKEN"

# 4. Configurar preferencias
curl -X PUT localhost:8080/api/v1/profile/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_type":"suv","budget_min":5000000,"budget_max":12000000}'
```

## Para el equipo

Cada integrante debe trabajar dentro de la estructura ya montada:

- **Listings (FR-12)** — completar `apps/server/migrations/003_listings.sql`, `apps/server/internal/domain/listing.go`, y crear repo/service/handler siguiendo el patrón del módulo Auth.
- **Feed/Swipe (FR-03, FR-04)** y **Match + Chat (FR-19)** — análogo, usando `apps/server/migrations/004_matches.sql` y `apps/server/internal/domain/match.go`.
- **Frontend** — trabajar en `apps/client/`. La API REST está documentada en `.docs/endpoints/`.

Para proteger endpoints, registrar las rutas dentro del grupo `protected` en `apps/server/cmd/api/main.go` y obtener el `user_id` con `middleware.UserIDFrom(c)`.

## Tests

```bash
make server-test
```

## Equipo

Benjamín Aliaga · Juan Carrera · Benjamín de la Fuente · Lizardo Salazar
Profesor: Guido Mellado · Ayudante: Luciano Revillod · UCT 2026
