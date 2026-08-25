# Prompt para Antigravity — Pendientes del Sistema de Riesgo Psicosocial

> Contexto: este es un sistema ya existente (React + TypeScript en el frontend, FastAPI + PostgreSQL en el backend, todo dockerizado) para digitalizar y calcular resultados de la batería de riesgo psicosocial en Colombia. Ya existen los modelos `Empresa`, `Evaluación`, `Participante`, resultados por dominio/dimensión, y las pantallas de Dashboard, Empresas, Evaluaciones, Participantes, Resultados y Reportes PDF. Este prompt cubre los pendientes de esa app — no es un proyecto nuevo, son ajustes y features sobre el código existente. Antes de tocar cada punto, localiza los archivos/componentes ya implementados que le correspondan; no dupliques pantallas ni modelos.

---

## ⚠️ Confirmar antes de implementar (2 puntos ambiguos)

1. **Punto 9 (colores de riesgo en blanco):** interpreté que el fondo de las celdas/badges de nivel de riesgo debe pasar a blanco, dejando el color solo como texto o borde (para no perder la señal visual del semáforo de riesgo). Si en realidad quieres que TODO quede sin color (texto negro plano, sin distinción visual por nivel), dilo antes de implementar.
2. **Punto 12 (semáforo de programa legacy):** no tengo contexto de qué es "programa legacy" ni cómo se veía ese semáforo. Antes de implementarlo, adjunta una captura de pantalla del programa legado o describe: qué mide, cuántos estados tiene (¿3 colores: rojo/amarillo/verde?), y en qué pantalla debe aparecer (¿resumen por empresa, por evaluación, por participante?).

Todo lo demás está listo para implementarse directamente con las especificaciones de abajo.

---

## 1. Preguntas filtro condicionales en el cuestionario Intralaboral (captura)

**Aplica a:** pantalla de captura del cuestionario Intralaboral (Forma A y Forma B).

### 1.1 Atención a clientes o usuarios
- La pregunta filtro "En mi trabajo debo brindar servicio a clientes o usuarios" (Sí/No) debe presentarse **antes** del bloque de preguntas de "Demandas emocionales" (ítems 106–114 en Forma A, 89–97 en Forma B).
- Si el usuario responde **No**: el bloque completo de preguntas de esa sección debe quedar **deshabilitado** (no editable, visualmente atenuado o directamente oculto — usa el mismo patrón visual que ya tengas para secciones condicionales, si existe alguno) y **no se guarda respuesta alguna** para esos ítems.
- Al calcular resultados, si la pregunta filtro fue "No", el backend debe asignar **0 automático** a la dimensión "Demandas emocionales" (esta regla ya está documentada en el manual de baremos: "0 automático si 'brindo servicio a clientes o usuarios' = No").
- Si el usuario responde **Sí**, las preguntas se habilitan normalmente y deben responderse todas para que la sección cuente como completa.

### 1.2 Relación con colaboradores a cargo (jefatura) — solo Forma A
- Misma lógica que el punto anterior, aplicada a la pregunta filtro "Soy jefe de otras personas en mi trabajo" (Sí/No), que gobierna el bloque de ítems 115–123 (solo existe en Forma A, Forma B no tiene esta sección).
- Si responde **No**: bloque deshabilitado, sin respuestas guardadas, **0 automático** en la dimensión "Relación con los colaboradores" al calcular.
- Si responde **Sí**: se habilita y se exige completarlo.

### Criterios de aceptación
- [ ] No es posible enviar/guardar el cuestionario si la pregunta filtro no fue respondida.
- [ ] No es posible marcar el cuestionario como completo si, habiendo respondido "Sí" a una pregunta filtro, quedan preguntas de ese bloque sin responder.
- [ ] El motor de cálculo (`scoring_engine.py`) ya contempla estos ceros automáticos según el documento de baremos — verifica que la lógica esté conectada al valor real capturado de la pregunta filtro, no a si el bloque tiene respuestas vacías (para no confundir "no aplica" con "dato faltante").

---

## 2. Ficha de Datos Generales — texto de ayuda en antigüedad

**Aplica a:** formulario de captura de la Ficha de Datos Generales, preguntas 12 ("¿Hace cuántos años que trabaja en esta empresa?") y 15 ("¿Hace cuántos años que desempeña el cargo actual?").

- Agrega un texto de ayuda (helper text / tooltip / placeholder, según el patrón que ya uses en el formulario) junto a estos dos campos: **"Si lleva menos de un año, escriba 1"**.
- Esto simplifica el campo a un solo input numérico (ya no hace falta el sub-campo booleano "menos de un año" que se había planteado inicialmente); si el formulario ya tiene esa estructura de dos sub-campos, simplifícala a un único campo numérico con el texto de ayuda.

### Criterios de aceptación
- [ ] El campo acepta solo números enteros positivos.
- [ ] El texto de ayuda es visible sin necesidad de hacer hover/foco (o al menos con foco, según tu patrón de UI existente).

---

## 3. Botón "Marcar como completado" — validación de las 4 secciones del cuestionario

**Aplica a:** el botón "Marcar como completado" que ya existe en la parte superior de la pestaña/pantalla del participante (no es un botón nuevo exclusivo del Cuestionario de Estrés).

- Este botón marca como completado el cuestionario **completo** del participante, no una sección individual. Debe existir un único punto de control para esta acción (el botón de la parte de arriba), no botones independientes por sección.
- Solo debe permitir la acción (o ejecutarla exitosamente) cuando las **4 secciones** están respondidas al 100%:
  1. Ficha de Datos Generales (19 preguntas).
  2. Cuestionario Intralaboral (Forma A o Forma B, según corresponda al participante) — incluyendo las secciones condicionales de atención a clientes y jefatura si aplicaron (ver punto 1 de este documento).
  3. Cuestionario de Factores Extralaborales (31 preguntas).
  4. Cuestionario de Estrés (31 preguntas).
- Si alguna sección tiene preguntas sin responder, el botón debe **bloquear la acción** y mostrar claramente qué sección(es) están incompletas (idealmente indicando cuántas preguntas faltan por sección, no solo un mensaje genérico).
- Al ejecutarse exitosamente, debe actualizar el estado `completado = true` del participante a nivel general (el campo/flag que usan el resto de reglas de negocio de este documento — punto 4, empresas/evaluaciones, exportación a Excel, etc. — para determinar si un participante cuenta o no en los cálculos).

### Criterios de aceptación
- [ ] El botón no permite completar el registro si falta al menos una pregunta en cualquiera de las 4 secciones.
- [ ] El mensaje de bloqueo indica qué sección(es) están incompletas.
- [ ] Una vez marcado como completado, el estado se refleja consistentemente en Participantes, Resultados y la exportación a Excel.
- [ ] No deben quedar botones de "marcar como completado" sueltos por sección (por ejemplo dentro del formulario de Estrés) que dupliquen o contradigan esta validación — todo pasa por el botón único de la parte superior.
---

## 4. Bug: participantes no completados están afectando resultados y exportaciones

**Aplica a:** motor de cálculo de resultados y exportación a Excel.

Este es un bug de datos, no una feature nueva. Actualmente los participantes que **no** están marcados como `completado` (en cualquiera de los instrumentos: Datos Generales, Intralaboral, Extralaboral, Estrés) están:
1. Siendo incluidos en los cálculos agregados de resultados (promedios, distribución de niveles de riesgo por empresa/evaluación, etc.).
2. Apareciendo en el archivo Excel exportado desde la sección Resultados.

**Comportamiento esperado:** ambos flujos (cálculo de resultados agregados y exportación a Excel) deben **filtrar únicamente participantes con estado `completado = true`** en los instrumentos correspondientes. Un participante con evaluación incompleta no debe sumar al total ni aparecer en el archivo entregable.

### Criterios de aceptación
- [ ] Revisa la query/endpoint de resultados agregados y agrega el filtro de completado.
- [ ] Revisa el endpoint/función que genera el Excel y agrega el mismo filtro.
- [ ] Escribe (o actualiza) un test que cree un participante incompleto y verifique que NO aparece ni en resultados agregados ni en el Excel.

---

## 5. Regla de negocio: empresas inactivas/archivadas no permiten nuevas evaluaciones

**Aplica a:** modelo `Empresa` y pantalla/modal de creación de Evaluación.

