from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.evaluation import Evaluation
from app.models.company import Company
from app.models.participant import Participant
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate, EvaluationResponse

router = APIRouter()

@router.post("/", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation(eval_in: EvaluationCreate, db: Session = Depends(get_db)):
    # Verify company exists
    company = db.query(Company).filter(Company.id == eval_in.empresa_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La empresa especificada no existe."
        )

    evaluation = Evaluation(**eval_in.model_dump())
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    res = EvaluationResponse.model_validate(evaluation)
    res.empresa_nombre = company.nombre
    res.total_participantes = 0
    return res

@router.get("/", response_model=List[EvaluationResponse])
def read_evaluations(
    empresa_id: Optional[int] = Query(None, description="Filtrar por ID de empresa"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Evaluation)
    if empresa_id is not None:
        query = query.filter(Evaluation.empresa_id == empresa_id)
    if estado is not None:
        query = query.filter(Evaluation.estado == estado)

    evaluations = query.offset(skip).limit(limit).all()

    result = []
    for ev in evaluations:
        part_count = db.query(func.count(Participant.id)).filter(Participant.evaluacion_id == ev.id).scalar()
        res = EvaluationResponse.model_validate(ev)
        res.total_participantes = part_count or 0
        if ev.empresa:
            res.empresa_nombre = ev.empresa.nombre
        result.append(res)

    return result

@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def read_evaluation(evaluation_id: int, db: Session = Depends(get_db)):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluación no encontrada."
        )

    part_count = db.query(func.count(Participant.id)).filter(Participant.evaluacion_id == evaluation.id).scalar()
    res = EvaluationResponse.model_validate(evaluation)
    res.total_participantes = part_count or 0
    if evaluation.empresa:
        res.empresa_nombre = evaluation.empresa.nombre
    return res

@router.put("/{evaluation_id}", response_model=EvaluationResponse)
def update_evaluation(
    evaluation_id: int, eval_in: EvaluationUpdate, db: Session = Depends(get_db)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluación no encontrada."
        )

    update_data = eval_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(evaluation, field, value)

    db.commit()
    db.refresh(evaluation)

    part_count = db.query(func.count(Participant.id)).filter(Participant.evaluacion_id == evaluation.id).scalar()
    res = EvaluationResponse.model_validate(evaluation)
    res.total_participantes = part_count or 0
    if evaluation.empresa:
        res.empresa_nombre = evaluation.empresa.nombre
    return res

@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evaluation(evaluation_id: int, db: Session = Depends(get_db)):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluación no encontrada."
        )

    db.delete(evaluation)
    db.commit()
    return None
