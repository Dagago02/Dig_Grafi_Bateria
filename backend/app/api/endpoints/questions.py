from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.question import Question
from app.schemas.question import QuestionResponse
from app.services.questionnaire_service import seed_questions_from_json, get_questionnaire_structure

router = APIRouter()

@router.post("/seed", status_code=status.HTTP_200_OK)
def seed_questions(db: Session = Depends(get_db)):
    """
    Sincroniza y carga todas las preguntas oficiales desde los archivos JSON en /official_data/.
    """
    total = seed_questions_from_json(db)
    return {"message": "Preguntas oficializadas cargadas exitosamente", "total_preguntas": total}

@router.get("/structure/{forma}", response_model=Any)
def read_questionnaire_structure(forma: str, db: Session = Depends(get_db)):
    """
    Obtiene el cuestionario estructurado (secciones, instrucciones, escala de respuesta y preguntas)
    inyectando los IDs de base de datos para fácil asociación.
    """
    # Ensure database has questions seeded
    count = db.query(Question).filter(Question.forma == forma).count()
    if count == 0:
        seed_questions_from_json(db)

    try:
        structure = get_questionnaire_structure(forma, db)
        return structure
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except FileNotFoundError as fe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fe))

@router.get("/", response_model=List[QuestionResponse])
def read_questions(
    forma: Optional[str] = Query(None, description="Filtrar por forma ('A', 'B', 'extralaboral', 'estres', 'datos_generales')"),
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if forma:
        query = query.filter(Question.forma == forma)

    questions = query.order_by(Question.numero.asc()).offset(skip).limit(limit).all()
    return questions
