from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.participant import Participant
from app.models.answer import Answer
from app.models.question import Question
from app.models.result import Result
from app.calculations.version import ALGORITHM_VERSION
from app.calculations.intralaboral import calculate_intralaboral
from app.calculations.extralaboral import calculate_extralaboral
from app.calculations.estres import calculate_estres
from app.calculations.risk_levels import classify_risk

BAREMOS_TOTAL_GENERAL_FORMA_A = [(0.0, 18.8, "Sin riesgo o riesgo despreciable"), (18.9, 24.4, "Riesgo bajo"), (24.5, 29.5, "Riesgo medio"), (29.6, 35.4, "Riesgo alto"), (35.5, 100.0, "Riesgo muy alto")]
BAREMOS_TOTAL_GENERAL_FORMA_B = [(0.0, 19.9, "Sin riesgo o riesgo despreciable"), (20.0, 24.8, "Riesgo bajo"), (24.9, 29.5, "Riesgo medio"), (29.6, 35.4, "Riesgo alto"), (35.5, 100.0, "Riesgo muy alto")]

def calculate_participant_results(participant_id: int, db: Session) -> List[Result]:
    """
    Procesa todas las respuestas del participante y genera o actualiza los registros de Result.
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise ValueError(f"Participante id {participant_id} no existe")

    forma = participant.tipo_forma or "A"
    grupo_ocupacional = 1 if forma == "A" else 2

    # Fetch stored answers joined with questions
    db_answers = db.query(Answer).join(Question).filter(Answer.participant_id == participant_id).all()

    answers_intra: Dict[int, str] = {}
    answers_extra: Dict[int, str] = {}
    answers_estres: Dict[int, str] = {}

    for ans in db_answers:
        q = ans.pregunta
        if not q:
            continue
        if q.forma in ["A", "B"]:
            answers_intra[q.numero] = ans.value
        elif q.forma == "extralaboral":
            answers_extra[q.numero] = ans.value
        elif q.forma == "estres":
            answers_estres[q.numero] = ans.value

    # Run calculations
    res_intra = calculate_intralaboral(answers_intra, forma)
    res_extra = calculate_extralaboral(answers_extra, grupo_ocupacional)
    res_estres = calculate_estres(answers_estres, grupo_ocupacional)

    # Combined Total (Intralaboral + Extralaboral)
    total_intra_raw = res_intra["total"]["puntaje_bruto"]
    total_extra_raw = res_extra["total"]["puntaje_bruto"]
    total_general_raw = total_intra_raw + total_extra_raw

    factor_general = 616.0 if forma == "A" else 512.0
    total_general_trans = round((total_general_raw / factor_general) * 100.0, 1)
    baremo_gen = BAREMOS_TOTAL_GENERAL_FORMA_A if forma == "A" else BAREMOS_TOTAL_GENERAL_FORMA_B
    total_general_risk = classify_risk(total_general_trans, baremo_gen)

    results_to_save = []

    def upsert_res(tipo: str, nom_target: str, comp: str, raw: float, trans: float, risk: str):
        existing = db.query(Result).filter(
            Result.participant_id == participant_id,
            Result.tipo_resultado == tipo,
            Result.nombre_target == nom_target
        ).first()

        if existing:
            existing.componente = comp
            existing.puntaje_bruto = raw
            existing.puntaje_transformado = trans
            existing.nivel_riesgo = risk
            existing.algorithm_version = ALGORITHM_VERSION
            results_to_save.append(existing)
        else:
            new_r = Result(
                participant_id=participant_id,
                tipo_resultado=tipo,
                nombre_target=nom_target,
                componente=comp,
                puntaje_bruto=raw,
                puntaje_transformado=trans,
                nivel_riesgo=risk,
                algorithm_version=ALGORITHM_VERSION
            )
            db.add(new_r)
            results_to_save.append(new_r)

    # 1. Intralaboral Dimensions & Domains
    for dim_name, d_val in res_intra["dimensiones"].items():
        upsert_res("dimension", dim_name, f"intralaboral_{forma}", d_val["puntaje_bruto"], d_val["puntaje_transformado"], d_val["nivel_riesgo"])

    for dom_name, d_val in res_intra["dominios"].items():
        upsert_res("dominio", dom_name, f"intralaboral_{forma}", d_val["puntaje_bruto"], d_val["puntaje_transformado"], d_val["nivel_riesgo"])

    upsert_res("general", "intralaboral", f"intralaboral_{forma}", res_intra["total"]["puntaje_bruto"], res_intra["total"]["puntaje_transformado"], res_intra["total"]["nivel_riesgo"])

    # 2. Extralaboral Dimensions & Total
    for dim_name, d_val in res_extra["dimensiones"].items():
        upsert_res("dimension", dim_name, "extralaboral", d_val["puntaje_bruto"], d_val["puntaje_transformado"], d_val["nivel_riesgo"])

    upsert_res("general", "extralaboral", "extralaboral", res_extra["total"]["puntaje_bruto"], res_extra["total"]["puntaje_transformado"], res_extra["total"]["nivel_riesgo"])

    # 3. Estrés Total
    upsert_res("general", "estres", "estres", res_estres["total"]["puntaje_bruto"], res_estres["total"]["puntaje_transformado"], res_estres["total"]["nivel_riesgo"])

    # 4. Total General (Intra + Extra)
    upsert_res("general", "total_general", "general", total_general_raw, total_general_trans, total_general_risk)

    db.commit()

    for r in results_to_save:
        db.refresh(r)

    return results_to_save
