from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.endpoints import companies

app = FastAPI(
    title="Batería de Riesgo Psicosocial API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(companies.router, prefix=f"{settings.API_V1_STR}/companies", tags=["Companies"])

# Root/Health check endpoints
@app.get("/")
def read_root():
    return {"message": "Batería de Riesgo Psicosocial API"}

@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "algorithm_version": settings.ALGORITHM_VERSION
    }
