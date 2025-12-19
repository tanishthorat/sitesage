"""
Core dependencies for dependency injection.

This module centralizes all FastAPI dependencies used across the application.
"""

from fastapi import Depends
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..firebase_auth import get_current_user, get_optional_user
from ..security import verify_internal_api_key
from .. import models


# Re-export database dependency (use get_db directly - it's a generator)
get_database = get_db


# Re-export authentication dependencies
def get_authenticated_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Get authenticated user dependency (required)."""
    return current_user


def get_optional_authenticated_user(
    current_user: Optional[models.User] = Depends(get_optional_user)
) -> Optional[models.User]:
    """Get optional authenticated user dependency (for guest support)."""
    return current_user


# Re-export security dependency
def verify_api_key(_: bool = Depends(verify_internal_api_key)) -> bool:
    """Verify internal API key dependency (BFF security)."""
    return True
