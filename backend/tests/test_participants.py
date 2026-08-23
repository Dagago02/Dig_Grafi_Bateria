import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_part.db"

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

def test_participant_crud_and_validations(client):
    # Setup company and evaluation
    comp_res = client.post("/api/v1/companies/", json={"nombre": "Empresa Part Test", "NIT": "800333444-5"})
    assert comp_res.status_code == 201
    company_id = comp_res.json()["id"]

    eval_res = client.post(
        "/api/v1/evaluations/",
        json={"empresa_id": company_id, "nombre": "Eval 2026 Part"}
    )
    assert eval_res.status_code == 201
    eval_id = eval_res.json()["id"]

    # 1. Create participant (Forma A)
    p1_res = client.post(
        "/api/v1/participants/",
        json={
            "empresa_id": company_id,
            "evaluacion_id": eval_id,
            "cedula": "1098765432",
            "nombres": "Juan",
            "apellidos": "Pérez",
            "tipo_forma": "A",
            "cargo": "Gerente",
            "area": "Administración"
        }
    )
    assert p1_res.status_code == 201
    p1_data = p1_res.json()
    assert p1_data["cedula"] == "1098765432"
    assert p1_data["tipo_forma"] == "A"
    p1_id = p1_data["id"]

    # 2. Try duplicate cedula in same evaluation -> 400 error
    p_dup_res = client.post(
        "/api/v1/participants/",
        json={
            "empresa_id": company_id,
            "evaluacion_id": eval_id,
            "cedula": "1098765432",
            "nombres": "Otro",
            "apellidos": "Pérez",
            "tipo_forma": "B"
        }
    )
    assert p_dup_res.status_code == 400

    # 3. Invalid tipo_forma -> 422 Unprocessable Entity
    p_invalid = client.post(
        "/api/v1/participants/",
        json={
            "empresa_id": company_id,
            "evaluacion_id": eval_id,
            "cedula": "9999999",
            "nombres": "Test",
            "apellidos": "Invalid",
            "tipo_forma": "C"
        }
    )
    assert p_invalid.status_code == 422

    # 4. List participants with filter
    list_res = client.get(f"/api/v1/participants/?evaluacion_id={eval_id}")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 5. Search participant
    search_res = client.get(f"/api/v1/participants/?search=Juan")
    assert search_res.status_code == 200
    assert len(search_res.json()) == 1

    # 6. Update participant
    put_res = client.put(
        f"/api/v1/participants/{p1_id}",
        json={"estado_evaluacion": "en_progreso"}
    )
    assert put_res.status_code == 200
    assert put_res.json()["estado_evaluacion"] == "en_progreso"

    # 7. Delete participant
    del_res = client.delete(f"/api/v1/participants/{p1_id}")
    assert del_res.status_code == 204
