from app.services.ai_service import AIService

try:
    vector = AIService.get_embedding("Hello world")
    print(f"Success! Vector length: {len(vector)}") # Should be 768
except Exception as e:
    print(f"Error: {e}")