# Baremos y Fórmulas de Transformación
## Batería de Instrumentos para la Evaluación de Factores de Riesgo Psicosocial

**Fuente:** Ministerio de la Protección Social / Pontificia Universidad Javeriana — *Batería de instrumentos para la evaluación de factores de riesgo psicosocial, Manual General* (julio 2010), secciones II (Intralaboral), III (Extralaboral) y VII (Estrés — tercera versión).

Este documento traduce a reglas de negocio explícitas todo lo necesario para que el motor de cálculo (`scoring_engine.py`) transforme las respuestas capturadas de los cuestionarios ya digitalizados (`ficha_datos_generales.json`, `cuestionario_intralaboral_forma_a.json`, `cuestionario_intralaboral_forma_b.json`, `cuestionario_factores_extralaborales.json`, `cuestionario_estres.json`) en niveles de riesgo.

---

## 0. Flujo general de cálculo (los 5 pasos, iguales para los tres instrumentos)

1. **Calificación de los ítems**: cada respuesta (Siempre / Casi siempre / Algunas veces o A veces / Casi nunca / Nunca) se convierte en un número entero según la tabla de dirección de calificación del instrumento (sección correspondiente más abajo). **La dirección de calificación varía por pregunta** — no es la misma para todos los ítems del cuestionario.
2. **Obtención de puntajes brutos**: suma de las calificaciones de los ítems que integran cada dimensión → suma de dimensiones que integran cada dominio → suma de dominios = puntaje bruto total del cuestionario.
3. **Transformación lineal a escala 0-100**:
   ```
   Puntaje transformado = (Puntaje bruto / Factor de transformación) × 100
   ```
   Redondear a **un decimal** (redondeo estándar: si la segunda cifra decimal es ≥5, sube; si es <5, no cambia). El resultado debe quedar siempre entre 0,0 y 100,0; un valor fuera de ese rango indica un error de cálculo.
4. **Comparación con las tablas de baremos** correspondientes (dimensión, dominio, total del cuestionario), que devuelven el nivel de riesgo.
5. **Interpretación del nivel de riesgo** (ver sección 6).

### Reglas de invalidación (aplican a todo el flujo)

- Un ítem no respondido o con doble marcación = dato perdido (no se califica).
- Cada dimensión tiene un mínimo de ítems requeridos para ser válida (ver detalle por instrumento). Si no se cumple, **no se calcula** el puntaje de esa dimensión, ni el del dominio al que pertenece, ni el total general.
- Si el trabajador responde "No" a una pregunta filtro (p. ej. "¿brinda servicio a clientes?" o "¿es jefe de otras personas?"), la dimensión correspondiente **se califica automáticamente en 0**, no se marca como inválida.

---

## 1. Cuestionario Intralaboral — FORMA A (123 ítems)

### 1.1 Dirección de calificación de los ítems (Tabla 21 del manual)

| Grupo | Ítems | Siempre | Casi siempre | Algunas veces | Casi nunca | Nunca |
|---|---|---|---|---|---|---|
| **Directo** | 4, 5, 6, 9, 12, 14, 32, 34, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105 | 0 | 1 | 2 | 3 | 4 |
| **Inverso** | 1, 2, 3, 7, 8, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 35, 36, 37, 38, 52, 80, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123 | 4 | 3 | 2 | 1 | 0 |

### 1.2 Ítems que integran cada dimensión y dominio (Tabla 23)

