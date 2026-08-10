"""
Shared API dependencies.

`get_db` provides the database session. `get_current_user` / `get_current_admin`
perform JWT authentication and role checks so protected endpoints can inject the
authenticated `User`.
"""

from typing import Generator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.enums import UserRole
from app.models.user import User

# Reads the `Authorization: Bearer <token>` header. `auto_error=False` lets us
# raise a consistent UnauthorizedError (with our envelope) when absent.
_bearer_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session.

    The session is always closed, even if the endpoint raises.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the authenticated user from the Bearer token.

    Raises:
        UnauthorizedError: if the token is missing/invalid or the user no
            longer exists or is disabled.
    """
    if credentials is None:
        raise UnauthorizedError("Authentication required — provide a Bearer token")

    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    user = db.get(User, user_id) if user_id else None

    if not user or not user.is_active:
        raise UnauthorizedError("User is not active or no longer exists")

    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Resolve the authenticated user and require the admin role.

    Raises:
        ForbiddenError: if the user is not an admin/superuser.
    """
    if current_user.role != UserRole.ADMIN and not current_user.is_superuser:
        raise ForbiddenError("Admin privileges required")
    return current_user
