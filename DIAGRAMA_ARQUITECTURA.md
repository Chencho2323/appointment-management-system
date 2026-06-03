# Diagrama de Arquitectura - Sistema de Gestión de Citas

## 📐 Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR WEB                           │
│                    (Chrome, Firefox, Edge)                      │
│                    Puerto Local: 3000                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│                   Puerto: 3000 (Docker)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Páginas (App Router)                                     │  │
│  │  ├── /login          (Autenticación)                      │  │
│  │  ├── /dashboard      (Estadísticas)                       │  │
│  │  ├── /appointments   (Listado de citas)                  │  │
│  │  ├── /appointments/[id] (Formulario)                      │  │
│  │  └── /report         (Reporte de tiempos)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Componentes                                               │  │
│  │  └── Navbar (Navegación responsive)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Utilidades                                               │  │
│  │  ├── axios.ts (Cliente HTTP con interceptores JWT)        │  │
│  │  └── utils.ts (Funciones helper)                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ API REST (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Django REST Framework)            │
│                   Puerto: 8000 (Docker)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Configuración Django                                     │  │
│  │  ├── settings.py (DB, JWT, CORS, Timezone)               │  │
│  │  ├── urls.py (Rutas principales)                          │  │
│  │  └── wsgi.py (Servidor WSGI)                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  App: appointments                                         │  │
│  │  ├── models.py (Modelo Appointment)                       │  │
│  │  ├── serializers.py (Validación + conversión JSON)        │  │
│  │  ├── views.py (Endpoints API)                             │  │
│  │  ├── urls.py (Rutas de la app)                            │  │
│  │  └── tests.py (Pruebas unitarias)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Autenticación JWT                                        │  │
│  │  ├── POST /api/auth/token/ (Login)                        │  │
│  │  └── POST /api/auth/token/refresh/ (Refresh)               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ SQL (PostgreSQL)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (PostgreSQL)                    │
│                   Puerto: 5432 (Docker)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Tabla: appointments_appointment                           │  │
│  │  ├── id (PK, Auto-increment)                              │  │
│  │  ├── scheduled_at (DateTime)                              │  │
│  │  ├── delivered_at (DateTime, nullable)                    │  │
│  │  ├── status (Varchar: Programada/En Proceso/Entregada/...) │  │
│  │  ├── provider (Varchar)                                   │  │
│  │  ├── product_line (Varchar)                               │  │
│  │  ├── sub_product_line (Varchar)                           │  │
│  │  ├── notes (Text)                                         │  │
│  │  ├── created_at (DateTime)                                │  │
│  │  ├── updated_at (DateTime)                                │  │
│  │  ├── created_by (FK → User)                               │  │
│  │  └── updated_by (FK → User)                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Tabla: auth_user (Django default)                        │  │
│  │  ├── id (PK)                                              │  │
│  │  ├── username                                             │  │
│  │  ├── password (hashed)                                    │  │
│  │  ├── email                                                │  │
│  │  └── ...                                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Autenticación

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  USUARIO  │                    │ FRONTEND │                    │ BACKEND  │
└─────┬────┘                    └─────┬────┘                    └─────┬────┘
      │                              │                              │
      │ 1. Ingresa credenciales       │                              │
      │    (username/password)        │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │ 2. POST /api/auth/token/     │
      │                              │    Body: {username, password} │
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │ 3. Valida credenciales       │
      │                              │    Genera access_token       │
      │                              │    Genera refresh_token       │
      │                              │                              │
      │                              │ 4. Response: {access, refresh}│
      │                              │<─────────────────────────────┤
      │                              │                              │
      │ 5. Guarda tokens en           │                              │
      │    localStorage               │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 6. Redirige a /dashboard     │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 7. Navega a página protegida │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │ 8. GET /api/appointments/     │
      │                              │    Header: Authorization:     │
      │                              │            Bearer <access_token>│
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │ 9. Valida token JWT          │
      │                              │    Retorna datos             │
      │                              │                              │
      │                              │ 10. Response: [citas]         │
      │                              │<─────────────────────────────┤
      │                              │                              │
      │ 11. Muestra datos en UI       │                              │
      │<─────────────────────────────┤                              │