| Dominio | Dimensión | Ítems (Forma A) | Mínimo respondido |
|---|---|---|---|
| Liderazgo y relaciones sociales en el trabajo | Características del liderazgo | 63–75 | puede faltar 1 |
| | Relaciones sociales en el trabajo | 76–89 | puede faltar 1 |
| | Retroalimentación del desempeño | 90–94 | todos |
| | Relación con los colaboradores (subordinados) | 115–123 | puede faltar 1 (**0 automático si "Soy jefe de otras personas" = No**) |
| Control sobre el trabajo | Claridad de rol | 53–59 | todos |
| | Capacitación | 60–62 | todos |
| | Participación y manejo del cambio | 48–51 | todos |
| | Oportunidades para el uso y desarrollo de habilidades y conocimientos | 39–42 | todos |
| | Control y autonomía sobre el trabajo | 44–46 | todos |
| Demandas del trabajo | Demandas ambientales y de esfuerzo físico | 1–12 | puede faltar 1 |
| | Demandas emocionales | 106–114 | todos (**0 automático si "brindo servicio a clientes o usuarios" = No**) |
| | Demandas cuantitativas | 13, 14, 15, 32, 43, 47 | todos |
| | Influencia del trabajo sobre el entorno extralaboral | 35–38 | todos |
| | Exigencias de responsabilidad del cargo | 19, 22, 23, 24, 25, 26 | todos |
| | Demandas de carga mental | 16, 17, 18, 20, 21 | todos |
| | Consistencia del rol | 27, 28, 29, 30, 52 | todos |
| | Demandas de la jornada de trabajo | 31, 33, 34 | todos |
| Recompensas | Recompensas derivadas de la pertenencia a la organización y del trabajo que se realiza | 95, 102, 103, 104, 105 | todos |
| | Reconocimiento y compensación | 96–101 | todos |

### 1.3 Factores de transformación (denominador de la fórmula) — Forma A

| Nivel | Nombre | Factor |
|---|---|---|
| Dimensión | Características del liderazgo | 52 |
| Dimensión | Relaciones sociales en el trabajo | 56 |
| Dimensión | Retroalimentación del desempeño | 20 |
| Dimensión | Relación con los colaboradores | 36 |
| Dimensión | Claridad de rol | 28 |
| Dimensión | Capacitación | 12 |
| Dimensión | Participación y manejo del cambio | 16 |
| Dimensión | Oportunidades uso/desarrollo de habilidades y conocimientos | 16 |
| Dimensión | Control y autonomía sobre el trabajo | 12 |
| Dimensión | Demandas ambientales y de esfuerzo físico | 48 |
| Dimensión | Demandas emocionales | 36 |
| Dimensión | Demandas cuantitativas | 24 |
| Dimensión | Influencia del trabajo sobre el entorno extralaboral | 16 |
| Dimensión | Exigencias de responsabilidad del cargo | 24 |
| Dimensión | Demandas de carga mental | 20 |
| Dimensión | Consistencia del rol | 20 |
| Dimensión | Demandas de la jornada de trabajo | 12 |
| Dimensión | Recompensas derivadas de la pertenencia a la organización | 20 |
| Dimensión | Reconocimiento y compensación | 24 |
| **Dominio** | Liderazgo y relaciones sociales en el trabajo | **164** |
| **Dominio** | Control sobre el trabajo | **84** |
| **Dominio** | Demandas del trabajo | **200** |
| **Dominio** | Recompensas | **44** |
| **Total cuestionario** | Puntaje total intralaboral Forma A | **492** |
| **Total general** | Intralaboral Forma A + Extralaboral | **616** |

**Ejemplo oficial:** puntaje bruto 34 en "Relaciones sociales en el trabajo" → 34/56×100 = 60,7.

### 1.4 Baremos — Dimensiones, Forma A (Tabla 29)

