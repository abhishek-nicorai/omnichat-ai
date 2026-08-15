from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ingestion_service import IngestionService

router = APIRouter()

@router.post("/upload")
async def upload_document(
    tenant_id: str, # This comes from the Clerk ID
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported currently")

    try:
        content = await file.read()
        num_chunks = IngestionService.process_pdf(content, tenant_id, db)
        return {"message": "Success", "chunks_processed": num_chunks}
    except Exception as e:
        print(f"Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))