from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ai_service import AIService
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/{tenant_id}/query", response_model=ChatResponse)
async def chat_with_bot(
    tenant_id: str, 
    payload: ChatRequest, 
    db: Session = Depends(get_db)
):
    context = AIService.get_relevant_context(payload.message, tenant_id, db)
    
    if not context:
        return ChatResponse(reply="I don't have any knowledge yet.")

    try:
        answer = await AIService.generate_response(payload.message, context)
        return ChatResponse(reply=answer)
    except Exception as e:
        # Return the actual error message to Swagger for easier debugging
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")