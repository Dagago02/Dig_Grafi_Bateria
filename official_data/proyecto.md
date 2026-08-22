# Proyecto: Plataforma de Digitalización y Análisis de Batería de Riesgo Psicosocial

Quiero construir una aplicación web local para digitalizar, almacenar, procesar y visualizar las encuestas de riesgo psicosocial aplicadas a trabajadores de empresas colombianas.

La aplicación NO será pública inicialmente. Se instalará en la máquina/servidor local del cliente mediante Docker y deberá funcionar completamente mediante contenedores.

## 1. Arquitectura tecnológica obligatoria

Utilizar exactamente esta arquitectura:

### Frontend

* React
* TypeScript
* Vite
* React Router
* Una librería de componentes UI moderna y consistente
* Axios o equivalente para comunicación con el backend
* Gráficas interactivas mediante una librería adecuada

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* Alembic
* PostgreSQL como base de datos

### Infraestructura

* Docker
* Docker Compose
* Un contenedor para frontend
* Un contenedor para backend
* Un contenedor para PostgreSQL

La estructura debe permitir que posteriormente sea posible desplegar la misma aplicación en un servidor remoto, aunque inicialmente se utilizará exclusivamente de forma local.

NO utilizar Supabase.

NO mezclar frontend y backend en el mismo proyecto.

NO utilizar SQLite.

NO colocar lógica de negocio importante en React.

Toda la lógica relacionada con cálculos, validaciones, almacenamiento y procesamiento de la batería debe estar en el backend.

---

# 2. Estructura del proyecto

Crear una estructura similar a:

project-root/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── router/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── calculations/
│   │   ├── reports/
│   │   └── db/
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── database/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md

Mantener una separación clara de responsabilidades.

---

# 3. Principio fundamental del proyecto

La información de las encuestas debe almacenarse de manera que:

1. Las respuestas originales nunca se pierdan.
2. Las respuestas puedan ser recalculadas.
3. Los resultados procesados puedan almacenarse.
4. Cada resultado tenga registrada la versión del algoritmo utilizado.
5. Sea posible recalcular resultados si posteriormente se corrige una fórmula o cambia la metodología.

No guardar únicamente los resultados.

Las respuestas originales son la fuente de verdad.

---

# 4. Modelo general de funcionamiento

El flujo general será:

Empresa
↓
Evaluación / periodo de medición
↓
Participante
↓
Datos generales
↓
Selección Forma A o Forma B
↓
Factores intralaborales
↓
Factores extralaborales
↓
Estrés
↓
Guardar respuestas
↓
Procesar resultados
↓
Guardar resultados calculados
↓
Visualizar resultados
↓
Generar reportes PDF

---

# 5. Entidades principales

Diseñar inicialmente estas entidades.

## Empresa

Campos mínimos:

* id
* nombre
* NIT
* email
* teléfono
* dirección
* estado
* created_at
* updated_at

El NIT debe poder utilizarse como identificador empresarial y debe tener validaciones adecuadas.

---

## Evaluación

Representa un periodo de medición de una empresa.

Campos:

* id
* empresa_id
* nombre
* fecha_inicio
* fecha_fin
* estado
* created_at
* updated_at

Estados sugeridos:

* activa
* completada
* archivada

Una empresa puede tener múltiples evaluaciones históricas.

Ejemplo:

Empresa X

* Evaluación 2026
* Evaluación 2027
* Evaluación 2028

Nunca sobrescribir las evaluaciones anteriores.

---

# 6. Participante

Cada trabajador evaluado pertenece a una empresa y a una evaluación.

La cédula será el identificador principal del participante dentro de la aplicación.

Campos iniciales:

* id
* empresa_id
* evaluacion_id
* cedula
* nombres
* apellidos
* sexo
* edad
* estado_civil
* nivel_educativo
* cargo
* area
* tipo_contrato
* tiempo_empresa
* tipo_forma
* estado_evaluacion
* created_at
* updated_at

El tipo de forma debe aceptar:

* A
* B

El sistema debe validar que cada participante tenga definida una forma antes de iniciar el cuestionario intralaboral.

El participante debe poder existir antes de completar la encuesta.

Estados sugeridos:

* pendiente
* en_progreso
* completado

---

# 7. Cuestionarios

Separar conceptualmente los diferentes componentes.

## Datos generales