```

---

## 🔁 Flujo de Refresh Token (cuando expira access_token)

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ FRONTEND │                    │ FRONTEND │                    │ BACKEND  │
│ (Axios)   │                    │ (UI)     │                    │ (Django) │
└─────┬────┘                    └─────┬────┘                    └─────┬────┘
      │                              │                              │
      │ 1. Request API con token      │                              │
      │    expirado                   │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │ 2. Response: 401 Unauthorized│                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 3. Intercepta error 401       │                              │
      │                              │                              │
      │ 4. POST /api/auth/token/     │                              │
      │    refresh/                   │                              │
      │    Body: {refresh}            │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │ 5. Valida refresh_token       │
      │                              │    Genera nuevo access_token  │
      │                              │                              │
      │ 6. Response: {access}        │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 7. Guarda nuevo access_token │                              │
      │    en localStorage            │                              │
      │                              │                              │
      │ 8. Reintenta request original│                              │
      │    con nuevo token            │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │ 9. Response: 200 OK          │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 10. Retorna datos a UI         │                              │
      │<─────────────────────────────┤                              │
```

---

## 📊 Flujo de Creación de Cita

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  USUARIO  │                    │ FRONTEND │                    │ BACKEND  │
└─────┬────┘                    └─────┬────┘                    └─────┬────┘
      │                              │                              │
      │ 1. Clic en "Nueva Cita"      │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │ 2. Muestra formulario         │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 3. Llena formulario          │                              │
      │    (scheduled_at, provider,  │                              │
      │     product_line, etc.)       │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │ 4. Clic en "Guardar"         │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │ 5. POST /api/appointments/    │
      │                              │    Body: {cita_data}          │
      │                              │    Header: Bearer <token>     │
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │                              │
      │                              │ 6. AppointmentSerializer     │
      │                              │    - Valida reglas negocio    │
      │                              │    - scheduled_at > now       │
      │                              │    - Si status=Entregada:     │
      │                              │      delivered_at requerido   │
      │                              │    - delivered_at >          │
      │                              │      scheduled_at             │
      │                              │                              │
      │                              │ 7. Crea registro en DB       │
      │                              │    - Asigna created_by = user │
      │                              │    - Asigna updated_by = user │
      │                              │                              │
      │                              │ 8. Response: 201 Created      │
      │                              │    Body: {cita_creada}         │
      │                              │<─────────────────────────────┤
      │                              │                              │
      │ 9. Muestra mensaje éxito      │                              │
      │    "Cita creada exitosamente" │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 10. Espera 1.5 seg             │                              │
      │                              │                              │
      │ 11. Redirige a /appointments  │                              │
      │<─────────────────────────────┤                              │
```

---

## 📈 Flujo de Dashboard con Filtro por Estado

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  USUARIO  │                    │ FRONTEND │                    │ BACKEND  │
└─────┬────┘                    └─────┬────┘                    └─────┬────┘
      │                              │                              │
      │ 1. En Dashboard              │                              │
      │    ve tarjetas de estado     │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 2. Clic en tarjeta "En Proceso"│                             │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │ 3. router.push('/appointments?status=En%20Proceso')         │
      │                              │                              │
      │ 4. Navega a /appointments    │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │
      │ 5. useEffect lee URL param   │                              │
      │    setFilters({status: 'En Proceso'})                    │
      │                              │                              │
      │ 6. useEffect detecta cambio   │                              │
      │    en filters → fetchAppointments()                        │
      │                              │                              │
      │                              │ 7. GET /api/appointments/     │
      │                              │    ?status=En+Proceso         │
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │ 8. Filtra queryset por status│
      │                              │    WHERE status = 'En Proceso'│
      │                              │                              │
      │                              │ 9. Response: [citas_filtradas]│
      │                              │<─────────────────────────────┤
      │                              │                              │
      │ 10. Muestra solo citas con    │                              │
      │     estado "En Proceso"       │                              │
      │<─────────────────────────────┤                              │
```

---

