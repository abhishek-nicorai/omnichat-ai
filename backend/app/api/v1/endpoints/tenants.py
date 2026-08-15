from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Tenant
from app.schemas.tenant import TenantCreate, Tenant as TenantSchema
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

@router.post("/sync", response_model=TenantSchema)
def sync_tenant(tenant_data: TenantCreate, db: Session = Depends(get_db)):
    # 1. Search by api_key (which we are currently storing the clerk_id in)
    db_tenant = db.query(Tenant).filter(Tenant.api_key == tenant_data.clerk_id).first()
    
    if db_tenant:
        print(f"Tenant found: {db_tenant.name}") # Debug log in terminal
        return db_tenant

    # 2. Create new if not found
    print(f"Creating new tenant for: {tenant_data.name}")
    new_tenant = Tenant(
        name=tenant_data.name,
        api_key=tenant_data.clerk_id,
        bot_name=f"{tenant_data.name}'s Bot",
        primary_color="#4F46E5", # Setting a visible indigo color instead of black
        welcome_message="Hello! How can I help you today?"
    )
    
    try:
        db.add(new_tenant)
        db.commit()
        db.refresh(new_tenant)
        return new_tenant
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


        # Add this schema for updates
class TenantUpdate(BaseModel):
    bot_name: Optional[str] = None
    primary_color: Optional[str] = None
    welcome_message: Optional[str] = None

@router.patch("/{tenant_id}", response_model=TenantSchema)
def update_tenant(
    tenant_id: str, 
    tenant_update: TenantUpdate, 
    db: Session = Depends(get_db)
):
    # Find the tenant by api_key (which is the clerk_id)
    db_tenant = db.query(Tenant).filter(Tenant.api_key == tenant_id).first()
    
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Update only the fields provided
    update_data = tenant_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tenant, key, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant