from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator

class ParticipantBase(BaseModel):
    cedula: str
    nombres: str
    apellidos: str
    sexo: Optional[str] = None  # "M", "F", "Otro"
    edad: Optional[int] = None
    estado_civil: Optional[str] = None
    nivel_educativo: Optional[str] = None
    cargo: Optional[str] = None
    area: Optional[str] = None
    tipo_contrato: Optional[str] = None
    tiempo_empresa: Optional[str] = None
    tipo_forma: Optional[str] = None  # "A" o "B"
    estado_evaluacion: str = "pendiente"  # "pendiente", "en_progreso", "completado"

    @field_validator("tipo_forma")
    @classmethod
    def validate_tipo_forma(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ["A", "B"]:
            raise ValueError("El tipo de forma debe ser 'A' o 'B'")
        return v

    @field_validator("estado_evaluacion")
    @classmethod
    def validate_estado_evaluacion(cls, v: str) -> str:
        valid_states = ["pendiente", "en_progreso", "completado"]
        if v not in valid_states:
            raise ValueError(f"El estado de evaluación debe ser uno de {valid_states}")
        return v

class ParticipantCreate(ParticipantBase):
    empresa_id: int
    evaluacion_id: int

class ParticipantUpdate(BaseModel):
    cedula: Optional[str] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    sexo: Optional[str] = None
    edad: Optional[int] = None
    estado_civil: Optional[str] = None
    nivel_educativo: Optional[str] = None
    cargo: Optional[str] = None
    area: Optional[str] = None
    tipo_contrato: Optional[str] = None
    tiempo_empresa: Optional[str] = None
    tipo_forma: Optional[str] = None
    estado_evaluacion: Optional[str] = None

    @field_validator("tipo_forma")
    @classmethod
    def validate_tipo_forma(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ["A", "B"]:
            raise ValueError("El tipo de forma debe ser 'A' o 'B'")
        return v

class ParticipantResponse(ParticipantBase):
    id: int
    empresa_id: int
    evaluacion_id: int
    created_at: datetime
    updated_at: datetime
    empresa_nombre: Optional[str] = None
    evaluacion_nombre: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
