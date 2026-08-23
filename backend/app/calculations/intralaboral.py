from typing import Dict, Any, List
from app.calculations.risk_levels import classify_risk

# --- FORMA A CONFIGURATION ---

INVERSE_ITEMS_FORMA_A = {
    1, 2, 3, 7, 8, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 
    27, 28, 29, 30, 31, 33, 35, 36, 37, 38, 52, 80, 106, 107, 108, 109, 110, 111, 
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123
}

DIMENSIONS_FORMA_A = [
    {"name": "Características del liderazgo", "items": list(range(63, 76)), "factor": 52},
    {"name": "Relaciones sociales en el trabajo", "items": list(range(76, 90)), "factor": 56},
    {"name": "Retroalimentación del desempeño", "items": list(range(90, 95)), "factor": 20},
    {"name": "Relación con los colaboradores", "items": list(range(115, 124)), "factor": 36},
    {"name": "Claridad de rol", "items": list(range(53, 60)), "factor": 28},
    {"name": "Capacitación", "items": list(range(60, 63)), "factor": 12},
    {"name": "Participación y manejo del cambio", "items": list(range(48, 52)), "factor": 16},
    {"name": "Oportunidades para el uso y desarrollo de habilidades y conocimientos", "items": list(range(39, 43)), "factor": 16},
    {"name": "Control y autonomía sobre el trabajo", "items": list(range(44, 47)), "factor": 12},
    {"name": "Demandas ambientales y de esfuerzo físico", "items": list(range(1, 13)), "factor": 48},
    {"name": "Demandas emocionales", "items": list(range(106, 115)), "factor": 36},
    {"name": "Demandas cuantitativas", "items": [13, 14, 15, 32, 43, 47], "factor": 24},
    {"name": "Influencia del trabajo sobre el entorno extralaboral", "items": list(range(35, 39)), "factor": 16},
    {"name": "Exigencias de responsabilidad del cargo", "items": [19, 22, 23, 24, 25, 26], "factor": 24},
    {"name": "Demandas de carga mental", "items": [16, 17, 18, 20, 21], "factor": 20},
    {"name": "Consistencia del rol", "items": [27, 28, 29, 30, 52], "factor": 20},
    {"name": "Demandas de la jornada de trabajo", "items": [31, 33, 34], "factor": 12},
    {"name": "Recompensas derivadas de la pertenencia a la organización", "items": [95, 102, 103, 104, 105], "factor": 20},
    {"name": "Reconocimiento y compensación", "items": list(range(96, 102)), "factor": 24},
]

DOMAINS_FORMA_A = [
    {"name": "Liderazgo y relaciones sociales en el trabajo", "dimensions": ["Características del liderazgo", "Relaciones sociales en el trabajo", "Retroalimentación del desempeño", "Relación con los colaboradores"], "factor": 164},
    {"name": "Control sobre el trabajo", "dimensions": ["Claridad de rol", "Capacitación", "Participación y manejo del cambio", "Oportunidades para el uso y desarrollo de habilidades y conocimientos", "Control y autonomía sobre el trabajo"], "factor": 84},
    {"name": "Demandas del trabajo", "dimensions": ["Demandas ambientales y de esfuerzo físico", "Demandas emocionales", "Demandas cuantitativas", "Influencia del trabajo sobre el entorno extralaboral", "Exigencias de responsabilidad del cargo", "Demandas de carga mental", "Consistencia del rol", "Demandas de la jornada de trabajo"], "factor": 200},
    {"name": "Recompensas", "dimensions": ["Recompensas derivadas de la pertenencia a la organización", "Reconocimiento y compensación"], "factor": 44},
]

