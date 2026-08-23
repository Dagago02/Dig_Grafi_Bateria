from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class QuestionBase(BaseModel):
    codigo: str
    texto: str
    seccion: Optional[str] = None
    forma: str
    numero: int
    tipo_respuesta: str
    opciones: Optional[Any] = None
    activa: bool = True

class QuestionResponse(QuestionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
