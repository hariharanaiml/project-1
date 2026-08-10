"""Pydantic schemas for the User model."""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enums import UserRole, UserStatus

# Reasonably permissive phone pattern: optional +, digits, spaces, dashes, parens.
PHONE_RE = re.compile(r"^[+]?[0-9\s\-()]{7,20}$")


class UserBase(BaseModel):
    """Shared user fields."""

    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=32)
    role: UserRole = UserRole.CITIZEN

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not PHONE_RE.match(value):
            raise ValueError("Phone number must contain only digits, spaces, dashes, or parentheses.")
        return value


class UserCreate(UserBase):
    """Request schema for user registration (auth logic lands in Milestone 2)."""

    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    """Partial update of user profile fields."""

    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=32)
    role: Optional[UserRole] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not PHONE_RE.match(value):
            raise ValueError("Phone number must contain only digits, spaces, dashes, or parentheses.")
        return value


class UserRead(BaseModel):
    """Response schema for a user."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    status: UserStatus
    is_active: bool
    is_superuser: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None


class UserListResponse(BaseModel):
    """Response envelope for a list of users."""

    success: bool = True
    data: list[UserRead]
    total: int


class UserDetailResponse(BaseModel):
    """Response envelope for a single user."""

    success: bool = True
    data: UserRead

