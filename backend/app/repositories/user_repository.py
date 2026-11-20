"""
User repository.

Extends the generic `BaseRepository` with user-specific queries: lookup by
email (case-insensitive normalized) and email-existence checks.

Kept intentionally thin — business rules live in `services/user_service.py`.
"""

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Data-access operations specific to the User model."""

    def __init__(self, db: Session) -> None:
        super().__init__(db, User)

    def get_by_email(self, email: str) -> Optional[User]:
        """Fetch a user by normalized (trimmed, lowercased) email."""
        normalized = email.strip().lower()
        stmt = select(User).where(func.lower(User.email) == normalized)
        return self.db.scalars(stmt).first()

    def email_exists(self, email: str) -> bool:
        """Return True when a user with the given email already exists."""
        normalized = email.strip().lower()
        stmt = select(func.count()).select_from(User).where(func.lower(User.email) == normalized)
        return int(self.db.scalars(stmt).one()) > 0
