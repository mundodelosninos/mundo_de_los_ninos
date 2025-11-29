# Mundo de Niños - Guía Completa de Implementación y Despliegue

**La guía definitiva para desplegar y configurar el sistema de gestión de guarderías Mundo de Niños**

> Esta guía completa consolida el despliegue, servicio de correo electrónico, almacenamiento de archivos, integración de calendario y todos los detalles de configuración en un recurso completo.

---

## 📚 Tabla de Contenidos

### 🚀 Comenzando
- [Descripción General](#descripción-general)
- [Inicio Rápido (15 minutos)](#inicio-rápido-15-minutos)
- [Comparación de Plataformas](#comparación-de-plataformas)
- [Descripción de la Arquitectura](#descripción-de-la-arquitectura)

### ☁️ Despliegue
- [Opción A: Railway + Vercel](#opción-a-railway--vercel-recomendado)
- [Opción B: Render con Docker](#opción-b-render-con-docker)
- [Opción C: Render Todo en Uno](#opción-c-render-todo-en-uno)

### ⚙️ Configuración Principal
- [Referencia Completa de Variables de Entorno](#referencia-de-variables-de-entorno)
- [Configuración de Base de Datos y Migraciones](#migraciones-de-base-de-datos)
- [Creación de Usuario Administrador](#creación-de-usuario-administrador)
- [SSL y Seguridad](#ssl-y-seguridad)

### 📧 Integración de Servicio de Email
- [¿Por qué Resend?](#por-qué-resend)
- [Configuración de Resend](#configuración-de-resend)
- [Plantillas y Funcionalidades de Email](#plantillas-y-funcionalidades-de-email)
- [Prueba de Entrega de Email](#prueba-de-entrega-de-email)
- [Dominio Personalizado para Emails](#dominio-personalizado-para-emails)
- [Solución de Problemas de Email](#solución-de-problemas-de-email)

### 📸 Integración de Almacenamiento de Archivos
- [Comparación de Opciones de Almacenamiento](#comparación-de-opciones-de-almacenamiento)
- [Configuración de Cloudflare R2 (Recomendado)](#configuración-de-cloudflare-r2-recomendado)
- [Configuración de Backblaze B2](#configuración-de-backblaze-b2-alternativa)
- [Configuración de AWS S3](#configuración-de-aws-s3)
- [Implementación Backend](#implementación-backend-de-almacenamiento-de-archivos)
- [Implementación Frontend](#implementación-frontend-de-almacenamiento-de-archivos)
- [Optimización de Imágenes](#optimización-de-imágenes)
- [Análisis de Costos de Almacenamiento](#análisis-de-costos-de-almacenamiento)

### 📅 Integración de Calendario
- [Descripción General del Sistema de Calendario](#descripción-general-del-sistema-de-calendario)
- [Integración con Google Calendar](#integración-con-google-calendar)
- [Integración con Outlook Calendar](#integración-con-outlook-calendar)
- [Implementación Frontend del Calendario](#implementación-frontend-del-calendario)
- [Sincronización de Calendario](#sincronización-de-calendario)

### 🎨 UI y Sistema de Diseño
- [Sistema de Tipografía](#sistema-de-tipografía)
- [Escala de Tipografía](#escala-de-tipografía)
- [Uso de Clases CSS](#uso-de-clases-css-de-tipografía)
- [Componente de Tipografía](#componente-de-tipografía)
- [Mejores Prácticas de Tipografía](#mejores-prácticas-de-tipografía)
- [Tipografía Responsiva](#tipografía-responsiva)

### 🔐 OAuth e Inicio de Sesión Social
- [Configuración de OAuth con Google](#configuración-de-oauth-con-google)
- [Configuración de OAuth con Facebook](#configuración-de-oauth-con-facebook)
- [Solución de Problemas de OAuth](#solución-de-problemas-de-oauth)

### ✅ Pruebas y Verificación
- [Verificaciones de Salud](#verificaciones-de-salud)
- [Pruebas de API](#pruebas-de-api)
- [Pruebas de Frontend](#pruebas-de-frontend)
- [Pruebas de WebSocket](#pruebas-de-websocket)
- [Pruebas de Email](#pruebas-de-email-1)
- [Pruebas de Carga de Archivos](#pruebas-de-carga-de-archivos)

### 🔧 Mantenimiento y Operaciones
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Guía de Solución de Problemas](#solución-de-problemas)
- [Actualización de la Aplicación](#actualización-de-la-aplicación)
- [Respaldo y Recuperación](#respaldo-y-recuperación)
- [Optimización de Rendimiento](#optimización-de-rendimiento)

### 💰 Gestión de Costos
- [Estimación de Costos por Plataforma](#estimación-de-costos)
- [Consejos para Optimización de Costos](#consejos-de-optimización-de-costos)
- [Consideraciones de Escalamiento](#consideraciones-de-escalamiento)

### 📖 Referencia
- [Referencia Rápida de Comandos](#referencia-rápida)
- [Credenciales Predeterminadas](#credenciales-predeterminadas)
- [Endpoints de API](#endpoints-de-api)
- [Recursos Adicionales](#recursos-adicionales)

---

## Descripción General

**Mundo de Niños** es un sistema integral de gestión de guarderías diseñado para facilitar la comunicación y las operaciones administrativas entre padres, maestros y administradores.

### Stack de la Aplicación

**Backend**:
- **Framework**: NestJS 10.x (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL 15 con TypeORM
- **Caché**: Redis 7 (opcional)
- **Autenticación**: JWT + Passport.js con soporte OAuth
- **Tiempo Real**: Socket.IO para WebSockets
- **Email**: Resend API
- **Almacenamiento**: Compatible con S3 (R2, B2 o S3)

**Frontend**:
- **Framework**: Next.js 14 (React 18 + TypeScript)
- **Gestión de Estado**: React Context + Zustand
- **Estilos**: Tailwind CSS
- **Tiempo Real**: Socket.IO Client
- **PWA**: Service Workers habilitados

### Funcionalidades Clave

- **Gestión de Usuarios**: Sistema multi-rol (Admin, Maestro, Padre)
- **Seguimiento de Estudiantes**: Perfiles completos de estudiantes y asistencia
- **Chat en Tiempo Real**: Mensajería directa y chats grupales
- **Integración de Calendario**: Sincronización con Google Calendar y Outlook
- **Registro de Actividades**: Actividades diarias con fotos/videos
- **Sistema de Asistencia**: Check-in/out con notificaciones
- **Gestión de Archivos**: Galerías de fotos/videos, documentos
- **Notificaciones por Email**: Restablecimiento de contraseña, emails de bienvenida, alertas
- **Inicio de Sesión OAuth**: Autenticación con Google y Facebook

### Tiempo Requerido
- **Despliegue rápido**: 15 minutos (Railway + Vercel)
- **Configuración completa con funcionalidades**: 45-60 minutos
- **Listo para producción con monitoreo**: 2-3 horas

---

## Inicio Rápido (15 minutos)

**Ruta más rápida a producción: Railway + Vercel**

### Prerequisitos

```bash
# 1. Subir código a GitHub (si no está ya)
git add .
git commit -m "chore: prepare for deployment"
git push origin main

# 2. Generar secreto JWT (¡guarda esto!)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Crear cuentas gratuitas:
# - Railway: https://railway.app
# - Vercel: https://vercel.com
# - Resend: https://resend.com
```

### Paso 1: Backend en Railway (7 min)

1. **Crear cuenta**: https://railway.app → Registrarse con GitHub
2. **Nuevo Proyecto** → **Desplegar desde repositorio GitHub**
3. **Seleccionar** repositorio `mundo_de_ninos`
4. **Agregar PostgreSQL**:
   - Clic en "+ New" → Database → PostgreSQL
5. **Agregar Backend**:
   - Clic en "+ New" → GitHub Repo
   - Root Directory: `backend`
6. **Agregar variables de entorno**:

```bash
NODE_ENV=production
PORT=4000
JWT_SECRET=tu-secreto-de-32-caracteres-de-arriba
JWT_EXPIRATION=24h
FRONTEND_URL=https://tu-app.vercel.app

# Email (Resend)
RESEND_API_KEY=re_obtener_de_resend
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Mundo de Niños
```

7. **Desplegar** - Esperar 5-7 minutos
8. **Copiar URL del backend** del panel de Railway

### Paso 2: Frontend en Vercel (5 min)

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar
cd frontend
vercel

# Agregar variables de entorno en el Panel de Vercel:
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://tu-backend.up.railway.app
```

### Paso 3: Configuración de Base de Datos (3 min)

```bash
# Instalar CLI de Railway
npm i -g @railway/cli
railway login
railway link

# Ejecutar migraciones
railway run npm run migration:run

# Crear usuario admin
railway connect postgres
```

En PostgreSQL:
```sql
INSERT INTO users (id, email, "firstName", "lastName", password, role, "authProvider", "isActive", "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@mundodeninos.com',
  'Admin',
  'Sistema',
  '$2a$10$CwTycUXWue0Thq9StjUM0uJ8qJO3Z8rGZhKKLKw7X.x1jZlrLJQ9m',
  'admin',
  'local',
  true,
  true,
  NOW(),
  NOW()
);
\q
```

**Credenciales predeterminadas**: `admin@mundodeninos.com` / `admin123`

### Paso 4: Verificar

```bash
# Probar backend
curl https://tu-backend.up.railway.app/api/health

# Iniciar sesión en frontend
open https://tu-app.vercel.app
```

**✅ ¡Listo!** Continúa leyendo para almacenamiento de archivos, integración de calendario y funcionalidades avanzadas.

---

## Comparación de Plataformas

| Funcionalidad | Railway + Vercel | Render Docker | Render Estándar |
|---------|------------------|---------------|-----------------|
| **Facilidad de Configuración** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tiempo de Configuración** | 15 min | 30-45 min | 20 min |
| **Tier Gratuito** | $5 crédito/mes | Limitado (90 días DB) | Limitado |
| **Arranques en Frío** | Ninguno | 30s (tier gratuito) | 30s (tier gratuito) |
| **Soporte Docker** | Sí | Sí | No |
| **Base de Datos Incluida** | Sí ($5-8/mes) | Sí ($0-7/mes) | Sí ($0-7/mes) |
| **Mejor Para** | Apps pequeñas-medianas | Usuarios de Docker | Principiantes |
| **Costo Mensual** | $0-18 | $0-21 | $0-21 |
| **Rendimiento** | Excelente | Bueno | Bueno |
| **Escalamiento** | Fácil | Manual | Manual |

**Recomendación**:
- **Principiantes**: Railway + Vercel (más fácil, mejor tier gratuito)
- **Entusiastas de Docker**: Render con Docker
- **Apps de producción**: Railway Starter o Render Starter

---

## Descripción de la Arquitectura

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                  Next.js 14 en Vercel                        │
│                  (React + TypeScript)                        │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTPS/WSS
             │
┌────────────▼────────────────────────────────────────────────┐
│                         BACKEND                              │
│                  NestJS en Railway/Render                    │
│                  (Node.js + TypeScript)                      │
└─┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────┘
  │      │      │      │      │      │      │      │
  │      │      │      │      │      │      │      └─► Resend
  │      │      │      │      │      │      │          (Email)
  │      │      │      │      │      │      │
  │      │      │      │      │      │      └────────► Cloudflare R2
  │      │      │      │      │      │                 (Almacenamiento)
  │      │      │      │      │      │
  │      │      │      │      │      └───────────────► Google/Facebook
  │      │      │      │      │                        (OAuth)
  │      │      │      │      │
  │      │      │      │      └──────────────────────► Google Calendar
  │      │      │      │                               Outlook Calendar
  │      │      │      │
  │      │      │      └─────────────────────────────► Redis
  │      │      │                                      (Caché)
  │      │      │
  │      │      └────────────────────────────────────► PostgreSQL
  │      │                                             (Base de Datos)
  │      │
  │      └───────────────────────────────────────────► Socket.IO
  │                                                    (WebSocket)
  │
  └──────────────────────────────────────────────────► JWT Auth
```

### Flujo de Peticiones

1. **Acceso de Usuario**: Navegador → Vercel (Next.js)
2. **Llamadas API**: Frontend → Backend Railway/Render → Base de Datos
3. **Tiempo Real**: Conexión WebSocket para chat
4. **Carga de Archivos**: Frontend → Backend → R2/S3
5. **Email**: Backend → Resend → Bandeja de entrada del usuario
6. **Sincronización de Calendario**: Backend → APIs de Google/Outlook

---

## Opción A: Railway + Vercel (Recomendado)

### ¿Por qué Elegir esta Opción?
- ✅ Configuración más rápida (15 minutos)
- ✅ $5 de crédito mensual (cubre apps pequeñas)
- ✅ Cero arranques en frío
- ✅ SSL/HTTPS automático
- ✅ Gestión simple de base de datos
- ✅ Excelente documentación

### A.1 Despliegue de Backend en Railway

#### Crear Cuenta de Railway
1. Ir a https://railway.app
2. Registrarse con GitHub
3. Autorizar acceso al repositorio

#### Desplegar Base de Datos PostgreSQL

1. **Panel** → **+ New** → **Database** → **PostgreSQL**
2. Railway crea automáticamente la variable `DATABASE_URL`
3. La base de datos está lista en ~2 minutos

#### Desplegar Redis (Opcional)

```
Panel → + New → Database → Redis
```
Railway crea `REDIS_URL` automáticamente.

#### Desplegar Servicio Backend

1. **Panel** → **+ New** → **GitHub Repo**
2. **Seleccionar repositorio**: `mundo_de_ninos`
3. **Configuración**:
   ```
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

4. **Variables de Entorno**:

Clic en servicio → pestaña **Variables**:

```bash
# Núcleo
NODE_ENV=production
PORT=4000
JWT_SECRET=tu-secreto-generado
JWT_EXPIRATION=24h
FRONTEND_URL=https://mundo-ninos.vercel.app

# DATABASE_URL creado automáticamente por el servicio PostgreSQL
# REDIS_URL creado automáticamente por el servicio Redis

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Mundo de Niños

# Almacenamiento de Archivos (ver sección de Almacenamiento para detalles)
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu-clave
R2_SECRET_ACCESS_KEY=tu-secreto
R2_BUCKET_NAME=mundo-ninos-prod
```

**Generar JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. **Desplegar**: Railway despliega automáticamente (5-7 min)

6. **Obtener URL del Backend**:
   - Settings → Networking → Generate Domain
   - Ejemplo: `mundo-ninos-backend.up.railway.app`

### A.2 Despliegue de Frontend en Vercel

#### Usando el Panel de Vercel

1. Ir a https://vercel.com/new
2. **Importar Repositorio Git**
3. **Seleccionar** `mundo_de_ninos`
4. **Configurar**:
   ```
   Framework: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```

5. **Variables de Entorno**:
   ```bash
   NEXT_PUBLIC_API_URL=https://mundo-ninos-backend.up.railway.app
   NEXT_PUBLIC_SOCKET_URL=https://mundo-ninos-backend.up.railway.app

   # OAuth Opcional
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-client-id
   NEXT_PUBLIC_FACEBOOK_APP_ID=tu-app-id
   ```

6. **Desplegar** (5-8 minutos)

#### Usando CLI de Vercel

```bash
npm i -g vercel
cd frontend
vercel

# Seguir las instrucciones
vercel env add NEXT_PUBLIC_API_URL
# Pegar URL del backend

vercel env add NEXT_PUBLIC_SOCKET_URL
# Pegar URL del backend

# Despliegue de producción
vercel --prod
```

### A.3 Actualizar CORS del Backend

1. Railway → Backend → Variables
2. Actualizar `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://mundo-ninos.vercel.app
   ```
3. Redespliega automáticamente

### A.4 CLI de Railway (Recomendado)

```bash
# Instalar
npm install -g @railway/cli

# Iniciar sesión
railway login

# Vincular proyecto
railway link

# Comandos útiles
railway logs                  # Ver logs
railway logs --service backend # Específico del servicio
railway connect postgres      # Conectar a BD
railway run npm run migration:run
railway status               # Estado del despliegue
```

---

## Opción B: Render con Docker

### ¿Por qué Elegir esta Opción?
- ✅ Control total de Docker
- ✅ Infraestructura como código
- ✅ Tier gratuito disponible
- ✅ Bueno para aprender Docker
- ⚠️ El tier gratuito tiene arranques en frío (30s)

### B.1 Prerequisitos

Tu repositorio ya tiene:
```
backend/
├── Dockerfile.prod
└── .dockerignore

frontend/
├── Dockerfile.prod
└── .dockerignore
```

### B.2 Configuración de Cuenta Render

1. Ir a https://render.com
2. Registrarse con GitHub
3. Autorizar acceso al repositorio

### B.3 Base de Datos PostgreSQL

1. **Panel** → **New +** → **PostgreSQL**
2. **Configuración**:
   ```
   Name: mundo-ninos-db
   Database: guarderia_db
   User: guarderia_user
   Region: Oregon (US West)
   PostgreSQL Version: 15
   Instance Type: Free
   ```

3. **Crear Base de Datos** (2-3 minutos)

4. **Copiar URL Interna de Base de Datos**:
   ```
   postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/guarderia_db
   ```

### B.4 Servicio Backend

1. **Panel** → **New +** → **Web Service**
2. **Conectar** repositorio `mundo_de_ninos`
3. **Configuración**:
   ```
   Name: mundo-ninos-backend
   Region: Oregon
   Branch: main
   Root Directory: backend

   Environment: Docker
   Dockerfile Path: ./Dockerfile.prod
   Docker Context: .

   Instance Type: Free
   Health Check Path: /api/health
   ```

4. **Variables de Entorno**:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@internal-host/db
JWT_SECRET=tu-secreto-de-64-caracteres
JWT_EXPIRATION=24h
FRONTEND_URL=https://mundo-ninos-frontend.onrender.com

RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Mundo de Niños
```

5. **Desplegar** (5-10 minutos)

6. **Verificar**:
```bash
curl https://mundo-ninos-backend.onrender.com/api/health
```

### B.5 Servicio Frontend

1. **Panel** → **New +** → **Web Service**
2. **Configuración**:
   ```
   Name: mundo-ninos-frontend
   Region: Oregon
   Branch: main
   Root Directory: frontend

   Environment: Docker
   Dockerfile Path: ./Dockerfile.prod
   Docker Context: .
   Docker Command: node server.js

   Instance Type: Free
   ```

3. **⚠️ CRÍTICO: Argumentos de Build de Docker**

En sección **Environment** → **Build**:

```bash
NEXT_PUBLIC_API_URL=https://mundo-ninos-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://mundo-ninos-backend.onrender.com
```

> **¿Por qué?** Next.js integra las variables `NEXT_PUBLIC_*` en tiempo de compilación.

4. **Variables de Entorno en Tiempo de Ejecución**:

```bash
NODE_ENV=production
PORT=3000
```

5. **Desplegar** (8-12 minutos)

### B.6 Actualizar FRONTEND_URL del Backend

1. Servicio Backend → **Environment**
2. Editar `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://mundo-ninos-frontend.onrender.com
   ```
3. Guardar (reinicio automático)

---

## Opción C: Render Todo en Uno

Desplegar ambos servicios sin Docker (runtime Node.js).

### C.1 PostgreSQL

Igual que [Opción B.3](#b3-base-de-datos-postgresql)

### C.2 Backend (Runtime Node)

1. **New +** → **Web Service**
2. **Configuración**:
   ```
   Name: mundo-ninos-backend
   Root Directory: backend

   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod

   Instance Type: Free
   ```

3. **Variables de Entorno**: Igual que Opción B
4. **Desplegar**

### C.3 Frontend (Runtime Node)

1. **New +** → **Web Service**
2. **Configuración**:
   ```
   Name: mundo-ninos-frontend
   Root Directory: frontend

   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start

   Instance Type: Free
   ```

3. **Variables de Entorno**:
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://mundo-ninos-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://mundo-ninos-backend.onrender.com
```

4. **Desplegar**

---

## Referencia de Variables de Entorno

### Variables del Backend (Lista Completa)

#### Esenciales (Requeridas)

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/database
JWT_SECRET=cadena-aleatoria-minimo-32-caracteres
JWT_EXPIRATION=24h
FRONTEND_URL=https://tu-url-frontend.com
```

#### Servicio de Email (Resend)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Mundo de Niños
```

#### Almacenamiento de Archivos (Cloudflare R2 - Recomendado)

```bash
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=mundo-ninos-prod
R2_PUBLIC_URL=https://cdn.tudominio.com  # Opcional
```

#### Almacenamiento de Archivos (Backblaze B2 - Alternativa)

```bash
B2_KEY_ID=xxxxxxxxxxxxxxxxxxxxx
B2_APPLICATION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
B2_BUCKET_NAME=mundo-ninos-prod
B2_BUCKET_ID=xxxxxxxxxxxxxxxxxxxxxxxx
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_REGION=us-west-002
```

#### Almacenamiento de Archivos (AWS S3 - Respaldo)

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_BUCKET_NAME=mundo-de-ninos-prod
```

#### Caché (Redis - Opcional)

```bash
REDIS_URL=redis://default:password@host:6379
```

#### OAuth - Google

```bash
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://tu-backend.com/api/auth/google/callback
```

#### OAuth - Facebook

```bash
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_CALLBACK_URL=https://tu-backend.com/api/auth/facebook/callback
```

#### Integración de Calendario - Google

```bash
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALENDAR_REDIRECT_URI=https://tu-backend.com/api/calendar/google/callback
```

#### Integración de Calendario - Outlook

```bash
OUTLOOK_CLIENT_ID=xxxxx-xxxx-xxxx-xxxx-xxxxx
OUTLOOK_CLIENT_SECRET=xxxxx
OUTLOOK_REDIRECT_URI=https://tu-backend.com/api/calendar/outlook/callback
OUTLOOK_TENANT_ID=common
```

### Variables del Frontend

```bash
# URLs de API (Requeridas)
NEXT_PUBLIC_API_URL=https://tu-url-backend.com
NEXT_PUBLIC_SOCKET_URL=https://tu-url-backend.com

# OAuth (Opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
NEXT_PUBLIC_FACEBOOK_APP_ID=1234567890123456
```

### Mejores Prácticas de Seguridad

```bash
# Generar secreto JWT seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar contraseñas seguras
openssl rand -base64 32

# Nunca hacer commit de secretos a Git
# Siempre usar gestión de secretos de la plataforma
# Rotar secretos regularmente (cada 90 días)
```

---

## Migraciones de Base de Datos

Después de desplegar el backend, ejecutar migraciones para crear el esquema de base de datos.

### Migraciones en Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Iniciar sesión y vincular
railway login
railway link

# Ejecutar migraciones
railway run npm run migration:run

# Verificar tablas
railway run psql $DATABASE_URL -c "\dt"
```

### Migraciones en Render

```bash
# Opción 1: Usando Shell
# Panel de Render → Servicio Backend → Shell

npm run migration:run
psql $DATABASE_URL -c "\dt"

# Opción 2: Desde máquina local
export DATABASE_URL="postgresql://..."
cd backend
npm run migration:run
```

### Migración SQL Manual

```bash
# Conectar a la base de datos
psql $DATABASE_URL

# Ejecutar SQL de migración
\i backend/src/database/migrations/1760059538970-InitialSchema.sql

# Verificar tablas
\dt

# Verificar tabla de usuarios
\d users

\q
```

### Tablas Esperadas

Después de la migración, deberías tener:
- `users` - Cuentas de usuario
- `teachers` - Perfiles de maestros
- `students` - Información de estudiantes
- `groups` - Definiciones de clase/grupo
- `families` - Relaciones familiares
- `attendances` - Registros de entrada/salida
- `activities` - Registros de actividades diarias
- `calendar_events` - Eventos y horarios
- `chat_messages` - Historial de chat
- `chat_rooms` - Definiciones de salas de chat
- `files` - Metadatos de archivos cargados

---

## Creación de Usuario Administrador

Después de las migraciones, crear una cuenta de administrador inicial.

### Método 1: Inserción PostgreSQL

**Railway**:
```bash
railway connect postgres
```

**Render**:
```bash
# Servicio Backend → Shell
psql $DATABASE_URL
```

**SQL**:
```sql
INSERT INTO users (
  id,
  email,
  "firstName",
  "lastName",
  password,
  role,
  "authProvider",
  "isActive",
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@mundodeninos.com',
  'Admin',
  'Sistema',
  '$2a$10$CwTycUXWue0Thq9StjUM0uJ8qJO3Z8rGZhKKLKw7X.x1jZlrLJQ9m',
  'admin',
  'local',
  true,
  true,
  NOW(),
  NOW()
);

-- Verificar
SELECT id, email, role FROM users WHERE role = 'admin';

\q
```

**Credenciales**: `admin@mundodeninos.com` / `admin123`

⚠️ **¡Cambiar la contraseña después del primer inicio de sesión!**

### Método 2: Script Seed

Si existe `backend/src/database/seeds/create-admin.ts`:

```bash
# Railway
railway run npm run seed:admin

# Shell de Render
npm run seed:admin

# Local con BD remota
DATABASE_URL="postgresql://..." npm run seed:admin
```

### Método 3: One-liner de Node.js

```bash
node -e "
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const password = await bcrypt.hash('Admin123!', 10);
  const result = await client.query(
    'INSERT INTO users (email, \"firstName\", \"lastName\", password, role, \"authProvider\", \"isActive\", \"emailVerified\") VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8) ON CONFLICT (email) DO NOTHING RETURNING id',
    ['admin@mundodeninos.com', 'Admin', 'Sistema', password, 'admin', 'local', true, true]
  );

  if (result.rows.length > 0) {
    console.log('✅ Admin creado:', result.rows[0].id);
  } else {
    console.log('ℹ️  Admin ya existe');
  }

  await client.end();
}

createAdmin().catch(console.error);
"
```

---

## SSL y Seguridad

### SSL Automático

Todas las plataformas recomendadas proporcionan SSL automático:

- **Railway**: HTTPS automático en todos los dominios
- **Render**: Certificados SSL gratuitos
- **Vercel**: HTTPS automático + HTTP/2

### Cabeceras de Seguridad

El backend ya incluye:
- **Helmet.js**: Cabeceras de seguridad
- **CORS**: Protección de origen cruzado
- **Rate Limiting**: 100 peticiones/60s por IP
- **JWT**: Autenticación basada en tokens
- **Hashing de Contraseñas**: bcrypt con 10 rondas

### Lista de Verificación de Seguridad Adicional

- [ ] Cambiar contraseña de admin predeterminada
- [ ] Rotar secreto JWT cada 90 días
- [ ] Habilitar 2FA para cuentas admin (funcionalidad futura)
- [ ] Revisar permisos de usuarios regularmente
- [ ] Monitorear intentos fallidos de inicio de sesión
- [ ] Mantener dependencias actualizadas (`npm audit`)
- [ ] Usar variables de entorno para todos los secretos
- [ ] Habilitar SSL de base de datos en producción
- [ ] Implementar rate limiting por usuario en API
- [ ] Configurar monitoreo de seguridad

---

## ¿Por qué Resend?

Resend es el servicio de email recomendado para Mundo de Niños.

### Comparación Resend vs SendGrid

| Funcionalidad | Resend | SendGrid |
|---------|--------|----------|
| **Tier Gratuito** | 100/día, 3000/mes **para siempre** | 100/día por **60 días** |
| **Precios** | $20/mes por 50k emails | $15/mes por 40k emails |
| **Calidad de API** | Moderna, limpia | Compleja, legacy |
| **Entregabilidad** | Excelente | Buena |
| **Tiempo de Configuración** | 5 minutos | 10 minutos |
| **Tarjeta de Crédito** | No requerida | Requerida después de prueba |
| **React Email** | Soporte nativo | No soportado |
| **Panel** | UI moderna | UI antigua |

### Por qué Elegimos Resend

1. **Tier Gratuito Permanente**: 3,000 emails/mes sin expiración
2. **Mejor DX**: API más limpia, integración más simple
3. **Mayor Entregabilidad**: Infraestructura moderna, mejor colocación en bandejas de entrada
4. **Sin Tarjeta de Crédito**: Tier gratuito verdadero sin pago
5. **Plantillas React**: Soporte nativo para plantillas de email React

---

## Configuración de Resend

### Paso 1: Crear Cuenta Resend

1. Ir a https://resend.com
2. **Registrarse** (no se necesita tarjeta de crédito)
3. **Verificar** dirección de email

### Paso 2: Generar API Key

1. **Panel** → **API Keys**
2. **Create API Key**
   - Nombre: `Mundo de Niños Production`
   - Permisos: Full Access
   - Copiar clave (comienza con `re_`)

### Paso 3: Configurar Backend

Agregar a las variables de entorno:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Mundo de Niños
```

### Paso 4: Elegir Email Remitente

**Opción A: Predeterminado de Resend (Inicio Rápido)**

```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Pros**:
- ✅ Funciona inmediatamente
- ✅ No necesita verificación
- ✅ Perfecto para desarrollo

**Contras**:
- ⚠️ Muestra "via resend.dev" en clientes de email
- ⚠️ No profesional para producción

**Opción B: Dominio Personalizado (Producción)**

1. **Agregar Dominio**:
   - Panel → **Domains** → **Add Domain**
   - Ingresar: `mundodeninos.com` (sin www)

2. **Agregar Registros DNS**:

   Resend proporcionará estos registros:

   ```
   Type: TXT
   Name: resend._domainkey.mundodeninos.com
   Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN...

   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.dev ~all
   ```

3. **Verificar Dominio** (5-10 minutos)

4. **Actualizar Email**:
   ```bash
   RESEND_FROM_EMAIL=noreply@mundodeninos.com
   ```

### Paso 5: Probar Email

```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email-prueba@example.com"}'
```

Revisar bandeja de entrada para email de restablecimiento de contraseña.

---

## Plantillas y Funcionalidades de Email

Tu aplicación tiene dos plantillas de email listas:

### 1. Email de Restablecimiento de Contraseña ✅

**Disparador**: Usuario hace clic en "Olvidé mi Contraseña"

**Características**:
- Token de restablecimiento seguro (hash SHA-256)
- Expiración de 1 hora
- Plantilla HTML hermosa
- Respaldo en texto plano
- Diseño con marca

**Implementación**:
```typescript
// backend/src/services/email.service.ts
async sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetToken: string
): Promise<void>
```

**Endpoint**: `POST /api/auth/forgot-password`

### 2. Email de Bienvenida ⚠️

**Estado**: Plantilla lista pero no se envía actualmente

**Para Habilitar**: Agregar al endpoint de registro

```typescript
// backend/src/modules/auth/auth.service.ts
async register(registerDto: RegisterDto) {
  // ... código existente ...

  // Agregar esta línea:
  await this.emailService.sendWelcomeEmail(user.email, user.firstName);

  return user;
}
```

### Futuras Funcionalidades de Email

Considerar agregar:

**Notificaciones de Asistencia**:
```typescript
async sendCheckInNotification(
  parentEmail: string,
  studentName: string,
  time: Date
): Promise<void>
```

**Resumen Diario de Actividades**:
```typescript
async sendDailySummary(
  parentEmail: string,
  studentName: string,
  activities: Activity[]
): Promise<void>
```

**Invitaciones a Eventos**:
```typescript
async sendEventInvitation(
  email: string,
  event: CalendarEvent,
  icalAttachment: Buffer
): Promise<void>
```

**Confirmación de Cambio de Contraseña**:
```typescript
async sendPasswordChangedNotification(
  email: string,
  name: string
): Promise<void>
```

---

## Prueba de Entrega de Email

### Prueba Local

```bash
# Iniciar backend
cd backend
npm run start:dev

# Probar restablecimiento de contraseña
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Revisar Panel de Resend
# https://resend.com/emails
```

### Prueba en Producción

```bash
curl -X POST https://tu-backend.up.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@example.com"}'
```

### Verificar en Panel de Resend

1. Ir a https://resend.com/emails
2. Ver todos los emails enviados
3. Revisar:
   - ✅ Estado de entrega
   - ✅ Tasa de apertura
   - ✅ Tasa de clics
   - ✅ Reportes de rebote/spam

### Probar Entregabilidad

Usar **Mail Tester**: https://www.mail-tester.com

1. Obtener email temporal de Mail Tester
2. Enviar email de prueba a esa dirección
3. Hacer clic en "Check Score"
4. Apuntar a 9/10 o más alto

---

## Dominio Personalizado para Emails

### ¿Por qué Usar Dominio Personalizado?

- ✅ Apariencia profesional
- ✅ Mejor entregabilidad
- ✅ Consistencia de marca
- ✅ Sin etiqueta "via resend.dev"

### Proceso de Configuración

#### 1. Agregar Dominio a Resend

1. **Panel** → **Domains** → **Add Domain**
2. Ingresar tu dominio: `mundodeninos.com`
3. Hacer clic en **Add Domain**

#### 2. Configurar Registros DNS

Resend proporciona estos registros:

**Registro SPF**:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.dev ~all
TTL: 3600
```

**Registro DKIM**:
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
TTL: 3600
```

**Registro DMARC** (opcional pero recomendado):
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@mundodeninos.com
TTL: 3600
```

#### 3. Agregar Registros al Proveedor DNS

**Para Cloudflare**:
1. Panel → DNS → Records → Add Record
2. Copiar cada registro de Resend
3. Guardar

**Para Namecheap**:
1. Domain List → Manage → Advanced DNS
2. Add New Record
3. Copiar valores de Resend

**Para Google Domains**:
1. DNS → Custom Records
2. Agregar cada registro TXT
3. Guardar

#### 4. Verificar Dominio

1. Esperar 5-10 minutos para propagación DNS
2. Resend → Domains → Hacer clic en **Verify**
3. Estado cambia a ✅ **Verified**

#### 5. Actualizar Variable de Entorno

```bash
RESEND_FROM_EMAIL=noreply@mundodeninos.com
```

Redesplegar aplicación.

### Solución de Problemas de Verificación de Dominio

**¿Dominio no verifica?**

1. **Verificar propagación DNS**:
   ```bash
   dig resend._domainkey.mundodeninos.com TXT
   ```

2. **Verificar SPF**:
   ```bash
   dig mundodeninos.com TXT
   ```

3. **Esperar más tiempo**: DNS puede tomar hasta 48 horas

4. **Verificar proxy de Cloudflare**: Deshabilitar proxy (nube gris) para registros TXT

---

## Solución de Problemas de Email

### Error: "Resend not configured"

**Síntoma**: Logs del backend muestran "Resend not configured"

**Solución**:
```bash
# Verificar que RESEND_API_KEY esté configurada
echo $RESEND_API_KEY

# Debe comenzar con "re_"
# Si está vacía, agregar a variables de entorno
```

### Error: "Invalid API key"

**Síntoma**: 401 Unauthorized de la API Resend

**Soluciones**:
1. Regenerar API key en el panel de Resend
2. Copiar nueva clave exactamente (sin espacios extra)
3. Actualizar variable de entorno
4. Reiniciar aplicación

### Emails Yendo a Spam

**Causas**:
- Usar `onboarding@resend.dev` (email de prueba)
- Dominio no verificado
- Registros SPF/DKIM faltantes
- Palabras disparadoras de spam en el asunto

**Soluciones**:
1. **Verificar dominio personalizado** (más importante)
2. **Agregar registros SPF/DKIM/DMARC**
3. **Calentar dominio**: Comenzar con volumen pequeño
4. **Evitar palabras spam**: "Gratis", "Haga clic aquí", "Actúe ahora"
5. **Probar entregabilidad** con Mail Tester

### Emails No se Envían

**Revisar logs**:
```bash
# Railway
railway logs | grep -i email

# Render
# Servicio → Logs → Filtrar: "email"
```

**Problemas comunes**:
1. **API key faltante**
   ```bash
   # Verificar si está configurada
   railway run printenv | grep RESEND
   ```

2. **Email remitente incorrecto**
   ```bash
   # Debe coincidir con dominio verificado
   RESEND_FROM_EMAIL=noreply@mundodeninos.com
   # NO: noreply@gmail.com
   ```

3. **Límite de tasa excedido**
   - Tier gratuito: 100 emails/día
   - Revisar uso en panel de Resend

### Retrasos en Email

**Síntoma**: Emails llegan 5-10 minutos tarde

**Causas**:
- Cola de Resend durante tráfico alto
- Retrasos del servidor receptor
- Greylisting por receptor

**Soluciones**:
- Normal para tier gratuito
- Actualizar a plan pago para entrega más rápida
- La mayoría de los emails aún llegan en 1 minuto

### Ver Logs de Email

**Panel de Resend**:
1. https://resend.com/emails
2. Ver todos los emails enviados
3. Hacer clic en email para detalles:
   - Estado de entrega
   - Seguimiento de apertura/clic
   - Mensajes de error

**Logs del Backend**:
```typescript
// Modo desarrollo muestra:
this.logger.log(`Password reset email sent to: ${to}`);

// Revisar logs para confirmación
```

---

## Comparación de Opciones de Almacenamiento

Tu app necesita almacenamiento de archivos para:
- Fotos de estudiantes
- Avatares de usuarios
- Imágenes/archivos de chat
- Galería de actividades
- Documentos (PDFs)

### Comparación Rápida

| Proveedor | Costo de Almacenamiento | Costo de Transferencia | Tier Gratuito | Mejor Para |
|----------|--------------|---------------|-----------|----------|
| **Cloudflare R2** ⭐ | $0.015/GB | **GRATIS** | 10GB | **Producción** |
| **Backblaze B2** 💰 | $0.005/GB | $0.01/GB | 10GB | **Apps económicas** |
| **AWS S3** | $0.023/GB | $0.09/GB | 5GB (12 meses) | **Enterprise** |
| **Vercel Blob** | $0.15/GB | Incluido | 500MB | **Prototipos** |

### Ejemplo de Costo Real

**Escenario**: 50 estudiantes, 2GB almacenamiento, 20GB transferencia mensual

**Cloudflare R2**:
```
Almacenamiento: 2GB × $0.015 = $0.03/mes
Transferencia: 20GB × $0 = $0/mes
Peticiones: 100k × $0 = $0/mes (tier gratuito)
───────────────────────────────
TOTAL: $0.03/mes ⭐
```

**Backblaze B2**:
```
Almacenamiento: 2GB × $0.005 = $0.01/mes
Transferencia: 20GB × $0.01 = $0.20/mes
───────────────────────────────
TOTAL: $0.21/mes
```

**AWS S3**:
```
Almacenamiento: 2GB × $0.023 = $0.046/mes
Transferencia: 20GB × $0.09 = $1.80/mes
───────────────────────────────
TOTAL: $1.89/mes
```

### Recomendación

**Usar Cloudflare R2** para:
- ✅ Cero tarifas de salida (mayor ahorro)
- ✅ API compatible con S3 (migración fácil)
- ✅ CDN global incluido
- ✅ Perfecto para apps con muchas imágenes
- ✅ Excelente para compartir fotos con padres

---

## Configuración de Cloudflare R2 (Recomendado)

### Paso 1: Crear Cuenta Cloudflare

1. Ir a https://dash.cloudflare.com/sign-up
2. Registrarse (cuenta gratuita funciona)
3. Verificar email

### Paso 2: Habilitar R2

1. **Panel** → **R2 Object Storage**
2. **Purchase R2 Plan**: Pay-as-you-go ($0.015/GB)
3. Proporcionar método de pago (requerido pero hay tier gratuito disponible)

### Paso 3: Crear Bucket

1. **Create Bucket**
2. **Configuración**:
   ```
   Name: mundo-ninos-prod
   Location: Automatic (distribución global)
   ```
3. **Create**

### Paso 4: Generar Token API

1. **R2** → **Manage R2 API Tokens**
2. **Create API Token**
   ```
   Token Name: mundo-ninos-backend
   Permissions: Object Read & Write
   Buckets: Apply to specific buckets → mundo-ninos-prod
   TTL: Forever
   ```
3. **Create Token**
4. **Copiar**:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (ej., `https://xxx.r2.cloudflarestorage.com`)

### Paso 5: Configurar Acceso Público (Opcional)

Para URLs de imagen públicas sin URLs firmadas:

1. **Bucket** → **Settings** → **Public Access**
2. **Allow Access**: ON
3. **Custom Domains** → **Connect Domain**
   ```
   Domain: cdn.mundodeninos.com
   ```
4. **Agregar CNAME DNS**:
   ```
   cdn.mundodeninos.com → mundo-ninos-prod.r2.cloudflarestorage.com
   ```

### Paso 6: Variables de Entorno

```bash
# Backend
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu-access-key-id
R2_SECRET_ACCESS_KEY=tu-secret-access-key
R2_BUCKET_NAME=mundo-ninos-prod
R2_PUBLIC_URL=https://cdn.mundodeninos.com  # Opcional
```

### Paso 7: Probar Conexión

```bash
# Instalar AWS CLI (compatible con S3)
npm install -g @aws-sdk/client-s3

# Probar carga
node -e "
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const command = new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: 'test.txt',
  Body: 'Hello from Mundo de Niños!',
});

s3.send(command)
  .then(() => console.log('✅ Upload successful!'))
  .catch(err => console.error('❌ Error:', err));
"
```

---

## Configuración de Backblaze B2 (Alternativa)

### Cuándo Usar B2

- Costo de almacenamiento más bajo ($0.005/GB)
- Volumen de tráfico bajo
- Usar CDN Cloudflare para entrega
- Muy consciente del presupuesto

### Pasos de Configuración

1. **Crear Cuenta**: https://www.backblaze.com/b2/sign-up.html

2. **Crear Bucket**:
   ```
   Bucket Name: mundo-ninos-prod
   Files in Bucket: Private
   Object Lock: Disabled
   ```

3. **Generar Application Key**:
   ```
   App Keys → Add a New Application Key
   Name: mundo-ninos-backend
   Bucket Access: mundo-ninos-prod only
   Type of Access: Read and Write
   ```

4. **Copiar Credenciales**:
   - keyID
   - applicationKey
   - Endpoint (ej., `s3.us-west-002.backblazeb2.com`)

5. **Variables de Entorno**:
   ```bash
   B2_KEY_ID=tu-key-id
   B2_APPLICATION_KEY=tu-app-key
   B2_BUCKET_NAME=mundo-ninos-prod
   B2_BUCKET_ID=tu-bucket-id
   B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
   B2_REGION=us-west-002
   ```

### B2 + CDN Cloudflare (Recomendado)

Reducir costos de salida usando Cloudflare como CDN:

1. **Crear Worker de Cloudflare**:
   ```javascript
   // cdn-worker.js
   export default {
     async fetch(request) {
       const url = new URL(request.url);
       const b2Url = `https://f002.backblazeb2.com/file/mundo-ninos-prod${url.pathname}`;

       const response = await fetch(b2Url, {
         cf: {
           cacheEverything: true,
           cacheTtl: 86400  // 24 horas
         }
       });

       return response;
     }
   }
   ```

2. **Conectar Dominio Personalizado**:
   ```
   cdn.mundodeninos.com → Worker
   ```

3. **Resultado**: ¡Ancho de banda gratis vía Cloudflare!

---

## Configuración de AWS S3

### Cuándo Usar S3

- Ya usando ecosistema AWS
- Necesita funcionalidades avanzadas de S3
- Requisitos empresariales
- Necesidades de cumplimiento (HIPAA, etc.)

### Pasos de Configuración

1. **Consola AWS**: https://console.aws.amazon.com/s3

2. **Crear Bucket**:
   ```
   Bucket name: mundo-de-ninos-prod
   Region: us-east-1
   Block all public access: ON
   Versioning: Disabled
   Encryption: AES-256
   ```

3. **Crear Usuario IAM**:
   ```
   IAM → Users → Add User
   User name: mundo-ninos-backend
   Access type: Programmatic access

   Permissions: Attach existing policy
   Policy: AmazonS3FullAccess (o política restrictiva personalizada)
   ```

4. **Guardar Credenciales**:
   - Access Key ID
   - Secret Access Key

5. **Variables de Entorno**:
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
   AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AWS_BUCKET_NAME=mundo-de-ninos-prod
   ```

### Optimización de Costos S3

```bash
# Habilitar Intelligent Tiering
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket mundo-de-ninos-prod \
  --id DefaultIT \
  --intelligent-tiering-configuration file://it-config.json
```

---

## Implementación Backend de Almacenamiento de Archivos

### Instalar Dependencias

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp uuid
```

**Paquetes**:
- `@aws-sdk/client-s3`: Cliente S3 (funciona con R2, B2, S3)
- `@aws-sdk/s3-request-presigner`: Generar URLs firmadas
- `sharp`: Procesamiento de imágenes (redimensionar, comprimir, conversión de formato)
- `uuid`: Generar nombres de archivo únicos

### Crear Servicio de Archivos

**Archivo**: `backend/src/modules/files/files.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import * as path from 'path';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string | null;

  constructor() {
    // Detectar automáticamente proveedor: R2 > B2 > S3
    if (process.env.R2_ENDPOINT) {
      // Cloudflare R2
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
      this.bucketName = process.env.R2_BUCKET_NAME;
      this.publicUrl = process.env.R2_PUBLIC_URL || null;

    } else if (process.env.B2_ENDPOINT) {
      // Backblaze B2
      this.s3Client = new S3Client({
        region: process.env.B2_REGION || 'us-west-002',
        endpoint: process.env.B2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.B2_KEY_ID,
          secretAccessKey: process.env.B2_APPLICATION_KEY,
        },
      });
      this.bucketName = process.env.B2_BUCKET_NAME;
      this.publicUrl = null;

    } else {
      // AWS S3
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.bucketName = process.env.AWS_BUCKET_NAME;
      this.publicUrl = `https://${this.bucketName}.s3.amazonaws.com`;
    }
  }

  /**
   * Cargar archivo genérico con procesamiento de imagen opcional
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    options?: {
      compress?: boolean;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    },
  ): Promise<{ url: string; key: string; size: number }> {
    this.validateFile(file);

    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    let buffer = file.buffer;
    let contentType = file.mimetype;
    let finalSize = file.size;

    // Procesar imagen si es necesario
    if (options?.compress && this.isImage(file.mimetype)) {
      const processed = await this.processImage(buffer, options);
      buffer = processed.buffer;
      contentType = processed.contentType;
      finalSize = buffer.length;
    }

    // Cargar a almacenamiento
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      }),
    );

    // Generar URL
    const url = this.publicUrl
      ? `${this.publicUrl}/${key}`
      : await this.getSignedUrl(key, 31536000); // 1 año

    return { url, key, size: finalSize };
  }

  /**
   * Cargar avatar (400x400, optimizado)
   */
  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; key: string }> {
    const result = await this.uploadFile(file, `avatars/${userId}`, {
      compress: true,
      maxWidth: 400,
      maxHeight: 400,
      quality: 80,
    });

    return { url: result.url, key: result.key };
  }

  /**
   * Cargar foto de estudiante (800x800)
   */
  async uploadStudentPhoto(
    file: Express.Multer.File,
    studentId: string,
  ): Promise<{ url: string; key: string }> {
    const result = await this.uploadFile(file, `students/${studentId}`, {
      compress: true,
      maxWidth: 800,
      maxHeight: 800,
      quality: 85,
    });

    return { url: result.url, key: result.key };
  }

  /**
   * Cargar archivo de chat
   */
  async uploadChatFile(
    file: Express.Multer.File,
    chatRoomId: string,
  ): Promise<{ url: string; key: string; size: number; type: string; name: string }> {
    const result = await this.uploadFile(file, `chat/${chatRoomId}`, {
      compress: this.isImage(file.mimetype),
      maxWidth: 1920,
      quality: 85,
    });

    return {
      ...result,
      type: file.mimetype,
      name: file.originalname,
    };
  }

  /**
   * Cargar múltiples fotos de galería
   */
  async uploadGalleryPhotos(
    files: Express.Multer.File[],
    groupId: string,
    date: string,
  ): Promise<Array<{ url: string; key: string; size: number }>> {
    const results = [];

    for (const file of files) {
      const result = await this.uploadFile(
        file,
        `gallery/${groupId}/${date}`,
        {
          compress: true,
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 85,
        },
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Eliminar archivo del almacenamiento
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Obtener URL firmada temporal
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Procesar imagen: redimensionar + comprimir
   */
  private async processImage(
    buffer: Buffer,
    options: { maxWidth?: number; maxHeight?: number; quality?: number },
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const { maxWidth = 1920, maxHeight = 1920, quality = 85 } = options;

    let image = sharp(buffer);
    const metadata = await image.metadata();

    // Redimensionar si es demasiado grande
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image = image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convertir a formato optimizado
    if (metadata.format === 'png') {
      return {
        buffer: await image.png({ quality, compressionLevel: 9 }).toBuffer(),
        contentType: 'image/png',
      };
    } else {
      return {
        buffer: await image.jpeg({ quality, mozjpeg: true }).toBuffer(),
        contentType: 'image/jpeg',
      };
    }
  }

  /**
   * Validar archivo
   */
  private validateFile(file: Express.Multer.File): void {
    const maxSize = 20 * 1024 * 1024; // 20 MB

    if (file.size > maxSize) {
      throw new BadRequestException('Archivo demasiado grande. Máximo 20 MB.');
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido.');
    }
  }

  private isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  /**
   * Parsear clave de archivo desde URL
   */
  parseFileKey(urlOrKey: string): string {
    if (!urlOrKey) return null;
    if (urlOrKey.startsWith('http')) {
      const url = new URL(urlOrKey);
      return url.pathname.substring(1);
    }
    return urlOrKey;
  }
}
```

### Crear Controlador de Archivos

**Archivo**: `backend/src/modules/files/files.controller.ts`

```typescript
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No se proporcionó archivo');

    const result = await this.filesService.uploadAvatar(file, req.user.id);
    return { message: 'Avatar cargado exitosamente', ...result };
  }

  @Post('student/:studentId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudentPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param('studentId') studentId: string,
  ) {
    if (!file) throw new BadRequestException('No se proporcionó archivo');

    const result = await this.filesService.uploadStudentPhoto(file, studentId);
    return { message: 'Foto de estudiante cargada exitosamente', ...result };
  }

  @Post('chat/:chatRoomId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadChatFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('chatRoomId') chatRoomId: string,
  ) {
    if (!file) throw new BadRequestException('No se proporcionó archivo');

    const result = await this.filesService.uploadChatFile(file, chatRoomId);
    return { message: 'Archivo de chat cargado exitosamente', ...result };
  }

  @Post('gallery/:groupId/:date')
  @UseInterceptors(FilesInterceptor('files', 10)) // Máx 10 archivos
  async uploadGalleryPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('groupId') groupId: string,
    @Param('date') date: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    const results = await this.filesService.uploadGalleryPhotos(
      files,
      groupId,
      date,
    );

    return {
      message: `${results.length} fotos cargadas exitosamente`,
      files: results,
    };
  }

  @Delete(':key(*)')
  async deleteFile(@Param('key') key: string) {
    await this.filesService.deleteFile(key);
    return { message: 'Archivo eliminado exitosamente' };
  }

  @Get('signed-url/:key(*)')
  async getSignedUrl(@Param('key') key: string) {
    const url = await this.filesService.getSignedUrl(key);
    return { url, expiresIn: 3600 };
  }
}
```

### Crear Módulo de Archivos

**Archivo**: `backend/src/modules/files/files.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
```

### Registrar Módulo

**Archivo**: `backend/src/app.module.ts`

```typescript
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    // ... otros módulos
    FilesModule,
  ],
})
export class AppModule {}
```

---

## Implementación Frontend de Almacenamiento de Archivos

### Crear Componente de Carga de Imagen

**Archivo**: `frontend/src/components/ImageUpload.tsx`

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<{ url: string }>;
  folder: 'avatar' | 'student' | 'chat' | 'gallery';
  maxSize?: number; // MB
  aspectRatio?: number;
}

export default function ImageUpload({
  currentImage,
  onUpload,
  folder,
  maxSize = 10,
  aspectRatio,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo debe ser menor a ${maxSize}MB`);
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    setError('');

    // Vista previa local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Cargar
    try {
      setUploading(true);
      const result = await onUpload(file);
      setPreview(result.url);
    } catch (err) {
      setError('Error al cargar la imagen');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="text-center">
      {preview && (
        <div
          className={`relative mx-auto mb-4 overflow-hidden border-3 border-blue-100 ${
            folder === 'avatar' ? 'w-40 h-40 rounded-full' : 'w-72 h-48 rounded-lg'
          }`}
        >
          <Image
            src={preview}
            alt="Vista previa"
            fill
            className="object-cover"
          />
        </div>
      )}

      <label
        className={`inline-block px-6 py-3 rounded-lg font-semibold cursor-pointer ${
          uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {uploading ? 'Cargando...' : 'Seleccionar Imagen'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
}
```

### Crear Hook de Carga

**Archivo**: `frontend/src/hooks/useFileUpload.ts`

```typescript
import { useState } from 'react';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    endpoint: string,
  ): Promise<{ url: string; key: string }> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/${endpoint}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('Error al cargar archivo');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatar = (file: File) => uploadFile(file, 'avatar');

  const uploadStudentPhoto = (file: File, studentId: string) =>
    uploadFile(file, `student/${studentId}`);

  const uploadChatFile = (file: File, chatRoomId: string) =>
    uploadFile(file, `chat/${chatRoomId}`);

  const uploadMultiple = async (
    files: File[],
    endpoint: string,
  ): Promise<Array<{ url: string; key: string }>> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/${endpoint}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('Error al cargar archivos');
      }

      const data = await response.json();
      return data.files;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    error,
    uploadAvatar,
    uploadStudentPhoto,
    uploadChatFile,
    uploadMultiple,
  };
}
```

### Ejemplo de Uso

```typescript
// En tu componente
const { uploadAvatar, uploading } = useFileUpload();

const handleAvatarUpload = async (file: File) => {
  try {
    const result = await uploadAvatar(file);
    setUser({ ...user, avatar: result.url });
  } catch (error) {
    alert('Error al cargar avatar');
  }
};

// En JSX
<ImageUpload
  currentImage={user.avatar}
  onUpload={handleAvatarUpload}
  folder="avatar"
  maxSize={5}
/>
```

---

## Optimización de Imágenes

### Configuración de Sharp

El FilesService usa Sharp para procesamiento de imágenes:

**Optimización de Avatar**:
```typescript
{
  maxWidth: 400,
  maxHeight: 400,
  quality: 80,
  // Resultado: ~50KB por avatar
}
```

**Foto de Estudiante**:
```typescript
{
  maxWidth: 800,
  maxHeight: 800,
  quality: 85,
  // Resultado: ~150KB por foto
}
```

**Fotos de Galería**:
```typescript
{
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  // Resultado: ~300KB por foto
}
```

### Conversión de Formato

Sharp automáticamente:
- Convierte PNG a PNG optimizado
- Convierte JPEG a JPEG optimizado con mozjpeg
- Mantiene el formato original
- Elimina metadatos EXIF

### Optimización Adicional

Para mejor rendimiento:

**Conversión WebP**:
```typescript
// En método processImage
return {
  buffer: await image.webp({ quality: 85 }).toBuffer(),
  contentType: 'image/webp',
};
```

**Generación de Miniaturas**:
```typescript
async generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer();
}
```

---

## Análisis de Costos de Almacenamiento

### Desglose Detallado de Costos

**Suposiciones** (50 estudiantes):
- Fotos de estudiantes: 50 × 150KB = 7.5MB
- Avatares: 30 usuarios × 50KB = 1.5MB
- Fotos de chat: 10/día × 200KB × 30 días = 60MB
- Galería: 20 fotos/día × 300KB × 20 días = 120MB
- Documentos: 50MB
- **Total mensual**: ~240MB nuevos + ~500MB almacenamiento total
- **Total transferencia**: ~30GB/mes (padres viendo fotos)

### Cloudflare R2 (Ganador)

```
Almacenamiento: 500MB × $0.015/GB = $0.0075/mes
Transferencia: 30GB × $0 = $0/mes
Clase A (escrituras): 1,000 × $4.50/millón = $0.0045/mes
Clase B (lecturas): 100,000 × $0.36/millón = $0.036/mes
──────────────────────────────────────────────
TOTAL: ~$0.05/mes (¡básicamente gratis!)
```

### Backblaze B2

```
Almacenamiento: 500MB × $0.005/GB = $0.0025/mes
Transferencia: 30GB × $0.01/GB = $0.30/mes
Llamadas API: 100,000 × $0.004/10K = $0.04/mes
──────────────────────────────────────────────
TOTAL: ~$0.34/mes
```

### AWS S3

```
Almacenamiento: 500MB × $0.023/GB = $0.0115/mes
Transferencia: 30GB × $0.09/GB = $2.70/mes
Peticiones PUT: 1,000 × $0.005/1000 = $0.005/mes
Peticiones GET: 100,000 × $0.0004/1000 = $0.04/mes
──────────────────────────────────────────────
TOTAL: ~$2.76/mes
```

### Vercel Blob

```
Almacenamiento: 500MB × $0.15/GB = $0.075/mes
Transferencia: Incluida
──────────────────────────────────────────────
TOTAL: ~$0.08/mes
```

### Costos Anuales

| Proveedor | Mensual | Anual | Ahorro vs S3 |
|----------|---------|--------|---------------|
| **R2** | $0.05 | $0.60 | **$32.52** |
| Vercel | $0.08 | $0.96 | $32.16 |
| B2 | $0.34 | $4.08 | $29.04 |
| S3 | $2.76 | $33.12 | - |

**Ganador**: ¡Cloudflare R2 ahorra **$32/año** vs S3!

---

## Descripción General del Sistema de Calendario

Mundo de Niños incluye un sistema integral de calendario para programación y gestión de eventos.

### Funcionalidades del Calendario

**Para Todos los Usuarios**:
- ✅ Ver calendario en vista mensual
- ✅ Navegar entre meses
- ✅ Filtrar eventos por tipo
- ✅ Ver detalles de eventos
- ✅ Tipos de eventos con código de colores
- ✅ Diseño responsivo

**Para Administradores**:
- ✅ Crear cualquier evento
- ✅ Editar cualquier evento
- ✅ Eliminar cualquier evento
- ✅ Gestionar todos los participantes

**Para Maestros**:
- ✅ Crear eventos para sus grupos
- ✅ Editar eventos propios
- ✅ Eliminar eventos propios
- ✅ Ver eventos que crearon o en los que participan

**Para Padres**:
- ✅ Ver eventos relacionados con sus hijos
- ✅ Ver eventos de grupos de sus hijos
- ✅ Actualizar estado de participación
- ❌ No pueden crear o editar eventos

### Tipos de Eventos

| Tipo | Descripción | Color | Caso de Uso |
|------|-------------|-------|----------|
| `CLASS` | Sesiones de clase | Azul 🔵 | Lecciones regulares |
| `MEAL` | Horarios de comida | Verde 🟢 | Desayuno, almuerzo, merienda |
| `NAP` | Tiempos de siesta/descanso | Morado 🟣 | Períodos de descanso |
| `ACTIVITY` | Actividades | Amarillo 🟡 | Arte, música, juego al aire libre |
| `MEETING` | Reuniones | Rojo 🔴 | Reuniones padre-maestro |
| `EVENT` | Eventos generales | Índigo 🟦 | Ocasiones especiales |
| `HOLIDAY` | Días festivos | Rosa 🟥 | Cierres de escuela |

### Estado de Eventos

- `SCHEDULED` - Evento planificado
- `IN_PROGRESS` - Sucediendo ahora
- `COMPLETED` - Terminado
- `CANCELLED` - Evento cancelado

---

## Integración con Google Calendar

Sincronizar eventos con Google Calendar para padres y personal.

### Paso 1: Crear Proyecto Google Cloud

1. Ir a https://console.cloud.google.com
2. **Crear Nuevo Proyecto**
   ```
   Nombre del Proyecto: Mundo de Niños Calendar
   Organización: Tu organización
   Ubicación: Ubicación de tu organización
   ```

3. **Habilitar APIs**:
   - APIs & Services → Library
   - Buscar "Google Calendar API"
   - Hacer clic en **Enable**

### Paso 2: Crear Credenciales OAuth 2.0

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client ID**

3. **Configurar Pantalla de Consentimiento** (si no está hecho):
   ```
   Tipo de Usuario: External
   Nome de la App: Mundo de Niños
   Email de soporte al usuario: support@mundodeninos.com
   Contacto del desarrollador: dev@mundodeninos.com
   Alcances: Agregar alcances de Google Calendar API
   ```

4. **Crear Cliente OAuth**:
   ```
   Tipo de aplicación: Aplicación web
   Nombre: Mundo de Niños Backend

   Orígenes JavaScript autorizados:
   - https://tu-frontend.vercel.app
   - http://localhost:3000 (para desarrollo)

   URIs de redirección autorizados:
   - https://tu-backend.up.railway.app/api/calendar/google/callback
   - http://localhost:4000/api/calendar/google/callback
   ```

5. **Copiar Credenciales**:
   - Client ID
   - Client Secret

### Paso 3: Configurar Backend

Agregar a variables de entorno:

```bash
# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=123456789-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALENDAR_REDIRECT_URI=https://tu-backend.up.railway.app/api/calendar/google/callback
```

### Paso 4: Implementación Backend

**Servicio de Sincronización de Calendario** (ya implementado):

```typescript
// backend/src/modules/calendar/services/google-calendar.service.ts
import { google } from 'googleapis';

export class GoogleCalendarService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
  }

  async syncEvent(event: CalendarEvent, accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDate,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: event.endDate,
        timeZone: 'America/Los_Angeles',
      },
      location: event.location,
    };

    return await calendar.events.insert({
      calendarId: 'primary',
      requestBody: googleEvent,
    });
  }
}
```

### Paso 5: Integración Frontend

**Botón Conectar Google Calendar**:

```typescript
// frontend/src/components/calendar/GoogleCalendarSync.tsx
'use client';

export default function GoogleCalendarSync() {
  const handleConnect = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_API_URL + '/api/calendar/google/callback')}&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/calendar&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <button onClick={handleConnect} className="btn-primary">
      Conectar Google Calendar
    </button>
  );
}
```

### Paso 6: Probar Sincronización de Google Calendar

```bash
# Los logs del backend deberían mostrar:
# "Google Calendar event created: evt_xxxxx"

# Revisar Google Calendar del usuario:
# - El evento debería aparecer
# - Título, descripción, hora deberían coincidir
# - La ubicación debería estar configurada
```

---

## Integración con Outlook Calendar

Sincronizar con calendarios de Microsoft Outlook/Office 365.

### Paso 1: Registrar Aplicación Azure AD

1. Ir a https://portal.azure.com
2. **Azure Active Directory** → **App registrations**
3. **Nueva registro**:
   ```
   Nombre: Mundo de Niños Calendar
   Tipos de cuenta soportados: Cuentas en cualquier directorio organizacional
   URI de redirección: Web - https://tu-backend.up.railway.app/api/calendar/outlook/callback
   ```

### Paso 2: Configurar Permisos de API

1. **Permisos de API** → **Agregar un permiso**
2. **Microsoft Graph** → **Permisos delegados**
3. Agregar permisos:
   - `Calendars.ReadWrite`
   - `User.Read`
   - `offline_access`

4. **Otorgar consentimiento de administrador** (si es requerido)

### Paso 3: Crear Secreto de Cliente

1. **Certificados y secretos** → **Nuevo secreto de cliente**
2. Descripción: `Mundo de Niños Backend`
3. Expira: 24 meses
4. **Copiar el valor** (¡se muestra solo una vez!)

### Paso 4: Obtener Detalles de Aplicación

Copiar estos valores:
- **ID de aplicación (cliente)**
- **ID de directorio (inquilino)**
- **Valor del secreto de cliente**

### Paso 5: Configurar Backend

```bash
# Outlook/Microsoft Calendar
OUTLOOK_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
OUTLOOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OUTLOOK_REDIRECT_URI=https://tu-backend.up.railway.app/api/calendar/outlook/callback
OUTLOOK_TENANT_ID=common  # o tu ID de inquilino
```

### Paso 6: Implementación Backend

**Servicio de Sincronización Outlook**:

```typescript
// backend/src/modules/calendar/services/outlook-calendar.service.ts
import { Client } from '@microsoft/microsoft-graph-client';

export class OutlookCalendarService {
  async syncEvent(event: CalendarEvent, accessToken: string) {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const outlookEvent = {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description,
      },
      start: {
        dateTime: event.startDate,
        timeZone: 'Pacific Standard Time',
      },
      end: {
        dateTime: event.endDate,
        timeZone: 'Pacific Standard Time',
      },
      location: {
        displayName: event.location,
      },
    };

    return await client.api('/me/events').post(outlookEvent);
  }
}
```

### Paso 7: Integración Frontend

```typescript
// frontend/src/components/calendar/OutlookCalendarSync.tsx
export default function OutlookCalendarSync() {
  const handleConnect = () => {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_API_URL + '/api/calendar/outlook/callback')}&` +
      `scope=Calendars.ReadWrite offline_access&` +
      `response_mode=query`;

    window.location.href = authUrl;
  };

  return (
    <button onClick={handleConnect} className="btn-primary">
      Conectar Outlook Calendar
    </button>
  );
}
```

---

## Implementación Frontend del Calendario

El frontend del calendario está completamente implementado con estos componentes:

### Componente Principal del Calendario

**Archivo**: `frontend/src/components/calendar/CalendarView.tsx`

Características clave:
- Vista mensual con cuadrícula de días
- Modal de creación de eventos
- Modal de detalles de evento
- Filtrado de eventos
- Permisos basados en roles

**Uso**:
```typescript
import CalendarView from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Calendario</h1>
      <CalendarView />
    </div>
  );
}
```

### Componente de Formulario de Evento

**Archivo**: `frontend/src/components/calendar/EventForm.tsx`

Características:
- Crear/editar eventos
- Validación de formulario (Zod)
- Todos los tipos de eventos
- Selectores de fecha/hora
- Campo de ubicación

### Servicio de API de Calendario

**Archivo**: `frontend/src/services/api/calendar.ts`

```typescript
import axios from 'axios';
import { CalendarEvent, CreateEventDto, UpdateEventDto } from '@/types/calendar';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const calendarApi = {
  // Obtener eventos para rango de fechas
  async getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const response = await axios.get(`${API_URL}/api/calendar/events`, {
      params: { startDate, endDate },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  // Crear evento
  async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    const response = await axios.post(
      `${API_URL}/api/calendar/events`,
      data,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.data;
  },

  // Actualizar evento
  async updateEvent(id: string, data: UpdateEventDto): Promise<CalendarEvent> {
    const response = await axios.patch(
      `${API_URL}/api/calendar/events/${id}`,
      data,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.data;
  },

  // Eliminar evento
  async deleteEvent(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/calendar/events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  // Agregar participante
  async addParticipant(
    eventId: string,
    participantId: string,
    type: 'user' | 'student' | 'group'
  ): Promise<void> {
    await axios.post(
      `${API_URL}/api/calendar/events/${eventId}/participants`,
      { participantId, type },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  },

  // Actualizar estado de participación
  async updateParticipationStatus(
    eventId: string,
    participantId: string,
    status: 'pending' | 'accepted' | 'declined'
  ): Promise<void> {
    await axios.patch(
      `${API_URL}/api/calendar/events/${eventId}/participants/${participantId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  },
};
```

---

## Sincronización de Calendario

### Configuración de Auto-Sincronización

Habilitar sincronización automática de calendario:

```typescript
// backend/src/modules/calendar/calendar.service.ts

async syncToExternalCalendars(event: CalendarEvent): Promise<void> {
  // Obtener todos los participantes con integraciones de calendario
  const participants = await this.getParticipantsWithCalendarSync(event.id);

  for (const participant of participants) {
    if (participant.googleCalendarEnabled) {
      await this.googleCalendarService.syncEvent(
        event,
        participant.googleAccessToken
      );
    }

    if (participant.outlookCalendarEnabled) {
      await this.outlookCalendarService.syncEvent(
        event,
        participant.outlookAccessToken
      );
    }
  }
}
```

### Disparadores de Sincronización

Los eventos se sincronizan automáticamente cuando:
- ✅ Se crea un evento
- ✅ Se actualiza un evento
- ✅ Se elimina un evento
- ✅ Se agrega un participante
- ✅ Cambia el estado del evento

### Sincronización Manual

Los usuarios pueden disparar sincronización manual:

```typescript
// frontend/src/components/calendar/SyncButton.tsx
export default function SyncButton({ eventId }: { eventId: string }) {
  const handleSync = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/calendar/events/${eventId}/sync`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );

    alert('✅ Evento sincronizado con calendarios externos');
  };

  return (
    <button onClick={handleSync} className="btn-secondary">
      Sincronizar con Calendario
    </button>
  );
}
```

### Exportación iCal

Exportar eventos como formato iCal:

```typescript
// backend/src/modules/calendar/calendar.controller.ts

@Get('events/:id/ical')
async exportToICal(@Param('id') id: string, @Res() res: Response) {
  const event = await this.calendarService.findOne(id);

  const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mundo de Niños//Calendar//EN
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${this.formatICalDate(new Date())}
DTSTART:${this.formatICalDate(new Date(event.startDate))}
DTEND:${this.formatICalDate(new Date(event.endDate))}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || ''}
STATUS:${event.status.toUpperCase()}
END:VEVENT
END:VCALENDAR`;

  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', `attachment; filename="${event.title}.ics"`);
  res.send(ical);
}
```

---

## Sistema de Tipografía

La aplicación usa un sistema unificado de tipografía con **Inter** para texto del cuerpo y **Poppins** para encabezados, proporcionando estilos consistentes en todos los componentes.

### Configuración de Fuentes

**Fuentes Usadas**:
- **Inter**: Texto del cuerpo, etiquetas, subtítulos, elementos de UI (pesos: 100-900)
- **Poppins**: Encabezados y texto display (pesos: 300-700)

**Archivos**:
- `frontend/src/app/globals.css` - Clases de tipografía y variables CSS
- `frontend/tailwind.config.js` - Configuración de tipografía Tailwind
- `frontend/src/components/ui/Typography.tsx` - Componente de tipografía
- `frontend/src/app/layout.tsx` - Configuración de carga de fuentes

### Escala de Tipografía

| Clase de Tamaño | Tamaño | Uso |
|------------|------|-------|
| `text-xs` | 12px | Subtítulos, timestamps, texto de ayuda |
| `text-sm` | 14px | Etiquetas, botones pequeños, texto secundario |
| `text-base` | 16px | Texto del cuerpo, formularios |
| `text-lg` | 18px | Texto grande del cuerpo, subtítulos |
| `text-xl` | 20px | Títulos de tarjetas, encabezados de sección |
| `text-2xl` | 24px | H3, subtítulos de página |
| `text-3xl` | 30px | H2, títulos de sección |
| `text-4xl` | 36px | H1, títulos de página |
| `text-5xl` | 48px | Texto display, títulos hero |

**Pesos de Fuente**:
- `font-light` (300) - Texto sutil
- `font-normal` (400) - Texto del cuerpo
- `font-medium` (500) - Etiquetas, énfasis
- `font-semibold` (600) - Subtítulos
- `font-bold` (700) - Encabezados, texto importante

### Uso de Clases CSS de Tipografía

#### Clases de Encabezado

```tsx
// Títulos de página
<h1 className="heading-1">Panel de Control</h1>

// Títulos de sección
<h2 className="heading-2">Actividad Reciente</h2>

// Títulos de subsección
<h3 className="heading-3">Estadísticas</h3>

// Encabezados más pequeños
<h4 className="heading-4">Acciones Rápidas</h4>
<h5 className="heading-5">Detalles</h5>
<h6 className="heading-6">Metadatos</h6>
```

#### Clases de Texto del Cuerpo

```tsx
// Texto grande del cuerpo (18px)
<p className="body-large">
  Párrafo principal o contenido enfatizado.
</p>

// Texto regular del cuerpo (16px) - Predeterminado
<p className="body-base">
  Texto de párrafo estándar.
</p>

// Texto pequeño del cuerpo (14px)
<p className="body-small">
  Información secundaria.
</p>
```

#### Clases de Etiqueta

```tsx
// Etiquetas de formulario (14px, peso medio)
<label className="label-base">Dirección de Email</label>

// Etiquetas grandes (16px)
<label className="label-large">Nombre Completo</label>

// Etiquetas pequeñas (12px)
<label className="label-small">Opcional</label>
```

#### Clases de Texto Especial

```tsx
// Subtítulo/Texto de Ayuda (12px, gris)
<span className="caption">Última actualización hace 5 minutos</span>

// Overline (12px, mayúsculas, espaciado amplio)
<span className="overline">Categoría</span>

// Texto Display (Encabezados extra grandes)
<h1 className="display-1">Título Hero (48px)</h1>
<h2 className="display-2">Display Grande (36px)</h2>

// Enlaces con efectos hover
<a href="#" className="link">Aprender Más</a>
```

### Componente de Tipografía

El componente `Typography` proporciona una forma flexible y type-safe de renderizar texto con estilos consistentes.

#### Uso Básico

```tsx
import {
  Typography,
  Heading1,
  Heading2,
  BodyText,
  Label,
  Caption
} from '@/components/ui';

function MyComponent() {
  return (
    <div>
      {/* Usando componentes especializados */}
      <Heading1>Título de Página</Heading1>
      <Heading2>Título de Sección</Heading2>
      <BodyText>Este es contenido de texto del cuerpo.</BodyText>
      <Label>Etiqueta de Formulario</Label>
      <Caption>Texto de ayuda</Caption>
    </div>
  );
}
```

#### Props del Componente

```tsx
interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' |
            'display-1' | 'display-2' |
            'body-large' | 'body' | 'body-small' |
            'label-large' | 'label' | 'label-small' |
            'caption' | 'overline';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' |
       'p' | 'span' | 'div' | 'label';
  color?: 'default' | 'primary' | 'secondary' |
          'success' | 'warning' | 'danger' |
          'muted' | 'white';
  weight?: 'light' | 'normal' | 'medium' |
           'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  noMargin?: boolean;
  className?: string;
}
```

#### Ejemplos Avanzados

```tsx
// Cambiar elemento HTML manteniendo estilos
<Typography variant="h2" as="h1">
  Estilizado como H2 pero renderiza como elemento H1
</Typography>

// Colores personalizados
<Typography variant="body" color="primary">
  Texto con color primario
</Typography>

<Typography variant="body" color="danger">
  Mensaje de error
</Typography>

// Peso y alineación personalizados
<Typography variant="body" weight="bold" align="center">
  Texto negrita, centrado
</Typography>

// Truncar texto largo
<Typography variant="body" truncate>
  Este texto muy largo será truncado...
</Typography>

// Combinar con clases Tailwind
<Typography variant="h2" className="mb-8 border-b pb-4">
  Encabezado con estilos personalizados
</Typography>
```

### Mejores Prácticas de Tipografía

#### 1. Usar HTML Semántico

```tsx
// ✅ Bueno - Semántico y accesible
<h1 className="heading-1">Título de Página</h1>
<h2 className="heading-2">Sección</h2>
<p className="body-base">Contenido</p>

// ❌ Malo - No semántico
<div className="heading-1">Título de Página</div>
<span className="heading-2">Sección</span>
```

#### 2. Mantener Jerarquía Visual

```tsx
// ✅ Bueno - Jerarquía clara
<Heading1>Título Principal</Heading1>
<Heading2>Sección</Heading2>
<Heading3>Subsección</Heading3>
<BodyText>Contenido...</BodyText>

// ❌ Malo - Salta niveles
<Heading1>Título Principal</Heading1>
<Heading4>Sección</Heading4>
```

#### 3. Estilos Consistentes de Etiquetas

```tsx
// ✅ Bueno - Consistente
<label className="label-base">Email</label>
<label className="label-base">Contraseña</label>

// O usando componente
<Label>Email</Label>
<Label>Contraseña</Label>
```

#### 4. Usar Alturas de Línea Apropiadas

```tsx
// ✅ Ajustada para encabezados
<h1 className="heading-1 leading-tight">Título</h1>

// ✅ Relajada para texto del cuerpo
<p className="body-base leading-relaxed">
  Contenido de párrafo largo...
</p>
```

### Tipografía Responsiva

#### Utilidades de Texto Responsivo

Para tipografía fluida que escala con el tamaño del viewport:

```tsx
// Tamaños de texto responsivos
<h1 className="text-responsive-2xl">
  Encabezado fluido (24px - 32px)
</h1>

<p className="text-responsive-base">
  Texto del cuerpo fluido (14px - 16px)
</p>

<span className="text-responsive-sm">
  Texto pequeño fluido (12px - 14px)
</span>

// Encabezado responsivo con tamaño automático
<h1 className="heading-responsive">
  Auto-escalado (24px - 36px)
</h1>
```

#### Breakpoints Mobile-First

Usar prefijos responsivos de Tailwind:

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Encabezado Responsivo
</h1>

<p className="text-sm sm:text-base lg:text-lg">
  Texto del cuerpo responsivo
</p>
```

### Patrones Comunes de Tipografía

```tsx
// Título de Página
<Heading1>Panel de Control</Heading1>

// Título de Sección
<Heading2>Actividad Reciente</Heading2>

// Título de Tarjeta
<Heading4>Estadísticas</Heading4>

// Etiqueta de Formulario
<label className="label-base" htmlFor="email">
  Dirección de Email
</label>

// Párrafo del Cuerpo
<p className="body-base leading-relaxed">
  Este es contenido del cuerpo con espaciado de línea cómodo.
</p>

// Subtítulo/Timestamp
<span className="caption">Hace 2 horas</span>

// Valor de Estadística
<div className="text-2xl font-bold text-gray-900">
  1,234
</div>
<div className="caption">Total Estudiantes</div>
```

### Referencia de Variables CSS

Propiedades personalizadas disponibles para uso avanzado:

```css
/* Familias de Fuentes */
var(--font-sans)      /* Inter */
var(--font-heading)   /* Poppins */

/* Tamaños de Fuente */
var(--text-xs)        /* 12px */
var(--text-sm)        /* 14px */
var(--text-base)      /* 16px */
var(--text-lg)        /* 18px */
var(--text-xl)        /* 20px */
var(--text-2xl)       /* 24px */
var(--text-3xl)       /* 30px */
var(--text-4xl)       /* 36px */
var(--text-5xl)       /* 48px */

/* Pesos de Fuente */
var(--font-light)     /* 300 */
var(--font-normal)    /* 400 */
var(--font-medium)    /* 500 */
var(--font-semibold)  /* 600 */
var(--font-bold)      /* 700 */

/* Alturas de Línea */
var(--leading-tight)    /* 1.25 */
var(--leading-snug)     /* 1.375 */
var(--leading-normal)   /* 1.5 */
var(--leading-relaxed)  /* 1.625 */
var(--leading-loose)    /* 2 */
```

### Soporte de Modo Oscuro

Todas las clases de tipografía soportan automáticamente modo oscuro:

```tsx
// Se adapta automáticamente a los colores
<Typography variant="body" color="default">
  Modo claro: gray-900, Modo oscuro: gray-100
</Typography>

<Typography variant="body" color="primary">
  Modo claro: primary-600, Modo oscuro: primary-400
</Typography>

<Caption>
  Modo claro: gray-500, Modo oscuro: gray-400
</Caption>
```

### Migración desde Estilos Antiguos

#### Convertir Estilos en Línea a Sistema de Tipografía

```tsx
// Antes: Clases Tailwind en línea
<div className="text-2xl font-bold text-gray-900">
  Encabezado
</div>

// Después: Clase de tipografía
<h3 className="heading-3">Encabezado</h3>

// O: Componente de tipografía
<Heading3>Encabezado</Heading3>
```

```tsx
// Antes: Tamaño de etiqueta inconsistente
<div className="text-sm font-medium text-gray-500">Etiqueta</div>
<div className="text-base font-medium text-gray-700">Etiqueta</div>

// Después: Etiquetas consistentes
<label className="label-base">Etiqueta</label>
<label className="label-base">Etiqueta</label>
```

```tsx
// Antes: Estilos complejos de párrafo
<p className="text-base leading-7 text-gray-600">
  Texto del cuerpo
</p>

// Después: Simplificado con clase de tipografía
<p className="body-base">Texto del cuerpo</p>

// O: Componente de tipografía
<BodyText>Texto del cuerpo</BodyText>
```

---

## Referencia Rápida

### Comandos Esenciales

```bash
# Railway
railway login
railway link
railway logs
railway run <comando>
railway connect postgres

# Vercel
vercel
vercel --prod
vercel logs
vercel env ls

# Base de Datos
psql $DATABASE_URL
npm run migration:run

# Secretos
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Credenciales Predeterminadas

```
Email Admin:      admin@mundodeninos.com
Contraseña Admin: admin123
```

⚠️ **¡Cambiar inmediatamente después del primer inicio de sesión!**

### URLs Importantes

```bash
# Después del despliegue
Frontend:  https://tu-app.vercel.app
Backend:   https://tu-backend.up.railway.app
API Docs:  https://tu-backend.up.railway.app/api/docs
Health:    https://tu-backend.up.railway.app/api/health

# Servicios
Resend:    https://resend.com/emails
R2:        https://dash.cloudflare.com/r2
Railway:   https://railway.app
Vercel:    https://vercel.com/dashboard
```

---

## Estimación de Costos

### Tier Gratuito (Hobby)

```
Railway:          $5 crédito/mes
Vercel:           $0/mes
PostgreSQL:       Incluido en $5 Railway
Resend:           $0/mes (3k emails)
Cloudflare R2:    $0/mes (efectivamente gratis)
───────────────────────────────────────
TOTAL: $0-5/mes
```

### Configuración de Producción

```
Railway Starter:  $13-18/mes
Vercel:           $0/mes
PostgreSQL:       Incluido
Redis:            Incluido
Resend:           $0/mes
Cloudflare R2:    ~$1/mes
Dominio:          ~$1/mes
───────────────────────────────────────
TOTAL: ~$15-20/mes
```

---

## Recursos Adicionales

### Documentación de Plataformas
- [Documentación Railway](https://docs.railway.app)
- [Documentación Render](https://render.com/docs)
- [Documentación Vercel](https://vercel.com/docs)

### Documentación de Servicios
- [API Resend](https://resend.com/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2)
- [PostgreSQL](https://www.postgresql.org/docs/)

### Documentación de Frameworks
- [NestJS](https://docs.nestjs.com)
- [Next.js](https://nextjs.org/docs)
- [TypeORM](https://typeorm.io)

### Comunidad
- [Discord Railway](https://discord.gg/railway)
- [Comunidad Render](https://community.render.com)
- [Discusiones Vercel](https://github.com/vercel/vercel/discussions)

---

**¡Tu guía completa para desplegar y administrar Mundo de Niños!** 🚀

Para preguntas, problemas o contribuciones, por favor consulta el repositorio del proyecto.

*Última actualización: Enero 2025*
