from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.answer import Answer
from app.models.participant import Participant
from app.schemas.answer import AnswerBatchCreate, AnswerResponse
from app.calculations.calculator import calculate_participant_results

router = APIRouter()

@router.post("/batch", response_model=List[AnswerResponse], status_code=status.HTTP_200_OK)
def save_answers_batch(batch_in: AnswerBatchCreate, db: Session = Depends(get_db)):
    """
    Guarda o actualiza en lote las respuestas originales de un participante.
    Nunca elimina respuestas previas no incluidas a menos que se reescriban.
    Si se provee `estado_evaluacion`, actualiza el estado de la encuesta del participante.
    """
    # Verify participant exists
    participant = db.query(Participant).filter(Participant.id == batch_in.participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El participante especificado no existe."
        )

    saved_answers = []
    for item in batch_in.answers:
        existing = db.query(Answer).filter(
            Answer.participant_id == batch_in.participant_id,
            Answer.question_id == item.question_id
        ).first()

        if existing:
            existing.value = str(item.value)
            saved_answers.append(existing)
        else:
            new_ans = Answer(
                participant_id=batch_in.participant_id,
                question_id=item.question_id,
                value=str(item.value)
            )
            db.add(new_ans)
            saved_answers.append(new_ans)

    if batch_in.estado_evaluacion:
        participant.estado_evaluacion = batch_in.estado_evaluacion

    db.commit()

    try:
        calculate_participant_results(batch_in.participant_id, db)
    except Exception:
        pass

    for ans in saved_answers:
        db.refresh(ans)

    res = []
    for ans in saved_answers:
        r = AnswerResponse.model_validate(ans)
        if ans.pregunta:
            r.question_code = ans.pregunta.codigo
        res.append(r)

    return res

@router.get("/participant/{participant_id}", response_model=List[AnswerResponse])
def read_participant_answers(participant_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todas las respuestas originales almacenadas para un participante.
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El participante especificado no existe."
        )

    answers = db.query(Answer).filter(Answer.participant_id == participant_id).all()
    res = []
    for ans in answers:
        r = AnswerResponse.model_validate(ans)
        if ans.pregunta:
            r.question_code = ans.pregunta.codigo
        res.append(r)

    return res
