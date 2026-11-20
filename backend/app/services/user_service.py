"""
User service — business logic for authentication and user management.

This layer orchestrates the user repository and password hashing so API
routes stay thin. The auth router (register/login/me/logout) and the users
router both consume this service.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, UnauthorizedError
from app.core.logging import get_logger
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.utils.helpers import utcnow

logger = get_logger(__name__)


class UserService:
    """Encapsulates all user/auth business operations."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = UserRepository(db)

    # ── Queries ─────────────────────────────────────────────────────────────────

    def get_user(self, user_id: str) -> User:
        """Fetch a user by ID or raise NotFoundError."""
        user = self.repo.get(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Fetch a user by normalized email (None when missing)."""
        return self.repo.get_by_email(email)

    def email_exists(self, email: str) -> bool:
        """Return True when a user with the email already exists."""
        return self.repo.email_exists(email)

    # ── Mutations ───────────────────────────────────────────────────────────────

    def create_user(self, payload: UserCreate) -> User:
        """Create a user with a bcrypt-hashed password."""
        user = User(
            email=payload.email.lower(),
            full_name=payload.full_name,
            phone=payload.phone,
            role=payload.role,
            hashed_password=hash_password(payload.password),
        )
        self.repo.save(user)
        logger.info("Created user %s (%s)", user.id, user.email)
        return user

    def authenticate(self, email: str, password: str) -> User:
        """
        Verify email + password and return the active user.

        Raises:
            UnauthorizedError: if the credentials are invalid or the account
                is deactivated.
        """
        normalized_email = email.strip().lower()
        user = self.repo.get_by_email(normalized_email)
        user_found = user is not None
        pw_ok = verify_password(password, user.hashed_password) if user_found else False
        
        logger.info(
            "Authentication attempt: email_normalized=%s user_found=%s password_verified=%s is_active=%s",
            normalized_email,
            user_found,
            pw_ok,
            user.is_active if user_found else None,
        )

        if not user or not pw_ok:
            raise UnauthorizedError("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated")

        user.last_login_at = utcnow()
        self.repo.save(user)
        return user
