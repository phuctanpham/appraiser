"""Initial migration - Create tasks table

Revision ID: 001
Revises: 
Create Date: 2025-10-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('schedule', sa.String(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=True, default=True),
        sa.Column('last_run', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index on task name for faster lookups
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
    op.create_index(op.f('ix_tasks_name'), 'tasks', ['name'], unique=False)
    op.create_index(op.f('ix_tasks_enabled'), 'tasks', ['enabled'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_tasks_enabled'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_name'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    
    # Drop table
    op.drop_table('tasks')