BAREMOS_DIMENSIONES_FORMA_A = {
    "Características del liderazgo": [(0.0, 3.8, "Sin riesgo o riesgo despreciable"), (3.9, 15.4, "Riesgo bajo"), (15.5, 30.8, "Riesgo medio"), (30.9, 46.2, "Riesgo alto"), (46.3, 100.0, "Riesgo muy alto")],
    "Relaciones sociales en el trabajo": [(0.0, 5.4, "Sin riesgo o riesgo despreciable"), (5.5, 16.1, "Riesgo bajo"), (16.2, 25.0, "Riesgo medio"), (25.1, 37.5, "Riesgo alto"), (37.6, 100.0, "Riesgo muy alto")],
    "Retroalimentación del desempeño": [(0.0, 10.0, "Sin riesgo o riesgo despreciable"), (10.1, 25.0, "Riesgo bajo"), (25.1, 40.0, "Riesgo medio"), (40.1, 55.0, "Riesgo alto"), (55.1, 100.0, "Riesgo muy alto")],
    "Relación con los colaboradores": [(0.0, 13.9, "Sin riesgo o riesgo despreciable"), (14.0, 25.0, "Riesgo bajo"), (25.1, 33.3, "Riesgo medio"), (33.4, 47.2, "Riesgo alto"), (47.3, 100.0, "Riesgo muy alto")],
    "Claridad de rol": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 10.7, "Riesgo bajo"), (10.8, 21.4, "Riesgo medio"), (21.5, 39.3, "Riesgo alto"), (39.4, 100.0, "Riesgo muy alto")],
    "Capacitación": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 16.7, "Riesgo bajo"), (16.8, 33.3, "Riesgo medio"), (33.4, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Participación y manejo del cambio": [(0.0, 12.5, "Sin riesgo o riesgo despreciable"), (12.6, 25.0, "Riesgo bajo"), (25.1, 37.5, "Riesgo medio"), (37.6, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Oportunidades para el uso y desarrollo de habilidades y conocimientos": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 6.3, "Riesgo bajo"), (6.4, 18.8, "Riesgo medio"), (18.9, 31.3, "Riesgo alto"), (31.4, 100.0, "Riesgo muy alto")],
    "Control y autonomía sobre el trabajo": [(0.0, 8.3, "Sin riesgo o riesgo despreciable"), (8.4, 25.0, "Riesgo bajo"), (25.1, 41.7, "Riesgo medio"), (41.8, 58.3, "Riesgo alto"), (58.4, 100.0, "Riesgo muy alto")],
    "Demandas ambientales y de esfuerzo físico": [(0.0, 14.6, "Sin riesgo o riesgo despreciable"), (14.7, 22.9, "Riesgo bajo"), (23.0, 31.3, "Riesgo medio"), (31.4, 39.6, "Riesgo alto"), (39.7, 100.0, "Riesgo muy alto")],
    "Demandas emocionales": [(0.0, 16.7, "Sin riesgo o riesgo despreciable"), (16.8, 25.0, "Riesgo bajo"), (25.1, 33.3, "Riesgo medio"), (33.4, 47.2, "Riesgo alto"), (47.3, 100.0, "Riesgo muy alto")],
    "Demandas cuantitativas": [(0.0, 25.0, "Sin riesgo o riesgo despreciable"), (25.1, 33.3, "Riesgo bajo"), (33.4, 45.8, "Riesgo medio"), (45.9, 54.2, "Riesgo alto"), (54.3, 100.0, "Riesgo muy alto")],
    "Influencia del trabajo sobre el entorno extralaboral": [(0.0, 18.8, "Sin riesgo o riesgo despreciable"), (18.9, 31.3, "Riesgo bajo"), (31.4, 43.8, "Riesgo medio"), (43.9, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Exigencias de responsabilidad del cargo": [(0.0, 37.5, "Sin riesgo o riesgo despreciable"), (37.6, 54.2, "Riesgo bajo"), (54.3, 66.7, "Riesgo medio"), (66.8, 79.2, "Riesgo alto"), (79.3, 100.0, "Riesgo muy alto")],
    "Demandas de carga mental": [(0.0, 60.0, "Sin riesgo o riesgo despreciable"), (60.1, 70.0, "Riesgo bajo"), (70.1, 80.0, "Riesgo medio"), (80.1, 90.0, "Riesgo alto"), (90.1, 100.0, "Riesgo muy alto")],
    "Consistencia del rol": [(0.0, 15.0, "Sin riesgo o riesgo despreciable"), (15.1, 25.0, "Riesgo bajo"), (25.1, 35.0, "Riesgo medio"), (35.1, 45.0, "Riesgo alto"), (45.1, 100.0, "Riesgo muy alto")],
    "Demandas de la jornada de trabajo": [(0.0, 8.3, "Sin riesgo o riesgo despreciable"), (8.4, 25.0, "Riesgo bajo"), (25.1, 33.3, "Riesgo medio"), (33.4, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Recompensas derivadas de la pertenencia a la organización": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 5.0, "Riesgo bajo"), (5.1, 10.0, "Riesgo medio"), (10.1, 20.0, "Riesgo alto"), (20.1, 100.0, "Riesgo muy alto")],
    "Reconocimiento y compensación": [(0.0, 4.2, "Sin riesgo o riesgo despreciable"), (4.3, 16.7, "Riesgo bajo"), (16.8, 25.0, "Riesgo medio"), (25.1, 37.5, "Riesgo alto"), (37.6, 100.0, "Riesgo muy alto")],
}

BAREMOS_DOMINIOS_FORMA_A = {
    "Liderazgo y relaciones sociales en el trabajo": [(0.0, 9.1, "Sin riesgo o riesgo despreciable"), (9.2, 17.7, "Riesgo bajo"), (17.8, 25.6, "Riesgo medio"), (25.7, 34.8, "Riesgo alto"), (34.9, 100.0, "Riesgo muy alto")],
    "Control sobre el trabajo": [(0.0, 10.7, "Sin riesgo o riesgo despreciable"), (10.8, 19.0, "Riesgo bajo"), (19.1, 29.8, "Riesgo medio"), (29.9, 40.5, "Riesgo alto"), (40.6, 100.0, "Riesgo muy alto")],
    "Demandas del trabajo": [(0.0, 28.5, "Sin riesgo o riesgo despreciable"), (28.6, 35.0, "Riesgo bajo"), (35.1, 41.5, "Riesgo medio"), (41.6, 47.5, "Riesgo alto"), (47.6, 100.0, "Riesgo muy alto")],
    "Recompensas": [(0.0, 4.5, "Sin riesgo o riesgo despreciable"), (4.6, 11.4, "Riesgo bajo"), (11.5, 20.5, "Riesgo medio"), (20.6, 29.5, "Riesgo alto"), (29.6, 100.0, "Riesgo muy alto")],
}

BAREMOS_TOTAL_FORMA_A = [(0.0, 19.7, "Sin riesgo o riesgo despreciable"), (19.8, 25.8, "Riesgo bajo"), (25.9, 31.5, "Riesgo medio"), (31.6, 38.0, "Riesgo alto"), (38.1, 100.0, "Riesgo muy alto")]


# --- FORMA B CONFIGURATION ---

INVERSE_ITEMS_FORMA_B = {
    1, 2, 3, 7, 8, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 66, 89, 90, 91, 92, 93, 94, 95, 96
}

DIMENSIONS_FORMA_B = [
    {"name": "Características del liderazgo", "items": list(range(49, 62)), "factor": 52},
    {"name": "Relaciones sociales en el trabajo", "items": list(range(62, 74)), "factor": 48},
    {"name": "Retroalimentación del desempeño", "items": list(range(74, 79)), "factor": 20},
    {"name": "Claridad de rol", "items": list(range(41, 46)), "factor": 20},
    {"name": "Capacitación", "items": list(range(46, 49)), "factor": 12},
    {"name": "Participación y manejo del cambio", "items": list(range(38, 41)), "factor": 12},
    {"name": "Oportunidades para el uso y desarrollo de habilidades y conocimientos", "items": list(range(29, 33)), "factor": 16},
    {"name": "Control y autonomía sobre el trabajo", "items": list(range(34, 37)), "factor": 12},
    {"name": "Demandas ambientales y de esfuerzo físico", "items": list(range(1, 13)), "factor": 48},
    {"name": "Demandas emocionales", "items": list(range(89, 98)), "factor": 36},
    {"name": "Demandas cuantitativas", "items": [13, 14, 15], "factor": 12},
    {"name": "Influencia del trabajo sobre el entorno extralaboral", "items": list(range(25, 29)), "factor": 16},
    {"name": "Demandas de carga mental", "items": list(range(16, 21)), "factor": 20},
    {"name": "Demandas de la jornada de trabajo", "items": [21, 22, 23, 24, 33, 37], "factor": 24},
    {"name": "Recompensas derivadas de la pertenencia a la organización", "items": list(range(85, 89)), "factor": 16},
    {"name": "Reconocimiento y compensación", "items": list(range(79, 85)), "factor": 24},
]

DOMAINS_FORMA_B = [
    {"name": "Liderazgo y relaciones sociales en el trabajo", "dimensions": ["Características del liderazgo", "Relaciones sociales en el trabajo", "Retroalimentación del desempeño"], "factor": 120},
    {"name": "Control sobre el trabajo", "dimensions": ["Claridad de rol", "Capacitación", "Participación y manejo del cambio", "Oportunidades para el uso y desarrollo de habilidades y conocimientos", "Control y autonomía sobre el trabajo"], "factor": 72},
    {"name": "Demandas del trabajo", "dimensions": ["Demandas ambientales y de esfuerzo físico", "Demandas emocionales", "Demandas cuantitativas", "Influencia del trabajo sobre el entorno extralaboral", "Demandas de carga mental", "Demandas de la jornada de trabajo"], "factor": 156},
    {"name": "Recompensas", "dimensions": ["Recompensas derivadas de la pertenencia a la organización", "Reconocimiento y compensación"], "factor": 40},
]

BAREMOS_DIMENSIONES_FORMA_B = {
    "Características del liderazgo": [(0.0, 3.8, "Sin riesgo o riesgo despreciable"), (3.9, 13.5, "Riesgo bajo"), (13.6, 25.0, "Riesgo medio"), (25.1, 38.5, "Riesgo alto"), (38.6, 100.0, "Riesgo muy alto")],
    "Relaciones sociales en el trabajo": [(0.0, 6.3, "Sin riesgo o riesgo despreciable"), (6.4, 14.6, "Riesgo bajo"), (14.7, 27.1, "Riesgo medio"), (27.2, 37.5, "Riesgo alto"), (37.6, 100.0, "Riesgo muy alto")],
    "Retroalimentación del desempeño": [(0.0, 5.0, "Sin riesgo o riesgo despreciable"), (5.1, 20.0, "Riesgo bajo"), (20.1, 30.0, "Riesgo medio"), (30.1, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Claridad de rol": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 5.0, "Riesgo bajo"), (5.1, 15.0, "Riesgo medio"), (15.1, 30.0, "Riesgo alto"), (30.1, 100.0, "Riesgo muy alto")],
    "Capacitación": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 16.7, "Riesgo bajo"), (16.8, 25.0, "Riesgo medio"), (25.1, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Participación y manejo del cambio": [(0.0, 16.7, "Sin riesgo o riesgo despreciable"), (16.8, 33.3, "Riesgo bajo"), (33.4, 41.7, "Riesgo medio"), (41.8, 58.3, "Riesgo alto"), (58.4, 100.0, "Riesgo muy alto")],
    "Oportunidades para el uso y desarrollo de habilidades y conocimientos": [(0.0, 12.5, "Sin riesgo o riesgo despreciable"), (12.6, 25.0, "Riesgo bajo"), (25.1, 37.5, "Riesgo medio"), (37.6, 56.3, "Riesgo alto"), (56.4, 100.0, "Riesgo muy alto")],
    "Control y autonomía sobre el trabajo": [(0.0, 33.3, "Sin riesgo o riesgo despreciable"), (33.4, 50.0, "Riesgo bajo"), (50.1, 66.7, "Riesgo medio"), (66.8, 75.0, "Riesgo alto"), (75.1, 100.0, "Riesgo muy alto")],
    "Demandas ambientales y de esfuerzo físico": [(0.0, 22.9, "Sin riesgo o riesgo despreciable"), (23.0, 31.3, "Riesgo bajo"), (31.4, 39.6, "Riesgo medio"), (39.7, 47.9, "Riesgo alto"), (48.0, 100.0, "Riesgo muy alto")],
    "Demandas emocionales": [(0.0, 19.4, "Sin riesgo o riesgo despreciable"), (19.5, 27.8, "Riesgo bajo"), (27.9, 38.9, "Riesgo medio"), (39.0, 47.2, "Riesgo alto"), (47.3, 100.0, "Riesgo muy alto")],
    "Demandas cuantitativas": [(0.0, 16.7, "Sin riesgo o riesgo despreciable"), (16.8, 33.3, "Riesgo bajo"), (33.4, 41.7, "Riesgo medio"), (41.8, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Influencia del trabajo sobre el entorno extralaboral": [(0.0, 12.5, "Sin riesgo o riesgo despreciable"), (12.6, 25.0, "Riesgo bajo"), (25.1, 31.3, "Riesgo medio"), (31.4, 50.0, "Riesgo alto"), (50.1, 100.0, "Riesgo muy alto")],
    "Demandas de carga mental": [(0.0, 50.0, "Sin riesgo o riesgo despreciable"), (50.1, 65.0, "Riesgo bajo"), (65.1, 75.0, "Riesgo medio"), (75.1, 85.0, "Riesgo alto"), (85.1, 100.0, "Riesgo muy alto")],
    "Demandas de la jornada de trabajo": [(0.0, 25.0, "Sin riesgo o riesgo despreciable"), (25.1, 37.5, "Riesgo bajo"), (37.6, 45.8, "Riesgo medio"), (45.9, 58.3, "Riesgo alto"), (58.4, 100.0, "Riesgo muy alto")],
    "Recompensas derivadas de la pertenencia a la organización": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 6.3, "Riesgo bajo"), (6.4, 12.5, "Riesgo medio"), (12.6, 18.8, "Riesgo alto"), (18.9, 100.0, "Riesgo muy alto")],
    "Reconocimiento y compensación": [(0.0, 0.9, "Sin riesgo o riesgo despreciable"), (1.0, 12.5, "Riesgo bajo"), (12.6, 25.0, "Riesgo medio"), (25.1, 37.5, "Riesgo alto"), (37.6, 100.0, "Riesgo muy alto")],
}

BAREMOS_DOMINIOS_FORMA_B = {
    "Liderazgo y relaciones sociales en el trabajo": [(0.0, 8.3, "Sin riesgo o riesgo despreciable"), (8.4, 17.5, "Riesgo bajo"), (17.6, 26.7, "Riesgo medio"), (26.8, 38.3, "Riesgo alto"), (38.4, 100.0, "Riesgo muy alto")],
    "Control sobre el trabajo": [(0.0, 19.4, "Sin riesgo o riesgo despreciable"), (19.5, 26.4, "Riesgo bajo"), (26.5, 34.7, "Riesgo medio"), (34.8, 43.1, "Riesgo alto"), (43.2, 100.0, "Riesgo muy alto")],
    "Demandas del trabajo": [(0.0, 26.9, "Sin riesgo o riesgo despreciable"), (27.0, 33.3, "Riesgo bajo"), (33.4, 37.8, "Riesgo medio"), (37.9, 44.2, "Riesgo alto"), (44.3, 100.0, "Riesgo muy alto")],
    "Recompensas": [(0.0, 2.5, "Sin riesgo o riesgo despreciable"), (2.6, 10.0, "Riesgo bajo"), (10.1, 17.5, "Riesgo medio"), (17.6, 27.5, "Riesgo alto"), (27.6, 100.0, "Riesgo muy alto")],
}

BAREMOS_TOTAL_FORMA_B = [(0.0, 20.6, "Sin riesgo o riesgo despreciable"), (20.7, 26.0, "Riesgo bajo"), (26.1, 31.2, "Riesgo medio"), (31.3, 38.7, "Riesgo alto"), (38.8, 100.0, "Riesgo muy alto")]


def score_item(forma: str, q_num: int, val_str: str) -> int:
    """
    Convierte una respuesta dada ("Siempre", "Casi siempre", "Algunas veces", "Casi nunca", "Nunca" o "0".."4")
    en su valor entero según la dirección del ítem (directo vs inverso).
    """
    map_likert = {
        "Siempre": 4, "Casi siempre": 3, "Algunas veces": 2, "Casi nunca": 1, "Nunca": 0,
        "4": 4, "3": 3, "2": 2, "1": 1, "0": 0
    }
    raw_val = map_likert.get(str(val_str).strip(), 0)

    inverse_set = INVERSE_ITEMS_FORMA_A if forma == "A" else INVERSE_ITEMS_FORMA_B

    if q_num in inverse_set:
        # Inverso: Siempre=4, Casi siempre=3, Algunas veces=2, Casi nunca=1, Nunca=0
        return raw_val
    else:
        # Directo: Siempre=0, Casi siempre=1, Algunas veces=2, Casi nunca=3, Nunca=4
        return 4 - raw_val


def calculate_intralaboral(answers_map: Dict[int, str], forma: str) -> Dict[str, Any]:
    """
    Calcula los puntajes brutos, transformados y niveles de riesgo de Intralaboral (Forma A o B).
    answers_map es un diccionario {numero_de_pregunta: valor_respuesta}.
    """
    dimensions_def = DIMENSIONS_FORMA_A if forma == "A" else DIMENSIONS_FORMA_B
    domains_def = DOMAINS_FORMA_A if forma == "A" else DOMAINS_FORMA_B
    baremos_dims = BAREMOS_DIMENSIONES_FORMA_A if forma == "A" else BAREMOS_DIMENSIONES_FORMA_B
    baremos_doms = BAREMOS_DOMINIOS_FORMA_A if forma == "A" else BAREMOS_DOMINIOS_FORMA_B
    baremo_total = BAREMOS_TOTAL_FORMA_A if forma == "A" else BAREMOS_TOTAL_FORMA_B
    total_factor = 492 if forma == "A" else 388

    dimension_results = {}
    dim_raw_sums = {}

    for dim in dimensions_def:
        dim_name = dim["name"]
        items = dim["items"]
        factor = dim["factor"]

        raw_sum = 0
        for item_num in items:
            ans_val = answers_map.get(item_num, "Nunca")
            raw_sum += score_item(forma, item_num, ans_val)

        dim_raw_sums[dim_name] = raw_sum
        score_trans = round((raw_sum / factor) * 100.0, 1) if factor > 0 else 0.0
        risk_level = classify_risk(score_trans, baremos_dims[dim_name])

        dimension_results[dim_name] = {
            "puntaje_bruto": raw_sum,
            "puntaje_transformado": score_trans,
            "nivel_riesgo": risk_level
        }

    domain_results = {}
    for dom in domains_def:
        dom_name = dom["name"]
        dom_dims = dom["dimensions"]
        factor = dom["factor"]

        dom_raw_sum = sum(dim_raw_sums[d] for d in dom_dims if d in dim_raw_sums)
        score_trans = round((dom_raw_sum / factor) * 100.0, 1) if factor > 0 else 0.0
        risk_level = classify_risk(score_trans, baremos_doms[dom_name])

        domain_results[dom_name] = {
            "puntaje_bruto": dom_raw_sum,
            "puntaje_transformado": score_trans,
            "nivel_riesgo": risk_level
        }

    total_raw = sum(dim_raw_sums.values())
    total_trans = round((total_raw / total_factor) * 100.0, 1)
    total_risk = classify_risk(total_trans, baremo_total)

    return {
        "dimensiones": dimension_results,
        "dominios": domain_results,
        "total": {
            "puntaje_bruto": total_raw,
            "puntaje_transformado": total_trans,
            "nivel_riesgo": total_risk
        }
    }
