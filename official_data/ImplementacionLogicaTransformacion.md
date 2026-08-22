# IMPLEMENTACIÓN DE LA LÓGICA DE LA BATERÍA DE RIESGO PSICOSOCIAL

Estamos continuando el desarrollo de una aplicación para digitalizar, almacenar, procesar y visualizar las baterías de riesgo psicosocial aplicadas en Colombia.

La arquitectura existente es:

* Frontend: React + TypeScript + Vite
* Backend: Python + FastAPI
* Base de datos: PostgreSQL
* ORM: SQLAlchemy
* Migraciones: Alembic
* Infraestructura: Docker + Docker Compose

Frontend y backend son proyectos separados.

La aplicación se instalará inicialmente de forma local en la máquina/servidor del cliente mediante Docker.

---

# 1. FUENTES OFICIALES DEL PROYECTO

En la raíz del proyecto existirá una carpeta:

official_data/

Esta carpeta contiene TODOS los archivos que deben utilizarse como fuente para implementar la batería.

Dentro estarán archivos como:

official_data/
├── cuestionario.json
├── baremos/
├── formulas/
└── otros_documentos/

Actualmente se proporcionarán archivos que contienen:

* Preguntas del cuestionario.
* Opciones de respuesta.
* Identificación/código de las preguntas.
* Baremos.
* Fórmulas transformacionales.
* Reglas de cálculo.
* Agrupaciones.
* Dominios.
* Dimensiones.
* Clasificaciones de riesgo.

IMPORTANTE:

Los archivos dentro de `official_data/` son FUENTE DE VERDAD.

NO modificar estos archivos.

NO sobrescribirlos.

NO reinterpretarlos arbitrariamente.

NO inventar preguntas.

NO inventar respuestas.

NO inventar fórmulas.

NO inventar baremos.

NO inventar rangos.

NO inventar dominios.

NO inventar dimensiones.

NO inventar niveles de riesgo.

Si existe alguna información que no pueda determinarse claramente a partir de los archivos, DETENER la implementación de esa parte y documentar exactamente qué información falta.

---

# 2. PRIMERA TAREA: ANALIZAR LOS ARCHIVOS

Antes de escribir la lógica de cálculo, analiza completamente:

official_data/

En particular:

* cuestionario.json
* todos los archivos de baremos
* todos los archivos relacionados con fórmulas
* cualquier documento adicional relevante

Crear un documento:

docs/bateria-spec.md

Este documento debe contener una especificación técnica de la batería derivada exclusivamente de los archivos proporcionados.

Debe identificar:

1. Componentes
2. Cuestionarios
3. Preguntas
4. Opciones
5. Códigos
6. Formas A/B
7. Dominios
8. Dimensiones
9. Fórmulas
10. Baremos
11. Rangos
12. Niveles de riesgo
13. Relaciones entre preguntas y dominios
14. Relaciones entre dominios y dimensiones
15. Cualquier regla especial

NO comenzar la implementación del cálculo hasta haber terminado este análisis.

---

# 3. ESTRUCTURA DE LA BATERÍA

La aplicación debe manejar estas etapas:

1. Datos generales
2. Factores intralaborales
3. Factores extralaborales
4. Estrés

El componente intralaboral tiene dos cuestionarios:

* Forma A
* Forma B

Cada participante tendrá una única forma intralaboral.

---

# 4. CUESTIONARIO

Utilizar `official_data/cuestionario.json` como fuente principal de las preguntas.

No copiar manualmente las preguntas al código.

Crear un mecanismo para cargar/importar la estructura del cuestionario.

La base de datos debe almacenar las preguntas necesarias para que la aplicación pueda funcionar de forma independiente del archivo JSON una vez importado.

Crear un proceso de seed/import inicial.

Ejemplo:

backend/app/seed/

o

backend/scripts/import_questionnaire.py

Debe poder ejecutarse de manera controlada.

El proceso debe ser idempotente:

Si se ejecuta dos veces, NO debe duplicar las preguntas.

---

# 5. MODELO DE PREGUNTAS

La estructura debe permitir como mínimo:

Question:

* id
* code
* text
* section
* questionnaire_type
* form
* question_number
* response_type
* order
* active

Donde `questionnaire_type` permita identificar:

* datos_generales
* intralaboral
* extralaboral
* estres

Y `form` permita:

* A
* B
* null

Las preguntas que no correspondan a Forma A/B deben tener `form = null`, salvo que los archivos fuente indiquen otra cosa.

NO asumir.

---

