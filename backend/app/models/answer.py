from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func, Index
from sqlalchemy.orm import relationship

from app.db.session import Base


class Answer(Base):
    """
    Respuestas ORIGINALES de un participante a cada pregunta.
    
    - Nunca eliminar ni sobreescribir respuestas originales.
    - El campo 'value' almacena la respuesta como texto (ej: "2", "Siempre").
      La conversión a puntuación numérica se realiza en el motor de cálculo.
    - Los resultados calculados se almacenan por separado en la tabla Result.
    """
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="RESTRICT"), nullable=False, index=True)
    value = Column(String, nullable=False)  # Respuesta original (texto o número como string)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Restricción: un participante solo puede tener una respuesta por pregunta
    __table_args__ = (
        UniqueConstraint("participant_id", "question_id", name="uq_answer_participant_question"),
        Index("ix_answer_participant_question", "participant_id", "question_id"),
    )

    # Relationships
    participante = relationship("Participant", back_populates="respuestas")
    pregunta = relationship("Question", back_populates="respuestas")
