# Objetos Perdidos

Aplicacion full-stack para publicar objetos perdidos o encontrados. Quedo preparada para este stack:

- Frontend: `Cloudflare Pages`
- Backend: `Render`
- Base de datos: `Neon Postgres`
- Imagenes: `Cloudflare R2` (S3-compatible)

## Estructura

```text
app/
|-- backend/
|   |-- src/
|   |-- Dockerfile
|   `-- .env.example
`-- frontend/
    |-- public/
    |-- src/
    `-- .env.example
render.yaml
```

## Lo que ya quedo configurado

- El backend ya no usa memoria: crea y usa la tabla `posts` en Postgres.
- Las imagenes se suben a un bucket S3-compatible cuando defines las variables `S3_*`.
- Si no defines `S3_*` en desarrollo local, el backend cae a `app/backend/uploads/`.
- El frontend ya compila para raiz `/`, que es lo correcto para Cloudflare Pages.
- Se agrego `app/frontend/public/_redirects` para que el routing de React funcione al refrescar.
- Se agrego `render.yaml` para que Render pueda levantar el backend mas facil.

## Variables de entorno

### Backend

Copia `app/backend/.env.example` a `app/backend/.env` y completa:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_ayEFsce7d9bB@ep-crimson-sound-adt8btav-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
BACKEND_PUBLIC_URL=http://localhost:5000
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-project.pages.dev
MAX_UPLOAD_SIZE_MB=8
S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET_NAME=lost-and-found-images
S3_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
S3_PUBLIC_BASE_URL=https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

### Frontend

Copia `app/frontend/.env.example` a `app/frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

En Cloudflare Pages, esa misma variable debe apuntar a tu URL de Render.

## Desarrollo local

1. Instala dependencias:

```bash
npm run install:all
```

2. Crea tus archivos `.env` a partir de los `.env.example`.

3. Levanta todo:

```bash
npm run dev
```

## API

- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/health`

## Deploy

La guia completa esta en [DEPLOYMENT.md](./DEPLOYMENT.md).