# 6. OPCIONES DE RESPUESTA

Las opciones deben estar modeladas de forma independiente.

Ejemplo:

QuestionOption:

* id
* question_id
* value
* label
* order
* score
* active

IMPORTANTE:

No asumir que `score` es igual al valor visual de la respuesta.

La puntuación debe derivarse de las reglas oficiales.

Una opción puede tener:

label = "Siempre"

pero su puntuación puede depender de la pregunta y del sentido de calificación.

No asumir.

---

# 7. RESPUESTAS DEL PARTICIPANTE

Mantener las respuestas originales.

Crear una estructura equivalente a:

Answer:

* id
* participant_id
* question_id
* selected_option_id
* raw_value
* answered_at

La respuesta original debe conservarse.

Nunca eliminar las respuestas cuando se recalculen resultados.

---

# 8. VERSIONAMIENTO

Crear una versión de la metodología/calculadora.

Ejemplo:

CALCULATION_VERSION = "1.0.0"

No asumir que esta versión corresponde a una versión oficial de la normativa.

Es una versión INTERNA del motor de cálculo.

Cada resultado calculado debe guardar:

* calculation_version
* calculated_at

Esto permitirá recalcular resultados posteriormente.

---

# 9. MOTOR DE CÁLCULO

Crear un módulo independiente:

backend/app/calculations/

Estructura sugerida:

calculations/
├── **init**.py
├── questionnaire.py
├── intralaboral.py
├── extralaboral.py
├── estres.py
├── transformations.py
├── domains.py
├── dimensions.py
├── risk_levels.py
├── engine.py
└── version.py

NO colocar fórmulas directamente dentro de los endpoints FastAPI.

Los endpoints deben llamar al motor de cálculo mediante servicios.

---

# 10. FLUJO DE CÁLCULO

El cálculo debe seguir exactamente la estructura encontrada en los documentos.

Conceptualmente:

Respuesta
↓
Puntuación de pregunta
↓
Agrupación correspondiente
↓
Puntaje bruto
↓
Transformación
↓
Percentil / baremo cuando corresponda
↓
Nivel de riesgo
↓
Dominio
↓
Dimensión
↓
Resultado individual

Pero NO asumir que este orden exacto aplica a todos los componentes.

Utilizar la documentación proporcionada para determinar el flujo real.

---

# 11. FÓRMULAS

Las fórmulas encontradas en los documentos deben implementarse como funciones independientes.

Ejemplo conceptual:

calculate_raw_score()

transform_score()

calculate_percentile()

classify_risk()

Pero los nombres y operaciones exactas deben derivarse de la especificación.

Cada función debe tener:

* entrada claramente definida
* salida claramente definida
* documentación
* referencia al documento fuente
* tests

---

# 12. PREGUNTAS CON INVERSIÓN O REGLAS ESPECIALES

Prestar especial atención a preguntas cuya puntuación dependa de:

* inversión de escala
* tipo de cuestionario
* forma A/B
* componente
* dominio
* dimensión
* fórmula específica

NO asumir que todas las preguntas utilizan la misma conversión.

La configuración debe permitir que cada pregunta tenga su propia regla cuando corresponda.

---

# 13. DOMINIOS Y DIMENSIONES

Crear relaciones explícitas.

Conceptualmente:

Dimension
1 → N
Domain

Domain
1 → N
Question

Pero NO asumir esta estructura si los documentos muestran una relación diferente.

El objetivo es poder consultar:

Participante
→ Resultado de dimensión
→ Dominios asociados
→ Preguntas asociadas

---

# 14. RESULTADOS

Crear modelos separados para resultados procesados.

Por ejemplo:

IndividualResult:

* id
* participant_id
* component
* score_raw
* score_transformed
* percentile
* risk_level
* calculation_version
* calculated_at

Y estructuras específicas para:

* resultados de preguntas
* resultados de dominios
* resultados de dimensiones
* resultados generales

No almacenar solamente un resultado total.

Necesitamos conservar suficiente información para generar posteriormente:

* dashboards
* tablas
* gráficos
* reportes PDF
* exportaciones Excel

---

# 15. RESULTADOS POR COMPONENTE

Debe ser posible consultar independientemente:

## Intralaboral

* Forma A
* Forma B

## Extralaboral

## Estrés

Cada uno debe poder entregar los resultados correspondientes según las reglas oficiales.

---

# 16. NIVELES DE RIESGO

Implementar únicamente los niveles encontrados en los documentos oficiales.

No asumir rangos.

