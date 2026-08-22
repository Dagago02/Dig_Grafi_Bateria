---
trigger: always_on
---

---
description: Reglas para trabajar con la documentación oficial de la batería de riesgo psicosocial
alwaysApply: true
---

# Fuente oficial

Todos los documentos ubicados en:

/official_data/

son la fuente de verdad para implementar la batería de riesgo psicosocial.

Antes de implementar preguntas, fórmulas, baremos, dominios, dimensiones o niveles de riesgo, analizar primero los archivos de esta carpeta.

Nunca inventar ni asumir:

- preguntas
- opciones
- puntuaciones
- fórmulas
- transformaciones
- baremos
- rangos
- dominios
- dimensiones
- niveles de riesgo

Si un dato no está claramente determinado por los documentos de /official_data/, no inventarlo.

Informar la inconsistencia o solicitar aclaración.

Los archivos de /official_data/ son documentos fuente y NO deben modificarse.

Las reglas de cálculo deben implementarse en el backend.

Toda fórmula debe tener pruebas unitarias.

Cuando sea posible, documentar la fuente de cada regla indicando archivo y página/sección.

Las respuestas originales de los participantes deben conservarse y los resultados calculados deben poder recalcularse.