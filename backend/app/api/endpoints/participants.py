from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.participant import Participant
from app.models.company import Company
from app.models.evaluation import Evaluation
from app.schemas.participant import ParticipantCreate, ParticipantUpdate, ParticipantResponse

router = APIRouter()

@router.post("/", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
def create_participant(part_in: ParticipantCreate, db: Session = Depends(get_db)):
    # Verify company exists
    company = db.query(Company).filter(Company.id == part_in.empresa_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La empresa especificada no existe."
        )

    # Verify evaluation exists
    evaluation = db.query(Evaluation).filter(Evaluation.id == part_in.evaluacion_id).first()
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La evaluación especificada no existe."
        )

    # Check unique constraint (cedula + evaluacion_id)
    existing = db.query(Participant).filter(
        Participant.cedula == part_in.cedula,
        Participant.evaluacion_id == part_in.evaluacion_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un participante con esta cédula registrado en esta evaluación."
        )

    participant = Participant(**part_in.model_dump())
    db.add(participant)
    db.commit()
    db.refresh(participant)

    res = ParticipantResponse.model_validate(participant)
    res.empresa_nombre = company.nombre
    res.evaluacion_nombre = evaluation.nombre
    return res

@router.get("/", response_model=List[ParticipantResponse])
def read_participants(
    empresa_id: Optional[int] = Query(None, description="Filtrar por ID de empresa"),
    evaluacion_id: Optional[int] = Query(None, description="Filtrar por ID de evaluación"),
    estado_evaluacion: Optional[str] = Query(None, description="Filtrar por estado de encuesta"),
    tipo_forma: Optional[str] = Query(None, description="Filtrar por forma (A o B)"),
    search: Optional[str] = Query(None, description="Búsqueda por cédula, nombres o apellidos"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Participant)

    if empresa_id is not None:
        query = query.filter(Participant.empresa_id == empresa_id)
    if evaluacion_id is not None:
        query = query.filter(Participant.evaluacion_id == evaluacion_id)
    if estado_evaluacion is not None:
        query = query.filter(Participant.estado_evaluacion == estado_evaluacion)
    if tipo_forma is not None:
        query = query.filter(Participant.tipo_forma == tipo_forma)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Participant.cedula.ilike(search_pattern),
                Participant.nombres.ilike(search_pattern),
                Participant.apellidos.ilike(search_pattern)
            )
        )

    participants = query.offset(skip).limit(limit).all()

    result = []
    for p in participants:
        res = ParticipantResponse.model_validate(p)
        if p.evaluacion:
            res.evaluacion_nombre = p.evaluacion.nombre
            if p.evaluacion.empresa:
                res.empresa_nombre = p.evaluacion.empresa.nombre
        result.append(res)

    return result

@router.get("/{participant_id}", response_model=ParticipantResponse)
def read_participant(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante no encontrado."
        )

    res = ParticipantResponse.model_validate(participant)
    if participant.evaluacion:
        res.evaluacion_nombre = participant.evaluacion.nombre
        if participant.evaluacion.empresa:
            res.empresa_nombre = participant.evaluacion.empresa.nombre
    return res

@router.put("/{participant_id}", response_model=ParticipantResponse)
def update_participant(
    participant_id: int, part_in: ParticipantUpdate, db: Session = Depends(get_db)
):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante no encontrado."
        )

    update_data = part_in.model_dump(exclude_unset=True)

    if "cedula" in update_data and update_data["cedula"] != participant.cedula:
        existing = db.query(Participant).filter(
            Participant.cedula == update_data["cedula"],
            Participant.evaluacion_id == participant.evaluacion_id,
            Participant.id != participant_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un participante con esta cédula en la misma evaluación."
            )

    for field, value in update_data.items():
        setattr(participant, field, value)

    db.commit()
    db.refresh(participant)

    res = ParticipantResponse.model_validate(participant)
    if participant.evaluacion:
        res.evaluacion_nombre = participant.evaluacion.nombre
        if participant.evaluacion.empresa:
            res.empresa_nombre = participant.evaluacion.empresa.nombre
    return res

@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante no encontrado."
        )

    db.delete(participant)
    db.commit()
    return None
