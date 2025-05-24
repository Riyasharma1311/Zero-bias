from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
import re

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.DOCTOR
    specialization: Optional[str] = None
    license_number: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    is_active: Optional[bool] = None

    @validator('password')
    def password_strength(cls, v):
        """Validate password strength if provided."""
        if v is None:
            return v
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserInDBBase(UserBase):
    """Schema for user information from database."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """Schema for user response."""
    is_active: bool


class UserInDB(UserInDBBase):
    """Schema for user with hashed password."""
    hashed_password: str


class Token(BaseModel):
    """Schema for access token."""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Schema for token payload with user information."""
    sub: Optional[int] = None
    role: Optional[str] = None

