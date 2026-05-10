# AutoMatch — Client

Frontend del proyecto. **A construir por el integrante encargado de UI.**

Sugerencia (PDF, sección 4): React.js o Next.js. Punto de partida visual disponible en el HTML estático en la raíz del repo (`motor-match-v3.html`) y el diseño en Claude Design.

## Inicializar

```bash
# desde apps/client/
npm create vite@latest . -- --template react-ts
# o
npx create-next-app@latest .
```

## Variables esperadas

```
VITE_API_URL=http://localhost:8080/api/v1
```

(o `NEXT_PUBLIC_API_URL` si se usa Next).

## Endpoints disponibles

Ver [`.docs/endpoints/`](../../.docs/endpoints/) en la raíz del repo.
