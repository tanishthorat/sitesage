"""Add Pro SEO metrics

Revision ID: b8742199cde9
Revises: a9377098dad8
Create Date: 2025-12-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8742199cde9'
down_revision: Union[str, None] = 'a9377098dad8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add Pro SEO metrics columns to reports table
    op.add_column('reports', sa.Column('word_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('reports', sa.Column('internal_links_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('reports', sa.Column('external_links_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('reports', sa.Column('canonical_url', sa.String(), nullable=True))
    op.add_column('reports', sa.Column('og_tags_present', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('reports', sa.Column('schema_present', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('reports', sa.Column('robots_txt_exists', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('reports', sa.Column('sitemap_exists', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('reports', sa.Column('top_keywords', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove Pro SEO metrics columns from reports table
    op.drop_column('reports', 'top_keywords')
    op.drop_column('reports', 'sitemap_exists')
    op.drop_column('reports', 'robots_txt_exists')
    op.drop_column('reports', 'schema_present')
    op.drop_column('reports', 'og_tags_present')
    op.drop_column('reports', 'canonical_url')
    op.drop_column('reports', 'external_links_count')
    op.drop_column('reports', 'internal_links_count')
    op.drop_column('reports', 'word_count')