## 🗂️ Estructura de Archivos (Árbol)

```
appointment-management-system/
│
├── docker-compose.yml              # Orquestación de contenedores
│
├── README.md                       # Documentación general del proyecto
├── DOCUMENTACION_TECNICA.md        # Documentación técnica detallada
├── DIAGRAMA_ARQUITECTURA.md       # Este archivo (diagramas)
│
├── backend/                        # Backend Django REST Framework
│   ├── manage.py                   # Script de gestión Django
│   ├── requirements.txt            # Dependencias Python
│   │
│   ├── config/                     # Configuración del proyecto
│   │   ├── __init__.py
│   │   ├── settings.py             # Configuración principal
│   │   ├── urls.py                 # Rutas URL principales
│   │   ├── wsgi.py                 # Servidor WSGI
│   │   └── asgi.py                 # Servidor ASGI
│   │
│   └── appointments/              # App principal de citas
│       ├── __init__.py
│       ├── admin.py              # Configuración admin Django
│       ├── apps.py               # Clase de configuración
│       ├── models.py             # Modelo Appointment
│       ├── serializers.py        # Serializadores DRF
│       ├── views.py              # Vistas API (endpoints)
│       ├── urls.py               # Rutas URL de la app
│       ├── tests.py              # Pruebas unitarias
│       │
│       └── migrations/           # Migraciones DB
│           └── 0001_initial.py   # Migración inicial
│
└── frontend/                      # Frontend Next.js
    ├── package.json               # Dependencias Node.js
    ├── tsconfig.json              # Configuración TypeScript
    ├── tailwind.config.ts         # Configuración Tailwind
    │
    ├── app/                      # App Router (Next.js 13+)
    │   ├── layout.tsx            # Layout principal
    │   ├── page.tsx              # Página inicio (redirect)
    │   │
    │   ├── login/               # Página de login
    │   │   └── page.tsx
    │   │
    │   ├── dashboard/           # Dashboard
    │   │   └── page.tsx
    │   │
    │   ├── appointments/        # Citas
    │   │   ├── page.tsx        # Listado con filtros
    │   │   └── [id]/           # Detalle/edición
    │   │       └── page.tsx    # Formulario
    │   │
    │   └── report/             # Reporte
    │       └── page.tsx
    │
    └── components/             # Componentes React
        └── Navbar.tsx          # Barra navegación
```

---

## 🔗 Mapeo de Endpoints a Archivos

| Endpoint | Método | Archivo Backend | Función | Archivo Frontend |
|-----------|--------|-----------------|---------|-----------------|
| `/api/auth/token/` | POST | `config/urls.py` → Simple JWT | Login | `app/login/page.tsx` |
| `/api/auth/token/refresh/` | POST | `config/urls.py` → Simple JWT | Refresh token | `lib/axios.ts` (interceptor) |
| `/api/appointments/` | GET | `appointments/views.py` → `AppointmentViewSet.list` | Listar citas | `app/appointments/page.tsx` |
| `/api/appointments/` | POST | `appointments/views.py` → `AppointmentViewSet.create` | Crear cita | `app/appointments/[id]/page.tsx` |
| `/api/appointments/{id}/` | GET | `appointments/views.py` → `AppointmentViewSet.retrieve` | Obtener cita | `app/appointments/[id]/page.tsx` |
| `/api/appointments/{id}/` | PUT | `appointments/views.py` → `AppointmentViewSet.update` | Actualizar cita | `app/appointments/[id]/page.tsx` |
| `/api/appointments/{id}/` | DELETE | `appointments/views.py` → `AppointmentViewSet.destroy` | Eliminar cita | `app/appointments/page.tsx` |
| `/api/appointments/dashboard/` | GET | `appointments/views.py` → `AppointmentViewSet.dashboard` | Estadísticas | `app/dashboard/page.tsx` |
| `/api/appointments/report/` | GET | `appointments/views.py` → `AppointmentViewSet.report` | Reporte tiempos | `app/report/page.tsx` |

---

## 🎨 Flujo de Datos (Data Flow)