- El modelo `Empresa` debe tener (o ya tiene) un campo de estado con al menos estos valores: `activa`, `inactiva`, `archivada`.
- Al intentar crear una nueva Evaluación asociada a una empresa cuyo estado sea `inactiva` o `archivada`, el sistema debe **bloquear la creación** y mostrar un mensaje explicando por qué (ej. "No se pueden crear evaluaciones para una empresa inactiva o archivada").
- Esta validación debe existir tanto en el **backend** (para que no se pueda saltar desde la API directamente) como reflejarse en el **frontend** (deshabilitar o filtrar del selector de empresas del modal "Crear Nueva Evaluación" aquellas que estén inactivas/archivadas, o mostrarlas pero bloquear el submit con el mensaje de error).

### Criterios de aceptación
- [ ] Backend: `POST /api/evaluaciones` devuelve error (400/409, el código que uses en el resto de la API) si la empresa no está activa.
- [ ] Frontend: el modal de creación de evaluación comunica claramente por qué no se puede proceder.

---

## 6. Regla de negocio: evaluaciones completadas no permiten nuevos participantes

**Aplica a:** modelo `Evaluación` y pantalla/modal de creación de Participante.

- Mismo patrón que el punto anterior: si una Evaluación tiene estado `completada`, no se pueden crear nuevos Participantes asociados a ella.
- Validación en backend (`POST /api/participantes`) y en frontend (modal "Crear Nuevo Participante").

### Criterios de aceptación
- [ ] Backend devuelve error si la evaluación está completada.
- [ ] Frontend comunica el motivo del bloqueo.

---

## 7. Botón de expandir en las gráficas

**Aplica a:** Dashboard Visual Individual (pantalla 5.2) y cualquier otra pantalla con gráficos de resultados.

- Agrega un botón/ícono de "expandir" en cada gráfico que, al hacer clic, lo muestre en un tamaño más grande (modal a pantalla completa o un panel ampliado — usa el patrón que mejor encaje con tu librería de componentes actual).
- El gráfico expandido debe mantener toda su interactividad (tooltips, tabs de dominio si aplica, etc.).
- Debe poder cerrarse fácilmente (botón de cerrar, click fuera del modal, o tecla Escape).

### Criterios de aceptación
- [ ] Cada gráfico de la pantalla de resultados tiene su botón de expandir.
- [ ] El gráfico expandido es legible en pantallas grandes (no solo estira el mismo tamaño, aprovecha el espacio extra).

---

## 8. Nada ignora este punto
---

## 9. Gráfica de rangos de edad — cambiar color del rango ">55 años"

**Aplica a:** gráfico de distribución por rangos de edad (probablemente en el Dashboard resultados).

- El rango "más de 55 años" actualmente usa color naranja. Cámbialo a un color distinto que:
  - No sea naranja.
  - No coincida con los colores ya usados para los niveles de riesgo (para evitar que el usuario confunda "riesgo alto" con "grupo etario"), es decir evita rojo/amarillo/verde saturados si esos colores ya están en uso para riesgo.
  - Sugerencia: un tono de morado, azul oscuro o gris azulado suelen funcionar bien como color "neutro" dentro de paletas categóricas.

### Criterios de aceptación
- [ ] El color nuevo es visualmente distinguible del resto de la paleta de rangos de edad.
- [ ] No se reutiliza ningún color ya asignado a niveles de riesgo en otras partes de la app.

---

## 10. Modo privacidad ("ojito") en la pantalla de Participantes

**Aplica a:** pantalla de Participantes (listado).

Esta es la feature más delicada del lote — léela completa antes de implementar.

### Comportamiento
1. Agrega un botón con ícono de "ojo" (mostrar/ocultar) al lado del botón "Nuevo participante".
2. Al activarlo (modo oculto), en el **listado** de participantes se deben enmascarar (no eliminar del DOM, solo visualmente, ej. con `••••••` o similar) las columnas: **cédula, nombre, cargo**.
3. El **cuadro de búsqueda por cédula** debe seguir funcionando exactamente igual a nivel de lógica (filtra los resultados normalmente), pero el texto que el usuario escribe en el input debe mostrarse enmascarado mientras el modo privacidad esté activo (como un input tipo password, `type="password"` o equivalente, pero conservando el filtrado en tiempo real).
4. Este modo **NO debe afectar**:
   - La pantalla de **Editar participante** (al abrir edición, se ve toda la información normal, sin importar si el modo privacidad estaba activo en el listado).
   - La pantalla de **Encuesta** (captura del cuestionario): se ve toda la información normal.
