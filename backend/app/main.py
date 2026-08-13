from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.db.session import engine
from app.models import models
 
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="OmniChat AI API")

# Enable CORS for the future Widget and Admin Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our modular API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to OmniChat AI API", "docs": "/docs"}