from datetime import datetime

from pydantic import BaseModel

from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str
    full_name: str
    email: str | None = None
    password: str
    role: UserRole = UserRole.STAFF


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str | None
    role: UserRole
    is_active: bool
    created_at: datetime | None

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
