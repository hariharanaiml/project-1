"""
Authentication endpoints.

Real registration/login with bcrypt password hashing and JWT issuance.
All responses use the standard `{ success, data, meta }` envelope; `data`
carries `access_token` / `token_type` / `expires_in` / `user`.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.exceptions import ConflictError
from app.core.responses import ok_response
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.schemas.user import UserCreate, UserRead
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _token_payload(user: User) -> dict:
    """Build the standard auth data payload (token + user) for responses."""
    token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
        "user": UserRead.model_validate(user).model_dump(mode="json"),
    }


@router.post(
    "/register",
    summary="Register a new user",
    status_code=status.HTTP_201_CREATED,
)
async def register(payload: UserCreate, db: Session = Depends(get_db)) -> dict:
    """
    Register a new user account.

    Validates that the email is not already in use, hashes the password with
    bcrypt, persists the user, and returns an access token.
    """
    service = UserService(db)
    if service.email_exists(payload.email):
        raise ConflictError("An account with this email already exists")

    user = service.create_user(payload)

    return ok_response(_token_payload(user))


@router.post("/login", summary="Log in")
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    """
    Log in with email + password.

    Verifies the credentials, records the login time, and returns an access
    token in the standard envelope.
    """
    user = UserService(db).authenticate(payload.email, payload.password)

    return ok_response(_token_payload(user))


@router.get("/me", summary="Get current user")
async def me(current_user: User = Depends(get_current_user)) -> dict:
    """
    Return the authenticated user's profile.

    Requires a valid Bearer token.
    """
    return ok_response(UserRead.model_validate(current_user).model_dump(mode="json"))


@router.post("/logout", summary="Log out")
async def logout(current_user: User = Depends(get_current_user)) -> dict:
    """
    End the current session.

    Access tokens are stateless JWTs, so there is no server-side session to
    destroy — the client discards the token on logout. This endpoint still
    requires a valid token so expired/revoked credentials receive a proper
    401 and the client can clear its local session safely.
    """
    return ok_response({"message": "Logged out successfully"})
