"""Schemas for institution settings."""

import uuid

from pydantic import BaseModel, ConfigDict


class InstitutionOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    domain: str | None
    subscription_tier: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class InstitutionUpdate(BaseModel):
    name: str | None = None
    domain: str | None = None
