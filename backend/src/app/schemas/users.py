"""Schemas for institution user management."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class UserListItem(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str | None
    role: str
    status: str
    is_active: bool
    last_login_at: datetime | None
    created_at: datetime


class PaginatedUsers(BaseModel):
    users: list[UserListItem]
    total: int
    limit: int
    offset: int


class UserCreate(BaseModel):
    email: str
    full_name: str | None = None
    password: str
    role: str = "student"


class UserUpdate(BaseModel):
    role: str | None = None
    status: str | None = None  # active | suspended
    is_active: bool | None = None
