import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_qa.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_seed_and_structure(client):
    # 1. Seed questions
    seed_res = client.post("/api/v1/questions/seed")
    assert seed_res.status_code == 200
    data = seed_res.json()
    assert data["total_preguntas"] > 100

    # 2. Get structure for Forma A
    str_a = client.get("/api/v1/questions/structure/A")
    assert str_a.status_code == 200
    json_a = str_a.json()
    assert json_a["cuestionario_id"] == "intralaboral_forma_a"
    assert "secciones" in json_a
    assert len(json_a["secciones"]) > 0

    # 3. Get structure for Estres
    str_est = client.get("/api/v1/questions/structure/estres")
    assert str_est.status_code == 200
    json_est = str_est.json()
    assert json_est["cuestionario_id"] == "estres"
    assert len(json_est["preguntas"]) == 31

def test_answers_batch_save_and_retrieve(client):
    # Setup company, evaluation, participant
    comp_res = client.post("/api/v1/companies/", json={"nombre": "Empresa QA Test", "NIT": "999888777-1"})
    company_id = comp_res.json()["id"]

    eval_res = client.post("/api/v1/evaluations/", json={"empresa_id": company_id, "nombre": "Eval QA Test"})
    eval_id = eval_res.json()["id"]

    part_res = client.post(
        "/api/v1/participants/",
        json={
            "empresa_id": company_id,
            "evaluacion_id": eval_id,
            "cedula": "123456",
            "nombres": "Carlos",
            "apellidos": "Gómez",
            "tipo_forma": "A"
        }
    )
    participant_id = part_res.json()["id"]

    # Retrieve some question IDs
    q_list = client.get("/api/v1/questions/?forma=estres").json()
    q1 = q_list[0]
    q2 = q_list[1]

    # Save answers batch
    batch_res = client.post(
        "/api/v1/answers/batch",
        json={
            "participant_id": participant_id,
            "answers": [
                {"question_id": q1["id"], "value": "1"},
                {"question_id": q2["id"], "value": "3"}
            ],
            "estado_evaluacion": "en_progreso"
        }
    )
    assert batch_res.status_code == 200
    ans_data = batch_res.json()
    assert len(ans_data) == 2

    # Verify participant state updated
    p_check = client.get(f"/api/v1/participants/{participant_id}").json()
    assert p_check["estado_evaluacion"] == "en_progreso"

    # Retrieve participant answers
    get_ans = client.get(f"/api/v1/answers/participant/{participant_id}")
    assert get_ans.status_code == 200
    assert len(get_ans.json()) == 2
