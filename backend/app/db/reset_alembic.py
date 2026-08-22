"""Script para resetear el estado de Alembic y marcar el esquema actual como base."""

from sqlalchemy import text
from app.db.session import engine


def reset_alembic():
    with engine.connect() as conn:
        # Check if alembic_version exists
        result = conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alembic_version')"
        ))
        exists = result.scalar()

        if exists:
            conn.execute(text("DELETE FROM alembic_version"))
            conn.commit()
            print("Cleared old alembic_version entries.")
        else:
            print("alembic_version table does not exist yet.")


if __name__ == "__main__":
    reset_alembic()
