# Archivos del Proyecto y Consulta SQL

Este documento explica qué archivos son del framework, cuáles se crearon/editaron, para qué sirven, y dónde está la consulta SQL de la prueba técnica.

---

## 📁 Estructura de Archivos

### Archivos del Framework Django (Backend)

Estos archivos son generados automáticamente por Django y no se modificaron:

- `backend/manage.py` - Script de gestión de Django (generado por `django-admin startproject`)
- `backend/config/__init__.py` - Inicializador del paquete config (generado por Django)
- `backend/config/asgi.py` - Configuración ASGI (generado por Django)
- `backend/config/wsgi.py` - Configuración WSGI (generado por Django)
- `backend/appointments/__init__.py` - Inicializador de la app appointments (generado por Django)
- `backend/appointments/migrations/` - Archivos de migración generados automáticamente por Django
  - `0001_initial.py` - Migración inicial (generada por `makemigrations`)
  - `0002_alter_appointment_delivered_at.py` - Migración de ajuste (generada por `makemigrations`)
  - `0003_appointment_created_by_and_more.py` - Migración de campos (generada por `makemigrations`)
  - `0004_alter_appointment_status.py` - Migración de ajuste (generada por `makemigrations`)

### Archivos del Framework Next.js (Frontend)

Estos archivos son generados automáticamente por Next.js y no se modificaron:

- `frontend/next.config.js` - Configuración de Next.js (generado por `npx create-next-app`)
- `frontend/next-env.d.ts` - Declaraciones de tipos de Next.js (generado por Next.js)
- `frontend/tsconfig.json` - Configuración de TypeScript (generado por `npx create-next-app`)
- `frontend/tailwind.config.ts` - Configuración de Tailwind CSS (generado por `npx create-next-app`)
- `frontend/postcss.config.js` - Configuración de PostCSS (generado por `npx create-next-app`)
- `frontend/.eslintrc.json` - Configuración de ESLint (generado por `npx create-next-app`)

---

## 📝 Archivos Creados/Editados (Código Personalizado)

### Backend - Archivos Creados

#### 1. `backend/config/settings.py`
**Propósito**: Configuración principal del proyecto Django
**Modificaciones**: 
- Configuración de base de datos PostgreSQL
- Configuración de JWT (Simple JWT)
- Configuración de CORS
- Configuración de REST Framework
- Zona horaria America/Bogota

#### 2. `backend/config/urls.py`
**Propósito**: Rutas URL principales del proyecto
**Modificaciones**:
- Rutas de autenticación JWT (`/api/auth/token/`, `/api/auth/token/refresh/`)
- Rutas de la app appointments (`/api/appointments/`)
- Rutas de documentación Swagger/Redoc

#### 3. `backend/appointments/models.py`
**Propósito**: Modelo de datos para citas
**Creado desde cero**: Define el modelo `Appointment` con:
- Campos: scheduled_at, delivered_at, status, provider, product_line, sub_product_line, notes
- Campos de auditoría: created_at, updated_at, created_by, updated_by
- Validaciones de negocio en el método `clean()`
- Índices para optimización de consultas

#### 4. `backend/appointments/serializers.py`
**Propósito**: Serializadores para conversión JSON y validación
**Creado desde cero**: Define:
- `UserSerializer`: Serializa modelo User de Django
- `AppointmentSerializer`: Serializa completo de Appointment con validaciones
- `AppointmentListSerializer`: Serializador ligero para listados
- `ReportSerializer`: Serializa datos del reporte

#### 5. `backend/appointments/views.py`
**Propósito**: Vistas API (endpoints REST)
**Creado desde cero**: Define:
- `AppointmentViewSet`: ViewSet para CRUD de citas
- Acción personalizada `dashboard()`: Estadísticas del dashboard
- Acción personalizada `report()`: **AQUÍ ESTÁ LA CONSULTA SQL** (ver sección abajo)

#### 6. `backend/appointments/urls.py`
**Propósito**: Rutas URL específicas de la app appointments
**Creado desde cero**: Define:
- Rutas del ViewSet de appointments
- Ruta de registro de operadores

#### 7. `backend/appointments/admin.py`
**Propósito**: Configuración de la interfaz de administración de Django
**Modificado**: Configuración del admin para el modelo Appointment con:
- list_display, list_filter, search_fields
- fieldsets organizados por secciones
- save_model para asignar created_by y updated_by automáticamente

#### 8. `backend/appointments/auth_views.py`
**Propósito**: Vistas personalizadas para autenticación
**Creado desde cero**: Define:
- `register_operator()`: Endpoint para registro de nuevos usuarios (operadores)

