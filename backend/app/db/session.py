from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

try:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
except (ModuleNotFoundError, ImportError):
    # Fallback for local execution/testing if postgres driver is not installed
    engine = create_engine("sqlite:///./local.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
