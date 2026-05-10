# Patrones de Diseño Aplicados — AutoMatch Backend

Este documento explica los patrones implementados, dónde están en el código y por qué se eligieron. Es el material base para la presentación.

---

## 1. Repository

**Tipo:** Patrón arquitectónico (data access).

**Dónde:** [`internal/repository/user_repo.go`](../internal/repository/user_repo.go), [`internal/repository/profile_repo.go`](../internal/repository/profile_repo.go).

**Problema que resuelve:** sin Repository, la lógica de negocio termina mezclada con SQL crudo. Cualquier cambio en la base obliga a tocar todo el código de servicio, y los tests requieren una DB real.

**Implementación:** definimos una **interface** que expone operaciones de dominio (`Create`, `FindByEmail`, `FindByID`) y una **implementación concreta** para Postgres. El service consume la interface, no la implementación.

```go
type UserRepository interface {
    Create(ctx context.Context, u *domain.User) error
    FindByEmail(ctx context.Context, email string) (*domain.User, error)
    FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
}
```

**Beneficio en este proyecto:** los tests del `AuthService` usan un `fakeUserRepo` en memoria — no necesitamos Postgres corriendo para correr los tests.

---

## 2. Dependency Injection (DI)

**Tipo:** Principio + patrón de construcción.

**Dónde:** todos los constructores `NewXxx(...)` y el composition root en [`cmd/api/main.go`](../cmd/api/main.go).

**Problema que resuelve:** si un servicio crea internamente sus colaboradores (`repo := postgresRepo.New()`), queda **acoplado** a la implementación concreta y es prácticamente intesteable.

**Implementación:** cada capa declara sus dependencias como parámetros del constructor. El único lugar que conoce las implementaciones concretas es el `main`.

```go
authService := service.NewAuthService(userRepo, hasher, jwtIssuer)
```

**Beneficio:** dependencias **explícitas** (se ven en la firma), **invertidas** (apuntan a abstracciones) y **reemplazables** en tests.

---

## 3. Strategy

**Tipo:** Patrón de comportamiento (GoF).

**Dónde:** [`internal/auth/hasher.go`](../internal/auth/hasher.go).

**Problema que resuelve:** el algoritmo de hashing de contraseñas puede cambiar (bcrypt hoy, argon2 mañana). Si el servicio llama directamente a `bcrypt.GenerateFromPassword`, queda atado a esa librería.

**Implementación:** una interface `PasswordHasher` con dos métodos (`Hash`, `Verify`) y una implementación concreta `BcryptHasher`. El servicio recibe la interface.

```go
type PasswordHasher interface {
    Hash(plain string) (string, error)
    Verify(plain, hashed string) error
}
```

**Beneficio:** intercambiar `BcryptHasher` por `Argon2Hasher` no toca ni una línea del `AuthService`. En tests podemos usar un hasher de costo bajísimo para acelerarlos.

---

## 4. Middleware (Chain of Responsibility)

**Tipo:** Patrón de comportamiento (GoF).

**Dónde:** [`internal/middleware/auth.go`](../internal/middleware/auth.go).

**Problema que resuelve:** la verificación de JWT es transversal a múltiples handlers. Repetirla en cada uno viola DRY y abre la puerta a olvidos (un handler protegido sin validación = vulnerabilidad).

**Implementación:** una `gin.HandlerFunc` que valida el token, inyecta `user_id` en el contexto, o aborta con 401. Se aplica al grupo de rutas protegidas:

```go
protected := api.Group("/")
protected.Use(middleware.JWTAuth(jwtIssuer))
{
    protected.GET("/profile/me", profileHandler.GetMe)
    protected.PUT("/profile/me", profileHandler.UpdateMe)
}
```

**Beneficio:** los handlers protegidos son ignorantes de la autenticación; solo piden `middleware.UserIDFrom(c)` cuando lo necesitan.

---

## 5. DTO (Data Transfer Object)

**Tipo:** Patrón estructural de capas.

**Dónde:** [`internal/handler/dto/`](../internal/handler/dto/).

**Problema que resuelve:** si el handler serializa directamente la entidad de dominio (`domain.User`), el campo `PasswordHash` se filtra en la respuesta JSON. Además, el cliente queda acoplado a la estructura interna del modelo.

**Implementación:** structs separados para request y response, con tags `json` y validaciones (`binding:"required,email"`).

```go
type UserResponse struct {
    ID        string    `json:"id"`
    Email     string    `json:"email"`
    Role      string    `json:"role"`
    CreatedAt time.Time `json:"created_at"`
}
```

**Beneficio:** el contrato HTTP evoluciona independiente del modelo de dominio.

---

## 6. Factory Method

**Tipo:** Patrón creacional (GoF) — uso menor.

**Dónde:** `domain.NewUser(...)` en [`internal/domain/user.go`](../internal/domain/user.go).

**Problema que resuelve:** construir una entidad sin validar invariantes (email vacío, rol inválido) deja el sistema en un estado inválido. Validar en cada caller duplica lógica.

**Implementación:** una función `NewUser` que normaliza el email, valida el rol y genera el UUID. Si falla, devuelve error.

**Beneficio:** **una sola puerta de entrada** para crear entidades válidas.

---

## Resumen para slides

| # | Patrón | Capa | Justificación corta |
|---|---|---|---|
| 1 | Repository | Persistencia | Desacopla DB de la lógica; testing con mocks |
| 2 | Dependency Injection | Composition root | Dependencias explícitas e invertidas |
| 3 | Strategy | Auth | Algoritmo de hashing intercambiable |
| 4 | Middleware (Chain of Resp.) | Handler | Auth transversal sin repetir código |
| 5 | DTO | Handler | Separa contrato HTTP del dominio |
| 6 | Factory Method | Dominio | Garantiza invariantes al crear entidades |
