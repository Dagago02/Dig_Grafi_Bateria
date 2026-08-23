from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class AnswerItem(BaseModel):
    question_id: int
    value: str

class AnswerBatchCreate(BaseModel):
    participant_id: int
    answers: List[AnswerItem]
    estado_evaluacion: Optional[str] = None  # If set, update participant's estado_evaluacion (e.g. "completado" or "en_progreso")

class AnswerResponse(BaseModel):
    id: int
    participant_id: int
    question_id: int
    value: str
    created_at: datetime
    updated_at: datetime
    question_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
