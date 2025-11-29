# 🎨 Mundo de Niños - Sistema de Gestión para Centros Lúdicos

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

**Sistema completo de gestión para centros lúdicos y guarderías**

[Características](#características) •
[Demo](#demo) •
[Instalación](#instalación) •
[Documentación](#documentación) •
[Contribuir](#contribuir)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#acerca-del-proyecto)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Scripts Disponibles](#scripts-disponibles)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribuir](#contribuir)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## 🎯 Acerca del Proyecto

**Mundo de Niños** es una plataforma moderna y completa para la gestión integral de centros lúdicos, guarderías y jardines infantiles. Facilita la comunicación entre padres, profesores y administradores, automatiza tareas administrativas y proporciona herramientas para el seguimiento del desarrollo de los niños.

### ¿Por qué este proyecto?

- **Centralización**: Toda la información en un solo lugar
- **Comunicación en Tiempo Real**: Chat instantáneo entre padres y profesores
- **Automatización**: Registro de asistencia, actividades y eventos
- **Accesibilidad**: PWA instalable en cualquier dispositivo
- **Seguridad**: Autenticación robusta y control de acceso basado en roles

---

## ✨ Características Principales

### 👥 Gestión de Usuarios
- ✅ Sistema de roles (Admin, Profesor, Padre)
- ✅ Autenticación local con JWT
- ✅ Login social (Google, Facebook)
- ✅ Recuperación de contraseña por email
- ✅ Perfiles personalizables con avatar

### 👶 Gestión de Estudiantes
- ✅ Registro completo de información del niño
- ✅ Historial médico (alergias, observaciones)
- ✅ Contactos de emergencia
- ✅ Agrupación por clases/grupos
- ✅ Seguimiento de desarrollo

### 📚 Gestión de Grupos
- ✅ Creación de grupos/clases
- ✅ Asignación de profesores
- ✅ Límites de capacidad
- ✅ Colores personalizados para identificación
- ✅ Gestión de estudiantes por grupo

### 📊 Registro de Asistencia
- ✅ Check-in/check-out diario
- ✅ Estados: Presente, Ausente, Tarde, Salida temprana
- ✅ Registro masivo (bulk)
- ✅ Notificaciones automáticas a padres
- ✅ Reportes de asistencia

### 🎨 Actividades Diarias
- ✅ Registro de actividades (comida, siesta, juego, etc.)
- ✅ Tipos de actividad personalizables
- ✅ Notas y observaciones por actividad
- ✅ Timeline de actividades del día
- ✅ Notificaciones a padres en tiempo real

### 💬 Chat en Tiempo Real
- ✅ Mensajería instantánea (WebSocket)
- ✅ Chats directos (1-a-1)
- ✅ Chats grupales (por clase)
- ✅ Envío de archivos e imágenes
- ✅ Indicador de "escribiendo..."
- ✅ Contador de mensajes no leídos
- ✅ Historial de conversaciones

### 📅 Calendario de Eventos
- ✅ Creación de eventos y actividades
- ✅ Tipos de eventos (clases, reuniones, fiestas, etc.)
- ✅ Invitación de participantes
- ✅ Vista mensual/semanal/diaria
- ✅ Sincronización con Google Calendar
- ✅ Sincronización con Outlook Calendar
- ✅ Recordatorios automáticos

### 📱 Progressive Web App (PWA)
- ✅ Instalable en móviles y escritorio
- ✅ Modo offline (caché)
- ✅ Notificaciones push
- ✅ Experiencia nativa
- ✅ Iconos adaptables

### 🔒 Seguridad
- ✅ Autenticación JWT
- ✅ Hashing de contraseñas (bcrypt)
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Validación de datos (frontend + backend)
- ✅ Protección CORS
- ✅ Rate limiting
- ✅ Helmet.js para headers de seguridad

---

## 🛠️ Stack Tecnológico

### Backend
```
🚀 NestJS 10.x           - Framework Node.js con TypeScript
🗄️ PostgreSQL 15         - Base de datos relacional
🔧 TypeORM 0.3.x         - ORM para TypeScript
🔐 Passport + JWT        - Autenticación y autorización
⚡ Redis 7               - Cache y sesiones (opcional)
🔌 Socket.io 4.x         - WebSockets para chat en tiempo real
📧 Resend                - Envío de emails (free tier: 3k/mes)
☁️ Cloudflare R2 / S3    - Almacenamiento de archivos
📚 Swagger/OpenAPI       - Documentación de API
```

### Frontend
```
⚛️ Next.js 14            - Framework React con SSR/SSG
🎨 Tailwind CSS 3.x      - Framework CSS utility-first
📝 TypeScript 5.2        - Superset tipado de JavaScript
🎯 React Hook Form       - Manejo de formularios
✅ Zod                   - Validación de esquemas
🔌 Socket.io-client      - Cliente WebSocket
📊 Chart.js              - Gráficas y visualizaciones
📅 React Big Calendar    - Componente de calendario
🌐 i18next               - Internacionalización
💾 Zustand               - Gestión de estado
```

### DevOps & Tools
```
🐳 Docker & Docker Compose  - Contenedores
🔄 Git & GitHub             - Control de versiones
📦 npm                      - Gestor de paquetes
🧪 Jest                     - Testing framework
🎨 ESLint + Prettier        - Linting y formato de código
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Pages      │  │  Components  │  │  Contexts        │  │
│  │   (Routing)  │  │  (UI Layer)  │  │  (State)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│                    HTTP REST + WebSocket                     │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS 10)                       │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Controllers  │  │  Services   │  │  Guards/Pipes    │   │
│  │ (Endpoints)  │  │  (Logic)    │  │  (Security)      │   │
│  └──────────────┘  └─────────────┘  └──────────────────┘   │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   AWS S3     │
│  (Database)  │  │   (Cache)    │  │  (Storage)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Principios arquitectónicos:**
- 🎯 Separación de responsabilidades (Frontend/Backend)
- 🔐 API-First design
- 🔄 Comunicación stateless (JWT)
- ⚡ Real-time con WebSockets
- 📦 Modularidad (NestJS modules)
- 🧪 Testeable y mantenible

**Documentación completa**:
- [Guía de Despliegue](./COMPREHENSIVE_GUIDE.md) - Deployment completo paso a paso

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0 ([Descargar](https://nodejs.org/))
- **npm** >= 9.0.0 (incluido con Node.js)
- **Docker** >= 24.0.0 ([Descargar](https://www.docker.com/get-started))
- **Docker Compose** >= 2.0.0 (incluido con Docker Desktop)
- **Git** ([Descargar](https://git-scm.com/))

### Verificar instalación

```bash
node --version   # v18.x.x o superior
npm --version    # 9.x.x o superior
docker --version # 24.x.x o superior
docker-compose --version # 2.x.x o superior
```

---

## 🚀 Instalación

### Opción 1: Instalación con Docker (Recomendada)

**Paso 1: Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/mundo_de_ninos.git
cd mundo_de_ninos
```

**Paso 2: Configurar variables de entorno**

```bash
# Copiar archivos de ejemplo
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar archivos .env con tus configuraciones
```

**Paso 3: Levantar servicios con Docker Compose**

```bash
docker-compose up -d
```

Esto iniciará:
- ✅ PostgreSQL en `localhost:5432`
- ✅ Redis en `localhost:6379`
- ✅ Backend API en `http://localhost:4000`
- ✅ Frontend en `http://localhost:3000`

**Paso 4: Ejecutar migraciones y seed**

```bash
# Ejecutar migraciones de base de datos
docker-compose exec backend npm run migration:run

# (Opcional) Cargar datos de prueba
docker-compose exec backend npm run seed
```

**Paso 5: Acceder a la aplicación**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Docs (Swagger)**: http://localhost:4000/api/docs

---

### Opción 2: Instalación Manual

**Backend**

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
npm run migration:run

# (Opcional) Cargar datos de prueba
npm run seed

# Iniciar servidor de desarrollo
npm run start:dev
```

El backend estará disponible en `http://localhost:4000`

**Frontend**

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno

#### Backend (`backend/.env`)

```env
# Base de datos
DATABASE_URL=postgresql://guarderia_user:guarderia_password@localhost:5432/guarderia_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=guarderia_user
DB_PASSWORD=guarderia_password
DB_NAME=guarderia_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion

# OAuth (Opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret

# Almacenamiento de archivos (Cloudflare R2 - Recomendado)
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu_r2_access_key
R2_SECRET_ACCESS_KEY=tu_r2_secret_key
R2_BUCKET_NAME=mundo-ninos-prod
R2_PUBLIC_URL=https://cdn.tudominio.com

# O AWS S3 (Alternativa)
# AWS_ACCESS_KEY_ID=tu_aws_access_key
# AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
# AWS_BUCKET_NAME=guarderia-bucket
# AWS_REGION=us-east-1

# Email (Resend - Free: 100/día, 3000/mes)
RESEND_API_KEY=re_tu_api_key_de_resend
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Mundo de Niños

# Otros
PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# OAuth (Opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=tu_facebook_app_id
```

### Configuración de Email (Resend)

**Paso 1**: Crear cuenta en https://resend.com (gratis, sin tarjeta)

**Paso 2**: Obtener API Key
- Dashboard → API Keys → Create API Key
- Copiar el key que empieza con `re_`

**Paso 3**: Configurar en `.env`:
```bash
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev  # O tu dominio verificado
RESEND_FROM_NAME=Mundo de Niños
```

Ver [COMPREHENSIVE_GUIDE.md](./COMPREHENSIVE_GUIDE.md#email-service-setup-resend) para configuración completa.

### Configuración de Almacenamiento de Archivos (Opcional)

**Opción 1: Cloudflare R2** (Recomendado - gratuito hasta 10GB)
```bash
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu_r2_access_key_id
R2_SECRET_ACCESS_KEY=tu_r2_secret_key
R2_BUCKET_NAME=mundo-ninos-prod
```

Ver [COMPREHENSIVE_GUIDE.md](./COMPREHENSIVE_GUIDE.md#cloudflare-r2-setup-recommended) para setup completo.

### Configuración OAuth (Opcional)

#### Google OAuth
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto nuevo
3. Habilitar "Google+ API"
4. Crear credenciales OAuth 2.0
5. Agregar `http://localhost:3000` a URIs autorizadas
6. Copiar Client ID y Secret a `.env`

#### Facebook OAuth
1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Crear una aplicación
3. Agregar producto "Facebook Login"
4. Configurar URIs de redirección
5. Copiar App ID y Secret a `.env`

---

## 💻 Uso

### Usuarios de Prueba (Seed)

Después de ejecutar `npm run seed`, puedes usar estos usuarios:

```
👨‍💼 Admin
Email: admin@guarderia.com
Password: admin123

👨‍🏫 Profesor
Email: profesor@guarderia.com
Password: profesor123

👨‍👩‍👧 Padre
Email: padre@guarderia.com
Password: padre123
```

### Flujo de Trabajo Típico

1. **Login** → Ingresar con email y contraseña
2. **Dashboard** → Vista principal con estadísticas
3. **Gestión de Estudiantes** → Agregar/editar niños
4. **Registro de Asistencia** → Marcar presente/ausente
5. **Chat** → Comunicarse con padres/profesores
6. **Calendario** → Crear eventos y reuniones

---

## 📜 Scripts Disponibles

### Backend

```bash
# Desarrollo
npm run start:dev        # Servidor con hot-reload
npm run start:debug      # Servidor con debugger

# Producción
npm run build            # Compilar TypeScript
npm run start:prod       # Servidor de producción

# Base de datos
npm run migration:generate  # Generar migración
npm run migration:run       # Ejecutar migraciones
npm run migration:revert    # Revertir última migración
npm run seed                # Cargar datos de prueba

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:cov         # Tests con coverage
npm run test:e2e         # Tests end-to-end

# Linting
npm run lint             # Ejecutar ESLint
npm run format           # Formatear con Prettier
```

### Frontend

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo

# Producción
npm run build            # Build de producción
npm run start            # Servidor de producción

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con coverage

# Linting
npm run lint             # Ejecutar ESLint
npm run type-check       # Verificar tipos TypeScript
```

### Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
docker-compose logs -f backend  # Solo backend

# Reiniciar servicios
docker-compose restart
docker-compose restart backend  # Solo backend

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build
docker-compose up -d --build

# Limpiar todo (¡CUIDADO! Borra volúmenes)
docker-compose down -v
```

---

## 📚 API Documentation

La documentación completa de la API está disponible en **Swagger**.

### Acceder a Swagger UI

Una vez que el backend esté corriendo:

**URL**: http://localhost:4000/api/docs

### Endpoints Principales

| Módulo | Endpoint Base | Descripción |
|--------|---------------|-------------|
| Auth | `/api/auth` | Autenticación y registro |
| Students | `/api/students` | Gestión de estudiantes |
| Groups | `/api/groups` | Gestión de grupos |
| Attendance | `/api/attendance` | Asistencia y actividades |
| Chat | `/api/chat` | Mensajería (REST) |
| Chat | `WS /chat` | Mensajería (WebSocket) |
| Calendar | `/api/calendar` | Eventos de calendario |

### Autenticación de API

Todos los endpoints (excepto login/register) requieren autenticación JWT.

**Header de autorización:**
```
Authorization: Bearer <tu_token_jwt>
```

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:4000/api/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🧪 Testing

### Backend

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

**Estructura de tests:**
```
backend/src/
├── modules/
│   └── students/
│       ├── students.service.spec.ts
│       └── students.controller.spec.ts
└── test/
    └── app.e2e-spec.ts
```

### Frontend

```bash
cd frontend

# Unit tests
npm run test

# Coverage
npm run test:coverage
```

**Estructura de tests:**
```
frontend/src/
└── components/
    └── calendar/
        └── CalendarView.test.tsx
```

---

## 🚢 Deployment

**Para despliegue completo en producción, consulta la [Guía de Despliegue Completa](./COMPREHENSIVE_GUIDE.md)**

### Opción Rápida: Railway + Vercel (15 minutos)

**Paso 1: Backend en Railway**
```bash
# 1. Crear cuenta en https://railway.app
# 2. New Project → Deploy from GitHub
# 3. Agregar PostgreSQL automáticamente
# 4. Configurar variables de entorno (ver guía completa)
# 5. Deploy automático
```

**Paso 2: Frontend en Vercel**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel

# Configurar env vars:
# NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
# NEXT_PUBLIC_SOCKET_URL=https://tu-backend.up.railway.app
```

**Paso 3: Configurar Email y Storage**
```bash
# Resend (Email)
# 1. Crear cuenta en https://resend.com
# 2. Obtener API key
# 3. Agregar RESEND_API_KEY a Railway

# Cloudflare R2 (Almacenamiento - Opcional)
# 1. Crear bucket en Cloudflare R2
# 2. Obtener credenciales
# 3. Agregar R2_* variables a Railway
```

### Otras Opciones de Deployment

| Opción | Backend | Frontend | Base de Datos | Costo Mensual |
|--------|---------|----------|---------------|---------------|
| **Railway + Vercel** | Railway | Vercel | Railway PostgreSQL | $0-5 |
| **Render All-in-One** | Render | Render | Render PostgreSQL | $0-21 |
| **Render + Vercel** | Render | Vercel | Render PostgreSQL | $0-7 |

**Guías detalladas**:
- [Quick Start (15 min)](./COMPREHENSIVE_GUIDE.md#quick-start-15-minutes)
- [Railway + Vercel](./COMPREHENSIVE_GUIDE.md#option-a-railway--vercel-recommended)
- [Render with Docker](./COMPREHENSIVE_GUIDE.md#option-b-render-with-docker)
- [Troubleshooting](./COMPREHENSIVE_GUIDE.md#troubleshooting)

### Consideraciones de Producción

**Seguridad:**
- ✅ Cambiar `JWT_SECRET` a valor aleatorio fuerte (usar `crypto.randomBytes(32)`)
- ✅ HTTPS automático en Railway/Vercel/Render
- ✅ Configurar CORS con FRONTEND_URL específica
- ✅ Rate limiting ya configurado (100 req/min)
- ✅ Usar variables de entorno de la plataforma

**Performance:**
- ✅ Compresión gzip habilitada en NestJS
- ✅ CDN automático en Vercel para frontend
- ✅ Redis para caché (opcional)
- ✅ Índices de BD ya configurados en migraciones
- ✅ Optimización automática de imágenes en Next.js

**Monitoreo:**
- ✅ Logs nativos de Railway/Render/Vercel
- ✅ Integración con Sentry para errores (opcional)
- ✅ Health check endpoint: `/api/health`
- ✅ Swagger docs: `/api/docs`

---

## 📁 Estructura del Proyecto

```
mundo_de_ninos/
│
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Módulos de la aplicación
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── users/         # Usuarios
│   │   │   ├── students/      # Estudiantes
│   │   │   ├── groups/        # Grupos
│   │   │   ├── attendance/    # Asistencia
│   │   │   ├── chat/          # Chat
│   │   │   └── calendar/      # Calendario
│   │   ├── config/            # Configuraciones
│   │   ├── services/          # Servicios compartidos
│   │   ├── app.module.ts      # Módulo raíz
│   │   └── main.ts            # Entry point
│   ├── test/                  # Tests E2E
│   ├── .env.example           # Variables de entorno ejemplo
│   ├── Dockerfile             # Imagen Docker
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # App Next.js
│   ├── src/
│   │   ├── app/               # App Router (Next.js 14)
│   │   │   ├── auth/          # Páginas de autenticación
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── layout.tsx     # Layout raíz
│   │   │   └── page.tsx       # Landing page
│   │   ├── components/        # Componentes reutilizables
│   │   ├── contexts/          # React Contexts
│   │   ├── services/          # API calls
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilidades
│   ├── public/                # Assets estáticos
│   ├── .env.example           # Variables de entorno ejemplo
│   ├── Dockerfile             # Imagen Docker
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── uploads/                    # Archivos subidos (local)
├── docker-compose.yml          # Orquestación Docker
├── COMPREHENSIVE_GUIDE.md      # Guía de despliegue y configuración
├── README.md                   # Este archivo
└── LICENSE                     # Licencia MIT
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar este proyecto, sigue estos pasos:

### 1. Fork del Proyecto

Haz click en el botón "Fork" en la parte superior derecha de GitHub.

### 2. Clonar tu Fork

```bash
git clone https://github.com/tu-usuario/mundo_de_ninos.git
cd mundo_de_ninos
```

### 3. Crear una Rama

```bash
git checkout -b feature/nueva-funcionalidad
```

**Convención de nombres de ramas:**
- `feature/` - Nueva funcionalidad
- `fix/` - Corrección de bug
- `docs/` - Documentación
- `refactor/` - Refactorización
- `test/` - Tests

### 4. Hacer Cambios

- ✅ Seguir la guía de estilo del proyecto
- ✅ Escribir tests para nuevas funcionalidades
- ✅ Actualizar documentación si es necesario
- ✅ Asegurar que todos los tests pasen

### 5. Commit y Push

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad X"
git push origin feature/nueva-funcionalidad
```

**Convención de commits (Conventional Commits):**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formateo, punto y coma, etc.
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Actualización de dependencias, etc.

### 6. Abrir Pull Request

Ve a tu fork en GitHub y haz click en "Compare & pull request".

**Checklist antes de PR:**
- [ ] Código sigue las guías de estilo
- [ ] Tests agregados/actualizados y pasando
- [ ] Documentación actualizada
- [ ] Commits siguiendo convención
- [ ] Sin conflictos con `main`

### Reportar Bugs

Si encuentras un bug, [abre un issue](https://github.com/tu-usuario/mundo_de_ninos/issues) con:

1. **Título descriptivo**
2. **Pasos para reproducir**
3. **Comportamiento esperado vs actual**
4. **Screenshots (si aplica)**
5. **Versión de Node.js, navegador, OS**

### Solicitar Funcionalidades

Para solicitar nuevas funcionalidades, [abre un issue](https://github.com/tu-usuario/mundo_de_ninos/issues) con:

1. **Descripción de la funcionalidad**
2. **Problema que resuelve**
3. **Alternativas consideradas**
4. **Mockups o ejemplos (si aplica)**

---

## 📝 Code Style

### Backend (NestJS)

- **Linter**: ESLint
- **Formatter**: Prettier
- **Estilo**: Airbnb TypeScript

```bash
npm run lint       # Verificar
npm run lint:fix   # Corregir
npm run format     # Formatear
```

### Frontend (Next.js)

- **Linter**: ESLint (Next.js config)
- **Formatter**: Prettier
- **Estilo**: Next.js + Airbnb

```bash
npm run lint       # Verificar
npm run format     # Formatear
```

---

## 🐛 Troubleshooting

### Error: Puerto 5432 ya en uso

```bash
# Detener PostgreSQL local
sudo service postgresql stop

# O cambiar el puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar 5433 externamente
```

### Error: Cannot connect to database

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar servicio
docker-compose restart postgres
```

### Error: Module not found en Frontend

```bash
# Limpiar caché y reinstalar
rm -rf node_modules .next
npm install
npm run dev
```

### Error: EADDRINUSE al iniciar backend

```bash
# Matar proceso en puerto 4000
lsof -ti:4000 | xargs kill -9

# O cambiar puerto en .env
PORT=4001
```

**Más soluciones**: Ver [Guía de Troubleshooting](./COMPREHENSIVE_GUIDE.md#troubleshooting) completa

---

## 📊 Roadmap

### v1.0 (Actual) ✅
- [x] Sistema de autenticación
- [x] Gestión de estudiantes y grupos
- [x] Registro de asistencia
- [x] Chat en tiempo real
- [x] Calendario de eventos
- [x] PWA

### v1.1 (Próximo)
- [ ] Notificaciones push
- [ ] Reportes en PDF
- [ ] Dashboard de analytics
- [ ] Módulo de pagos
- [ ] Multi-idioma completo

### v2.0 (Futuro)
- [ ] Multi-tenancy
- [ ] Videollamadas integradas
- [ ] App móvil nativa (React Native)
- [ ] Inteligencia artificial (recomendaciones)
- [ ] Geolocalización (tracking de buses)

Ver [Issues](https://github.com/tu-usuario/mundo_de_ninos/issues) para más detalles.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2024 Mundo de Niños

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 👥 Autores

- **Tu Nombre** - *Desarrollo Inicial* - [@tu-usuario](https://github.com/tu-usuario)

Ver también la lista de [contribuidores](https://github.com/tu-usuario/mundo_de_ninos/contributors).

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - Framework backend increíble
- [Next.js](https://nextjs.org/) - El mejor framework de React
- [Tailwind CSS](https://tailwindcss.com/) - Sistema de diseño utility-first
- [TypeORM](https://typeorm.io/) - ORM robusto para TypeScript
- [Socket.io](https://socket.io/) - WebSockets simplificados
- Todos los [contribuidores](https://github.com/tu-usuario/mundo_de_ninos/contributors)

---

## 📞 Contacto

**Equipo de Desarrollo**

- Email: [contacto@mundodeninos.com](mailto:contacto@mundodeninos.com)
- Website: [https://mundodeninos.com](https://mundodeninos.com)
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Twitter: [@mundodeninos](https://twitter.com/mundodeninos)

**Links del Proyecto**

- [Repositorio](https://github.com/tu-usuario/mundo_de_ninos)
- [Issues](https://github.com/tu-usuario/mundo_de_ninos/issues)
- [Pull Requests](https://github.com/tu-usuario/mundo_de_ninos/pulls)
- [Guía de Despliegue](./COMPREHENSIVE_GUIDE.md)

---

## ⭐ Dale una Estrella

Si este proyecto te fue útil, ¡considera darle una estrella en GitHub! ⭐

---

<div align="center">

**[⬆ Volver arriba](#-mundo-de-niños---sistema-de-gestión-para-centros-lúdicos)**

Made with ❤️ by the Mundo de Niños Team

</div>
