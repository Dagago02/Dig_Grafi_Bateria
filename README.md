# Plataforma de Digitalización y Análisis de Batería de Riesgo Psicosocial

Esta aplicación web local está diseñada para digitalizar, almacenar, procesar y visualizar los cuestionarios de riesgo psicosocial aplicados a trabajadores de empresas colombianas, basados en los instrumentos oficiales del Ministerio de Trabajo.

## Arquitectura

- **Frontend**: React + TypeScript + Vite + Axios + Recharts (Gráficas interactivas) + Lucide Icons.
- **Backend**: Python + FastAPI + SQLAlchemy + Alembic.
- **Base de Datos**: PostgreSQL 15.
- **Contenedores**: Docker y Docker Compose para un despliegue garantizado en cualquier sistema sin instalación de dependencias locales.

---

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución en tu sistema.

---

## Instalación y Arranque Rápido

1. **Descargar el Repositorio**
   Descomprime o clona el repositorio en una carpeta de tu máquina local.

2. **Configurar Variables de Entorno**
   El proyecto ya incluye un archivo `.env` configurado por defecto para funcionar inmediatamente. Si necesitas cambiar puertos o credenciales, edita el archivo `.env` o cópialo desde `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Levantar los Contenedores**
   Abre una terminal (PowerShell o CMD) en la raíz del proyecto y ejecuta:
   ```bash
   docker-compose up --build -d
   ```
   *Nota: Si es la primera vez que lo ejecutas, Docker descargará las imágenes necesarias (puede tardar un par de minutos).*

4. **Acceder a la Aplicación**
   - **Interfaz Gráfica (Frontend)**: Abre tu navegador web en [http://localhost:5173](http://localhost:5173).
   - **Documentación de la API (Backend)**: Accede a [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Guía de Migración y Backups (Importante)

Dado que la aplicación almacena datos críticos e información confidencial, debes seguir un protocolo estricto para extraer y restaurar copias de seguridad de la base de datos (backups).

> [!WARNING]
> **Corrupción de Caracteres en Windows**: Nunca extraigas ni restaures la base de datos usando comandos nativos de la terminal de Windows (`>` o `<`). PowerShell corrompe automáticamente la codificación UTF-8, lo que dañará los acentos (á, é, í) y las eñes (ñ) en los registros. 

Para mover la base de datos de una computadora a otra de forma segura, siempre debes ejecutar los comandos **desde adentro del contenedor** y usar `docker cp`.

### Extraer una Copia de Seguridad (Backup)
Para generar un backup seguro que preserva la codificación:
1. Genera el volcado `.sql` dentro del contenedor de la base de datos:
   ```bash
   docker exec bateria_db pg_dump -U postgres -d bateria_db -f /tmp/backup_seguro.sql
   ```
2. Extrae el archivo hacia tu computadora (en la carpeta donde tengas abierta la terminal):
   ```bash
   docker cp bateria_db:/tmp/backup_seguro.sql backup_seguro.sql
   ```

### Restaurar una Copia de Seguridad (En otra computadora)
Cuando copies la carpeta del proyecto a otro computador y levantes los contenedores (`docker-compose up -d`), puedes inyectar los datos del backup anterior así:
1. Copia el archivo `.sql` desde tu computadora hacia adentro del contenedor:
   ```bash
   docker cp backup_seguro.sql bateria_db:/tmp/backup_seguro.sql
   ```
2. Ejecuta la restauración directamente desde el motor interno de PostgreSQL:
   ```bash
   docker exec bateria_db psql -U postgres -d bateria_db -f /tmp/backup_seguro.sql
   ```

Para más detalles o dudas sobre los backups, consulta el archivo [GUIA_BACKUP.md](GUIA_BACKUP.md).

---

## Modificar Preguntas y Motor de Cálculo (Uso Avanzado)

Siguiendo la **Regla 1** estricta de este proyecto, toda la lógica de cálculo y opciones de respuestas están basadas **única y exclusivamente** en la documentación técnica oficial que se encuentra en la carpeta `official_data/`.

### Cuestionarios
Las preguntas y respuestas posibles están pre-cargadas desde los siguientes archivos JSON:
- **Ficha de Datos Generales**: `official_data/ficha_datos_generales.json`
- **Intralaboral Forma A**: `official_data/cuestionario_intralaboral_A.json`
- **Intralaboral Forma B**: `official_data/cuestionario_intralaboral_B.json`
- **Extralaboral**: `official_data/cuestionario_extralaboral.json`
- **Cuestionario de Estrés**: `official_data/cuestionario_estres.json`

### Fórmulas y Baremos
El motor de cálculo vive en `backend/app/calculations/`. Allí se procesan matemáticamente las respuestas para convertirlas en puntajes (transformaciones, sumas) y posteriormente en **Niveles de Riesgo** (Sin riesgo, Bajo, Medio, Alto, Muy Alto).

> [!CAUTION]
> Los archivos fuente ubicados en `official_data/` son la fuente de verdad (archivos intocables). Si necesitas auditar cómo el sistema está puntuando a una persona, revisa directamente los PDFs del Ministerio ubicados en esa misma carpeta.

---

## Comandos Útiles de Docker

- **Detener los servicios sin borrar datos**:
  ```bash
  docker-compose stop
  ```
- **Detener y eliminar los contenedores (Los datos persisten en los volúmenes)**:
  ```bash
  docker-compose down
  ```
- **Ver los registros (logs) del sistema**:
  ```bash
  docker-compose logs -f
  ```
