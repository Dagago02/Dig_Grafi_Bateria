from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import relationship

from app.db.session import Base


class Result(Base):
    """
    Resultados CALCULADOS a partir de las respuestas originales de un participante.
    
    - Se almacena la versión del algoritmo usado para permitir recálculo posterior.
    - tipo_resultado indica el nivel de granularidad:
        "general": resultado consolidado del componente (ej: "intralaboral_A")
        "dominio":  resultado por dominio (ej: "liderazgo_y_relaciones_sociales")
        "dimension": resultado por dimensión (ej: "caracteristicas_del_liderazgo")
    
    - Fuente: Los rangos, niveles de riesgo y fórmulas son los definidos en /official_data/.
    """
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True)

    tipo_resultado = Column(String, nullable=False)   # "general", "dominio", "dimension"
    nombre_target = Column(String, nullable=False)    # Nombre del dominio/dimensión/componente
    componente = Column(String, nullable=True)        # "intralaboral_A", "intralaboral_B", "extralaboral", "estres"

    puntaje_bruto = Column(Float, nullable=True)
    puntaje_transformado = Column(Float, nullable=True)
    percentil = Column(Float, nullable=True)
    nivel_riesgo = Column(String, nullable=True)      # "sin_riesgo", "bajo", "medio", "alto"

    algorithm_version = Column(String, nullable=False, default="1.0.0")
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_result_participant_tipo", "participant_id", "tipo_resultado", "nombre_target"),
    )

    # Relationships
    participante = relationship("Participant", back_populates="resultados")
