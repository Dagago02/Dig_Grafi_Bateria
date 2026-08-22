from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func, Index
from sqlalchemy.orm import relationship

from app.db.session import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("companies.id", ondelete="RESTRICT"), nullable=False, index=True)
    evaluacion_id = Column(Integer, ForeignKey("evaluations.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Identificación
    cedula = Column(String, nullable=False, index=True)

    # Datos personales
    nombres = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    sexo = Column(String, nullable=True)  # "M", "F", "Otro"
    edad = Column(Integer, nullable=True)
    estado_civil = Column(String, nullable=True)
    nivel_educativo = Column(String, nullable=True)

    # Datos laborales
    cargo = Column(String, nullable=True)
    area = Column(String, nullable=True)
    tipo_contrato = Column(String, nullable=True)
    tiempo_empresa = Column(String, nullable=True)  # Ej: "menos de 1 año", "1-5 años"

    # Control de evaluación
    tipo_forma = Column(String, nullable=True)  # "A" o "B"
    estado_evaluacion = Column(String, default="pendiente", nullable=False)  # "pendiente", "en_progreso", "completado"

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Restricción: cédula única por evaluación (el mismo trabajador puede estar en diferentes evaluaciones)
    __table_args__ = (
        UniqueConstraint("cedula", "evaluacion_id", name="uq_participant_cedula_evaluacion"),
        Index("ix_participant_empresa_evaluacion", "empresa_id", "evaluacion_id"),
    )

    # Relationships
    evaluacion = relationship("Evaluation", back_populates="participantes")
    respuestas = relationship("Answer", back_populates="participante", cascade="all, delete-orphan")
    resultados = relationship("Result", back_populates="participante", cascade="all, delete-orphan")
