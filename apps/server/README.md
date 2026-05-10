# AutoMatch — Server

Backend en Go + Gin sobre arquitectura en capas.

## Estructura

```
cmd/api/                 → composition root (DI)
internal/
  domain/                → entidades puras
  repository/            → interfaces + impl Postgres (patrón Repository)
  service/               → lógica de negocio
  handler/               → adaptadores HTTP (Gin) + DTOs
  middleware/            → JWT auth
  auth/                  → PasswordHasher (Strategy) + JWT issuer
  shared/                → config, conexión DB
migrations/              → SQL ejecutado al levantar Postgres
```

## Comandos rápidos (desde la raíz del monorepo)

```bash
make up            # docker compose up --build
make server-test   # go test ./...
make server-run    # correr local (necesita .env)
```

## API docs (Swagger UI)

Con el server corriendo: **http://localhost:8080/swagger/index.html**

Si modificas anotaciones `@Summary`, `@Param`, etc. en los handlers, regenera con:

```bash
make server-docs
```

(Requiere `go install github.com/swaggo/swag/cmd/swag@latest`.)

## Patrones aplicados

Ver [`docs/PATTERNS.md`](docs/PATTERNS.md) y [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Endpoints

Ver [`.docs/endpoints/`](../../.docs/endpoints/) en la raíz del monorepo.