Contendrá las preguntas correspondientes a los datos generales/sociodemográficos.

## Intralaboral

Puede ser:

* Forma A
* Forma B

Nunca mezclar las preguntas de Forma A y Forma B.

El participante debe tener asociado exactamente un tipo de forma.

## Extralaboral

Cuestionario correspondiente al componente extralaboral.

## Estrés

Cuestionario correspondiente al componente de estrés.

---

# 8. Diseño de preguntas

No escribir las preguntas directamente dentro del código Python.

Crear una estructura de datos/configuración para las preguntas.

Cada pregunta debe tener como mínimo:

* id
* codigo
* texto
* seccion
* forma
* numero
* tipo_respuesta
* opciones
* activa

Ejemplo conceptual:

Question:

id
codigo
texto
seccion
forma
numero
tipo_respuesta

Esto permitirá posteriormente modificar la interfaz sin modificar la estructura completa de la aplicación.

IMPORTANTE:

No inventar preguntas.

No modificar preguntas.

No modificar opciones.

No modificar fórmulas.

Los cuestionarios oficiales serán suministrados posteriormente mediante archivos PDF/documentación del proyecto.

Antes de implementar las preguntas, analizar los documentos suministrados y construir la estructura a partir de ellos.

---

# 9. Respuestas

Crear una entidad para almacenar las respuestas originales.

Ejemplo:

Answer:

* id
* participant_id
* question_id
* value
* created_at
* updated_at

Las respuestas deben almacenarse independientemente de los resultados calculados.

Nunca eliminar las respuestas originales cuando se recalculen resultados.

---

# 10. Resultados

Crear entidades separadas para resultados procesados.

Como mínimo:

## Resultado individual

* participant_id
* tipo_resultado
* puntaje_bruto
* puntaje_transformado
* percentil
* nivel_riesgo
* algorithm_version
* calculated_at

Los resultados deben poder almacenarse para:

* dimensión
* dominio
* factor
* componente general

---

# 11. Niveles de riesgo

La aplicación debe manejar inicialmente:

* Sin riesgo
* Riesgo bajo
* Riesgo medio
* Riesgo alto

NO asumir rangos de puntuación.

Los rangos deberán salir exclusivamente de la documentación oficial suministrada.

---

# 12. Motor de cálculo

Crear un módulo independiente:

backend/app/calculations/

Dentro de este módulo separar:

* fórmulas
* transformaciones
* agrupaciones
* clasificación de riesgo
* validaciones
* versiones del algoritmo

Por ejemplo:

calculations/
├── **init**.py
├── intralaboral.py
├── extralaboral.py
├── estres.py
├── dimensions.py
├── domains.py
├── risk_levels.py
└── version.py

No colocar las fórmulas directamente dentro de endpoints FastAPI.

Los endpoints solamente deben llamar a los servicios correspondientes.

---

# 13. Versionamiento del algoritmo

Implementar desde el inicio:

ALGORITHM_VERSION = "1.0.0"

Cada resultado calculado debe almacenar la versión utilizada.

Esto permitirá posteriormente hacer:

Resultado:
algorithm_version = 1.0.0

Si se corrige alguna fórmula:

algorithm_version = 1.1.0

Y posteriormente poder identificar resultados antiguos y recalcularlos.

---

# 14. Cálculo híbrido

Utilizar esta estrategia:

1. Guardar respuestas originales.
2. Al completar la evaluación, ejecutar el cálculo.
3. Guardar los resultados procesados.
4. Utilizar los resultados procesados para dashboards y consultas frecuentes.
5. Mantener la posibilidad de recalcular desde las respuestas originales.

No recalcular todo cada vez que el usuario abre un dashboard.

---

# 15. Dashboard principal

Crear una pantalla principal con:

* Empresas activas
* Evaluaciones activas
* Evaluaciones completadas
* Participantes pendientes
* Participantes en progreso
* Participantes completados
* Total de participantes
* Resumen general

Debe funcionar como centro de navegación.

Menú lateral:

* Dashboard
* Empresas
* Evaluaciones
* Participantes
* Resultados
* Reportes
* Configuración

---

# 16. Módulo Empresas

Crear:

GET /companies
GET /companies/{id}
POST /companies
PUT /companies/{id}
DELETE /companies/{id}

Frontend:

Tabla con:

* Nombre
* NIT
* Email
* Teléfono
* Número de evaluaciones
* Estado
* Acciones

