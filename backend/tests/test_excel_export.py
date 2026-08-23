import pytest
import openpyxl
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.reports.excel_exporter import generate_evaluation_excel

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_excel.db"

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

def test_excel_export_service(client, db):
    # Setup company, evaluation, participant
    comp_res = client.post("/api/v1/companies/", json={"nombre": "Empresa Excel Test", "NIT": "111222333-9"})
    company_id = comp_res.json()["id"]

    eval_res = client.post("/api/v1/evaluations/", json={"empresa_id": company_id, "nombre": "Eval Excel Test"})
    eval_id = eval_res.json()["id"]

    part_res = client.post(
        "/api/v1/participants/",
        json={
            "empresa_id": company_id,
            "evaluacion_id": eval_id,
            "cedula": "777888999",
            "nombres": "Ana",
            "apellidos": "Martínez",
            "tipo_forma": "A"
        }
    )
    assert part_res.status_code == 201

    # Generate Excel via service
    excel_stream = generate_evaluation_excel(eval_id, db)
    assert excel_stream is not None

    wb = openpyxl.load_workbook(excel_stream)
    sheet = wb.active
    assert sheet.title == "Resultados Batería"
    assert sheet.max_row >= 2  # Header + 1 participant row
    headers = [cell.value for cell in list(sheet.rows)[0]]
    assert "Número de identificación" in headers
    assert "PUNTAJE TOTAL GENERAL (nivel de riesgo)" in headers

def test_excel_export_endpoint(client):
    # Get evaluation list
    list_res = client.get("/api/v1/evaluations/")
    assert list_res.status_code == 200
    eval_id = list_res.json()[0]["id"]

    res = client.get(f"/api/v1/results/export/evaluation/{eval_id}/excel")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