### Creación de Cita
```
Formulario React → handleSubmit() → axios.post()
                                    ↓
                              AppointmentSerializer.validate()
                                    ↓
                              Appointment.objects.create()
                                    ↓
                              PostgreSQL INSERT
                                    ↓
                              Response 201 + JSON
                                    ↓
                              React setState + redirect
```

### Listado con Filtros
```
URL params → useEffect → setFilters()
                              ↓
                        useEffect (filters change)
                              ↓
                        fetchAppointments()
                              ↓
                        axios.get() with params
                              ↓
                        AppointmentViewSet.get_queryset()
                              ↓
                        Django ORM filters
                              ↓
                        PostgreSQL SELECT with WHERE
                              ↓
                        Response 200 + JSON
                              ↓
                        React setState appointments
```

---

## 🔐 Seguridad en el Sistema

### Capas de Seguridad
```
┌─────────────────────────────────────────────────────────────┐
│  1. Navegador: HTTPS (en producción)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend: Validación de campos (cliente)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Axios: Interceptor que agrega JWT a cada request        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. CORS: Solo permite orígenes configurados               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Django: PermissionClasses = IsAuthenticated             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. JWT: Validación de firma y expiración del token        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  7. Serializers: Validación de reglas de negocio           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  8. PostgreSQL: Usuario/contraseña de DB, permisos         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Flujo de Despliegue (Deployment)

```
Desarrollo Local:
┌─────────────────────────────────────────────────────────────┐
│  1. docker-compose up --build                              │
│     - Construye imágenes frontend y backend                │
│     - Inicia contenedores (frontend, backend, db)          │
│     - Ejecuta migraciones                                  │
│     - Carga datos de prueba (seed_data)                   │
└─────────────────────────────────────────────────────────────┘

Producción (Futuro):
┌─────────────────────────────────────────────────────────────┐
│  1. Frontend: Vercel/Netlify (Next.js)                     │
│  2. Backend: Heroku/DigitalOcean (Django)                  │
│  3. Database: PostgreSQL Cloud (AWS RDS, etc.)              │
│  4. Environment Variables: SECRET_KEY, DB_URL, etc.        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Resumen de Tecnologías por Capa

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Infraestructura** | Docker Compose | Orquestación de contenedores |
| **Base de Datos** | PostgreSQL 15 | Almacenamiento persistente |
| **Backend API** | Django REST Framework | API RESTful |
| **Autenticación** | Simple JWT | Tokens JWT para auth |
| **Frontend UI** | Next.js 14 | Framework React SSR |
| **Estilos** | Tailwind CSS | Estilos utility-first |
| **HTTP Client** | Axios | Llamadas API con interceptores |
| **Iconos** | Lucide React | Iconos SVG |
| **Fechas** | date-fns | Manipulación de fechas |
| **Tipado** | TypeScript 5 | Tipado estático frontend |

---

## 🎯 Puntos Clave para Presentación

### Arquitectura
- **Monolítica separada**: Frontend y backend en contenedores separados
- **REST API**: Comunicación HTTP/JSON entre frontend y backend
- **JWT Authentication**: Tokens con refresh automático
- **Docker**: Contenedores para reproducibilidad

### Backend (Django)
- **Model-View-Serializer**: Patrón estándar DRF
- **ORM Django**: Abstracción SQL con validaciones
- **SQL Nativo**: Para reportes complejos (performance)
- **Management Commands**: Para tareas administrativas

### Frontend (Next.js)
- **App Router**: Next.js 13+ con file-based routing
- **Client Components**: 'use client' para interactividad
- **Axios Interceptors**: Manejo automático de JWT
- **Responsive Design**: Tailwind CSS mobile-first

### Seguridad
- **JWT con Refresh**: Balance seguridad/usabilidad
- **CORS**: Restricción de orígenes
- **Validaciones**: En ambos lados (backend y frontend)
- **Passwords**: Hasheadas con PBKDF2 (Django default)

### Base de Datos
- **PostgreSQL**: Base de datos relacional robusta
- **Índices**: Para performance en filtros
- **Migraciones**: Versionado de schema
- **Foreign Keys**: Integridad referencial
