"""Add lighthouse_status to reports

Revision ID: c8f42a1d9e7a
Revises: b8742199cde9
Create Date: 2025-12-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c8f42a1d9e7a'
down_revision: Union[str, None] = 'b8742199cde9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add lighthouse_status column to reports table
    # Default to 'pending' for new reports
    op.add_column('reports', sa.Column('lighthouse_status', sa.String(), nullable=False, server_default='pending'))


def downgrade() -> None:
    # Remove lighthouse_status column from reports table
    op.drop_column('reports', 'lighthouse_status')