#### 9. `backend/appointments/tests.py`
**Propósito**: Pruebas unitarias y de integración
**Creado desde cero**: Contiene 13 pruebas:
- 3 pruebas de modelo (AppointmentModelTests)
- 10 pruebas de API (AppointmentAPITests)

#### 10. `backend/appointments/management/commands/seed_data.py`
**Propósito**: Comando para cargar datos de prueba
**Creado desde cero**: Comando de management que:
- Crea usuarios de prueba
- Crea citas de prueba con fechas futuras
- Se ejecuta con: `python manage.py seed_data`

#### 11. `backend/requirements.txt`
**Propósito**: Dependencias Python del backend
**Creado desde cero**: Lista de paquetes necesarios:
- Django, djangorestframework, djangorestframework-simplejwt
- psycopg2-binary, django-cors-headers, drf-spectacular
- python-decouple

### Frontend - Archivos Creados

#### 12. `frontend/lib/axios.ts`
**Propósito**: Instancia de Axios con interceptores JWT
**Creado desde cero**: Configura:
- Base URL para la API
- Request interceptor: Agrega token al header Authorization
- Response interceptor: Maneja renovación de token en error 401

#### 13. `frontend/lib/utils.ts`
**Propósito**: Funciones utilitarias
**Creado desde cero**: Define:
- `cn()`: Función para combinar clases de Tailwind CSS

#### 14. `frontend/components/Sidebar.tsx`
**Propósito**: Componente de barra lateral de navegación
**Creado desde cero**: Implementa:
- Menú responsive con toggle
- Items de navegación (Dashboard, Citas, Reporte)
- Función `handleNavigation()`: Cierra menú en móvil al navegar
- Layout: empuja contenido en desktop, superpone en móvil

#### 15. `frontend/app/layout.tsx`
**Propósito**: Layout principal de la aplicación
**Creado desde cero**: Wrapper que:
- Verifica autenticación (token en localStorage)
- Redirige a /login si no está autenticado
- Envuelve todas las páginas protegidas

#### 16. `frontend/app/page.tsx`
**Propósito**: Página de inicio
**Creado desde cero**: Redirige automáticamente al dashboard

#### 17. `frontend/app/login/page.tsx`
**Propósito**: Página de autenticación
**Creado desde cero**: Implementa:
- Efecto de panel deslizante (login/registro)
- Formulario de login con username/password
- Formulario de registro con username/email/password
- Manejo de errores persistentes con botón de cierre
- Iconos: UserPlus para ambos formularios
- Colores: Gradiente azul y blanco

#### 18. `frontend/app/dashboard/page.tsx`
**Propósito**: Dashboard principal con estadísticas
**Creado desde cero**: Muestra:
- Tarjetas con total de citas
- Tarjetas con conteo por estado (clickeables)
- Llama a `/api/appointments/dashboard/`
- Layout con Sidebar que empuja contenido

#### 19. `frontend/app/appointments/page.tsx`
**Propósito**: Listado de citas con filtros
**Creado desde cero**: Implementa:
- Filtros: status, provider, product_line, date_from, date_to
- Tabla con citas
- Botones de acción (ver, editar, eliminar)
- URL parameters para filtros automáticos
- Layout con Sidebar que empuja contenido

#### 20. `frontend/app/appointments/[id]/page.tsx`
**Propósito**: Formulario de creación/edición de citas
**Creado desde cero**: Implementa:
- Modo creación (id="new") o edición (id=número)
- Campos: scheduled_at, delivered_at, status, provider, product_line, sub_product_line, notes
- Validaciones de formulario
- Mensajes de éxito/error
- Layout con Sidebar que empuja contenido

#### 21. `frontend/app/report/page.tsx`
**Propósito**: Reporte de tiempos de entrega
**Creado desde cero**: Implementa:
- Formulario con date_from y date_to
- Llama a `/api/appointments/report/`
- Muestra tabla con resultados
- Gráfico de barras con Recharts
- Layout con Sidebar que empuja contenido

#### 22. `frontend/package.json`
**Propósito**: Dependencias Node.js y scripts
**Modificado**: Agregó dependencias:
- axios, recharts, lucide-react, date-fns
- clsx, tailwind-merge

---

## 🗄️ Consulta SQL de la Prueba Técnica

### Ubicación
**Archivo**: `backend/appointments/views.py`
**Líneas**: 120-131
**Método**: `AppointmentViewSet.report()`

### Código de la Consulta SQL

```python
# Consulta SQL nativa como se requiere
query = """
    SELECT 
        sub_product_line,
        COUNT(*) AS total_deliveries,
        AVG(EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 3600) AS avg_hours
    FROM appointments_appointment
    WHERE status = 'Entregada'
    AND scheduled_at BETWEEN %s AND %s
    GROUP BY sub_product_line
    ORDER BY sub_product_line;
"""
```