No escribir algo como:

if score < 20:
"bajo"

hasta comprobar que ese rango corresponde exactamente al baremo suministrado.

Todos los rangos deben proceder de `official_data/`.

---

# 17. BAREMOS

Los baremos deben quedar separados de la lógica del código cuando sea posible.

Crear una estructura que permita almacenar/configurar:

* componente
* forma
* dominio/dimensión
* rango
* nivel
* valores necesarios

Los baremos deberán poder actualizarse sin tener que modificar toda la lógica del motor.

Si los documentos requieren una estructura distinta, utilizar la estructura correspondiente.

---

# 18. IMPORTACIÓN DE BAREMOS

Crear scripts de importación para los baremos.

Ejemplo:

backend/scripts/import_baremos.py

Debe:

1. Leer la fuente.
2. Validar estructura.
3. Detectar errores.
4. Insertar/actualizar registros.
5. Evitar duplicados.
6. Mostrar resumen de lo importado.

Ejemplo de salida:

Imported:

* X preguntas
* X opciones
* X baremos
* X reglas
* X dominios
* X dimensiones

Si existe algún elemento ambiguo:

NO inventarlo.

Mostrarlo como error de importación.

---

# 19. VALIDACIÓN DE LA CONFIGURACIÓN

Crear un comando:

python -m app.scripts.validate_battery

Este comando debe comprobar:

* Todas las preguntas tienen código.
* Todas las preguntas tienen sección.
* Las preguntas A/B tienen forma válida.
* Todas las opciones están asociadas a una pregunta.
* Todas las preguntas necesarias tienen reglas de puntuación.
* Todos los dominios tienen sus relaciones.
* Todas las dimensiones tienen sus relaciones.
* Todos los baremos necesarios existen.
* Todas las reglas tienen configuración válida.

El comando debe producir errores claros.

---

# 20. TESTS DE CÁLCULO

Esta parte es CRÍTICA.

Crear tests unitarios para cada fórmula.

Ejemplo conceptual:

tests/calculations/

├── test_intralaboral.py
├── test_extralaboral.py
├── test_estres.py
├── test_transformations.py
├── test_baremos.py
└── test_risk_levels.py

Los valores esperados deben salir de los documentos suministrados.

No inventar casos de prueba.

Cuando sea posible, crear casos de prueba a partir de ejemplos explícitos existentes en los documentos.

---

# 21. TEST DE EXTREMO A EXTREMO

Crear al menos un test completo:

Participante
↓
Respuestas
↓
Puntuación
↓
Transformación
↓
Baremo
↓
Nivel de riesgo
↓
Resultado almacenado

Verificar que el resultado final coincida con el cálculo esperado.

---

# 22. RE-CÁLCULO

Crear un servicio:

recalculate_participant_results(participant_id)

Debe:

1. Leer respuestas originales.
2. Determinar la forma.
3. Ejecutar las reglas actuales.
4. Generar resultados.
5. Guardar nuevos resultados.
6. Mantener la trazabilidad de la versión utilizada.

No modificar las respuestas originales.

---

# 23. CÁLCULO AL COMPLETAR LA ENCUESTA

Cuando un participante complete todos los componentes requeridos:

1. Validar que no falten respuestas.
2. Ejecutar cálculo.
3. Guardar resultados.
4. Guardar calculation_version.
5. Marcar participante como `completed`.

Todo esto debe realizarse mediante una transacción cuando corresponda.

Si el cálculo falla:

* No marcar como completado.
* No dejar resultados parcialmente inconsistentes.
* Registrar el error.

---

# 24. API

Crear endpoints similares a:

POST /api/v1/participants/{id}/calculate

POST /api/v1/participants/{id}/recalculate

GET /api/v1/participants/{id}/results

GET /api/v1/participants/{id}/results/intralaboral

GET /api/v1/participants/{id}/results/extralaboral

GET /api/v1/participants/{id}/results/estres

GET /api/v1/participants/{id}/results/domains

GET /api/v1/participants/{id}/results/dimensions

Los nombres pueden adaptarse a la arquitectura existente, pero mantener una API coherente.

---

# 25. FRONTEND

Crear servicios TypeScript para consumir los resultados.

Por ejemplo:

frontend/src/services/results.ts

Debe permitir:

* obtener resultados individuales
* obtener dominios
* obtener dimensiones
* obtener puntajes
* obtener niveles de riesgo

No implementar todavía el graficador existente.

Preparar la estructura para integrarlo posteriormente.

---

