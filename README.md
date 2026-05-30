# AutoMatch

Plataforma de matchmaking para vehículos usados con feed adaptativo tipo *swipe*. Conecta compradores y vendedores según preferencias y habilita chat directo cuando hay match.

Proyecto universitario · **Diseño de Software** · UCT 2026.

## Stack

![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-008ECF?logo=gin&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-HS256-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

## Cómo levantarlo

```bash
make up                  # backend + postgres
cd apps/client && npm install && npm run dev   # frontend
```

- 🚀 API → http://localhost:8080
- 📘 Swagger → http://localhost:8080/swagger/index.html
- 🖥️ Frontend → http://localhost:3000

## Estructura

```
apps/
├── server/   → Go + Gin + Postgres (arquitectura en capas)
└── client/   → Next.js + React + TypeScript
.docs/endpoints/  → contratos de la API por módulo
```

## Módulos (16 endpoints REST)

| Módulo | FR | Estado |
|---|---|---|
| Auth + Perfil | FR-01, FR-02 | ✅ |
| Listings | FR-12 | ✅ |
| Feed + Swipe | FR-03, FR-04 | ✅ |
| Match + Chat | FR-19 | ✅ |

## Arquitectura y patrones

**Capas:** `Handler → Service → Repository → Domain`

**SOLID:** SRP, OCP, LSP, ISP, DIP — todos aplicados y verificados con tests.

**Patrones aplicados:**

| Categoría | Patrón |
|---|---|
| Creacional | Factory Method (`NewUser`, `NewListing`, ...) |
| Estructural | Repository · DTO |
| Comportamiento | Strategy (`PasswordHasher`) · Middleware (JWT) · Specification (`ListingFilter`) |

Detalle completo en [`apps/server/docs/PATTERNS.md`](apps/server/docs/PATTERNS.md) y [`apps/server/docs/ARCHITECTURE.md`](apps/server/docs/ARCHITECTURE.md).

## Tests

```bash
make server-test   # 22 tests unitarios con mocks
```

## Equipo

👨‍💻 Benjamín Aliaga · Juan Carrera · Benjamín de la Fuente · Lizardo Salazar

🎓 Prof. Guido Mellado · Ay. Luciano Revillod · UCT 2026
