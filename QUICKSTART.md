# Quickstart

## 1. Instala dependencias

```bash
npm run install:all
```

## 2. Configura variables

### Backend

```bash
cd app/backend
copy .env.example .env
```

Completa:

- `DATABASE_URL` de Neon
- `S3_*` de Cloudflare R2
- `CORS_ALLOWED_ORIGINS`

### Frontend

```bash
cd ../frontend
copy .env.example .env
```

Pon:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 3. Corre el proyecto

Desde la raiz:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 4. Deploy recomendado

- Frontend: Cloudflare Pages
  - Root directory: `app/frontend`
  - Build command: `npm run build`
  - Output directory: `build`
  - Env var: `REACT_APP_API_URL=https://tu-backend.onrender.com`

- Backend: Render
  - Usa `render.yaml` o configura manualmente `app/backend`
  - Build command: `npm install && npm run build`
  - Start command: `npm start`

- Base de datos: Neon Postgres
  - Copia su connection string en `DATABASE_URL`

- Imagenes: Cloudflare R2
  - Crea el bucket
  - Genera API token / access keys
  - Completa `S3_ENDPOINT`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`