5. Este modo **SÍ debe afectar** la pantalla de **Ver resultados**: cuando el modo privacidad está activo y el usuario entra a ver los resultados de un participante, el **nombre y la cédula** deben mostrarse ocultos/enmascarados en esa pantalla también (el resto de la información de resultados — puntajes, gráficos, niveles de riesgo — se muestra normalmente).
6. El estado del toggle (activo/inactivo) puede vivir en estado local del frontend (no hace falta persistirlo en base de datos, a menos que quieras que se recuerde entre sesiones — en ese caso, guárdalo en `localStorage` o en preferencias de usuario si ya tienes ese concepto).

### Criterios de aceptación
- [ ] Activar el modo oculta cédula, nombre y cargo en el listado, sin afectar otras columnas.
- [ ] El buscador por cédula sigue filtrando correctamente mientras el texto tecleado se ve enmascarado.
- [ ] Abrir "Editar" o "Encuesta" desde el listado siempre muestra los datos completos, sin importar el estado del toggle.
- [ ] Abrir "Ver resultados" respeta el estado del toggle: si estaba activo, nombre y cédula aparecen ocultos también en esa pantalla.
- [ ] Desactivar el modo vuelve a mostrar todo con normalidad en el listado.

---

## 11. Semáforo de programa legacy — Tabla de "Baremos por Departamento"

**Contexto:** este componente ya existe y funciona en la app legacy de graficación, en `official_data/excel-insights-main` (sección Intralaboral, componente `BaremosTableDashboard`). Se debe portar tal cual a la app nueva, adaptando únicamente el origen de los datos (de un parser de archivo local a la API real del backend). El código de referencia y la captura de pantalla ya fueron compartidos — úsalos como fuente de verdad del comportamiento exacto a replicar, no reinventes el diseño.

### Qué es y dónde va
Es una tabla-semáforo llamada **"Baremos por Departamento"**, ubicada como una pestaña más (junto a Demográficos, Intralaboral, Extralaboral, Estrés, Consolidado, Informes) dentro de la vista de resultados de una **Evaluación**. Muestra, para cada departamento/área de la empresa (campo "Departamento o sección de la empresa donde trabaja" de la Ficha de Datos Generales), el promedio de riesgo de cada dimensión y dominio del Intralaboral, separado en columnas **Forma A** y **Forma B**, representado como un círculo de color (semáforo) con opción de mostrar también el número.

### Estructura de la tabla
- **Filas:** todas las dimensiones y dominios del Intralaboral (Forma A y Forma B combinadas en la misma lista de filas, ya que comparten casi todos los nombres — usa el listado del documento de baremos, secciones 1.2 y 2.2). Las filas de dominio van en negrita/mayúscula con fondo distintivo (en el legacy usan `bg-amber-50` + texto en mayúsculas), las de dimensión van indentadas.
- **Columnas:** una columna agrupadora por cada departamento presente en la evaluación (encabezado combinado/merged), y dentro de cada departamento dos subcolumnas: Forma A y Forma B.
- **Celda:** un círculo de color según el nivel de riesgo **promedio** de esa dimensión/dominio en ese departamento y esa forma, calculado sobre los participantes de esa forma en ese departamento. Si no hay datos (ninguna dimensión/dominio no aplica a esa forma, o no hay participantes de esa forma en ese departamento), mostrar `N/A` en texto gris en vez de círculo.

### Cálculo de los promedios (esto es nuevo — en el legacy venía de un archivo, aquí debe venir del backend)
- Para cada combinación (departamento, dimensión/dominio, forma), promediar el **puntaje transformado** de esa dimensión/dominio entre todos los participantes de esa evaluación que: (a) pertenecen a ese departamento, (b) respondieron esa Forma del Intralaboral, y (c) están marcados como `completado = true` (misma regla del punto 4 de este documento — nunca incluir participantes incompletos).
- Con el promedio resultante, determinar el nivel de riesgo comparándolo contra la tabla de baremos de esa dimensión/dominio específica (documento de baremos, secciones 1.4/1.5 para Forma A, 2.4/2.5 para Forma B) — **no promediar niveles de riesgo categóricos**, se promedia el puntaje numérico y luego se clasifica una sola vez.
- Expón esto como un endpoint nuevo, por ejemplo `GET /api/evaluaciones/{id}/baremos-por-departamento`, que devuelva ya armada la estructura `{ departamentos: string[], filas: [{ dimension, esDominio, valores: { [departamento]: { formaA: {puntaje, nivelRiesgo}, formaB: {puntaje, nivelRiesgo} } } }] }` — el mismo shape que usa el componente legacy (`DepartmentBaremosData`), para poder portar el componente casi sin tocar su JSX.

