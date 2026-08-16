import os
import google.generativeai as genai
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models.models import DocumentChunk, Tenant

load_dotenv()

# Global configuration for the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AIService:
    @staticmethod
    def get_embedding(text: str):
        """Convert text to a 768-dimensional vector using the stable model."""
        try:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type="retrieval_document",
                title="Embedding for RAG",
                output_dimensionality=768
            )
            return result['embedding']
        except Exception as e:
            print(f"CRITICAL EMBEDDING ERROR: {str(e)}")
            raise e

    @staticmethod
    async def generate_response(prompt: str, context: str):
        """Generate a grounded response using the Async Gemini client."""
        # Try using the base name which the SDK maps to the correct version
        # If 'gemini-1.5-flash' continues to 404, 'gemini-1.5-flash-latest' is the alternative
        model = genai.GenerativeModel('gemini-flash-latest')
        
        full_prompt = f"""
        You are a helpful AI assistant. Answer the user's question using ONLY the provided context.
        If the answer is not in the context, say you don't know the answer.
        
        CONTEXT:
        {context}
        
        USER QUESTION:
        {prompt}
        """
        
        try:
            # We explicitly use the async call
            response = await model.generate_content_async(full_prompt)
            
            # Use .text to get the string result
            return response.text
        except Exception as e:
            # If we still get a 404, we log it and try a fallback
            print(f"DETAILED GEMINI REASONING ERROR: {str(e)}")
            raise e

    @staticmethod
    def get_relevant_context(query: str, clerk_id: str, db: Session):
        """Perform vector similarity search scoped to the specific tenant."""
        # 1. Generate embedding for the user's question
        query_vector = AIService.get_embedding(query)

        # 2. Find the internal Tenant UUID to ensure data isolation
        tenant = db.query(Tenant).filter(Tenant.api_key == clerk_id).first()
        if not tenant:
            print(f"CONTEXT ERROR: No tenant found for clerk_id {clerk_id}")
            return ""

        # 3. Vector Similarity Search using Cosine Distance (<=>)
        chunks = db.query(DocumentChunk).filter(
            DocumentChunk.tenant_id == tenant.id
        ).order_by(
            DocumentChunk.embedding.cosine_distance(query_vector)
        ).limit(5).all()

        if not chunks:
            print(f"CONTEXT WARNING: No relevant chunks found in DB for tenant {tenant.id}")
            return ""

        # 4. Join the results into a single context string
        return "\n\n".join([c.content for c in chunks])