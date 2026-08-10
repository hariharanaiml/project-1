"""
Pydantic schemas for the authentication module.

Only request/response contracts are defined here — the actual auth logic
(JWT issuance, password hashing, token verification) lands in Milestone 2.
"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str = Field(min_length=1, description="User password")


class TokenPayload(BaseModel):
    """Decoded JWT payload (contract for Milestone 2)."""

    sub: str
    exp: int
    iat: int
    role: Optional[str] = None


class TokenResponse(BaseModel):
    """Token response returned after successful authentication."""

    success: bool = True
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional["UserRead"] = None


# Avoid circular import — import lazily at module bottom.
from app.schemas.user import UserRead  # noqa: E402

TokenResponse.model_rebuild()

