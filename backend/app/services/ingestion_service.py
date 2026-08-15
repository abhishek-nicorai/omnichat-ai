import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.services.ai_service import AIService
from app.models.models import DocumentChunk, Tenant # Added Tenant import
from sqlalchemy.orm import Session

class IngestionService:
    @staticmethod
    def process_pdf(file_bytes: bytes, clerk_id: str, db: Session):
        # 1. TRANSLATION STEP: Find the internal UUID for this Clerk User
        tenant = db.query(Tenant).filter(Tenant.api_key == clerk_id).first()
        if not tenant:
            raise Exception("Tenant not found in database. Please refresh your dashboard.")

        internal_uuid = tenant.id

        # 2. Extract Text from PDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()

        # 3. Chunk Text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
        chunks = text_splitter.split_text(full_text)

        # 4. Embed and Store using the INTERNAL UUID
        for chunk in chunks:
            vector = AIService.get_embedding(chunk)
            
            db_chunk = DocumentChunk(
                tenant_id=internal_uuid, # Using the translated UUID here
                content=chunk,
                embedding=vector,
                metadata_json={"source": "pdf_upload"}
            )
            db.add(db_chunk)
        
        db.commit()
        return len(chunks)