# 26. INTEGRACIÓN FUTURA DEL GRAFICADOR

Ya existe un aplicativo de graficación desarrollado anteriormente.

NO reescribirlo todavía.

NO reemplazarlo.

NO modificarlo sin necesidad.

Cuando el motor de cálculo esté terminado, analizaremos el aplicativo existente y conectaremos sus funciones con los resultados generados por esta nueva plataforma.

La nueva arquitectura debe permitir que el graficador consuma algo equivalente a:

{
"participant_id": 123,
"intralaboral": {...},
"extralaboral": {...},
"estres": {...}
}

La estructura final debe definirse después de analizar el graficador existente.

---

# 27. DATOS SENSIBLES

La aplicación manejará información personal de trabajadores.

Por lo tanto:

* No mostrar información innecesaria.
* No registrar respuestas personales en logs.
* No incluir cédulas en mensajes de error.
* Validar permisos antes de devolver resultados.
* No exponer endpoints de resultados sin autorización.
* No almacenar información sensible en el frontend permanentemente.

---

# 28. NO HACER TODAVÍA

En esta fase NO implementar:

* integración con el graficador existente
* generación de PDF
* exportación Excel
* gráficos definitivos
* módulos de facturación
* límites de uso
* pagos
* funcionalidades SaaS
* sincronización con internet

El objetivo de esta fase es exclusivamente:

CUESTIONARIO
+
RESPUESTAS
+
FÓRMULAS
+
BAREMOS
+
CÁLCULO
+
RESULTADOS

---

# 29. ORDEN DE EJECUCIÓN

Trabaja en este orden:

### PASO 1

Analiza completamente:

official_data/

### PASO 2

Genera:

docs/bateria-spec.md

### PASO 3

Muéstrame un resumen de lo encontrado:

* número de preguntas
* componentes
* Forma A
* Forma B
* dominios
* dimensiones
* baremos
* fórmulas
* reglas especiales

NO implementes todavía si detectas inconsistencias.

### PASO 4

Crear/ajustar modelos PostgreSQL.

### PASO 5

Crear migraciones Alembic.

### PASO 6

Crear importadores de:

* cuestionario
* opciones
* baremos
* reglas

### PASO 7

Crear motor de cálculo.

### PASO 8

Crear tests.

### PASO 9

Crear endpoints.

### PASO 10

Crear integración básica con frontend.

---

# 30. REGLA MÁS IMPORTANTE

La aplicación debe reproducir los cálculos definidos en los documentos suministrados.

No crear una "interpretación aproximada".

No simplificar las fórmulas.

No sustituir baremos.

No modificar preguntas.

No asumir valores.

Si una fórmula del documento dice exactamente:

X = ...

implementar exactamente esa fórmula.

Si existe una tabla de transformación, utilizar esa tabla.

Si existe una regla especial para una pregunta, respetarla.

Si hay diferencias entre Forma A y Forma B, respetarlas.

Si existe una pregunta que no participa en determinado cálculo, respetarlo.

---

# 31. TRAZABILIDAD

Cada regla de cálculo implementada debería poder relacionarse con su fuente.

Cuando sea posible, documentar:

* archivo fuente
* página/sección
* regla implementada

Por ejemplo:

# Fuente:

# official_data/baremos/formulas.pdf

# Página: XX

# Regla: transformación del dominio X

Esto permitirá auditar posteriormente el código.

---

# 32. RESULTADO ESPERADO

Al terminar esta fase debo poder:

1. Crear un participante.
2. Seleccionar Forma A o Forma B.
3. Cargar sus respuestas.
4. Completar los cuestionarios.
5. Guardar todas las respuestas.
6. Ejecutar el motor de cálculo.
7. Obtener:

   * puntajes brutos
   * puntajes transformados
   * percentiles cuando correspondan
   * resultados por dominio
   * resultados por dimensión
   * niveles de riesgo
8. Guardar los resultados.
9. Recalcular los resultados.
10. Consultarlos mediante API.
11. Ejecutar todos los tests y obtener resultados satisfactorios.

---

# 33. IMPORTANTE SOBRE EL DESARROLLO

No intentes resolver todo en una sola generación.

Divide el trabajo en tareas pequeñas.

Después de cada tarea:

* Ejecutar tests.
* Revisar errores.
* Verificar migraciones.
* Verificar Docker.
* Verificar que la aplicación siga funcionando.

No continuar si existen errores críticos.

Primero comprender los documentos.

Después diseñar la estructura.

Después implementar.

Después probar.

NO al revés.
