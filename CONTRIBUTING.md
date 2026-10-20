# Cómo contribuir

Gracias por querer mejorar este proyecto. Esta guía explica cómo trabajar aquí de
forma consistente, para que cada cambio sea fácil de revisar y de mantener.

## Stack

- **Backend:** Django, Django REST Framework, JWT, drf-spectacular
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Base de datos:** PostgreSQL
- **Entorno:** Docker y Docker Compose

## Levantar el proyecto en local

```bash
git clone https://github.com/Chencho2323/appointment-management-system.git
cd appointment-management-system
docker compose up --build
```

El frontend queda en `http://localhost:3000` y la API en `http://localhost:8000`.
La documentación interactiva de la API está en `http://localhost:8000/api/docs`.

Para trabajar sobre un solo componente sin Docker:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

```bash
cd frontend
npm install
npm run dev
```

## Correr las pruebas

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Estilo de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):

```
<tipo>(<ámbito>): <descripción en imperativo y en minúsculas>

feat(citas): agregar filtro por rango de fechas
fix(auth): corregir expiración del token de refresco
docs(readme): explicar el flujo de despliegue
```

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`.

## Pull requests

1. Crea una rama desde `main`: `git checkout -b feature/mi-cambio`.
2. Commitea siguiendo el estilo anterior.
3. Abre el pull request hacia `main` y describe qué resuelve y cómo se probó.
4. El CI corre lint y pruebas automáticamente en backend y frontend. Todo debe
   pasar antes de aprobar.
5. Mantén los commits legibles: preferimos varios commits claros a uno grande.

## Reportar un problema

Abre un issue con el template de reporte de error, incluyendo pasos para
reproducir, versión, y logs relevantes. Si el fallo expone datos sensibles,
usa el proceso de [SECURITY.md](SECURITY.md) en vez de un issue público.

## Dudas

Cualquier duda sobre el alcance técnico o sobre el código, abre una discusión en
la pestaña de Discussions del repositorio.
