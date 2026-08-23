import sys
import os
import random

# Setup python path to include the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.evaluation import Evaluation
from app.models.participant import Participant
from app.models.question import Question
from app.models.answer import Answer
from app.calculations.calculator import calculate_participant_results

def run_insert_10():
    db = SessionLocal()
    try:
        # 1. Fetch Company & Evaluation
        company = db.query(Company).filter(Company.nombre == "Empresa Test").first()
        if not company:
            print("Empresa Test no encontrada en base de datos.")
            return

        evaluation = db.query(Evaluation).filter(
            Evaluation.empresa_id == company.id,
            Evaluation.nombre == "Evaluación Prueba 2026"
        ).first()
        if not evaluation:
            print("Evaluación Prueba 2026 no encontrada.")
            return

        print(f"Insertando 10 participantes de prueba adicionales en Empresa: {company.nombre}, Eval: {evaluation.nombre}")

        # 2. Get questions by questionnaire types to assign answers correctly
        questions = db.query(Question).all()
        q_by_forma = {}
        for q in questions:
            if q.forma not in q_by_forma:
                q_by_forma[q.forma] = []
            q_by_forma[q.forma].append(q)

        # Choices for random generation
        likert_choices = ["Siempre", "Casi siempre", "A veces", "Nunca"]
        sexos = ["M", "F"]
        nombres_m = ["Carlos", "Andres", "Luis", "Felipe", "Pedro", "Jorge", "Mateo", "Santiago"]
        nombres_f = ["Camila", "Sofia", "Natalia", "Valentina", "Andrea", "Paula", "Lucia", "Gabriela"]
        apellidos = ["Rodriguez", "Gomez", "Martinez", "Lopez", "Diaz", "Castro", "Hernandez", "Ruiz"]
        
        estados_civiles = ["Soltero (a)", "Casado (a)", "Unión libre", "Separado (a)", "Divorciado (a)"]
        niveles_educativos = [
            "Primaria completa", "Bachillerato incompleto", "Bachillerato completo",
            "Técnico / tecnológico completo", "Profesional completo", "Post-grado completo"
        ]
        tiempo_empresa_choices = ["Menos de 1 año", "1 a 5 años", "6 a 10 años", "11 a 20 años", "21 o más"]
        cargos_a = ["Gerente", "Director", "Coordinador", "Analista Senior", "Consultor"]
        cargos_b = ["Auxiliar", "Operario", "Secretaria", "Asistente", "Técnico de Soporte"]
        areas = ["Finanzas", "Operaciones", "Sistemas", "Ventas", "Recursos Humanos", "Calidad"]
        contratos = ["Término indefinido", "Temporal de 1 año o más", "Temporal de menos de 1 año", "Prestación de servicios"]
        estratos = ["1", "2", "3", "4", "5", "6"]
        viviendas = ["Propia", "En arriendo", "Familiar"]
        salarios = [
            "Fijo (diario, semanal, quincenal o mensual)",
            "Una parte fija y otra variable",
            "Todo variable (a destajo, por producción, por comisión)"
        ]

        for i in range(1, 11):
            cedula = f"20023578{i}"
            sexo = random.choice(sexos)
            nombres = random.choice(nombres_m if sexo == "M" else nombres_f)
            apellidos_choice = f"{random.choice(apellidos)} {random.choice(apellidos)}"
            
            tipo_forma = random.choice(["A", "B"])
            cargo = random.choice(cargos_a if tipo_forma == "A" else cargos_b)
            area = random.choice(areas)
            tipo_contrato = random.choice(contratos)
            tiempo_empresa = random.choice(tiempo_empresa_choices)
            estado_civil = random.choice(estados_civiles)
            nivel_educativo = random.choice(niveles_educativos)
            edad = random.randint(20, 60)
            
            # Check if participant already exists by cedula
            existing = db.query(Participant).filter(
                Participant.cedula == cedula,
                Participant.evaluacion_id == evaluation.id
            ).first()

            if existing:
                print(f"Participante {nombres} ({cedula}) ya existe. Saltando.")
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
            print(f"Creado participante de test {p.nombres} {p.apellidos} (id={p.id}, forma={p.tipo_forma})")

            # Insert answers
            answers_to_insert = []

            # 3. Demographic Answers (Ficha / datos_generales)
            # We map random answers to the questions based on question number
            for q in q_by_forma.get("datos_generales", []):
                val = "N/A"
                if q.numero == 1: val = f"{p.nombres} {p.apellidos}"
                elif q.numero == 2: val = "Masculino" if p.sexo == "M" else "Femenino"
                elif q.numero == 3: val = str(2026 - p.edad)
                elif q.numero == 4: val = p.estado_civil
                elif q.numero == 5: val = p.nivel_educativo
                elif q.numero == 6: val = p.cargo
                elif q.numero == 7: val = "Bogotá"
                elif q.numero == 8: val = random.choice(estratos)
                elif q.numero == 9: val = random.choice(viviendas)
                elif q.numero == 10: val = str(random.randint(0, 4))
                elif q.numero == 11: val = "Bogotá"
                elif q.numero == 12: val = "3" # placeholder years
                elif q.numero == 13: val = p.cargo
                elif q.numero == 14: 
                    val = "Jefatura - tiene personal a cargo" if p.tipo_forma == "A" else "Operario, operador, ayudante, servicios generales"
                elif q.numero == 15: 
                    val = str(random.randint(1, 15))
                elif q.numero == 16: val = p.area
                elif q.numero == 17: val = p.tipo_contrato
                elif q.numero == 18: val = "8"
                elif q.numero == 19: val = random.choice(salarios)
                
                answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=str(val)))

            # 4. Intralaboral (Forma A or B)
            for q in q_by_forma.get(p.tipo_forma, []):
                val = random.choice(likert_choices)
                answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=val))

            # 5. Extralaboral
            for q in q_by_forma.get("extralaboral", []):
                val = random.choice(likert_choices)
                answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=val))

            # 6. Estrés
            for q in q_by_forma.get("estres", []):
                val = random.choice(likert_choices)
                answers_to_insert.append(Answer(participant_id=p.id, question_id=q.id, value=val))

            db.add_all(answers_to_insert)
            db.commit()

            # 7. Run calculations
            calculate_participant_results(p.id, db)
            print(f"  -> {len(answers_to_insert)} respuestas añadidas y resultados calculados.")

        print("Inserción de 10 participantes completada exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"Error durante la inserción: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_insert_10()
