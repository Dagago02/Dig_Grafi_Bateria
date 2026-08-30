import os
import json
from pathlib import Path
from sqlalchemy.orm import Session

from app.models.question import Question

FORMA_ALIASES = {
    "extralaboral": "extralaboral",
    "datos_generales": "datos_generales",
}


def canonicalize_forma(forma: str) -> str:
    return FORMA_ALIASES.get(forma, forma)

def find_official_data_dir() -> Path:
    env_dir = os.environ.get("OFFICIAL_DATA_DIR")
    if env_dir and Path(env_dir).exists():
        return Path(env_dir)
    
    candidates = [
        Path(__file__).resolve().parent.parent.parent.parent / "official_data",
        Path(__file__).resolve().parent.parent.parent / "official_data",
        Path("/app/official_data"),
        Path("./official_data"),
        Path("../official_data")
    ]
    for c in candidates:
        if c.exists() and (c / "cuestionario_intralaboral_forma_a.json").exists():
            return c
    
    return candidates[0]

OFFICIAL_DATA_DIR = find_official_data_dir()

def get_official_data_path(filename: str) -> Path:
    dir_path = find_official_data_dir()
    return dir_path / filename

def seed_questions_from_json(db: Session) -> int:
    """
    Carga de forma idempotente todas las preguntas oficiales desde los archivos JSON en /official_data/.
    Retorna el número total de preguntas procesadas/almacenadas.
    """
    files_config = [
        {"filename": "cuestionario_intralaboral_forma_a.json", "forma": "A", "prefix": "FA"},
        {"filename": "cuestionario_intralaboral_forma_b.json", "forma": "B", "prefix": "FB"},
        {"filename": "cuestionario_factores_extralaborales.json", "forma": "extralaboral", "prefix": "EXT"},
        {"filename": "cuestionario_estres.json", "forma": "estres", "prefix": "EST"},
        {"filename": "ficha_datos_generales.json", "forma": "datos_generales", "prefix": "DG"},
    ]

    total_seeded = 0

    for item in files_config:
        filepath = get_official_data_path(item["filename"])
        if not filepath.exists():
            print(f"Advertencia: El archivo {filepath} no existe en {filepath.parent}.")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        forma = item["forma"]
        prefix = item["prefix"]
        escala_def = data.get("escala_respuesta") or data.get("escala_respuesta") or []

        if "secciones" in data:
            for sec in data["secciones"]:
                seccion_nombre = sec.get("nombre", "")
                for q in sec.get("preguntas", []):
                    q_num = q["id"]
                    codigo = f"{prefix}_{q_num}"
                    texto = q["texto"]
                    
                    opciones = q.get("opciones") or escala_def
                    tipo_resp = "likert5" if len(opciones) == 5 else ("likert4" if len(opciones) == 4 else "opcion_unica")

                    db_q = db.query(Question).filter(Question.codigo == codigo).first()
                    if not db_q:
                        db_q = Question(
                            codigo=codigo,
                            texto=texto,
                            seccion=seccion_nombre,
                            forma=forma,
                            numero=q_num,
                            tipo_respuesta=tipo_resp,
                            opciones=opciones,
                            activa=True
                        )
                        db.add(db_q)
                    else:
                        db_q.texto = texto
                        db_q.seccion = seccion_nombre
                        db_q.opciones = opciones

                    total_seeded += 1
                    total_seeded += 1

                if "condicional" in sec:
                    cond = sec["condicional"]
                    cond_id = cond["id_filtro"]
                    codigo_cond = f"{prefix}_FILTRO_{cond_id}"
                    texto_cond = cond["pregunta_filtro"]
                    
                    db_cond = db.query(Question).filter(Question.codigo == codigo_cond).first()
                    if not db_cond:
                        db_cond = Question(
                            codigo=codigo_cond,
                            texto=texto_cond,
                            seccion=seccion_nombre,
                            forma=forma,
                            numero=cond_id,
                            tipo_respuesta=cond.get("tipo_filtro", "si_no"),
                            opciones=[{"label": "Si", "value": "Si"}, {"label": "No", "value": "No"}],
                            activa=True
                        )
                        db.add(db_cond)
                    else:
                        db_cond.texto = texto_cond
                        db_cond.seccion = seccion_nombre
                    
                    total_seeded += 1
        elif "preguntas" in data:
            for q in data["preguntas"]:
                q_num = q["id"]
                codigo = f"{prefix}_{q_num}"
                texto = q["texto"]
                seccion_nombre = q.get("seccion", None)
                
                opciones = q.get("opciones") or escala_def
                tipo_q = q.get("tipo")
                if tipo_q:
                    tipo_resp = tipo_q
                elif len(opciones) == 5:
                    tipo_resp = "likert5"
                elif len(opciones) == 4:
                    tipo_resp = "likert4"
                else:
                    tipo_resp = "opcion_unica"

                db_q = db.query(Question).filter(Question.codigo == codigo).first()
                if not db_q:
                    db_q = Question(
                        codigo=codigo,
                        texto=texto,
                        seccion=seccion_nombre,
                        forma=forma,
                        numero=q_num,
                        tipo_respuesta=tipo_resp,
                        opciones=opciones,
                        activa=True
                    )
                    db.add(db_q)
                else:
                    db_q.texto = texto
                    db_q.seccion = seccion_nombre
                    db_q.opciones = opciones

                total_seeded += 1

    db.commit()
    return total_seeded

def get_questionnaire_structure(forma: str, db: Session) -> dict:
    """
    Retorna la estructura del cuestionario (nombre, instrucciones, escala de respuesta y preguntas)
    a partir del archivo JSON oficial original en /official_data/.
    """
    forma = canonicalize_forma(forma)

    file_map = {
        "A": "cuestionario_intralaboral_forma_a.json",
        "B": "cuestionario_intralaboral_forma_b.json",
        "extralaboral": "cuestionario_factores_extralaborales.json",
        "estres": "cuestionario_estres.json",
        "datos_generales": "ficha_datos_generales.json",
    }

    filename = file_map.get(forma)
    if not filename:
        raise ValueError(f"Forma no válida: {forma}")

    filepath = get_official_data_path(filename)
    if not filepath.exists():
        raise FileNotFoundError(f"Archivo de datos no encontrado: {filename}")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Inject DB Question IDs into questions structure for clean referencing
    questions_in_db = {q.codigo: q.id for q in db.query(Question).filter(Question.forma == forma).all()}

    prefix_map = {"A": "FA", "B": "FB", "extralaboral": "EXT", "estres": "EST", "datos_generales": "DG"}
    prefix = prefix_map.get(forma, "")

    if "secciones" in data:
        for sec in data["secciones"]:
            if "condicional" in sec:
                cond_code = f"{prefix}_FILTRO_{sec['condicional']['id_filtro']}"
                cond_qid = questions_in_db.get(cond_code)
                if cond_qid:
                    sec["condicional"]["id_filtro"] = cond_qid

            for q in sec.get("preguntas", []):
                code = f"{prefix}_{q['id']}"
                qid = questions_in_db.get(code)
                q["db_id"] = qid
    elif "preguntas" in data:
        for q in data["preguntas"]:
            code = f"{prefix}_{q['id']}"
            qid = questions_in_db.get(code)
            q["db_id"] = qid
            q["db_id"] = qid

    if "escala_respuesta" in data and "escala_respuesta" not in data:
        data["escala_respuesta"] = data["escala_respuesta"]
    elif "escala_respuesta" in data and "escala_respuesta" not in data:
        data["escala_respuesta"] = data["escala_respuesta"]

    return data
