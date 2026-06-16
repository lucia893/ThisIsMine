# Deployment

Esta app quedo preparada para:

- Frontend en `Cloudflare Pages`
- Backend en `Render`
- DB en `Neon Postgres`
- Imagenes en `Cloudflare R2`

## 1. Neon Postgres

1. Crea un proyecto en Neon.
2. Crea una base.
3. Copia la connection string.
4. Usala como `DATABASE_URL`.

Ejemplo:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
```

El backend crea la tabla `posts` automaticamente al arrancar.

## 2. Cloudflare R2

1. Crea un bucket, por ejemplo `lost-and-found-images`.
2. Activa acceso publico para servir imagenes o conectale un dominio publico.
3. Crea access keys para el bucket.
4. Guarda:

```env
S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET_NAME=lost-and-found-images
S3_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
S3_PUBLIC_BASE_URL=https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

## 3. Render para el backend

Puedes usar el archivo [render.yaml](./render.yaml) o configurarlo manualmente.

### Opcion A: usando `render.yaml`

1. Sube el repo a GitHub.
2. En Render crea un servicio desde el repo.
3. Detecta `render.yaml`.
4. Completa las variables sensibles:
   - `DATABASE_URL`
   - `BACKEND_PUBLIC_URL`
   - `CORS_ALLOWED_ORIGINS`
   - `S3_ENDPOINT`
   - `S3_BUCKET_NAME`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_PUBLIC_BASE_URL`

### Opcion B: configuracion manual

- Root directory: `app/backend`
- Runtime: `Node`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`

### Variables recomendadas en Render

```env
NODE_ENV=production
PORT=5000
BACKEND_PUBLIC_URL=https://tu-backend.onrender.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://tu-front.pages.dev
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET_NAME=lost-and-found-images
S3_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
S3_PUBLIC_BASE_URL=https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

## 4. Cloudflare Pages para el frontend

1. En Cloudflare Pages crea un proyecto conectado a tu repo.
2. Configura:
   - Root directory: `app/frontend`
   - Build command: `npm run build`
   - Build output directory: `build`
3. Agrega la variable:

```env
REACT_APP_API_URL=https://tu-backend.onrender.com
```

4. Deploy.

La app ya incluye `app/frontend/public/_redirects`, asi que las rutas de React funcionan tambien al refrescar una pagina interna.

## 5. CORS

El backend valida origenes con `CORS_ALLOWED_ORIGINS`, separado por comas.

Ejemplo:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://tu-front.pages.dev,https://tu-dominio.com
```

## 6. Docker

Tambien deje [app/backend/Dockerfile](./app/backend/Dockerfile) por si luego quieres desplegar el backend como contenedor en otra plataforma.

## 7. Verificacion rapida

Cuando ya este desplegado:

- `GET https://tu-backend.onrender.com/api/health`
- Abre el frontend en Pages
- Crea una publicacion con imagen
- Confirma que:
  - se guarda en Neon
  - la imagen sale desde R2
  - el frontend la muestra bien