| Dimensión | Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|---|
| Características del liderazgo | 0,0–3,8 | 3,9–15,4 | 15,5–30,8 | 30,9–46,2 | 46,3–100 |
| Relaciones sociales en el trabajo | 0,0–5,4 | 5,5–16,1 | 16,2–25,0 | 25,1–37,5 | 37,6–100 |
| Retroalimentación del desempeño | 0,0–10,0 | 10,1–25,0 | 25,1–40,0 | 40,1–55,0 | 55,1–100 |
| Relación con los colaboradores | 0,0–13,9 | 14,0–25,0 | 25,1–33,3 | 33,4–47,2 | 47,3–100 |
| Claridad de rol | 0,0–0,9 | 1,0–10,7 | 10,8–21,4 | 21,5–39,3 | 39,4–100 |
| Capacitación | 0,0–0,9 | 1,0–16,7 | 16,8–33,3 | 33,4–50,0 | 50,1–100 |
| Participación y manejo del cambio | 0,0–12,5 | 12,6–25,0 | 25,1–37,5 | 37,6–50,0 | 50,1–100 |
| Oportunidades uso/desarrollo habilidades | 0,0–0,9 | 1,0–6,3 | 6,4–18,8 | 18,9–31,3 | 31,4–100 |
| Control y autonomía sobre el trabajo | 0,0–8,3 | 8,4–25,0 | 25,1–41,7 | 41,8–58,3 | 58,4–100 |
| Demandas ambientales y de esfuerzo físico | 0,0–14,6 | 14,7–22,9 | 23,0–31,3 | 31,4–39,6 | 39,7–100 |
| Demandas emocionales | 0,0–16,7 | 16,8–25,0 | 25,1–33,3 | 33,4–47,2 | 47,3–100 |
| Demandas cuantitativas | 0,0–25,0 | 25,1–33,3 | 33,4–45,8 | 45,9–54,2 | 54,3–100 |
| Influencia del trabajo sobre entorno extralaboral | 0,0–18,8 | 18,9–31,3 | 31,4–43,8 | 43,9–50,0 | 50,1–100 |
| Exigencias de responsabilidad del cargo | 0,0–37,5 | 37,6–54,2 | 54,3–66,7 | 66,8–79,2 | 79,3–100 |
| Demandas de carga mental | 0,0–60,0 | 60,1–70,0 | 70,1–80,0 | 80,1–90,0 | 90,1–100 |
| Consistencia del rol | 0,0–15,0 | 15,1–25,0 | 25,1–35,0 | 35,1–45,0 | 45,1–100 |
| Demandas de la jornada de trabajo | 0,0–8,3 | 8,4–25,0 | 25,1–33,3 | 33,4–50,0 | 50,1–100 |
| Recompensas derivadas de la pertenencia a la organización | 0,0–0,9 | 1,0–5,0 | 5,1–10,0 | 10,1–20,0 | 20,1–100 |
| Reconocimiento y compensación | 0,0–4,2 | 4,3–16,7 | 16,8–25,0 | 25,1–37,5 | 37,6–100 |

### 1.5 Baremos — Dominios, Forma A (Tabla 31)

| Dominio | Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|---|
| Liderazgo y relaciones sociales en el trabajo | 0,0–9,1 | 9,2–17,7 | 17,8–25,6 | 25,7–34,8 | 34,9–100 |
| Control sobre el trabajo | 0,0–10,7 | 10,8–19,0 | 19,1–29,8 | 29,9–40,5 | 40,6–100 |
| Demandas del trabajo | 0,0–28,5 | 28,6–35,0 | 35,1–41,5 | 41,6–47,5 | 47,6–100 |
| Recompensas | 0,0–4,5 | 4,6–11,4 | 11,5–20,5 | 20,6–29,5 | 29,6–100 |

### 1.6 Baremos — Total del cuestionario, Forma A (Tabla 33)

| Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|
| 0,0–19,7 | 19,8–25,8 | 25,9–31,5 | 31,6–38,0 | 38,1–100 |

---

## 2. Cuestionario Intralaboral — FORMA B (97 ítems)

### 2.1 Dirección de calificación de los ítems (Tabla 22 del manual)

| Grupo | Ítems | Siempre | Casi siempre | Algunas veces | Casi nunca | Nunca |
|---|---|---|---|---|---|---|
| **Directo** | 4, 5, 6, 9, 12, 14, 22, 24, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 97 | 0 | 1 | 2 | 3 | 4 |
| **Inverso** | 1, 2, 3, 7, 8, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 66, 89, 90, 91, 92, 93, 94, 95, 96 | 4 | 3 | 2 | 1 | 0 |

### 2.2 Ítems que integran cada dimensión y dominio (Tabla 23)