Acciones:

* Ver
* Editar
* Eliminar

Crear modal:

"Crear nueva empresa"

Campos:

* Nombre
* NIT
* Email
* Teléfono
* Dirección

---

# 17. Módulo Evaluaciones

Crear listado de evaluaciones.

Columnas:

* Empresa
* Nombre de evaluación
* Fecha inicio
* Fecha final
* Participantes
* Completados
* Estado
* Acciones

Crear modal:

"Crear nueva evaluación"

Campos:

* Empresa
* Nombre
* Fecha inicio
* Fecha final

No permitir crear una evaluación sin empresa.

---

# 18. Módulo Participantes

Crear tabla con:

* Cédula
* Nombre
* Empresa
* Evaluación
* Forma
* Área
* Cargo
* Estado
* Acciones

Filtros:

* Empresa
* Evaluación
* Forma A/B
* Estado

Estados:

* Pendiente
* En progreso
* Completado

Crear modal:

"Nuevo participante"

Datos:

* Empresa
* Evaluación
* Cédula
* Nombres
* Apellidos
* Datos sociodemográficos
* Área
* Cargo
* Forma A/B

---

# 19. Flujo de encuesta

Cuando se cree un participante:

Mostrar botón:

"Aplicar encuesta"

El flujo debe ser:

1. Datos generales
2. Selección/confirmación de Forma A/B
3. Intralaboral
4. Extralaboral
5. Estrés
6. Confirmación
7. Finalizar

Guardar el progreso.

Si el usuario abandona el cuestionario, debe poder continuar posteriormente.

No perder respuestas parcialmente diligenciadas.

---

# 20. Estado de completitud

El backend debe determinar cuándo un participante completó todos los componentes requeridos.

Solo cuando estén completos:

* Datos generales
* Intralaboral
* Extralaboral
* Estrés

se debe marcar:

estado_evaluacion = completado

Después ejecutar el procesamiento de resultados.

---

# 21. Resultados

Crear pantalla:

"Resultados"

Debe permitir seleccionar una evaluación.

Mostrar:

* Total participantes
* Completados
* Pendientes
* Porcentaje de avance
* Distribución de resultados
* Acceso a resultados individuales

Tabla:

* Cédula
* Nombre
* Área
* Cargo
* Forma
* Estado
* Acciones

Acciones:

* Ver resultados
* Dashboard individual
* Generar PDF

---

# 22. Resultado individual

Crear pantalla con pestañas:

* Intralaboral
* Extralaboral
* Estrés

Mostrar:

* Puntaje bruto
* Puntaje transformado
* Percentil
* Nivel de riesgo

También mostrar resultados por:

* Dimensión
* Dominio

La estructura exacta dependerá de las fórmulas y clasificación encontradas en los documentos oficiales.

---

# 23. Dashboard individual

Crear una pantalla gráfica.

Debe poder mostrar:

* Nivel de riesgo
* Dimensiones
* Dominios
* Puntajes
* Distribución de riesgo

Usar gráficos interactivos.

No implementar todavía la lógica definitiva de gráficos si posteriormente se va a integrar el aplicativo de graficación existente.

Crear una capa/adaptador que permita conectar posteriormente ese código.

Por ejemplo:

backend/app/services/results_service.py

y

frontend/src/services/results.ts

El graficador existente se integrará posteriormente sin modificar innecesariamente el núcleo de datos.

---

# 24. Reportes PDF

NO almacenar PDFs permanentemente.

Los informes deben generarse bajo demanda.

Flujo:

Usuario solicita PDF
↓
Backend consulta resultados
↓
Construye informe
↓
Genera PDF
↓
Devuelve archivo
↓
Usuario descarga

Crear inicialmente endpoints como:

GET /reports/participants/{participant_id}/pdf

GET /reports/evaluations/{evaluation_id}/pdf

GET /reports/companies/{company_id}/pdf

La generación debe estar separada del cálculo.

---

# 25. Exportación Excel

Permitir exportar resultados consolidados.

Por ejemplo:

* Participantes
* Puntajes
* Dimensiones
* Dominios
* Niveles de riesgo

El Excel también debe generarse bajo demanda.

No almacenarlo permanentemente.

---

# 26. API

Crear endpoints REST claros.

Ejemplo:

/api/v1/companies

/api/v1/evaluations

/api/v1/participants

