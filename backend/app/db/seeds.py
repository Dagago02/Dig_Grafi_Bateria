"""
Script de seeds para cargar datos de prueba en la base de datos.

IMPORTANTE: Las preguntas aquí son FICTICIAS y solo sirven para verificar
el funcionamiento del flujo de datos. Las preguntas oficiales de la batería
deben cargarse desde los documentos en /official_data/ en la Fase 4.
"""
from app.db.session import SessionLocal
from app.db import base as _all_models  # noqa: F401 – registers all models with the mapper
from app.models.company import Company
from app.models.evaluation import Evaluation
from app.models.question import Question
import datetime


def seed_test_questions(db):
    """Carga preguntas de prueba para el flujo de datos."""
    preguntas_prueba = [
        {
            "codigo": "TEST_INTRA_A_01",
            "texto": "[PREGUNTA DE PRUEBA] Esta es la pregunta 1 del cuestionario intralaboral Forma A",
            "seccion": "Prueba",
            "forma": "A",
            "numero": 1,
            "tipo_respuesta": "likert4",
            "opciones": [
                {"label": "Siempre", "value": 4},
                {"label": "Casi siempre", "value": 3},
                {"label": "Algunas veces", "value": 2},
                {"label": "Nunca", "value": 1},
            ],
        },
        {
            "codigo": "TEST_INTRA_A_02",
            "texto": "[PREGUNTA DE PRUEBA] Esta es la pregunta 2 del cuestionario intralaboral Forma A",
            "seccion": "Prueba",
            "forma": "A",
            "numero": 2,
            "tipo_respuesta": "likert4",
            "opciones": [
                {"label": "Siempre", "value": 4},
                {"label": "Casi siempre", "value": 3},
                {"label": "Algunas veces", "value": 2},
                {"label": "Nunca", "value": 1},
            ],
        },
        {
            "codigo": "TEST_INTRA_B_01",
            "texto": "[PREGUNTA DE PRUEBA] Esta es la pregunta 1 del cuestionario intralaboral Forma B",
            "seccion": "Prueba",
            "forma": "B",
            "numero": 1,
            "tipo_respuesta": "likert4",
            "opciones": [
                {"label": "Siempre", "value": 4},
                {"label": "Casi siempre", "value": 3},
                {"label": "Algunas veces", "value": 2},
                {"label": "Nunca", "value": 1},
            ],
        },
        {
            "codigo": "TEST_EXTRA_01",
            "texto": "[PREGUNTA DE PRUEBA] Esta es la pregunta 1 del cuestionario extralaboral",
            "seccion": "Prueba",
            "forma": "extralaboral",
            "numero": 1,
            "tipo_respuesta": "likert4",
            "opciones": [
                {"label": "Siempre", "value": 4},
                {"label": "Casi siempre", "value": 3},
                {"label": "Algunas veces", "value": 2},
                {"label": "Nunca", "value": 1},
            ],
        },
        {
            "codigo": "TEST_ESTRES_01",
            "texto": "[PREGUNTA DE PRUEBA] Esta es la pregunta 1 del cuestionario de estrés",
            "seccion": "Prueba",
            "forma": "estres",
            "numero": 1,
            "tipo_respuesta": "likert5",
            "opciones": [
                {"label": "Nunca", "value": 0},
                {"label": "Casi nunca", "value": 1},
                {"label": "A veces", "value": 2},
                {"label": "Casi siempre", "value": 3},
                {"label": "Siempre", "value": 4},
            ],
        },
    ]

    added = 0
    for q_data in preguntas_prueba:
        exists = db.query(Question).filter(Question.codigo == q_data["codigo"]).first()
        if not exists:
            question = Question(**q_data)
            db.add(question)
            added += 1

    db.commit()
    print(f"  -> Preguntas de prueba cargadas: {added} nuevas (ya existían las otras)")


def seed_test_company_and_evaluation(db):
    """Carga una empresa y evaluación de prueba si no existen."""
    company = db.query(Company).filter(Company.NIT == "900.123.456-7").first()
    if not company:
        company = Company(
            nombre="Empresa Test",
            NIT="900.123.456-7",
            email="test@empresa.com",
            telefono="3001234567",
            direccion="Av. Principal 100",
            estado="activo",
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        print(f"  -> Empresa de prueba creada (id={company.id})")
    else:
        print(f"  -> Empresa de prueba ya existe (id={company.id})")

    evaluation = db.query(Evaluation).filter(
        Evaluation.empresa_id == company.id, Evaluation.nombre == "Evaluación Prueba 2026"
    ).first()

    if not evaluation:
        evaluation = Evaluation(
            empresa_id=company.id,
            nombre="Evaluación Prueba 2026",
            fecha_inicio=datetime.date(2026, 1, 1),
            fecha_fin=datetime.date(2026, 12, 31),
            estado="activa",
        )
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)
        print(f"  -> Evaluación de prueba creada (id={evaluation.id})")
    else:
        print(f"  -> Evaluación de prueba ya existe (id={evaluation.id})")


def run_seeds():
    db = SessionLocal()
    try:
        print("Ejecutando seeds de prueba...")
        seed_test_company_and_evaluation(db)
        seed_test_questions(db)
        print("Seeds de prueba finalizados correctamente.")
    except Exception as e:
        db.rollback()
        print(f"Error en seeds: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seeds()