| Dominio | Dimensión | Ítems (Forma B) | Mínimo respondido |
|---|---|---|---|
| Liderazgo y relaciones sociales en el trabajo | Características del liderazgo | 49–61 | puede faltar 1 |
| | Relaciones sociales en el trabajo | 62–73 | puede faltar 1 |
| | Retroalimentación del desempeño | 74–78 | todos |
| | *(Relación con los colaboradores no aplica a Forma B)* | — | — |
| Control sobre el trabajo | Claridad de rol | 41–45 | todos |
| | Capacitación | 46–48 | todos |
| | Participación y manejo del cambio | 38–40 | todos |
| | Oportunidades para el uso y desarrollo de habilidades y conocimientos | 29–32 | todos |
| | Control y autonomía sobre el trabajo | 34–36 | todos |
| Demandas del trabajo | Demandas ambientales y de esfuerzo físico | 1–12 | puede faltar 1 |
| | Demandas emocionales | 89–97 | todos (**0 automático si "brindo servicio a clientes o usuarios" = No**) |
| | Demandas cuantitativas | 13, 14, 15 | todos |
| | Influencia del trabajo sobre el entorno extralaboral | 25–28 | todos |
| | Demandas de carga mental | 16–20 | todos |
| | Demandas de la jornada de trabajo | 21, 22, 23, 24, 33, 37 | todos |
| | *(Exigencias de responsabilidad del cargo y Consistencia del rol no aplican a Forma B)* | — | — |
| Recompensas | Recompensas derivadas de la pertenencia a la organización y del trabajo que se realiza | 85–88 | todos |
| | Reconocimiento y compensación | 79–84 | todos |

### 2.3 Factores de transformación — Forma B

| Nivel | Nombre | Factor |
|---|---|---|
| Dimensión | Características del liderazgo | 52 |
| Dimensión | Relaciones sociales en el trabajo | 48 |
| Dimensión | Retroalimentación del desempeño | 20 |
| Dimensión | Claridad de rol | 20 |
| Dimensión | Capacitación | 12 |
| Dimensión | Participación y manejo del cambio | 12 |
| Dimensión | Oportunidades uso/desarrollo de habilidades y conocimientos | 16 |
| Dimensión | Control y autonomía sobre el trabajo | 12 |
| Dimensión | Demandas ambientales y de esfuerzo físico | 48 |
| Dimensión | Demandas emocionales | 36 |
| Dimensión | Demandas cuantitativas | 12 |
| Dimensión | Influencia del trabajo sobre el entorno extralaboral | 16 |
| Dimensión | Demandas de carga mental | 20 |
| Dimensión | Demandas de la jornada de trabajo | 24 |
| Dimensión | Recompensas derivadas de la pertenencia a la organización | 16 |
| Dimensión | Reconocimiento y compensación | 24 |
| **Dominio** | Liderazgo y relaciones sociales en el trabajo | **120** |
| **Dominio** | Control sobre el trabajo | **72** |
| **Dominio** | Demandas del trabajo | **156** |
| **Dominio** | Recompensas | **40** |
| **Total cuestionario** | Puntaje total intralaboral Forma B | **388** |
| **Total general** | Intralaboral Forma B + Extralaboral | **512** |

**Ejemplo oficial:** puntaje bruto 7 en "Demandas de la jornada de trabajo" (Forma B) → 7/24×100 = 29,2.

### 2.4 Baremos — Dimensiones, Forma B (Tabla 30)

