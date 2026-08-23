import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_eval.db"

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

def test_evaluation_crud(client):
    # 1. Create company first
    comp_res = client.post(
        "/api/v1/companies/",
        json={"nombre": "Empresa Eval Test", "NIT": "900111222-1"}
    )
    assert comp_res.status_code == 201
    company_id = comp_res.json()["id"]

    # 2. Create evaluation
    eval_res = client.post(
        "/api/v1/evaluations/",
        json={
            "empresa_id": company_id,
            "nombre": "Evaluación 2026",
            "fecha_inicio": "2026-01-01",
            "fecha_fin": "2026-12-31",
            "estado": "activa"
        }
    )
    assert eval_res.status_code == 201
    eval_data = eval_res.json()
    assert eval_data["nombre"] == "Evaluación 2026"
    assert eval_data["empresa_nombre"] == "Empresa Eval Test"
    eval_id = eval_data["id"]

    # 3. Read list of evaluations
    list_res = client.get(f"/api/v1/evaluations/?empresa_id={company_id}")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 4. Read single evaluation
    get_res = client.get(f"/api/v1/evaluations/{eval_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == eval_id

    # 5. Update evaluation
    put_res = client.put(
        f"/api/v1/evaluations/{eval_id}",
        json={"nombre": "Evaluación 2026 Modificada", "estado": "completada"}
    )
    assert put_res.status_code == 200
    assert put_res.json()["nombre"] == "Evaluación 2026 Modificada"
    assert put_res.json()["estado"] == "completada"

    # 6. Delete evaluation
    del_res = client.delete(f"/api/v1/evaluations/{eval_id}")
    assert del_res.status_code == 204

    # 7. Verify 404
    get_404 = client.get(f"/api/v1/evaluations/{eval_id}")
    assert get_404.status_code == 404
