from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class TenantBase(BaseModel):
    name: str

class TenantCreate(TenantBase):
    clerk_id: str  # We'll use this to link Clerk to our DB

class Tenant(TenantBase):
    id: UUID
    api_key: str
    bot_name: str
    primary_color: str
    welcome_message: str
    created_at: datetime

    class Config:
        from_attributes = True