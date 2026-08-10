"""
User endpoints.

Exposes the authenticated user's own profile via `GET /users/me`. Admin
management of other users is out of scope for this milestone.
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.responses import ok_response
from app.models.user import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", summary="Get current user")
async def get_me(current_user: User = Depends(get_current_user)) -> dict:
    """
    Return the authenticated user's profile.

    RESTful alias for `GET /auth/me`. Requires a valid Bearer token.
    """
    return ok_response(UserRead.model_validate(current_user).model_dump(mode="json"))