| Dimensión | Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|---|
| Características del liderazgo | 0,0–3,8 | 3,9–13,5 | 13,6–25,0 | 25,1–38,5 | 38,6–100 |
| Relaciones sociales en el trabajo | 0,0–6,3 | 6,4–14,6 | 14,7–27,1 | 27,2–37,5 | 37,6–100 |
| Retroalimentación del desempeño | 0,0–5,0 | 5,1–20,0 | 20,1–30,0 | 30,1–50,0 | 50,1–100 |
| Claridad de rol | 0,0–0,9 | 1,0–5,0 | 5,1–15,0 | 15,1–30,0 | 30,1–100 |
| Capacitación | 0,0–0,9 | 1,0–16,7 | 16,8–25,0 | 25,1–50,0 | 50,1–100 |
| Participación y manejo del cambio | 0,0–16,7 | 16,8–33,3 | 33,4–41,7 | 41,8–58,3 | 58,4–100 |
| Oportunidades uso/desarrollo habilidades | 0,0–12,5 | 12,6–25,0 | 25,1–37,5 | 37,6–56,3 | 56,4–100 |
| Control y autonomía sobre el trabajo | 0,0–33,3 | 33,4–50,0 | 50,1–66,7 | 66,8–75,0 | 75,1–100 |
| Demandas ambientales y de esfuerzo físico | 0,0–22,9 | 23,0–31,3 | 31,4–39,6 | 39,7–47,9 | 48,0–100 |
| Demandas emocionales | 0,0–19,4 | 19,5–27,8 | 27,9–38,9 | 39,0–47,2 | 47,3–100 |
| Demandas cuantitativas | 0,0–16,7 | 16,8–33,3 | 33,4–41,7 | 41,8–50,0 | 50,1–100 |
| Influencia del trabajo sobre entorno extralaboral | 0,0–12,5 | 12,6–25,0 | 25,1–31,3 | 31,4–50,0 | 50,1–100 |
| Demandas de carga mental | 0,0–50,0 | 50,1–65,0 | 65,1–75,0 | 75,1–85,0 | 85,1–100 |
| Demandas de la jornada de trabajo | 0,0–25,0 | 25,1–37,5 | 37,6–45,8 | 45,9–58,3 | 58,4–100 |
| Recompensas derivadas de la pertenencia a la organización | 0,0–0,9 | 1,0–6,3 | 6,4–12,5 | 12,6–18,8 | 18,9–100 |
| Reconocimiento y compensación | 0,0–0,9 | 1,0–12,5 | 12,6–25,0 | 25,1–37,5 | 37,6–100 |

### 2.5 Baremos — Dominios, Forma B (Tabla 32)

| Dominio | Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|---|
| Liderazgo y relaciones sociales en el trabajo | 0,0–8,3 | 8,4–17,5 | 17,6–26,7 | 26,8–38,3 | 38,4–100 |
| Control sobre el trabajo | 0,0–19,4 | 19,5–26,4 | 26,5–34,7 | 34,8–43,1 | 43,2–100 |
| Demandas del trabajo | 0,0–26,9 | 27,0–33,3 | 33,4–37,8 | 37,9–44,2 | 44,3–100 |
| Recompensas | 0,0–2,5 | 2,6–10,0 | 10,1–17,5 | 17,6–27,5 | 27,6–100 |

### 2.6 Baremos — Total del cuestionario, Forma B (Tabla 33)

| Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|
| 0,0–20,6 | 20,7–26,0 | 26,1–31,2 | 31,3–38,7 | 38,8–100 |

---

## 3. Cuestionario de Factores Psicosociales Extralaborales (31 ítems)

### 3.1 Dirección de calificación de los ítems (Tabla 11 del manual)

| Grupo | Ítems | Siempre | Casi siempre | Algunas veces | Casi nunca | Nunca |
|---|---|---|---|---|---|---|
| **Directo** | 1, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 27, 29 | 0 | 1 | 2 | 3 | 4 |
| **Inverso** | 2, 3, 6, 24, 26, 28, 30, 31 | 4 | 3 | 2 | 1 | 0 |

### 3.2 Ítems que integran cada dimensión (Tabla 12) — no hay dominios, solo dimensiones

| Dimensión | Ítems | Factor de transformación |
|---|---|---|
| Tiempo fuera del trabajo | 14, 15, 16, 17 | 16 |
| Relaciones familiares | 22, 25, 27 | 12 |
| Comunicación y relaciones interpersonales | 18, 19, 20, 21, 23 | 20 |
| Situación económica del grupo familiar | 29, 30, 31 | 12 |
| Características de la vivienda y de su entorno | 5, 6, 7, 8, 9, 10, 11, 12, 13 | 36 (puede faltar 1 ítem) |
| Influencia del entorno extralaboral sobre el trabajo | 24, 26, 28 | 12 |
| Desplazamiento vivienda-trabajo-vivienda | 1, 2, 3, 4 | 16 |
| **Total del cuestionario extralaboral** | Suma de las 7 dimensiones | **124** |
| **Total general (intra + extra)** | Forma A: 616 / Forma B: 512 | ver secciones 1.3 y 2.3 |