### Funcionalidad a preservar exactamente igual que en el legacy
- **Filtrar Departamentos:** dropdown con checkboxes por departamento + opción "Seleccionar Todos", que oculta/muestra columnas sin perder los datos ya cargados.
- **Mostrar Números y Colores / Mostrar Solo Colores:** toggle que agrega o quita el valor numérico junto al círculo de color.
- **Exportar Excel:** genera un `.xlsx` con encabezados combinados (departamento arriba, Forma A/Forma B abajo) y cada celda con texto tipo `"34.0 (Riesgo bajo)"`.
- **Imprimir:** vista optimizada para impresión en horizontal (landscape), oculta todo lo que no sea la tabla, fuerza impresión de colores de fondo/círculos.
- **Leyenda de colores** al final de la tabla, con los 5 niveles y sus colores exactos tal como están en `RISK_LEVELS`/`riskColors.ts` del legacy (en la captura: Sin riesgo = azul, Riesgo bajo = verde, Riesgo medio = amarillo, Riesgo alto = rojo, Riesgo muy alto = negro — **nota que esta paleta es distinta a la que se use en el resto de la app nueva**; pórtala tal cual para esta tabla específica, no la reemplaces por la paleta general de riesgo de otras pantallas).

### Qué NO portar
- El sistema de **bloqueo premium** (`BAREMOS_UNLOCKED`, la pantalla de "Función Bloqueada" con datos de contacto para desbloquear). Esto era un mecanismo de licenciamiento de la app legacy que no aplica aquí — el cliente ya tiene el sistema completo. Elimina esa lógica por completo y deja siempre la vista "desbloqueada".

### Criterios de aceptación
- [ ] La tabla solo promedia participantes con `completado = true`.
- [ ] El nivel de riesgo mostrado corresponde a clasificar el promedio numérico contra los baremos de esa dimensión/dominio específica, no a promediar niveles categóricos.
- [ ] Filtrar departamentos, alternar números/colores, exportar a Excel e imprimir funcionan igual que en el legacy.
- [ ] No queda ningún rastro del sistema de bloqueo premium (ni el flag, ni la pantalla de contacto, ni el componente `Lock`).
- [ ] La paleta de colores de esta tabla específica coincide con la legacy (azul/verde/amarillo/rojo/negro), aunque difiera de la paleta usada en el resto de la app nueva.

## Puntos extra (no bloqueantes, implementar solo si hay tiempo después de lo anterior)

### B. Carga de base de datos externa (.xlsx) para graficar
- Sección independiente (aislada del flujo normal de captura/resultados, para no mezclar datos reales con datos de prueba) donde el usuario pueda subir un archivo `.xlsx` externo con un formato de columnas ya calculado (similar al que ya manejaste en la app original de graficación) y ver los mismos gráficos/dashboards, **sin persistir esos datos en la base de datos principal** — es una herramienta de visualización ad-hoc, no de captura.
- Reutiliza los componentes de gráficos ya existentes en la pantalla 5.2, cambiando solo la fuente de datos (del backend a un parseo local del archivo subido, por ejemplo con una librería como `xlsx`/`SheetJS` en el frontend).

---

## Orden sugerido de implementación

1. Puntos 4, 5, 6 (reglas de negocio y bug de datos) — son los de mayor riesgo si se dejan para después, porque afectan la integridad de los reportes ya entregados a clientes.
2. Puntos 1, 2, 3 (mejoras de captura) — se benefician de resolverse antes de que se sigan capturando encuestas con el comportamiento actual.
3. Puntos 7, 8, 9, 10 (UI/UX) — sin urgencia funcional, pero de bajo riesgo.
4. Punto 11 y los puntos extra — al final, una vez tengas la aclaración pendiente y si sobra tiempo.