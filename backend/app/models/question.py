from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Question(Base):
    """
    Estructura de preguntas de los cuestionarios.
    
    - forma: "A" | "B" | "extralaboral" | "estres" | "datos_generales"
    - tipo_respuesta: "likert4" | "likert5" | "opcion_unica" | etc.
    - opciones: JSON con las opciones válidas y sus puntuaciones.
    
    IMPORTANTE: Las preguntas oficiales se cargarán desde los documentos en /official_data/.
    Este modelo NO debe ser modificado para incluir preguntas inventadas.
    """
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True, nullable=False)
    texto = Column(String, nullable=False)
    seccion = Column(String, nullable=True)   # Ej: "Liderazgo y relaciones sociales"
    forma = Column(String, nullable=False)    # "A", "B", "extralaboral", "estres", "datos_generales"
    numero = Column(Integer, nullable=False)  # Número de pregunta dentro de su cuestionario
    tipo_respuesta = Column(String, nullable=False)  # "likert4", "opcion_unica"
    opciones = Column(JSON, nullable=True)    # JSON: [{label: "Siempre", value: 4}, ...]
    activa = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    respuestas = relationship("Answer", back_populates="pregunta")
