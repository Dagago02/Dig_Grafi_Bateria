from typing import Dict, Any
from app.calculations.risk_levels import classify_risk
from app.calculations.likert import likert_frequency_0_4

INVERSE_ITEMS_EXTRALABORAL = {2, 3, 6, 24, 26, 28, 30, 31}

DIMENSIONS_EXTRALABORAL = [
    {"name": "Tiempo fuera del trabajo", "items": [14, 15, 16, 17], "factor": 16},
    {"name": "Relaciones familiares", "items": [22, 25, 27], "factor": 12},
    {"name": "Comunicación y relaciones interpersonales", "items": [18, 19, 20, 21, 23], "factor": 20},
    {"name": "Situación económica del grupo familiar", "items": [29, 30, 31], "factor": 12},
    {"name": "Características de la vivienda y de su entorno", "items": [5, 6, 7, 8, 9, 10, 11, 12, 13], "factor": 36},
    {"name": "Influencia del entorno extralaboral sobre el trabajo", "items": [24, 26, 28], "factor": 12},
    {"name": "Desplazamiento vivienda-trabajo-vivienda", "items": [1, 2, 3, 4], "factor": 16},
]

# Tabla 17 — Grupo 1: Jefes, profesionales o técnicos
BAREMOS_GRUPO1 = {
    "Tiempo fuera del trabajo": [(0.0, 6.3, "Sin riesgo o riesgo despreciable"), (6.4, 25.0, "Riesgo bajo"), (25.1, 37.5, "Riesgo medio"), (37.6, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Relaciones familiares": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 8.3, "Riesgo bajo"), (8.4, 16.7, "Riesgo medio"), (16.8, 25.0, "Riesgo alto"), (25.1, 100.0, "Riesgo muy alto")],
    "Comunicación y relaciones interpersonales": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 10.0, "Riesgo bajo"), (10.1, 20.0, "Riesgo medio"), (20.1, 30.0, "Riesgo alto"), (30.1, 100.0, "Riesgo muy alto")],
    "Situación económica del grupo familiar": [(0.0, 8.3, "Sin riesgo o riesgo despreciable"), (8.4, 25.0, "Riesgo bajo"), (25.1, 33.3, "Riesgo medio"), (33.4, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Características de la vivienda y de su entorno": [(0.0, 5.6, "Sin riesgo o riesgo despreciable"), (5.7, 11.1, "Riesgo bajo"), (11.2, 13.9, "Riesgo medio"), (14.0, 22.2, "Riesgo alto"), (22.3, 100.0, "Riesgo muy alto")],
    "Influencia del entorno extralaboral sobre el trabajo": [(0.0, 8.3, "Sin riesgo o riesgo despreciable"), (8.4, 16.7, "Riesgo bajo"), (16.8, 25.0, "Riesgo medio"), (25.1, 41.7, "Riesgo alto"), (41.8, 100.0, "Riesgo muy alto")],
    "Desplazamiento vivienda-trabajo-vivienda": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 12.5, "Riesgo bajo"), (12.6, 25.0, "Riesgo medio"), (25.1, 43.8, "Riesgo alto"), (43.9, 100.0, "Riesgo muy alto")],
    "Total": [(0.0, 11.3, "Sin riesgo o riesgo despreciable"), (11.4, 16.9, "Riesgo bajo"), (17.0, 22.6, "Riesgo medio"), (22.7, 29.0, "Riesgo alto"), (29.1, 100.0, "Riesgo muy alto")]
}

# Tabla 18 — Grupo 2: Auxiliares y operarios
BAREMOS_GRUPO2 = {
    "Tiempo fuera del trabajo": [(0.0, 6.3, "Sin riesgo o riesgo despreciable"), (6.4, 25.0, "Riesgo bajo"), (25.1, 37.5, "Riesgo medio"), (37.6, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Relaciones familiares": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 8.3, "Riesgo bajo"), (8.4, 25.0, "Riesgo medio"), (25.1, 33.3, "Riesgo alto"), (33.4, 100.0, "Riesgo muy alto")],
    "Comunicación y relaciones interpersonales": [(0.0, 5.0, "Sin riesgo o riesgo despreciable"), (5.1, 15.0, "Riesgo bajo"), (15.1, 25.0, "Riesgo medio"), (25.1, 35.0, "Riesgo alto"), (35.1, 100.0, "Riesgo muy alto")],
    "Situación económica del grupo familiar": [(0.0, 16.7, "Sin riesgo o riesgo despreciable"), (16.8, 25.0, "Riesgo bajo"), (25.1, 41.7, "Riesgo medio"), (41.8, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Características de la vivienda y de su entorno": [(0.0, 5.6, "Sin riesgo o riesgo despreciable"), (5.7, 11.1, "Riesgo bajo"), (11.2, 16.7, "Riesgo medio"), (16.8, 27.8, "Riesgo alto"), (27.9, 100.0, "Riesgo muy alto")],
    "Influencia del entorno extralaboral sobre el trabajo": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 16.7, "Riesgo bajo"), (16.8, 25.0, "Riesgo medio"), (25.1, 41.7, "Riesgo alto"), (41.8, 100.0, "Riesgo muy alto")],
    "Desplazamiento vivienda-trabajo-vivienda": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 12.5, "Riesgo bajo"), (12.6, 25.0, "Riesgo medio"), (25.1, 43.8, "Riesgo alto"), (43.9, 100.0, "Riesgo muy alto")],
    "Total": [(0.0, 12.9, "Sin riesgo o riesgo despreciable"), (13.0, 17.7, "Riesgo bajo"), (17.8, 24.2, "Riesgo medio"), (24.3, 32.3, "Riesgo alto"), (32.4, 100.0, "Riesgo muy alto")]
}

def score_item_extralaboral(q_num: int, val_str: str) -> int:
    raw_val = likert_frequency_0_4(val_str)
    if q_num in INVERSE_ITEMS_EXTRALABORAL:
        return raw_val
    else:
        return 4 - raw_val

def calculate_extralaboral(answers_map: Dict[int, str], grupo_ocupacional: int = 1) -> Dict[str, Any]:
    """
    Calcula los puntajes de Extralaboral.
    grupo_ocupacional = 1 para Jefes/Profesionales/Técnicos (Forma A), 2 para Auxiliares/Operarios (Forma B).
    """
    baremos = BAREMOS_GRUPO1 if grupo_ocupacional == 1 else BAREMOS_GRUPO2
    dimension_results = {}
    dim_raw_sums = {}

    for dim in DIMENSIONS_EXTRALABORAL:
        dim_name = dim["name"]
        items = dim["items"]
        factor = dim["factor"]

        raw_sum = 0
        for item_num in items:
            ans_val = answers_map.get(item_num, "Nunca")
            raw_sum += score_item_extralaboral(item_num, ans_val)

        dim_raw_sums[dim_name] = raw_sum
        score_trans = round((raw_sum / factor) * 100.0, 1) if factor > 0 else 0.0
        risk_level = classify_risk(score_trans, baremos[dim_name])

        dimension_results[dim_name] = {
            "puntaje_bruto": raw_sum,
            "puntaje_transformado": score_trans,
            "nivel_riesgo": risk_level
        }

    total_raw = sum(dim_raw_sums.values())
    total_trans = round((total_raw / 124.0) * 100.0, 1)
    total_risk = classify_risk(total_trans, baremos["Total"])

    return {
        "dimensiones": dimension_results,
        "total": {
            "puntaje_bruto": total_raw,
            "puntaje_transformado": total_trans,
            "nivel_riesgo": total_risk
        }
    }