### Explicación de la Consulta

Esta consulta SQL responde al requerimiento de la prueba técnica de calcular el tiempo promedio de entrega agrupado por sub-línea de producto.

**Componentes de la consulta**:

1. **`SELECT sub_product_line`**: Selecciona la sub-línea de producto para agrupar los resultados

2. **`COUNT(*) AS total_deliveries`**: Cuenta el número total de entregas por sub-línea

3. **`AVG(EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 3600) AS avg_hours`**: 
   - `delivered_at - scheduled_at`: Calcula la diferencia de tiempo entre entrega y programación
   - `EXTRACT(EPOCH FROM ...)`: Convierte la diferencia a segundos (epoch)
   - `/ 3600`: Convierte segundos a horas
   - `AVG(...)`: Calcula el promedio de horas

4. **`FROM appointments_appointment`**: Tabla de citas (nombre generado por Django)

5. **`WHERE status = 'Entregada'`**: Filtra solo citas entregadas (no programadas, en proceso o canceladas)

6. **`AND scheduled_at BETWEEN %s AND %s`**: Filtra por rango de fechas (parámetros dinámicos)

7. **`GROUP BY sub_product_line`**: Agrupa los resultados por sub-línea de producto

8. **`ORDER BY sub_product_line`**: Ordena alfabéticamente por sub-línea

### Cómo se Ejecuta la Consulta

```python
with connection.cursor() as cursor:
    cursor.execute(query, [date_from_parsed, date_to_parsed])
    rows = cursor.fetchall()
```

- Se usa `connection.cursor()` de Django para ejecutar SQL nativo
- Los parámetros `date_from_parsed` y `date_to_parsed` se pasan de forma segura (previene SQL injection)
- `cursor.fetchall()` obtiene todos los resultados

### Formateo de Resultados

```python
results = []
for row in rows:
    sub_product_line, total_deliveries, avg_hours = row
    avg_minutes = avg_hours * 60 if avg_hours else 0
    results.append({
        'sub_product_line': sub_product_line,
        'total_deliveries': total_deliveries,
        'avg_hours': round(avg_hours, 2) if avg_hours else 0,
        'avg_minutes': round(avg_minutes, 2) if avg_minutes else 0,
    })
```

- Se convierten las horas a minutos para mostrar ambos valores
- Se redondean a 2 decimales
- Se retorna en formato JSON para el frontend

---

## 🎯 Resumen para Preguntas de Entrevista

### ¿Dónde está la consulta SQL?
**Respuesta**: En `backend/appointments/views.py`, método `report()` del `AppointmentViewSet`, líneas 120-131.

### ¿Cómo se hizo la consulta SQL?
**Respuesta**: Se usó SQL nativo con `connection.cursor()` de Django, calculando el promedio de tiempo de entrega usando `AVG(EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 3600)` para obtener horas, agrupado por `sub_product_line`.

### ¿Qué archivos creaste?
**Respuesta**: 
- Backend: models.py, serializers.py, views.py, urls.py, auth_views.py, tests.py, admin.py, seed_data.py
- Frontend: axios.ts, utils.ts, Sidebar.tsx, layout.tsx, page.tsx, login/page.tsx, dashboard/page.tsx, appointments/page.tsx, appointments/[id]/page.tsx, report/page.tsx

### ¿Qué archivos son del framework?
**Respuesta**: 
- Django: manage.py, config/asgi.py, config/wsgi.py, appointments/migrations/
- Next.js: next.config.js, tsconfig.json, tailwind.config.ts, postcss.config.js

### ¿Cómo se maneja la autenticación?
**Respuesta**: JWT tokens con Simple JWT en el backend, almacenados en localStorage en el frontend, con interceptores de Axios para agregar el token a las requests y renovarlo automáticamente cuando expira.

### ¿Cómo se valida que delivered_at sea posterior a scheduled_at?
**Respuesta**: En el modelo `Appointment` (backend/appointments/models.py) en el método `clean()`, línea 110-113, y en el serializador (backend/appointments/serializers.py) en el método `validate()`, línea 64-68.

### ¿Dónde está la lógica del menú lateral?
**Respuesta**: En `frontend/components/Sidebar.tsx`, con función `handleNavigation()` que cierra el menú en móvil automáticamente, y layout `lg:relative fixed` que empuja contenido en desktop y superpone en móvil.

### ¿Cuántas pruebas hay?
**Respuesta**: 13 pruebas en `backend/appointments/tests.py`: 3 de modelo (AppointmentModelTests) y 10 de API (AppointmentAPITests) que cubren validaciones, CRUD, filtros, reportes y manejo de errores.