Todas las dimensiones requieren el 100% de los ítems respondidos, **excepto** "Características de la vivienda y de su entorno", que admite hasta 1 ítem sin responder.

**Ejemplo oficial:** puntaje bruto 4 en "Situación económica del grupo familiar" → 4/12×100 = 33,3.

### 3.3 Baremos — ¡diferenciados por nivel ocupacional del trabajador!

El extralaboral usa **dos tablas de baremos distintas** según el cargo del participante (dato que ya se captura en la Ficha de Datos Generales, pregunta 14 "Tipo de cargo"):

- **Grupo 1 — Jefatura, profesionales o técnicos** (Ficha de Datos Generales opción "Jefatura - tiene personal a cargo" u "Profesional, analista, técnico, tecnólogo") → Tabla 17.
- **Grupo 2 — Auxiliares y operarios** (Ficha de Datos Generales opción "Auxiliar, asistente administrativo, asistente técnico" u "Operario, operador, ayudante, servicios generales") → Tabla 18.

#### Tabla 17 — Grupo 1: Jefatura, profesionales o técnicos

| Dimensión / Total | Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|---|
| Tiempo fuera del trabajo | 0,0–6,3 | 6,4–25,0 | 25,1–37,5 | 37,6–50,0 | 50,1–100 |
| Relaciones familiares | 0,0–0,9 | 1,0–8,3 | 8,4–16,7 | 16,8–25,0 | 25,1–100 |
| Comunicación y relaciones interpersonales | 0,0–0,9 | 1,0–10,0 | 10,1–20,0 | 20,1–30,0 | 30,1–100 |
| Situación económica del grupo familiar | 0,0–8,3 | 8,4–25,0 | 25,1–33,3 | 33,4–50,0 | 50,1–100 |
| Características de la vivienda y de su entorno | 0,0–5,6 | 5,7–11,1 | 11,2–13,9 | 14,0–22,2 | 22,3–100 |
| Influencia del entorno extralaboral sobre el trabajo | 0,0–8,3 | 8,4–16,7 | 16,8–25,0 | 25,1–41,7 | 41,8–100 |
| Desplazamiento vivienda-trabajo-vivienda | 0,0–0,9 | 1,0–12,5 | 12,6–25,0 | 25,1–43,8 | 43,9–100 |
| **Total del cuestionario extralaboral** | **0,0–11,3** | **11,4–16,9** | **17,0–22,6** | **22,7–29,0** | **29,1–100** |

#### Tabla 18 — Grupo 2: Auxiliares y operarios

| Dimensión / Total | Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|---|
| Tiempo fuera del trabajo | 0,0–6,3 | 6,4–25,0 | 25,1–37,5 | 37,6–50,0 | 50,1–100 |
| Relaciones familiares | 0,0–0,9 | 1,0–8,3 | 8,4–25,0 | 25,1–33,3 | 33,4–100 |
| Comunicación y relaciones interpersonales | 0,0–5,0 | 5,1–15,0 | 15,1–25,0 | 25,1–35,0 | 35,1–100 |
| Situación económica del grupo familiar | 0,0–16,7 | 16,8–25,0 | 25,1–41,7 | 41,8–50,0 | 50,1–100 |
| Características de la vivienda y de su entorno | 0,0–5,6 | 5,7–11,1 | 11,2–16,7 | 16,8–27,8 | 27,9–100 |
| Influencia del entorno extralaboral sobre el trabajo | 0,0–0,9 | 1,0–16,7 | 16,8–25,0 | 25,1–41,7 | 41,8–100 |
| Desplazamiento vivienda-trabajo-vivienda | 0,0–0,9 | 1,0–12,5 | 12,6–25,0 | 25,1–43,8 | 43,9–100 |
| **Total del cuestionario extralaboral** | **0,0–12,9** | **13,0–17,7** | **17,8–24,2** | **24,3–32,3** | **32,4–100** |

---

## 4. Cuestionario para la Evaluación del Estrés — Tercera versión (31 ítems)

Este cuestionario **no se descompone en dominios ni dimensiones calificables**: solo produce un puntaje total válido. Los 4 grupos de síntomas (fisiológicos, comportamiento social, intelectuales/laborales, psicoemocionales) son puramente descriptivos, no se baremizan por separado.