/api/v1/questions

/api/v1/answers

/api/v1/results

/api/v1/reports

/api/v1/dashboard

Utilizar versionamiento:

/api/v1/

---

# 27. Base de datos

Utilizar PostgreSQL.

Crear relaciones correctas:

Empresa
1 → N
Evaluaciones

Evaluación
1 → N
Participantes

Participante
1 → N
Respuestas

Pregunta
1 → N
Respuestas

Participante
1 → N
Resultados

No guardar grandes estructuras JSON como sustituto de un modelo relacional cuando los datos deban consultarse, filtrarse o agregarse frecuentemente.

Se pueden utilizar JSONB para estructuras auxiliares cuando tenga sentido.

---

# 28. Integridad de datos

Implementar:

* Foreign keys
* Unique constraints
* Índices
* Validaciones Pydantic
* Validaciones de negocio
* Transacciones

Crear índices especialmente para:

* cedula
* empresa_id
* evaluacion_id
* participant_id
* question_id

La cédula debe tener restricciones apropiadas según el alcance de cada evaluación/empresa.

---

# 29. Docker

Crear:

docker-compose.yml

Servicios:

frontend
backend
db

El proyecto debe poder iniciarse con:

docker compose up --build

La base de datos debe utilizar un volumen persistente.

Ejemplo conceptual:

postgres_data:/var/lib/postgresql/data

IMPORTANTE:

Los datos deben sobrevivir aunque los contenedores se reinicien.

---

# 30. Variables de entorno

Nunca colocar contraseñas directamente en el código.

Crear:

.env.example

Variables iniciales:

POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
DATABASE_URL=
SECRET_KEY=
CORS_ORIGINS=

El README debe explicar cómo crear el archivo .env.

---

# 31. Instalación para el cliente

La instalación final debe ser extremadamente sencilla.

Objetivo:

1. Instalar Docker Desktop.
2. Copiar el proyecto.
3. Crear .env.
4. Ejecutar:

docker compose up -d

5. Abrir navegador:

http://localhost

La aplicación debe quedar funcionando sin requerir que el cliente instale Python, Node, PostgreSQL u otras dependencias.

---

# 32. Persistencia y backups

Como la aplicación manejará información sensible, crear documentación para backups.

No asumir que Docker garantiza backups.

Crear una estrategia que permita realizar:

pg_dump

de PostgreSQL.

El README debe incluir instrucciones para:

* Backup
* Restauración
* Actualización
* Reinicio
* Detener aplicación
* Actualizar imágenes

---

# 33. Seguridad

Aunque la aplicación sea local, tratar la información como sensible.

Implementar:

* Hash seguro de contraseñas
* Autenticación
* Autorización
* CORS configurado
* Validación de inputs
* Protección contra SQL injection mediante SQLAlchemy
* No exponer PostgreSQL públicamente
* Variables sensibles fuera del código
* Logs sin información sensible
* Sesiones seguras

Diseñar desde el inicio para que posteriormente pueda agregarse:

* Roles
* Auditoría
* MFA
* Cifrado adicional

---

# 34. Autenticación

Crear inicialmente un usuario administrador.

No crear registro público de usuarios.

El acceso será mediante:

email/usuario
+
contraseña

Posteriormente se podrán agregar diferentes roles.

---

# 35. Auditoría

Diseñar una estructura para poder registrar posteriormente:

* Usuario
* Acción
* Fecha
* Entidad afectada
* ID de entidad

Ejemplo:

Usuario X
generó PDF
Participante Y
2026-08-22 09:30

Esto es importante para trazabilidad.

---

# 36. Tests

Crear tests desde el inicio.

Backend:

* Tests de modelos
* Tests de endpoints
* Tests de validaciones
* Tests de cálculos
* Tests de clasificación de riesgo

Los cálculos deben tener tests unitarios exhaustivos.

Especialmente:

Pregunta → respuesta → puntaje → dominio → dimensión → nivel de riesgo.

No continuar con el proyecto si los cálculos no tienen tests.

---

# 37. Documentación

Crear README.md con:

* Descripción
* Arquitectura
* Requisitos
* Instalación
* Docker
* Variables de entorno
* Migraciones
* Inicialización
* Backup
* Restauración
* Tests
* Estructura del proyecto

FastAPI debe generar automáticamente documentación OpenAPI.

---

# 38. Diseño visual

