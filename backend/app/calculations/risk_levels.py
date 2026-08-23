from typing import Tuple

def classify_risk(score: float, ranges: list[tuple[float, float, str]]) -> str:
    """
    Compara un puntaje transformado (0.0 - 100.0) contra una tabla de rangos [(min, max, nivel), ...]
    y devuelve la categoría correspondiente.
    """
    score_rounded = round(score, 1)
    for min_val, max_val, level in ranges:
        if min_val <= score_rounded <= max_val:
            return level
    # Edge fallback: if score slightly above 100 or below 0 due to rounding
    if score_rounded < ranges[0][0]:
        return ranges[0][2]
    return ranges[-1][2]

RISK_INTERPRETATIONS = {
    "Sin riesgo o riesgo despreciable": "Ausencia de riesgo o riesgo tan bajo que no amerita intervención. Objeto de acciones o programas de promoción.",
    "Riesgo bajo": "No se espera relación con síntomas o respuestas de estrés significativas. Objeto de acciones de intervención para mantenerlo en niveles bajos.",
    "Riesgo medio": "Se esperaría una respuesta de estrés moderada. Amerita observación y acciones sistemáticas de intervención.",
    "Riesgo alto": "Síntomas más críticos y frecuentes; requiere intervención en el marco de un sistema de vigilancia epidemiológica.",
    "Riesgo muy alto": "Respuesta de estrés severa y perjudicial para la salud; requiere intervención inmediata en el marco de un sistema de vigilancia epidemiológica.",
    # Para cuestionario de estrés:
    "Muy bajo": "Ausencia de síntomas de estrés o presencia tan baja que no genera repercusiones.",
    "Bajo": "Síntomas de estrés bajos.",
    "Medio": "Respuesta de estrés moderada. Requiere acciones de prevención y manejo del estrés.",
    "Alto": "Nivel de estrés alto con sintomatología frecuente. Requiere intervención dentro del sistema de vigilancia.",
    "Muy alto": "Nivel de estrés muy alto con severas reacciones fisiológicas y emocionales. Intervención inmediata."
}
