# Documentación Técnica - Sistema de Gestión de Citas

## 📋 Índice
- [Arquitectura General](#arquitectura-general)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Backend (Django REST Framework)](#backend-django-rest-framework)
- [Frontend (Next.js + React)](#frontend-nextjs--react)
- [Base de Datos](#base-de-datos)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Endpoints API](#endpoints-api)
- [Componentes Frontend](#componentes-frontend)
- [Patrones de Diseño](#patrones-de-diseño)

---

## Arquitectura General

El sistema sigue una arquitectura **monolítica separada**:
- **Backend**: Django REST Framework (Python)
- **Frontend**: Next.js con App Router (React + TypeScript)
- **Base de Datos**: PostgreSQL
- **Contenedores**: Docker Compose para orquestación

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend       │
│   (Next.js)     │◄────────┤  (Django REST)  │
│   Puerto 3000   │  HTTP   │  Puerto 8000    │
└─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  PostgreSQL     │
                            │  Puerto 5432    │
                            └─────────────────┘
```

---

## Estructura del Proyecto

### Descripción General

El proyecto está organizado en dos carpetas principales: `backend` (Django REST Framework) y `frontend` (Next.js + React). Cada carpeta contiene su propia configuración, dependencias y código específico.

```
appointment-management-system/
├── backend/                          # Backend Django REST Framework
│   ├── appointments/                 # Aplicación principal de gestión de citas
│   │   ├── __init__.py              # Inicializador de la aplicación Django
│   │   ├── admin.py                 # Configuración de la interfaz de administración de Django
│   │   ├── apps.py                  # Clase de configuración de la aplicación
│   │   ├── auth_views.py            # Vistas personalizadas para autenticación (registro de operadores)
│   │   ├── management/              # Comandos de gestión personalizados
│   │   │   └── commands/
│   │   │       └── seed_data.py     # Comando para cargar datos de prueba en la base de datos
│   │   ├── migrations/              # Migraciones de base de datos
│   │   │   ├── 0001_initial.py     # Migración inicial que crea la tabla de citas
│   │   │   ├── 0002_alter_appointment_delivered_at.py  # Ajuste de campo delivered_at
│   │   │   ├── 0003_appointment_created_by_and_more.py  # Agrega campos de auditoría
│   │   │   └── 0004_alter_appointment_status.py  # Ajuste de campo status
│   │   ├── models.py                # Modelos de datos (Appointment con validaciones de negocio)
│   │   ├── serializers.py           # Serializadores DRF para conversión JSON y validación
│   │   ├── tests.py                 # Pruebas unitarias y de integración del backend
│   │   ├── views.py                 # Vistas API (endpoints REST)
│   │   └── urls.py                  # Rutas URL específicas de la aplicación de citas
│   ├── config/                      # Configuración del proyecto Django
│   │   ├── __init__.py             # Inicializador del paquete config
│   │   ├── asgi.py                 # Configuración ASGI (Asynchronous Server Gateway Interface)
│   │   ├── settings.py             # Configuración principal (base de datos, JWT, CORS, timezone)
│   │   ├── urls.py                 # Rutas URL principales del proyecto
│   │   └── wsgi.py                 # Configuración WSGI (Web Server Gateway Interface)
│   ├── .env                        # Variables de entorno (no versionado en git)
│   ├── .env.example                # Ejemplo de variables de entorno
│   ├── .flake8                     # Configuración del linter Flake8
│   ├── Dockerfile                  # Configuración de Docker para el contenedor del backend
│   ├── manage.py                   # Script de gestión Django (ejecutar servidor, migraciones, etc.)
│   └── requirements.txt            # Dependencias Python del backend
│
├── frontend/                         # Frontend Next.js con App Router
│   ├── app/                         # App Router de Next.js 13+ (rutas basadas en archivos)
│   │   ├── appointments/            # Rutas para gestión de citas
│   │   │   ├── page.tsx            # Página de listado de citas con filtros avanzados
│   │   │   └── [id]/               # Ruta dinámica para detalle/edición de cita
│   │   │       └── page.tsx        # Formulario de creación y edición de citas
│   │   ├── dashboard/              # Ruta del dashboard principal
│   │   │   └── page.tsx            # Página con estadísticas y métricas del sistema
│   │   ├── login/                   # Ruta de autenticación
│   │   │   └── page.tsx            # Página de login con efecto de panel deslizante
│   │   ├── report/                  # Ruta de reportes
│   │   │   └── page.tsx            # Página de reporte de tiempos de entrega con gráficos
│   │   ├── layout.tsx              # Layout principal de la aplicación (wrapper de todas las páginas)
│   │   └── page.tsx                # Página de inicio (redirige automáticamente al dashboard)
│   ├── components/                  # Componentes React reutilizables
│   │   └── Sidebar.tsx             # Componente de barra lateral de navegación responsive
│   ├── lib/                        # Utilidades y configuración compartida
│   │   ├── axios.ts                # Instancia de Axios con interceptores para JWT
│   │   └── utils.ts                # Funciones utilitarias (cn para combinar clases Tailwind)
│   ├── .env                        # Variables de entorno del frontend
│   ├── .env.example                # Ejemplo de variables de entorno del frontend
│   ├── .eslintrc.json              # Configuración de ESLint
│   ├── Dockerfile                  # Configuración de Docker para el contenedor del frontend
│   ├── next.config.js              # Configuración de Next.js
│   ├── next-env.d.ts               # Declaraciones de tipos de Next.js
│   ├── package.json                # Dependencias Node.js y scripts del frontend
│   ├── postcss.config.js           # Configuración de PostCSS (para Tailwind)
│   ├── tailwind.config.ts          # Configuración de Tailwind CSS
│   └── tsconfig.json               # Configuración de TypeScript
│
├── .github/                         # Configuración de GitHub
│   └── workflows/                  # Workflows de GitHub Actions (CI/CD)
│
├── docker-compose.yml               # Configuración de Docker Compose para orquestar contenedores
├── DIAGRAMA_ARQUITECTURA.md         # Diagrama detallado de la arquitectura del sistema
├── DOCUMENTACION_TECNICA.md         # Este archivo de documentación técnica
└── README.md                        # Documentación general del proyecto
```

---

## Backend (Django REST Framework)

### Archivos Principales

#### `backend/appointments/models.py`
**Propósito**: Define la estructura de datos de las citas con validaciones de negocio.

**Modelo `Appointment`**:
- `scheduled_at`: Fecha y hora programada de la cita (requerido)
- `delivered_at`: Fecha y hora de entrega (opcional, requerido cuando status es "Entregada")
- `status`: Estado de la cita (Programada, En Proceso, Entregada, Cancelada)
- `provider`: Nombre del proveedor (requerido, indexado)
- `product_line`: Línea de producto (requerido, indexado)
- `sub_product_line`: Sub-línea de producto (requerido, indexado)
- `notes`: Notas adicionales (opcional)
- `created_at`: Timestamp de creación (auto-generado)
- `updated_at`: Timestamp de actualización (auto-generado)
- `created_by`: Usuario que creó la cita (FK a User, nullable)
- `updated_by`: Usuario que actualizó la cita (FK a User, nullable)

**Métodos**:
- `__str__`: Representación en string del modelo (formato: "provider - product_line (status) - scheduled_at")
- `clean()`: Validaciones de negocio antes de guardar:
  - Regla 1: No se puede crear cita con fecha pasada
  - Regla 2: El estado "Entregada" requiere delivered_at
  - Regla 3: delivered_at debe ser posterior a scheduled_at
  - Regla 4: Validar transiciones de estado válidas
- `save()`: Llama a full_clean() antes de guardar para asegurar validaciones

#### `backend/appointments/serializers.py`
**Propósito**: Convierte modelos Django a JSON y viceversa, con validaciones.

**Serializadores**:
1. **`UserSerializer`**: Serializa el modelo User de Django
   - Campos: id, username, email, first_name, last_name

2. **`AppointmentSerializer`**: Serializa completo de Appointment
   - Incluye campos de lectura: created_by_username, updated_by_username
   - **Validaciones**:
     - `scheduled_at` no puede ser en el pasado (comparado con `timezone.now()`)
     - Si status es "Entregada", `delivered_at` es requerido
     - `delivered_at` debe ser posterior a `scheduled_at`
   - **Métodos**:
     - `create()`: Asigna automáticamente el usuario actual como creador
     - `update()`: Asigna automáticamente el usuario actual como actualizador

3. **`AppointmentListSerializer`**: Serializador ligero para listados
   - Campos mínimos para mostrar en tablas/listas

4. **`ReportSerializer`**: Serializa datos del reporte
   - Campos: sub_product_line, total_deliveries, avg_hours, avg_minutes

#### `backend/appointments/views.py`
**Propósito**: Define la lógica de los endpoints API.

**Vistas**:
1. **`AppointmentViewSet`**: ViewSet para CRUD de citas
   - `queryset`: Todas las citas ordenadas por scheduled_at descendente
   - `serializer_class`: AppointmentSerializer
   - `permission_classes`: IsAuthenticated (requiere login)
   - `filterset_fields`: Filtros por status, provider, product_line, date_from, date_to
   - **Acciones personalizadas**:
     - `dashboard()`: GET /api/appointments/dashboard/ - Estadísticas
     - `report()`: GET /api/appointments/report/ - Reporte de tiempos (SQL nativo)

2. **`CustomTokenObtainPairView`**: Vista personalizada de login JWT
   - Hereda de TokenObtainPairView de Simple JWT
   - Retorna access token y refresh token

#### `backend/config/settings.py`
**Propósito**: Configuración principal del proyecto Django.

**Configuraciones clave**:
- **Base de datos**: PostgreSQL con SSL deshabilitado
- **INSTALLED_APPS**: Django apps + DRF + Simple JWT
- **MIDDLEWARE**: CORS middleware para permitir requests del frontend
- **REST_FRAMEWORK**: Configuración de DRF (paginación, autenticación)
- **SIMPLE_JWT**: Configuración de tokens JWT (tiempo de vida 5 horas access, 1 día refresh)
- **CORS_ALLOWED_ORIGINS**: http://localhost:3000 (frontend)
- **TIME_ZONE**: America/Bogota

#### `backend/appointments/management/commands/seed_data.py`
**Propósito**: Comando de management para cargar datos de prueba.

**Funcionamiento**:
- Crea usuarios de prueba (admin, manager, operator)
- Crea citas de prueba con fechas futuras
- Se ejecuta con: `python manage.py seed_data`

---

## Frontend (Next.js + React)

### Archivos Principales

#### `frontend/lib/axios.ts`
**Propósito**: Instancia configurada de Axios para llamadas API con manejo automático de JWT.

**Configuración**:
- Base URL: http://localhost:8000/api (configurable via NEXT_PUBLIC_API_URL)
- Headers por defecto: Content-Type: application/json

**Interceptores**:
- **Request Interceptor**: Agrega automáticamente el access token al header Authorization cuando está disponible en localStorage
- **Response Interceptor**: Maneja errores 401 Unauthorized:
  - Verifica si la solicitud es para obtener token (evita loop infinito)
  - Si hay un refresh token disponible, intenta renovar el access token
  - Si la renovación falla, elimina los tokens y redirige a /login
  - Reintenta la solicitud original con el nuevo token

**Comentarios en español**: Todos los comentarios están en español para facilitar el entendimiento.

#### `frontend/app/login/page.tsx`
**Propósito**: Página de autenticación con efecto de panel deslizante para login/registro.

**Funcionamiento**:
- Estado `isLogin` controla si muestra formulario de login o registro
- Efecto de panel deslizante con animación CSS (transform translate)
- Formulario de login: username y password
- Formulario de registro: username, email, password, confirm_password
- Al submit de login, llama a `/api/auth/token/`
- Al submit de registro, llama a `/api/appointments/register/operator/`
- Guarda access_token y refresh_token en localStorage
- Redirige a `/dashboard` si exitoso
- Muestra errores de autenticación con botón de cierre manual
- Iconos: UserPlus para ambos formularios (login y registro)
- Colores: Gradiente azul (from-primary-600 to-primary-400) y blanco

**Validaciones**:
- Campos requeridos en ambos formularios
- Confirmación de contraseña en registro
- Mensajes de error específicos y persistentes (no desaparecen automáticamente)

#### `frontend/app/dashboard/page.tsx`
**Propósito**: Dashboard principal con estadísticas.

**Funcionamiento**:
- Llama a `/api/appointments/dashboard/` para obtener estadísticas
- Muestra tarjetas con:
  - Total de citas
  - Citas por estado (Programada, En Proceso, Entregada, Cancelada)
- **Interactividad**: Las tarjetas de estado son clickeables y navegan a `/appointments?status=X`

#### `frontend/app/appointments/page.tsx`
**Propósito**: Listado de citas con filtros.

**Funcionamiento**:
- Llama a `/api/appments/` con parámetros de filtro
- Filtros disponibles: status, provider, product_line, date_from, date_to
- **URL Parameters**: Lee `?status=X` de la URL para aplicar filtro automático
- **useEffect**: Vuelve a cargar cuando cambian los filtros
- Muestra tabla con citas y botones de acción (ver, editar, eliminar)

#### `frontend/app/appointments/[id]/page.tsx`
**Propósito**: Formulario de creación/edición de citas.

**Funcionamiento**:
- Si `id` es "new": modo creación
- Si `id` es número: modo edición (carga datos existentes)
- Campos: scheduled_at, delivered_at, status, provider, product_line, sub_product_line, notes
- **Validaciones**: required fields, validaciones de fecha
- Al guardar:
  - Muestra mensaje de éxito verde
  - Espera 1.5 segundos
  - Redirige a `/appointments`

#### `frontend/app/report/page.tsx`
**Propósito**: Reporte de tiempos de entrega.

**Funcionamiento**:
- Formulario con date_from y date_to
- Llama a `/api/appointments/report/?date_from=X&date_to=Y`
- Muestra tabla con:
  - sub_product_line
  - total_deliveries
  - avg_hours (promedio de horas)
  - avg_minutes (promedio de minutos)

#### `frontend/components/Sidebar.tsx`
**Propósito**: Componente de barra lateral de navegación responsive con menú colapsable.

**Funcionamiento**:
- Props: `isOpen` (boolean), `onToggle` (función)
- Estado local: `isOpen` para controlar visibilidad del menú
- Ancho: w-64 (expandido) o w-20 (colapsado) en desktop, w-0 (oculto) en móvil
- Posicionamiento: lg:relative fixed (empuja contenido en desktop, superpone en móvil)
- Items de navegación: Dashboard, Citas, Reporte
- Iconos: LayoutDashboard, Calendar, BarChart3
- **Función handleNavigation**: Cierra el menú en móvil automáticamente después de navegar
- Botón de logout: Elimina tokens y redirige a /login
- Animaciones: Transiciones suaves con duration-300
- Responsive: Menú hamburguesa en móvil con botón de toggle

---

## Base de Datos

### Tabla: `appointments_appointment`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | Integer (PK) | ID auto-incremental |
| scheduled_at | DateTime | Fecha y hora programada |
| delivered_at | DateTime (nullable) | Fecha y hora de entrega |
| status | VARCHAR(50) | Estado de la cita |
| provider | VARCHAR(200) | Nombre del proveedor |
| product_line | VARCHAR(200) | Línea de producto |
| sub_product_line | VARCHAR(200) | Sub-línea de producto |
| notes | TEXT | Notas adicionales |
| created_at | DateTime | Timestamp de creación |
| updated_at | DateTime | Timestamp de actualización |
| created_by_id | Integer (FK) | ID del usuario creador |
| updated_by_id | Integer (FK) | ID del usuario actualizador |

### Índices
- Índice en `scheduled_at` para ordenamiento
- Índice en `status` para filtrado

---

## Flujo de Autenticación

### 1. Login
```
Usuario → Frontend → POST /api/auth/token/
                ← access_token, refresh_token
                → Guarda en localStorage
                → Redirige a /dashboard
```

### 2. Request con Token
```
Frontend → Axios Interceptor → Agrega Authorization: Bearer <access_token>
         → Backend API
         ← Response (200 OK) o 401 Unauthorized
```

### 3. Refresh Token (si 401)
```
Frontend ← 401 Unauthorized
         → POST /api/auth/token/refresh/
         ← Nuevo access_token
         → Reintenta request original
```

### 4. Logout
```
Usuario → Frontend → Elimina tokens de localStorage
         → Redirige a /login
```

---

## Endpoints API

### Autenticación
- `POST /api/auth/token/` - Login (obtener tokens JWT)
  - Body: `{ username, password }`
  - Response: `{ access, refresh }`

- `POST /api/auth/token/refresh/` - Refrescar access token
  - Body: `{ refresh }`
  - Response: `{ access }`

### Citas
- `GET /api/appointments/` - Listar citas
  - Query params: `status`, `provider`, `product_line`, `date_from`, `date_to`
  - Response: Array de citas paginado

- `POST /api/appointments/` - Crear nueva cita
  - Body: Datos de la cita
  - Response: Cita creada (201)

- `GET /api/appointments/{id}/` - Obtener detalle de cita
  - Response: Datos de la cita

- `PUT /api/appointments/{id}/` - Actualizar cita
  - Body: Datos actualizados
  - Response: Cita actualizada

- `DELETE /api/appointments/{id}/` - Eliminar cita
  - Response: 204 No Content

- `GET /api/appointments/dashboard/` - Estadísticas del dashboard
  - Response: `{ total, status_counts, recent_appointments }`

- `GET /api/appointments/report/` - Reporte de tiempos
  - Query params: `date_from`, `date_to` (requeridos)
  - Response: Array con estadísticas por sub_product_line

---

## Componentes Frontend

### Navbar
- **Ubicación**: `frontend/components/Navbar.tsx`
- **Props**: Ninguno
- **Estado**: `mobileMenuOpen` (boolean)
- **Funciones**: `handleLogout()`
- **Uso**: Importado en todas las páginas protegidas

### Páginas
Todas las páginas usan:
- `useRouter` de Next.js para navegación
- `api` de `lib/axios.ts` para llamadas API
- `useEffect` para cargar datos al montar
- `useState` para manejo de estado local

---

## Patrones de Diseño

### Backend
1. **ViewSet Pattern**: Usa ModelViewSet para CRUD estándar
2. **Serializer Pattern**: Separación de validación y conversión de datos
3. **Repository Pattern**: Django ORM como repositorio de datos
4. **Command Pattern**: Management commands para tareas administrativas

### Frontend
1. **Component Pattern**: Componentes funcionales React
2. **Custom Hook Pattern**: Axios instance como hook personalizado
3. **Container/Presentational**: Separación de lógica y UI
4. **Guard Pattern**: Verificación de token en useEffect

### Seguridad
1. **JWT Authentication**: Tokens con tiempo de vida limitado
2. **Token Refresh**: Refresh tokens para renovación automática
3. **CORS**: Restricción de orígenes permitidos
4. **Permission Classes**: IsAuthenticated en todas las vistas protegidas

---

## Tecnologías Utilizadas

### Backend
- Python 3.11
- Django 4.2
- Django REST Framework 3.14
- djangorestframework-simplejwt 5.3
- psycopg2-binary 2.9 (PostgreSQL adapter)
- django-cors-headers 4.3

### Frontend
- Node.js 18+
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- Axios 1.6
- Lucide React (iconos)
- date-fns (manejo de fechas)

### Infraestructura
- Docker & Docker Compose
- PostgreSQL 15

---

## Debugging

### Backend Logs
```bash
docker-compose logs backend -f
```

### Frontend Logs
```bash
docker-compose logs frontend -f
```

### Ejecutar Pruebas
```bash
docker-compose exec backend python manage.py test appointments
```

### Pruebas Implementadas

#### Backend (Django)
El archivo `backend/appointments/tests.py` contiene 13 pruebas unitarias y de integración:

**Pruebas de Modelo (AppointmentModelTests)**:
1. `test_cannot_create_appointment_with_past_date`: Verifica que no se puede crear cita con fecha pasada
2. `test_delivered_status_requires_delivered_at`: Verifica que el estado "Entregada" requiere el campo delivered_at
3. `test_invalid_status_transition`: Verifica que las transiciones de estado inválidas no están permitidas

**Pruebas de API (AppointmentAPITests)**:
4. `test_unauthenticated_user_cannot_access_endpoints`: Verifica que usuarios no autenticados reciben 401
5. `test_create_appointment`: Verifica la creación de una nueva cita
6. `test_report_endpoint_returns_expected_fields`: Verifica que el endpoint de reporte retorna los campos esperados
7. `test_report_requires_date_parameters`: Verifica que el endpoint de reporte requiere parámetros de fecha
8. `test_update_appointment`: Verifica la actualización de una cita existente
9. `test_delete_appointment`: Verifica la eliminación de una cita existente
10. `test_list_appointments_with_filters`: Verifica el listado de citas con filtros
11. `test_dashboard_endpoint`: Verifica el endpoint de dashboard
12. `test_create_appointment_with_notes`: Verifica la creación de cita con notas
13. `test_invalid_date_format_in_report`: Verifica que el endpoint de reporte rechaza formatos de fecha inválidos
14. `test_delivered_at_must_be_after_scheduled_at`: Verifica que delivered_at debe ser posterior a scheduled_at

**Cobertura**: Las pruebas cubren validaciones de negocio, endpoints CRUD, filtros, reportes y manejo de errores.

### Cargar Datos de Prueba
```bash
docker-compose exec backend python manage.py seed_data
```

---

## Notas Importantes

1. **Zona Horaria**: Todo el sistema está configurado en America/Bogota (UTC-5)
2. **Validaciones**: Las validaciones de negocio están en ambos lados (backend y frontend)
3. **SQL Injection**: Prevenido mediante ORM de Django y parámetros en queries nativos
4. **XSS**: Prevenido mediante escaping automático de React
5. **Responsive**: Diseño mobile-first con Tailwind CSS
6. **Estado Global**: No se usa Redux/Context API - estado local por componente
7. **Error Handling**: Try-catch en todas las llamadas API con mensajes en español
8. **Comentarios en Español**: Todos los comentarios de código están en español para facilitar el entendimiento del proyecto
9. **Pruebas**: El backend cuenta con 13 pruebas unitarias y de integración que cubren validaciones, CRUD, filtros y reportes
10. **Layout del Menú**: El Sidebar empuja el contenido en desktop (lg:relative) y se superpone en móvil (fixed), cierra automáticamente en móvil al navegar
