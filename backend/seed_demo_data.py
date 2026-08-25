import sys
import os
import random
import datetime

# Setup python path to include the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.evaluation import Evaluation
from app.models.participant import Participant
from app.models.question import Question
from app.models.answer import Answer
from app.services.questionnaire_service import seed_questions_from_json
from app.calculations.calculator import calculate_participant_results

def run_seed_demo():
    db = SessionLocal()
    try:
        print("1. Cargando preguntas oficiales desde los archivos JSON...")
        total_questions = seed_questions_from_json(db)
        print(f"  -> Preguntas procesadas/cargadas: {total_questions}")

        # 2. Define Companies & Evaluations
        companies_data = [
            {
                "nombre": "Acme Corporación S.A.S.",
                "NIT": "900.111.222-1",
                "email": "contacto@acmecorp.com",
                "telefono": "6015551234",
                "direccion": "Calle 100 # 15-20, Bogotá",
                "evaluacion": "Evaluación Clima & Riesgo 2026"
            },
            {
                "nombre": "Tecnología e Innovación Global Ltda.",
                "NIT": "900.333.444-2",
                "email": "gestion@techglobal.co",
                "telefono": "6044449876",
                "direccion": "Carrera 43A # 1-50, Medellín",
                "evaluacion": "Evaluación Diagnóstico Psicosocial 2026"
            }
        ]

        questions = db.query(Question).all()
        q_by_forma = {}
        for q in questions:
            if q.forma not in q_by_forma:
                q_by_forma[q.forma] = []
            q_by_forma[q.forma].append(q)

        # Choices for random generation
        likert4_choices = ["Siempre", "Casi siempre", "Algunas veces", "Nunca"]
        likert5_choices = ["Siempre", "Casi siempre", "A veces", "Casi nunca", "Nunca"]
        
        sexos = ["M", "F"]
        nombres_m = ["Carlos", "Andres", "Luis", "Felipe", "Pedro", "Jorge", "Mateo", "Santiago", "Diego", "Esteban"]
        nombres_f = ["Camila", "Sofia", "Natalia", "Valentina", "Andrea", "Paula", "Lucia", "Gabriela", "Mariana", "Daniela"]
        apellidos = ["Rodriguez", "Gomez", "Martinez", "Lopez", "Diaz", "Castro", "Hernandez", "Ruiz", "Morales", "Torres"]
        
        estados_civiles = ["Soltero (a)", "Casado (a)", "Unión libre", "Separado (a)", "Divorciado (a)"]
        niveles_educativos = [
            "Primaria completa", "Bachillerato incompleto", "Bachillerato completo",
            "Técnico / tecnológico completo", "Profesional completo", "Post-grado completo"
        ]
        tiempo_empresa_choices = ["Menos de 1 año", "1 a 5 años", "6 a 10 años", "11 a 20 años", "21 o más"]
        cargos_a = ["Gerente de Operaciones", "Director RRHH", "Coordinador Financiero", "Analista Senior", "Jefe de Producción"]
        cargos_b = ["Auxiliar Administrativo", "Operario de Planta", "Secretaria Ejecutiva", "Asistente Técnico", "Conductor"]
        areas = ["Finanzas", "Operaciones", "Tecnología", "Ventas", "Recursos Humanos", "Calidad", "Logística"]
        contratos = ["Término indefinido", "Temporal de 1 año o más", "Temporal de menos de 1 año", "Prestación de servicios"]
        estratos = ["1", "2", "3", "4", "5", "6"]
        viviendas = ["Propia", "En arriendo", "Familiar"]
        salarios = [
            "Fijo (diario, semanal, quincenal o mensual)",
            "Una parte fija y otra variable",
            "Todo variable (a destajo, por producción, por comisión)"
        ]

        total_participants_created = 0

        for comp_idx, c_data in enumerate(companies_data, start=1):
            company = db.query(Company).filter(Company.NIT == c_data["NIT"]).first()
            if not company:
                company = Company(
                    nombre=c_data["nombre"],
                    NIT=c_data["NIT"],
                    email=c_data["email"],
                    telefono=c_data["telefono"],
                    direccion=c_data["direccion"],
                    estado="activo"
                )
                db.add(company)
                db.commit()
                db.refresh(company)
                print(f"\n2.{comp_idx} Empresa creada: {company.nombre} (id={company.id})")
            else:
                print(f"\n2.{comp_idx} Empresa ya existente: {company.nombre} (id={company.id})")

            evaluation = db.query(Evaluation).filter(
                Evaluation.empresa_id == company.id,
                Evaluation.nombre == c_data["evaluacion"]
            ).first()

            if not evaluation:
                evaluation = Evaluation(
                    empresa_id=company.id,
                    nombre=c_data["evaluacion"],
                    fecha_inicio=datetime.date(2026, 1, 15),
                    fecha_fin=datetime.date(2026, 12, 31),
                    estado="activa"
                )
                db.add(evaluation)
                db.commit()
                db.refresh(evaluation)
                print(f"  -> Evaluación creada: {evaluation.nombre} (id={evaluation.id})")
            else:
                print(f"  -> Evaluación ya existente: {evaluation.nombre} (id={evaluation.id})")

            print(f"  -> Generando 10 participantes para {company.nombre}...")

            for i in range(1, 11):
                cedula = f"{100000000 * comp_idx + 5500 + i}"
                sexo = random.choice(sexos)
                nombres = random.choice(nombres_m if sexo == "M" else nombres_f)
                apellidos_choice = f"{random.choice(apellidos)} {random.choice(apellidos)}"
                
                # Alternate between Forma A and Forma B
                tipo_forma = "A" if i % 2 == 1 else "B"
                cargo = random.choice(cargos_a if tipo_forma == "A" else cargos_b)
                area = random.choice(areas)
                tipo_contrato = random.choice(contratos)
                tiempo_empresa = random.choice(tiempo_empresa_choices)
                estado_civil = random.choice(estados_civiles)
                nivel_educativo = random.choice(niveles_educativos)
                edad = random.randint(22, 62)
                
                existing = db.query(Participant).filter(
                    Participant.cedula == cedula,
                    Participant.evaluacion_id == evaluation.id
                ).first()

                if existing:
                    print(f"     Participante {nombres} {apellidos_choice} ({cedula}) ya existe.")
                    continue

                p = Participant(
                    empresa_id=company.id,
                    evaluacion_id=evaluation.id,
                    cedula=cedula,
                    nombres=nombres,
                    apellidos=apellidos_choice,
                    sexo=sexo,
                    edad=edad,
                    estado_civil=estado_civil,
                    nivel_educativo=nivel_educativo,
                    cargo=cargo,
                    area=area,
                    tipo_contrato=tipo_contrato,
                    tiempo_empresa=tiempo_empresa,
                    tipo_forma=tipo_forma,
                    estado_evaluacion="completado"
                )
                db.add(p)
                db.commit()
                db.refresh(p)

                answers_to_insert = []

                # Demographic Answers (Ficha / datos_generales)
                for q in q_by_forma.get("datos_generales", []):
                    val = "N/A"
                    if q.numero == 1: val = f"{p.nombres} {p.apellidos}"
                    elif q.numero == 2: val = "Masculino" if p.sexo == "M" else "Femenino"
                    elif q.numero == 3: val = str(2026 - p.edad)
                    elif q.numero == 4: val = p.estado_civil
                    elif q.numero == 5: val = p.nivel_educativo
                    elif q.numero == 6: val = p.cargo
                    elif q.numero == 7: val = "Bogotá" if comp_idx == 1 else "Medellín"
                    elif q.numero == 8: val = random.choice(estratos)
                    elif q.numero == 9: val = random.choice(viviendas)
                    elif q.numero == 10: val = str(random.randint(0, 4))
                    elif q.numero == 11: val = "Bogotá" if comp_idx == 1 else "Medellín"
                    elif q.numero == 12: val = str(random.randint(1, 15))
                    elif q.numero == 13: val = p.cargo
                    elif q.numero == 14: 
                        val = "Jefatura - tiene personal a cargo" if p.tipo_forma == "A" else "Operario, operador, ayudante, servicios generales"
                    elif q.numero == 15: 
                        val = str(random.randint(1, 10))
                    elif q.numero == 16: val = p.area
                    elif q.numero == 17: val = p.tipo_contrato
                    elif q.numero == 18: val = str(random.randint(6, 10))
                    elif q.numero == 19: val = random.choice(salarios)
                    
                    answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=str(val)))

                # Intralaboral (Forma A or B)
                for q in q_by_forma.get(p.tipo_forma, []):
                    val = random.choice(likert4_choices)
                    answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=val))

                # Extralaboral
                for q in q_by_forma.get("extralaboral", []):
                    val = random.choice(likert4_choices)
                    answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=val))

                # Estrés
                for q in q_by_forma.get("estres", []):
                    val = random.choice(likert5_choices)
                    answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=val))

                db.add_all(answers_to_insert)
                db.commit()

                # Run official calculations
                calculate_participant_results(p.id, db)
                total_participants_created += 1

            print(f"  -> 10 participantes creados y calculados exitosamente para {company.nombre}.")

        print(f"\n✅ Proceso completado exitosamente: 2 empresas, 2 evaluaciones y {total_participants_created} participantes con resultados aleatorios.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error durante el seeding de prueba: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed_demo()
