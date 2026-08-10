"""
Security utilities — password hashing and JWT access tokens.

Uses bcrypt directly (bcrypt >= 4.0 exposes passlib-compatible helpers and
has no dependency on the unmaintained passlib) and PyJWT for tokens.
Settings come from `app/core/config.Settings`.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

from app.core.config import settings
from app.core.exceptions import UnauthorizedError

#: Token types we accept — only access tokens are issued today.
_ACCESS_TOKEN_TYPE = "access"

#: Claim keys shared between creation and decoding.
_SUBJECT_KEY = "sub"
_TYPE_KEY = "type"
_ROLE_KEY = "role"


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt (returns the encoded hash)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        # Malformed hash (e.g. a legacy/placeholder value) — treat as invalid.
        return False


def create_access_token(subject: str, role: Optional[str] = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject: The token subject (user id).
        role: Optional user role claim.

    Returns:
        The encoded JWT string.
    """
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        _SUBJECT_KEY: subject,
        _TYPE_KEY: _ACCESS_TOKEN_TYPE,
        _ROLE_KEY: role,
        "iat": now,
        "exp": expires,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate an access token.

    Raises:
        UnauthorizedError: if the token is missing, expired, malformed, or
            not an access token.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise UnauthorizedError("Access token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise UnauthorizedError("Invalid access token") from exc

    if payload.get(_TYPE_KEY) != _ACCESS_TOKEN_TYPE or not payload.get(_SUBJECT_KEY):
        raise UnauthorizedError("Invalid access token")

    return payload
