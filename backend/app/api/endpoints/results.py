from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.participant import Participant
from app.models.evaluation import Evaluation
from app.models.result import Result
from app.schemas.result import ResultResponse, ParticipantResultsSummary, EvaluationSummaryResponse, RiskDistribution
from app.calculations.calculator import calculate_participant_results
from app.reports.excel_exporter import generate_evaluation_excel

router = APIRouter()

@router.post("/calculate/{participant_id}", response_model=List[ResultResponse])
def calculate_participant(participant_id: int, db: Session = Depends(get_db)):
    """
    Ejecuta el motor de cálculo oficial para las respuestas guardadas de un participante.
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participante no encontrado.")

    try:
        results = calculate_participant_results(participant_id, db)
        return results
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al calcular: {str(e)}")

@router.post("/calculate-evaluation/{evaluation_id}", status_code=status.HTTP_200_OK)
def calculate_all_evaluation(evaluation_id: int, db: Session = Depends(get_db)):
    """
    Calcula los resultados de todos los participantes de una evaluación.
    """
    participants = db.query(Participant).filter(Participant.evaluacion_id == evaluation_id).all()
    count = 0
    for p in participants:
        try:
            calculate_participant_results(p.id, db)
            count += 1
        except Exception as e:
            print(f"Error procesando participante {p.id}: {e}")

    return {"message": f"Cálculo finalizado para {count} participantes de la evaluación.", "procesados": count}

@router.get("/participant/{participant_id}", response_model=ParticipantResultsSummary)
def read_participant_results(participant_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el resumen de resultados calculados para un participante.
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participante no encontrado.")

    results = db.query(Result).filter(Result.participant_id == participant_id).all()
    if not results:
        # If not calculated yet, attempt calculation automatically
        try:
            results = calculate_participant_results(participant_id, db)
        except Exception:
            results = []

    res_objs = [ResultResponse.model_validate(r) for r in results]

    return ParticipantResultsSummary(
        participant_id=participant.id,
        nombres=f"{participant.nombres} {participant.apellidos}",
        cedula=participant.cedula,
        tipo_forma=participant.tipo_forma or "A",
        estado_evaluacion=participant.estado_evaluacion,
        results=res_objs
    )

@router.get("/evaluation/{evaluation_id}/summary", response_model=EvaluationSummaryResponse)
def read_evaluation_summary(evaluation_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la distribución agregada de niveles de riesgo para una evaluación.
    """
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada.")

    participants = db.query(Participant).filter(Participant.evaluacion_id == evaluation_id).all()
    part_ids = [p.id for p in participants]

    results = db.query(Result).filter(Result.participant_id.in_(part_ids)).all() if part_ids else []

    dist_gen = RiskDistribution()
    dist_intra = RiskDistribution()
    dist_extra = RiskDistribution()
    dist_estres = RiskDistribution()

    def update_dist(dist: RiskDistribution, risk: str):
        if "Sin riesgo" in risk or "Muy bajo" in risk:
            dist.sin_riesgo += 1
        elif "bajo" in risk.lower() and "muy" not in risk.lower():
            dist.bajo += 1
        elif "medio" in risk.lower():
            dist.medio += 1
        elif "muy alto" in risk.lower() or "muy alto" in risk.lower():
            dist.muy_alto += 1
        elif "alto" in risk.lower():
            dist.alto += 1

    for r in results:
        if r.tipo_resultado == "total:general":
            update_dist(dist_gen, r.nivel_riesgo)
        elif r.tipo_resultado == "total:intralaboral":
            update_dist(dist_intra, r.nivel_riesgo)
        elif r.tipo_resultado == "total:extralaboral":
            update_dist(dist_extra, r.nivel_riesgo)
        elif r.tipo_resultado == "total:estres":
            update_dist(dist_estres, r.nivel_riesgo)

    evaluated_count = len(set(r.participant_id for r in results))

    return EvaluationSummaryResponse(
        evaluation_id=evaluation.id,
        nombre=evaluation.nombre,
        total_participantes=len(participants),
        participantes_evaluados=evaluated_count,
        distribucion_general=dist_gen,
        distribucion_intralaboral=dist_intra,
        distribucion_extralaboral=dist_extra,
        distribucion_estres=dist_estres
    )

@router.get("/export/evaluation/{evaluation_id}/excel")
def export_evaluation_excel(evaluation_id: int, db: Session = Depends(get_db)):
    """
    Genera y descarga en demanda la base de datos completa de la empresa/evaluación en formato Excel (.xlsx)
    con la estructura exacta de Ejemplo.xlsx.
    """
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada.")

    excel_file = generate_evaluation_excel(evaluation_id, db)
    filename = f"Base_Datos_Riesgo_Psicosocial_Eval_{evaluation_id}.xlsx"
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/evaluation/{evaluation_id}/dashboard-stats")
def get_evaluation_dashboard_stats(evaluation_id: int, db: Session = Depends(get_db)):
    """
    Returns the consolidated dashboard statistics for an evaluation,
    including demographics and risk level distributions.
    """
    participants = db.query(Participant).filter(Participant.evaluacion_id == evaluation_id).all()
    if not participants:
        raise HTTPException(status_code=404, detail="No participants found for this evaluation")

    participant_ids = [p.id for p in participants]
    results = db.query(Result).filter(Result.participant_id.in_(participant_ids)).all()

    from app.calculations.dashboard_stats import generate_dashboard_stats
    stats = generate_dashboard_stats(participants, results, db)
    
    return stats
