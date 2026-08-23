from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class EvaluationBase(BaseModel):
    nombre: str
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: str = "activa"  # "activa", "completada", "archivada"

class EvaluationCreate(EvaluationBase):
    empresa_id: int

class EvaluationUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: Optional[str] = None

class EvaluationResponse(EvaluationBase):
    id: int
    empresa_id: int
    created_at: datetime
    updated_at: datetime
    total_participantes: Optional[int] = 0
    empresa_nombre: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
