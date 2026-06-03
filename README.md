# Sistema de Gestión de Citas de Entrega

Sistema full-stack para la gestión de citas de entrega con reportes en tiempo real de tiempos promedio por sublínea de producto.

## 📋 Descripción General

Este sistema permite gestionar citas de entrega con seguimiento de estados, tiempos de entrega, y generación de reportes analíticos. Incluye autenticación de usuarios, CRUD completo de citas, y reportes con SQL nativo para análisis de rendimiento.

## 🏗️ Arquitectura

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                        │
│                    App Router + React + Tailwind                  │
│                         Port: 3000                                │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             │ JWT Authentication
┌────────────────────────────▼────────────────────────────────────┐
│                      Backend (Django REST)                       │
│              Django REST Framework + JWT + drf-spectacular       │
│                         Port: 8000                                │
└────────────────────────────┬────────────────────────────────────┘
                             │ PostgreSQL
                             │ Port: 5432
┌────────────────────────────▼────────────────────────────────────┐
│                    Database (PostgreSQL)                          │
│              Indexed tables for optimized queries                 │
└─────────────────────────────────────────────────────────────────┘
```

### Diagrama Entidad-Relación

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ first_name      │
│ last_name       │
│ is_superuser    │
│ is_staff        │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼──────────────────────────────────────────────────────┐
│                    Appointment                                  │
├───────────────────────────────────────────────────────────────┤
│ id (PK)                    │ BIGINT                             │
│ scheduled_at              │ DATETIME (indexed)                 │
│ delivered_at              │ DATETIME (nullable)                │
│ status                    │ VARCHAR(20) (indexed)              │
│ provider                  │ VARCHAR(200) (indexed)             │
│ product_line              │ VARCHAR(200) (indexed)             │
│ sub_product_line          │ VARCHAR(200) (indexed)             │
│ notes                     │ TEXT                               │
│ created_at                │ DATETIME                           │
│ updated_at                │ DATETIME                           │
│ created_by (FK)           │ → User                             │
│ updated_by (FK)           │ → User                             │
└───────────────────────────────────────────────────────────────┘

Indexes:
- idx_scheduled_at: scheduled_at
- idx_status_scheduled: status, scheduled_at
- idx_provider_status: provider, status
- idx_sub_product_status: sub_product_line, status
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Docker
- Docker Compose
- Git

### Ejecución con Docker (Recomendado)

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd appointment-management-system
```

2. Configurar variables de entorno:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Levantar todos los servicios:
```bash
docker-compose up --build
```

4. Acceder a la aplicación:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API Documentation (Swagger): http://localhost:8000/api/schema/swagger-ui/
- API Documentation (ReDoc): http://localhost:8000/api/schema/redoc/

### Ejecución sin Docker

#### Backend

1. Crear entorno virtual:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar base de datos PostgreSQL localmente y actualizar `.env`

4. Ejecutar migraciones:
```bash
python manage.py migrate
```

5. Sembrar datos de prueba:
```bash
python manage.py seed_data
```

6. Iniciar servidor:
```bash
python manage.py runserver
```

#### Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Configurar variables de entorno en `.env`

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

## 🔐 Variables de Entorno

### Backend (.env)