### 4.1 Dirección y valor de calificación de los ítems (Tabla 4 del manual — escala de 0 a 9, distinta a los otros instrumentos)

| Grupo | Ítems | Siempre | Casi siempre | A veces | Nunca |
|---|---|---|---|---|---|
| A | 1, 2, 3, 9, 13, 14, 15, 23, 24 | 9 | 6 | 3 | 0 |
| B | 4, 5, 6, 10, 11, 16, 17, 18, 19, 25, 26, 27, 28 | 6 | 4 | 2 | 0 |
| C | 7, 8, 12, 20, 21, 22, 29, 30, 31 | 3 | 2 | 1 | 0 |

> Nota: en este cuestionario todos los ítems son de dirección "directa" (a mayor frecuencia, mayor puntaje = mayor síntoma); lo que cambia entre grupos es la ponderación máxima del ítem (9, 6 o 3), no el sentido. Esto es distinto a los otros dos cuestionarios (donde sí hay verdaderos ítems inversos).

### 4.2 Cálculo del puntaje bruto total (fórmula especial — promedios ponderados por bloque de ítems)

El puntaje bruto **no es una simple suma de los 31 ítems**; es la suma de 4 subtotales, cada uno obtenido como el promedio de un bloque de ítems multiplicado por un factor:

```
a = promedio(ítems 1 a 8)   × 4
b = promedio(ítems 9 a 12)  × 3
c = promedio(ítems 13 a 22) × 2
d = promedio(ítems 23 a 31) × 1

Puntaje bruto total = a + b + c + d
```

Requiere el 100% de los 31 ítems respondidos; si falta uno, no se calcula el puntaje.

### 4.3 Transformación a escala 0-100

```
Puntaje transformado = (Puntaje bruto total / 61,16) × 100
```

Redondeo a un decimal, igual que los demás instrumentos.

### 4.4 Baremos — diferenciados por nivel ocupacional (Tabla 6), misma agrupación que en el Extralaboral

| Nivel de estrés | Jefes, profesionales y técnicos | Auxiliares y operarios |
|---|---|---|
| Muy bajo | 0,0–7,8 | 0,0–6,5 |
| Bajo | 7,9–12,6 | 6,6–11,8 |
| Medio | 12,7–17,7 | 11,9–17,0 |
| Alto | 17,8–25,0 | 17,1–23,4 |
| Muy alto | 25,1–100 | 23,5–100 |

> Nota de nomenclatura: el cuestionario de estrés usa las etiquetas **Muy bajo / Bajo / Medio / Alto / Muy alto**, mientras que Intralaboral y Extralaboral usan **Sin riesgo o riesgo despreciable / Riesgo bajo / Riesgo medio / Riesgo alto / Riesgo muy alto**. Son escalas de 5 niveles equivalentes en estructura pero con nombres distintos — mantenerlas literales tal como aparecen en el manual al mostrarlas en el frontend.

---

## 5. Puntaje total general de la evaluación (Intralaboral + Extralaboral)

Solo se calcula si a un mismo participante se le aplicaron **ambos** cuestionarios (intralaboral y extralaboral). El cuestionario de estrés **no entra** en esta suma.

```
Puntaje bruto general = Puntaje bruto total intralaboral + Puntaje bruto total extralaboral

Puntaje transformado = (Puntaje bruto general / Factor) × 100
```

| Combinación | Factor |
|---|---|
| Intralaboral Forma A + Extralaboral | 616 |
| Intralaboral Forma B + Extralaboral | 512 |

### Baremos — Total general (Tabla 34)

| Combinación | Sin riesgo / despreciable | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo muy alto |
|---|---|---|---|---|---|
| Intralaboral Forma A + Extralaboral | 0,0–18,8 | 18,9–24,4 | 24,5–29,5 | 29,6–35,4 | 35,5–100 |
| Intralaboral Forma B + Extralaboral | 0,0–19,9 | 20,0–24,8 | 24,9–29,5 | 29,6–35,4 | 35,5–100 |

