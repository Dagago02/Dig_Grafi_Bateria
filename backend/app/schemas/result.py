from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, ConfigDict

class ResultResponse(BaseModel):
    id: int
    participant_id: int
    tipo_resultado: str
    nombre_target: Optional[str] = None
    componente: Optional[str] = None
    puntaje_bruto: float
    puntaje_transformado: float
    nivel_riesgo: str
    algorithm_version: str
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ParticipantResultsSummary(BaseModel):
    participant_id: int
    nombres: str
    cedula: str
    tipo_forma: str
    estado_evaluacion: str
    results: List[ResultResponse]

class RiskDistribution(BaseModel):
    sin_riesgo: int = 0
    bajo: int = 0
    medio: int = 0
    alto: int = 0
    muy_alto: int = 0

class EvaluationSummaryResponse(BaseModel):
    evaluation_id: int
    nombre: str
    total_participantes: int
    participantes_evaluados: int
    distribucion_general: RiskDistribution
    distribucion_intralaboral: RiskDistribution
    distribucion_extralaboral: RiskDistribution
    distribucion_estres: RiskDistribution