La interfaz debe ser:

* Profesional
* Limpia
* Sobria
* Orientada a software empresarial
* Responsive

No crear una interfaz excesivamente colorida.

Utilizar colores para representar niveles de riesgo solamente cuando corresponda.

El usuario debe poder navegar fácilmente entre:

Empresa
→ Evaluación
→ Participante
→ Resultados

---

# 39. Regla crítica sobre la normativa

NO inventar información relacionada con la batería.

No inventar:

* Preguntas
* Opciones
* Fórmulas
* Pesos
* Rangos
* Dimensiones
* Dominios
* Clasificaciones

Cuando los PDFs oficiales sean incorporados al proyecto, analizarlos primero y convertirlos en una especificación técnica estructurada.

Si existe alguna ambigüedad, dejarla documentada y preguntarme antes de implementarla.

---

# 40. Orden de desarrollo

NO intentar construir toda la aplicación de una sola vez.

Trabajar por fases.

## Fase 1 — Infraestructura

Crear:

* Docker Compose
* PostgreSQL
* FastAPI
* React
* Comunicación frontend/backend
* Variables de entorno
* Health checks

Al terminar, debe ser posible ejecutar:

docker compose up

y comprobar que frontend, backend y DB funcionan.

---

## Fase 2 — Base de datos

Implementar:

* Empresas
* Evaluaciones
* Participantes
* Preguntas
* Respuestas
* Resultados

Crear migraciones Alembic.

Crear seeds únicamente para datos de prueba.

---

## Fase 3 — CRUD

Implementar:

* Empresas
* Evaluaciones
* Participantes

Crear primero API y después interfaz.

---

## Fase 4 — Cuestionarios

Implementar:

* Datos generales
* Forma A
* Forma B
* Extralaboral
* Estrés

Inicialmente utilizar preguntas de prueba.

NO implementar todavía las preguntas oficiales hasta que se suministren los PDFs.

---

## Fase 5 — Motor de cálculo

Implementar el motor de cálculo basándose exclusivamente en los documentos oficiales.

Crear tests para cada fórmula.

---

## Fase 6 — Resultados

Implementar:

* Resultados individuales
* Resultados por dimensión
* Resultados por dominio
* Niveles de riesgo
* Dashboard individual

---

## Fase 7 — Reportes

Implementar:

* PDF individual
* PDF consolidado
* Exportación Excel

Todos bajo demanda.

---

## Fase 8 — Integración del graficador existente

Cuando el núcleo esté funcionando, integrar el aplicativo de graficación existente.

NO reescribirlo innecesariamente.

Primero analizar su arquitectura y determinar qué partes pueden reutilizarse.

Crear una capa de integración para conectarlo con los resultados almacenados en PostgreSQL.

---

# 41. Regla de trabajo para Cursor

Trabaja de forma incremental.

Antes de modificar archivos importantes:

1. Analiza la estructura actual.
2. Explica brevemente qué vas a modificar.
3. Realiza cambios pequeños y coherentes.
4. Ejecuta tests.
5. Verifica que Docker siga funcionando.
6. No borres código funcional sin justificarlo.
7. No inventes requisitos.

Después de cada fase:

* Ejecutar tests.
* Verificar migraciones.
* Verificar API.
* Verificar frontend.
* Verificar Docker.

No pasar a la siguiente fase si la actual tiene errores.

---

# 42. Primera tarea

Por ahora NO implementes la batería oficial.

Quiero que primero construyas únicamente:

1. Estructura completa del proyecto.
2. Docker Compose.
3. PostgreSQL.
4. FastAPI.
5. React + TypeScript + Vite.
6. Comunicación frontend/backend.
7. Configuración de variables de entorno.
8. Health check.
9. Modelo inicial Empresa.
10. CRUD completo de Empresas.
11. README con instrucciones de instalación.

Al finalizar:

* Ejecuta los tests.
* Comprueba que Docker Compose levanta correctamente.
* Comprueba que PostgreSQL persiste los datos.
* Comprueba que el frontend puede comunicarse con FastAPI.
* Comprueba que puedo crear, consultar, editar y eliminar una empresa.

NO implementar todavía:

* preguntas oficiales
* fórmulas
* resultados
* batería
* PDFs
* gráficos
* integración del aplicativo existente

Primero quiero una base sólida y funcional sobre la cual construiremos el resto.
