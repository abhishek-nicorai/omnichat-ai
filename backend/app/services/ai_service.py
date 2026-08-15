import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AIService:
    @staticmethod
    def get_embedding(text: str):
        """Convert text to a 768-dimensional vector using the new stable model."""
        # We switched from text-embedding-004 to gemini-embedding-001
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document",
            title="Embedding for RAG",
            output_dimensionality=768  # MUST match your Postgres VECTOR(768) column
        )
        return result['embedding']

    @staticmethod
    async def generate_response(prompt: str, context: str):
        """Generate a response using Gemini 1.5 Flash."""
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        full_prompt = f"""
        You are a helpful AI assistant. Answer the user's question using ONLY the provided context.
        If the answer is not in the context, say you don't know.
        
        CONTEXT:
        {context}
        
        USER QUESTION:
        {prompt}
        """
        
        response = model.generate_content(full_prompt)
        return response.text