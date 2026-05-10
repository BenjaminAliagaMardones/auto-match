# Arquitectura — AutoMatch Backend

## Arquitectura en capas (Layered Architecture)

```
┌──────────────────────────────────────────────────┐
│ HANDLER (HTTP)        Gin handlers + DTOs        │ ← presentación
│   internal/handler/                              │
├──────────────────────────────────────────────────┤
│ SERVICE (lógica)      reglas de negocio          │ ← aplicación
│   internal/service/                              │
├──────────────────────────────────────────────────┤
│ REPOSITORY (DAO)      acceso a datos             │ ← persistencia
│   internal/repository/                           │
├──────────────────────────────────────────────────┤
│ DOMAIN (entidades)    User, BuyerProfile, ...    │ ← dominio
│   internal/domain/                               │
└──────────────────────────────────────────────────┘
                       ↓
                   PostgreSQL
```

### Reglas

1. **Las dependencias apuntan hacia abajo.** El dominio no importa nada del resto.
2. **El service depende de interfaces (Repository), no de Postgres.** Esto permite cambiar la base o usar mocks en tests.
3. **El handler nunca toca la base de datos directamente.** Solo habla con el service y traduce HTTP ↔ dominio vía DTOs.

## Flujo de un request — `POST /api/v1/auth/login`

```
   Cliente
     │ HTTP POST {email, password}
     ▼
┌───────────────────────────────────────────┐
│ Handler (auth_handler.go)                 │
│  · valida JSON con tags binding           │
│  · convierte DTO → input del service      │
└───────────────────┬───────────────────────┘
                    ▼
┌───────────────────────────────────────────┐
│ Service (auth_service.go)                 │
│  · users.FindByEmail(...)                 │
│  · hasher.Verify(plain, hash)             │
│  · jwt.Issue(userID, role)                │
└───────────────────┬───────────────────────┘
                    ▼
┌───────────────────────────────────────────┐
│ Repository (user_repo.go)                 │
│  · SELECT ... FROM users WHERE email = $1 │
└───────────────────┬───────────────────────┘
                    ▼
                 Postgres
                    │
                    ▼ filas
                  scanUser → *domain.User
                    ▲
                    │ resultado
                    │
              token JWT firmado
                    ▲
                    │
                  HTTP 200 LoginResponse
```

## Composition root

Todo el grafo de dependencias se construye en un solo lugar: [`cmd/api/main.go`](../cmd/api/main.go).

```go
hasher      := auth.NewBcryptHasher(bcrypt.DefaultCost)
jwtIssuer   := auth.NewJWTIssuer(cfg.JWTSecret, 24*time.Hour)
userRepo    := repository.NewPostgresUserRepository(conn)
authService := service.NewAuthService(userRepo, hasher, jwtIssuer)
authHandler := handler.NewAuthHandler(authService)
```

Cada capa recibe sus colaboradores por constructor → **Inyección de Dependencias**.

## Por qué `internal/`

Go bloquea imports a paquetes bajo `internal/` desde fuera del módulo. Eso garantiza que **solo `cmd/api`** puede armar el grafo de dependencias completo. Si alguien intenta saltarse las capas (ej: que un test externo importe directo el repository), el compilador lo bloquea.
