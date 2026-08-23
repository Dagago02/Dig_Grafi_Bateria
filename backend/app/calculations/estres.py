from typing import Dict, Any
from app.calculations.risk_levels import classify_risk

GROUP_A_ITEMS = {1, 2, 3, 9, 13, 14, 15, 23, 24}
GROUP_B_ITEMS = {4, 5, 6, 10, 11, 16, 17, 18, 19, 25, 26, 27, 28}
GROUP_C_ITEMS = {7, 8, 12, 20, 21, 22, 29, 30, 31}

BAREMOS_ESTRES_GRUPO1 = [
    (0.0, 7.8, "Muy bajo"),
    (7.9, 12.6, "Bajo"),
    (12.7, 17.7, "Medio"),
    (17.8, 25.0, "Alto"),
    (25.1, 100.0, "Muy alto")
]

BAREMOS_ESTRES_GRUPO2 = [
    (0.0, 6.5, "Muy bajo"),
    (6.6, 11.8, "Bajo"),
    (11.9, 17.0, "Medio"),
    (17.1, 23.4, "Alto"),
    (23.5, 100.0, "Muy alto")
]

def score_item_estres(q_num: int, val_str: str) -> float:
    map_opt = {
        "Siempre": 3, "Casi siempre": 2, "A veces": 1, "Algunas veces": 1, "Nunca": 0,
        "3": 3, "2": 2, "1": 1, "0": 0
    }
    raw = map_opt.get(str(val_str).strip(), 0)

    if q_num in GROUP_A_ITEMS:
        # 3->9, 2->6, 1->3, 0->0
        return float(raw * 3)
    elif q_num in GROUP_B_ITEMS:
        # 3->6, 2->4, 1->2, 0->0
        return float(raw * 2)
    else: # GROUP C
        # 3->3, 2->2, 1->1, 0->0
        return float(raw * 1)

def calculate_estres(answers_map: Dict[int, str], grupo_ocupacional: int = 1) -> Dict[str, Any]:
    """
    Calcula el puntaje de Estrés mediante la fórmula de promedios ponderados por bloque:
    a = promedio(1..8) * 4
    b = promedio(9..12) * 3
    c = promedio(13..22) * 2
    d = promedio(23..31) * 1
    Total Bruto = a + b + c + d
    Puntaje Transformado = (Total Bruto / 61.16) * 100
    """
    scores = {}
    for q_num in range(1, 32):
        val_str = answers_map.get(q_num, "Nunca")
        scores[q_num] = score_item_estres(q_num, val_str)

    block_1_8 = [scores[i] for i in range(1, 9)]
    block_9_12 = [scores[i] for i in range(9, 13)]
    block_13_22 = [scores[i] for i in range(13, 23)]
    block_23_31 = [scores[i] for i in range(23, 32)]

    a = (sum(block_1_8) / len(block_1_8)) * 4.0
    b = (sum(block_9_12) / len(block_9_12)) * 3.0
    c = (sum(block_13_22) / len(block_13_22)) * 2.0
    d = (sum(block_23_31) / len(block_23_31)) * 1.0

    raw_total = a + b + c + d
    trans_total = round((raw_total / 61.16) * 100.0, 1)

    baremos = BAREMOS_ESTRES_GRUPO1 if grupo_ocupacional == 1 else BAREMOS_ESTRES_GRUPO2
    risk_level = classify_risk(trans_total, baremos)

    return {
        "total": {
            "puntaje_bruto": round(raw_total, 2),
            "puntaje_transformado": trans_total,
            "nivel_riesgo": risk_level
        }
    }
