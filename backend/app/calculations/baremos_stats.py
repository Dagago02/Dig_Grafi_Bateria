from sqlalchemy.orm import Session
from collections import defaultdict
from app.models.participant import Participant
from app.models.result import Result
from app.calculations.intralaboral import (
    BAREMOS_DIMENSIONES_FORMA_A, BAREMOS_DIMENSIONES_FORMA_B,
    BAREMOS_DOMINIOS_FORMA_A, BAREMOS_DOMINIOS_FORMA_B,
    DOMAINS_FORMA_A, DOMAINS_FORMA_B,
    BAREMOS_TOTAL_FORMA_A, BAREMOS_TOTAL_FORMA_B
)
from app.calculations.risk_levels import classify_risk

def calculate_baremos_por_departamento(evaluation_id: int, db: Session):
    participants = db.query(Participant).filter(
        Participant.evaluacion_id == evaluation_id,
        Participant.estado_evaluacion == 'completado'
    ).all()
    
    if not participants:
        return {"departments": [], "rows": []}

    part_map = {p.id: p for p in participants}
    participant_ids = list(part_map.keys())
    
    results = db.query(Result).filter(
        Result.participant_id.in_(participant_ids),
        Result.componente.in_(["intralaboral_A", "intralaboral_B"])
    ).all()

    departments = set()
    for p in participants:
        dept = (p.area or "No especificado").strip()
        departments.add(dept)
    
    departments = sorted(list(departments))

    stats = defaultdict(lambda: defaultdict(lambda: {"A": {"sum": 0.0, "count": 0}, "B": {"sum": 0.0, "count": 0}}))

    for r in results:
        if r.tipo_resultado not in ["dimension", "dominio", "general"]:
            continue
            
        # Only include general if it is intralaboral
        if r.tipo_resultado == "general" and r.nombre_target != "intralaboral":
            continue
            
        p = part_map[r.participant_id]
        dept = (p.area or "No especificado").strip()
        forma = p.tipo_forma or 'A'
        
        dim = r.nombre_target
        if r.tipo_resultado == "general" and dim == "intralaboral":
            dim = "PUNTAJE TOTAL del cuestionario de factores de riesgo psicosocial intralaboral"
        
        stats[dim][dept][forma]["sum"] += r.puntaje_transformado
        stats[dim][dept][forma]["count"] += 1

    # Define row order
    row_order = []
    seen = set()
    for dom in DOMAINS_FORMA_A:
        name = dom["name"]
        if name not in seen:
            row_order.append((name, True))
            seen.add(name)
        for dim in dom["dimensions"]:
            if dim not in seen:
                row_order.append((dim, False))
                seen.add(dim)

    for dom in DOMAINS_FORMA_B:
        name = dom["name"]
        if name not in seen:
            row_order.append((name, True))
            seen.add(name)
        for dim in dom["dimensions"]:
            if dim not in seen:
                row_order.append((dim, False))
                seen.add(dim)

    total_name = "PUNTAJE TOTAL del cuestionario de factores de riesgo psicosocial intralaboral"
    row_order.append((total_name, False))

    rows = []
    for item_name, is_domain in row_order:
        values = {}
        for dept in departments:
            # Forma A
            a_stats = stats.get(item_name, {}).get(dept, {}).get("A", {"count": 0})
            if a_stats["count"] > 0:
                avg_a = a_stats["sum"] / a_stats["count"]
                if item_name == total_name:
                    baremos_list = BAREMOS_TOTAL_FORMA_A
                else:
                    baremos = BAREMOS_DOMINIOS_FORMA_A if is_domain else BAREMOS_DIMENSIONES_FORMA_A
                    baremos_list = baremos.get(item_name, [])
                risk_a = classify_risk(avg_a, baremos_list) if baremos_list else "N/A"
                forma_a = {"score": avg_a, "riskLevel": risk_a}
            else:
                forma_a = {"score": None, "riskLevel": ""}

            # Forma B
            b_stats = stats.get(item_name, {}).get(dept, {}).get("B", {"count": 0})
            if b_stats["count"] > 0:
                avg_b = b_stats["sum"] / b_stats["count"]
                if item_name == total_name:
                    baremos_list = BAREMOS_TOTAL_FORMA_B
                else:
                    baremos = BAREMOS_DOMINIOS_FORMA_B if is_domain else BAREMOS_DIMENSIONES_FORMA_B
                    baremos_list = baremos.get(item_name, [])
                risk_b = classify_risk(avg_b, baremos_list) if baremos_list else "N/A"
                forma_b = {"score": avg_b, "riskLevel": risk_b}
            else:
                forma_b = {"score": None, "riskLevel": ""}

            values[dept] = {"formaA": forma_a, "formaB": forma_b}
        
        rows.append({
            "dimension": item_name,
            "isDomain": is_domain,
            "values": values
        })

    return {
        "departments": departments,
        "rows": rows
    }