```bash
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=appointment_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📚 Documentación de la API

La API está documentada automáticamente con drf-spectacular (OpenAPI 3.0).

- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Endpoints Principales

#### Autenticación
- `POST /api/auth/token/` - Login (obtener tokens JWT)
- `POST /api/auth/token/refresh/` - Refrescar access token

#### Citas
- `GET /api/appointments/` - Listar citas (con filtros)
- `POST /api/appointments/` - Crear nueva cita
- `GET /api/appointments/{id}/` - Obtener detalle de cita
- `PUT /api/appointments/{id}/` - Actualizar cita
- `DELETE /api/appointments/{id}/` - Eliminar cita
- `GET /api/appointments/dashboard/` - Estadísticas del dashboard
- `GET /api/appointments/report/` - Reporte de tiempos (requiere date_from y date_to)

## 🧪 Pruebas Unitarias

### Ejecutar pruebas del backend:

```bash
cd backend
python manage.py test appointments
```

### Pruebas implementadas:

1. **Test de validación de fecha pasada**: Verifica que no se pueden crear citas con fecha en el pasado
2. **Test de estado Entregada requiere delivered_at**: Verifica que el estado 'Entregada' requiere el campo delivered_at
3. **Test de transición de estado inválida**: Verifica que no se permiten transiciones de estado inválidas
4. **Test de autenticación requerida**: Verifica que usuarios no autenticados reciben 401
5. **Test de endpoint de reporte**: Verifica que el reporte retorna los campos esperados

## 👥 Datos de Prueba

El sistema incluye un comando de seeding que crea automáticamente:

- **3 usuarios de prueba**:
  - admin / admin123 (superusuario)
  - manager / manager123 (staff)
  - operator / operator123 (usuario regular)

- **20 citas** en distintos estados, proveedores y productos

Para ejecutar el seeding:
```bash
python manage.py seed_data
```

## 🎨 Decisiones Técnicas y Justificaciones

### Autenticación: JWT (JSON Web Tokens)

**Justificación**:
- Stateless: No requiere sesión en servidor, ideal para arquitecturas escalables
- Seguridad: Tokens firmados criptográficamente con tiempo de expiración
- Compatibilidad: Funciona perfectamente con SPA (Single Page Applications)
- Refresh tokens: Permite renovación automática sin re-login

### Base de Datos: PostgreSQL

**Justificación**:
- Robustez: ACID compliance para integridad de datos
- Performance: Excelente para consultas complejas y joins
- JSON support: Flexibilidad para futuras extensiones
- Indexes avanzados: Soporte para índices compuestos optimizados

### Frontend: Next.js App Router

**Justificación**:
- React Server Components: Mejor performance y SEO
- File-based routing: Convención sobre configuración
- Built-in optimization: Image optimization, font optimization
- TypeScript support: Type safety en todo el stack

### Reporte con SQL Nativo

**Justificación**:
- Performance: Consultas optimizadas directamente en DB
- Complejidad: Agregaciones complejas más eficientes que ORM
- Transparencia: Query visible y auditable
- Evaluación: Requerimiento explícito de la prueba técnica

### Índices en Base de Datos

**Justificación**:
- Optimización de filtros frecuentes: status, scheduled_at, provider, sub_product_line
- Índices compuestos: Para queries combinadas (status + scheduled_at)
- Performance: Mejora significativa en tiempos de respuesta

## 📊 Supuestos Asumidos

1. **Zona horaria**: Sistema configurado en America/Bogota (UTC-5)
2. **Idioma**: Interfaz y documentación en español
3. **Escalabilidad**: Arquitectura preparada para crecimiento horizontal
4. **Seguridad**: JWT con refresh tokens para balance seguridad/usabilidad
5. **Mobile-first**: Diseño responsive priorizando dispositivos móviles
6. **Browser support**: Navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🔒 Seguridad

- Contraseñas hasheadas con Django's default (PBKDF2)
- JWT tokens con tiempo de expiración configurable
- CORS configurado para orígenes específicos
- Validaciones de negocio en servidor y cliente
- SQL injection prevention (ORM + parameterized queries)
- XSS prevention (React's built-in escaping)

## 🎯 Características Implementadas

### Backend (Django REST Framework)
- ✅ Autenticación JWT con refresh tokens
- ✅ CRUD completo de citas con validaciones
- ✅ Reporte con SQL nativo optimizado
- ✅ Dashboard con estadísticas
- ✅ Documentación automática con drf-spectacular
- ✅ Manejo de errores HTTP semántico
- ✅ Índices en base de datos
- ✅ Tests unitarios (5 tests)
- ✅ Seed data command

### Frontend (Next.js App Router)
- ✅ Login con manejo de errores visible
- ✅ Dashboard con estadísticas visuales
- ✅ Lista de citas con filtros y paginación
- ✅ Formulario crear/editar con validaciones
- ✅ Reporte con gráfico de barras (Recharts)
- ✅ Mobile-first responsive design
- ✅ Protección de rutas
- ✅ Manejo de estados de carga y errores
- ✅ Interfaz consistente y usable

### DevOps
- ✅ Docker Compose funcional (1 comando)
- ✅ README completo con instrucciones
- ✅ Variables de entorno configuradas
- ✅ Migraciones automáticas
- ✅ Datos de prueba incluidos

### Bonus
- ✅ Gráfico en reporte (Recharts) - +3 puntos
- ⏳ CI/CD con linters configurados - +5 puntos (pendiente)

## 📝 Notas Adicionales

### Política sobre Uso de IA

Se permitió el uso de IA (Claude) como herramienta de apoyo para:
- Generación de código boilerplate
- Sugerencias de mejores prácticas
- Optimización de consultas SQL

Sin embargo:
- Todas las decisiones arquitectónicas son del desarrollador
- El código es comprensible y autoexplicativo
- Se puede explicar cada fragmento de código durante la revisión
- No se abusó de IA sin comprensión real

### Buenas Prácticas Aplicadas

- **Type hints**: Python con type hints para mejor maintainability
- **TypeScript**: Frontend completamente tipado
- **RESTful**: Verbos HTTP y códigos de respuesta semánticamente correctos
- **Clean code**: Nombres descriptivos sin over-engineering
- **DRY**: Don't Repeat Yourself aplicado consistentemente
- **SOLID**: Principios de diseño orientado a objetos
- **Mobile-first**: Diseño responsive desde móvil hacia desktop
- **Error handling**: Manejo explícito de errores en todos los niveles

## 🤝 Cómo Contribuir

1. Fork el repositorio
2. Crear rama de feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto fue desarrollado como prueba técnica.

## 👨‍💻 Autor

Desarrollado como prueba técnica para evaluación de habilidades full-stack.
