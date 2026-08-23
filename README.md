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

---

## Modificar Preguntas, Respuestas y Motor de Cálculo

### 1. Estructura de Preguntas y Opciones (Cuestionarios)
La definición, distribución y opciones de respuestas de los cuestionarios oficiales están guardadas en formato JSON en el directorio [official_data](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/official_data/):
- **Ficha de Datos Generales**: [ficha_datos_generales.json](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/official_data/ficha_datos_generales.json)
- **Intralaboral Forma A**: [cuestionario_intralaboral_A.json](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/official_data/cuestionario_intralaboral_A.json)
- **Intralaboral Forma B**: [cuestionario_intralaboral_B.json](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/official_data/cuestionario_intralaboral_B.json)
- **Extralaboral**: [cuestionario_extralaboral.json](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/official_data/cuestionario_extralaboral.json)
- **Cuestionario de Estrés**: [cuestionario_estres.json](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/official_data/cuestionario_estres.json)

> [!NOTE]
> Si modificas estos archivos JSON, debes recargar/sembrar las preguntas en la base de datos enviando una petición POST al endpoint `/api/v1/questions/seed` (o a través de la documentación de Swagger en [http://localhost:8000/docs](http://localhost:8000/docs)).

### 2. Motor de Cálculo de Riesgo Psicosocial
Las fórmulas oficiales de transformación, suma de ítems y clasificación de baremos de riesgo están implementadas en el backend, en la carpeta [backend/app/calculations](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/backend/app/calculations/):
- **Orquestador Principal**: [calculator.py](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/backend/app/calculations/calculator.py) (gestiona qué cálculos correr por participante, asocia las respuestas y guarda los puntajes resultantes en la tabla `results`).
- **Factores Intralaborales (Forma A y B)**: [intralaboral.py](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/backend/app/calculations/intralaboral.py) (contiene la ponderación de dimensiones, agrupación de dominios y baremos específicos de riesgo).
- **Factores Extralaborales**: [extralaboral.py](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/backend/app/calculations/extralaboral.py) (fórmulas de transformación y baremos para las dimensiones del entorno extralaboral).
- **Cálculo de Estrés**: [estres.py](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/backend/app/calculations/estres.py) (suma de sintomatologías y clasificación de riesgo de estrés).
- **Clasificador de Baremos**: [risk_levels.py](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/backend/app/calculations/risk_levels.py) (lógica para ubicar los puntajes transformados dentro de los rangos de riesgo: Muy bajo/Sin riesgo, Bajo, Medio, Alto, Muy alto).
- **Agregador de Estadísticas (Dashboard)**: [dashboard_stats.py](file:///c:/Users/dagag/Documents/Programacion/bateria&digitador/backend/app/calculations/dashboard_stats.py) (realiza los cálculos masivos y tabulación de demográficos y niveles de riesgo para poblar las gráficas consolidadas de la empresa).

> [!WARNING]
> Siguiendo la normativa de la **Regla 1 (regla1.md)**, toda modificación a las fórmulas, baremos o clasificaciones de riesgo psicosocial debe validarse obligatoriamente contra el Documento Técnico Oficial ubicado en `official_data/`. Los archivos fuente de `official_data/` nunca deben modificarse. Las fórmulas deben estar respaldadas por pruebas unitarias (`pytest`).

