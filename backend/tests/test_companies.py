import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

# Use an in-memory SQLite database for testing the endpoints
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

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

def test_create_company(client):
    response = client.post(
        "/api/v1/companies/",
        json={
            "nombre": "Empresa Test",
            "NIT": "123456789-0",
            "email": "test@empresa.com",
            "telefono": "555-1234",
            "direccion": "Calle Falsa 123",
            "estado": "activo"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Empresa Test"
    assert data["NIT"] == "123456789-0"
    assert "id" in data

def test_create_company_duplicate_nit(client):
    # Try to create another company with the same NIT
    response = client.post(
        "/api/v1/companies/",
        json={
            "nombre": "Empresa Duplicada",
            "NIT": "123456789-0",
            "email": "dupe@empresa.com",
            "telefono": "555-0000",
            "direccion": "Avenida Siempre Viva",
            "estado": "activo"
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Una empresa con este NIT ya se encuentra registrada."

def test_read_companies(client):
    response = client.get("/api/v1/companies/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["nombre"] == "Empresa Test"

def test_read_company(client):
    # First get list to find the ID
    list_response = client.get("/api/v1/companies/")
    company_id = list_response.json()[0]["id"]

    response = client.get(f"/api/v1/companies/{company_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Empresa Test"

def test_update_company(client):
    list_response = client.get("/api/v1/companies/")
    company_id = list_response.json()[0]["id"]

    response = client.put(
        f"/api/v1/companies/{company_id}",
        json={"nombre": "Empresa Test Modificada", "telefono": "555-9999"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Empresa Test Modificada"
    assert data["telefono"] == "555-9999"

def test_delete_company(client):
    list_response = client.get("/api/v1/companies/")
    company_id = list_response.json()[0]["id"]

    response = client.delete(f"/api/v1/companies/{company_id}")
    assert response.status_code == 204

    # Verify it is deleted
    get_response = client.get(f"/api/v1/companies/{company_id}")
    assert get_response.status_code == 404