---

## 6. Interpretación de los niveles de riesgo (texto oficial para mostrar en reportes)

- **Sin riesgo o riesgo despreciable**: ausencia de riesgo o riesgo tan bajo que no amerita intervención. Objeto de acciones o programas de promoción.
- **Riesgo bajo**: no se espera relación con síntomas o respuestas de estrés significativas. Objeto de acciones de intervención para mantenerlo en niveles bajos.
- **Riesgo medio**: se esperaría una respuesta de estrés moderada. Amerita observación y acciones sistemáticas de intervención.
- **Riesgo alto**: síntomas más críticos y frecuentes; requiere intervención en el marco de un sistema de vigilancia epidemiológica.
- **Riesgo muy alto**: respuesta de estrés severa y perjudicial para la salud; requiere intervención inmediata en el marco de un sistema de vigilancia epidemiológica.

(Para el cuestionario de estrés, las etiquetas equivalentes son Muy bajo / Bajo / Medio / Alto / Muy alto, con interpretaciones análogas centradas en frecuencia e intensidad de síntomas.)

---

## 7. Cómo se determinan Forma A/B y el grupo ocupacional (baremos diferenciales) a partir de la Ficha de Datos Generales

La pregunta 14 de la Ficha de Datos Generales ("Tipo de cargo que más se parece al que usted desempeña") es la que gobierna **dos decisiones** del motor de cálculo:

| Opción de la pregunta 14 | Forma del Intralaboral a aplicar | Grupo de baremos para Extralaboral y Estrés |
|---|---|---|
| Jefatura - tiene personal a cargo | Forma A | Jefatura, profesionales o técnicos |
| Profesional, analista, técnico, tecnólogo | Forma A | Jefatura, profesionales o técnicos |
| Auxiliar, asistente administrativo, asistente técnico | Forma B | Auxiliares y operarios |
| Operario, operador, ayudante, servicios generales | Forma B | Auxiliares y operarios |

Se recomienda modelar este campo como un `nivel_ocupacional` derivado (`jefatura_profesional_tecnico` | `auxiliar_operario`) en el modelo `Participante`, calculado una sola vez al capturar la Ficha de Datos Generales, y usado luego tanto para elegir el cuestionario intralaboral correcto como para seleccionar la tabla de baremos correspondiente en Extralaboral y Estrés.

---

## 8. Notas para la implementación del `scoring_engine.py`

1. **Estructura de datos recomendada**: por cada instrumento, una tabla/JSON de configuración con: `item_id → dirección(directo/inverso)`, `dimension_id → [item_ids], factor_transformacion, minimo_items_requeridos`, `dominio_id → [dimension_ids], factor_transformacion` (cuando aplique), y `baremos[nivel_ocupacional?][dimension_id|dominio_id|total] → [(min, max, nivel_riesgo), ...]`. Este documento ya trae todos esos valores tabulados arriba, listos para volcarse a dichos JSON de configuración.
2. **No hardcodear** los factores de transformación ni los rangos de baremos en el código Python: cárguense desde configuración (JSON/tablas), tal como se recomendó en el prompt de Cursor, para que sean auditables y editables sin tocar código.
3. **Casos especiales a programar explícitamente**:
   - Ceros automáticos por preguntas filtro (Demandas emocionales / Relación con los colaboradores en Intralaboral).
   - Tolerancia de 1 ítem sin responder en las dimensiones específicas señaladas (no todas las dimensiones la tienen).
   - Cuestionario de Estrés: cálculo por promedios ponderados de bloques, **no** por suma simple de dimensiones/dominios.
   - Selección de tabla de baremos según `nivel_ocupacional` en Extralaboral y Estrés (Intralaboral ya se resuelve por elegir Forma A o B).
4. **Redondeo**: aplicar redondeo estándar a 1 decimal de forma consistente en todos los puntajes transformados, antes de comparar contra baremos (un redondeo distinto puede cambiar el nivel de riesgo resultante cerca de los límites de los rangos).
5. **Validación de rango**: cualquier puntaje transformado fuera de 0,0–100,0 debe tratarse como error de cálculo, no como dato válido.
