# Plataforma de Digitalización y Análisis de Batería de Riesgo Psicosocial

Esta aplicación web local está diseñada para digitalizar, almacenar, procesar y visualizar los cuestionarios de riesgo psicosocial aplicados a trabajadores de empresas colombianas, basados en los instrumentos oficiales del Ministerio de Trabajo.

## Arquitectura

- **Frontend**: React + TypeScript + Vite + Axios + Lucide Icons (Vanilla CSS para estilos premium).
- **Backend**: Python + FastAPI + SQLAlchemy + Alembic (PostgreSQL).
- **Contenedores**: Docker y Docker Compose para un despliegue sin dependencias locales adicionales.

---

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución en tu sistema.

---

## Instalación y Arranque Rápido

1. **Clonar o Copiar el Repositorio** en la máquina local.
2. **Configurar Variables de Entorno**:
   El proyecto ya incluye un archivo `.env` configurado por defecto. Si necesitas cambiar puertos o credenciales, edita el archivo `.env` o cópialo desde `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. **Levantar los Contenedores**:
   Ejecuta el siguiente comando en la terminal desde la raíz del proyecto:
   ```bash
   docker compose up --build -d
   ```
4. **Acceder a la Aplicación**:
   - **Frontend (Interfaz de Usuario)**: Abre tu navegador web en [http://localhost:5173](http://localhost:5173) (o el puerto configurado).
   - **Backend API (Swagger Docs)**: Accede a [http://localhost:8000/docs](http://localhost:8000/docs) para interactuar con la documentación interactiva de la API.

---

## Migraciones de Base de Datos

Las migraciones de SQLAlchemy son manejadas por Alembic. Para aplicar las migraciones dentro del contenedor de backend (por ejemplo, si actualizas o descargas una nueva versión del código):

```bash
docker compose exec backend alembic upgrade head
```

Para generar una nueva migración autogenerada tras modificar un modelo en Python:

```bash
docker compose exec backend alembic revision --autogenerate -m "nombre_de_la_migracion"
```

---

## Ejecutar Pruebas Unitarias

Para ejecutar las pruebas del backend usando `pytest`:

```bash
docker compose exec backend pytest
```

---

## Estrategia de Respaldo y Restauración (Backups)

Dado que la aplicación almacena datos sensibles que no deben perderse, se provee la siguiente guía de comandos:

### Crear un Backup de la Base de Datos

Ejecuta el siguiente comando para generar un volcado de la base de datos de PostgreSQL en un archivo `.sql`:

```bash
docker compose exec -t db pg_dump -U postgres -d bateria_db > backup_bateria_$(date +%F_%H%M%S).sql
```

*(En Windows PowerShell, puedes usar `docker compose exec -T db pg_dump -U postgres -d bateria_db | Out-File -Encoding UTF8 backup_bateria.sql`)*

### Restaurar un Backup de la Base de Datos

Para restaurar una copia de seguridad en un contenedor limpio:

```bash
# 1. Asegúrate de que el contenedor db esté en ejecución
# 2. Copia el archivo de volcado y restáuralo:
docker compose exec -T db psql -U postgres -d bateria_db < tu_archivo_backup.sql
```

---

## Comandos Útiles

- **Detener la aplicación**: `docker compose down`
- **Ver logs**: `docker compose logs -f`
- **Revisar estado de salud de los servicios**: `docker compose ps`
