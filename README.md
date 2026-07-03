# AutoMatch

Plataforma de matchmaking para vehículos usados con feed adaptativo tipo *swipe*. Conecta compradores y vendedores según preferencias y habilita chat directo cuando hay match.

Proyecto universitario · **Diseño de Software** · UCT 2026.

## Stack

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-008ECF?style=for-the-badge&logo=gin&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)



## Cómo levantarlo

```bash
make up                  # backend + postgres + minio (bucket de imágenes)
cd apps/client && npm install && npm run dev   # frontend
```

-  API → http://localhost:8080
-  Swagger → http://localhost:8080/swagger/index.html
-  MinIO (bucket de imágenes) → http://localhost:9001 (consola, user/pass: `automatch` / `automatch-secret`)
-  Frontend → http://localhost:3000

## Estructura

```
apps/
├── server/   → Go + Gin + Postgres (arquitectura en capas)
└── client/   → Next.js + React + TypeScript
.docs/endpoints/  → contratos de la API por módulo
```

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

 Benjamín Aliaga · Juan Carrera · Benjamín de la Fuente · Lizardo Salazar

 Prof. Guido Mellado · Ay. Luciano Revillod · UCT 2026
