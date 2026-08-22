"""Complete initial schema: companies, evaluations, participants, questions, answers, results

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # All tables are already created via Base.metadata.create_all()
    # This migration file exists only for tracking purposes.
    pass


def downgrade() -> None:
    op.drop_table('results')
    op.drop_table('answers')
    op.drop_table('participants')
    op.drop_table('evaluations')
    op.drop_table('questions')
    op.drop_table('companies')
