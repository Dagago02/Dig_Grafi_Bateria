# Guía Definitiva para Respaldar y Restaurar la Base de Datos

Esta guía explica cómo realizar una copia de seguridad (backup) y cómo restaurarla en otra computadora **sin que se corrompan los caracteres especiales** (como tildes y eñes) por culpa de la codificación de la terminal de Windows.

El secreto para que los acentos no se rompan es **evitar usar los símbolos `>` y `<`** en PowerShell o CMD. En su lugar, generamos el archivo dentro del contenedor Linux (donde UTF-8 es nativo) y luego lo copiamos hacia afuera.

---

## 💻 PASO 1: En tu PC Actual (Crear el Backup Limpio)

Abre tu terminal en la carpeta principal del proyecto y ejecuta estos dos comandos:

1. Crea el backup directamente **adentro** del contenedor (así Windows no lo toca):
```powershell
docker exec bateria_db pg_dump -U postgres -d bateria_db -f /tmp/backup_limpio.sql
```

2. Extrae ese archivo intacto hacia tu computadora (se guardará en la carpeta actual donde tienes la terminal abierta):
```powershell
docker cp bateria_db:/tmp/backup_limpio.sql .\backup_limpio.sql
```

> **Nota:** Ahora puedes llevarte este archivo `backup_limpio.sql` en una memoria USB, enviarlo por correo, etc., hacia tu nueva computadora.

---

## 💻 PASO 2: En tu Otra PC (Restaurar el Backup Limpio)

Una vez que tengas el archivo `backup_limpio.sql` en la nueva PC, colócalo en la carpeta raíz del proyecto. Asegúrate de haber levantado el sistema con `docker-compose up -d`. Luego, abre tu terminal en esa carpeta y ejecuta los siguientes comandos uno por uno:

1. Detén el contenedor del backend para que no interfiera durante la restauración:
```powershell
docker stop bateria_backend
```

2. Borra y recrea la base de datos (esto asegura que esté completamente vacía antes de meter los datos):
```powershell
docker exec -it bateria_db psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS bateria_db WITH (FORCE);"
docker exec -it bateria_db psql -U postgres -d postgres -c "CREATE DATABASE bateria_db;"
```

3. Introduce el archivo intacto **adentro** del contenedor de la nueva PC:
```powershell
docker cp .\backup_limpio.sql bateria_db:/tmp/backup_limpio.sql
```

4. Ejecuta la restauración de la base de datos leyendo el archivo directamente desde adentro de Docker (con la opción `-f`):
```powershell
docker exec bateria_db psql -U postgres -d bateria_db -f /tmp/backup_limpio.sql
```

5. Vuelve a encender el backend para que se conecte a la base de datos restaurada:
```powershell
docker start bateria_backend
```

¡Y listo! Al seguir estos pasos, Windows nunca lee ni interpreta el contenido del archivo de texto, garantizando que todos tus datos demográficos (tildes, eñes, etc.) se mantengan 100% intactos en la nueva máquina.
