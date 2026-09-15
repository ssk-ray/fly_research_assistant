import os
from google import genai

# Shared between ingest.py and rag.py so both use the exact same embedding
# model consistently, and so we only create one client.
_gemini_client = None


def get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    return _gemini_client


def embed_text(text: str):
    """
    Returns an embedding vector for a single piece of text, using Gemini's
    embedding API. This replaces a locally-loaded sentence-transformers
    model, which pulled in PyTorch and used enough RAM to crash Render's
    free tier (512MB limit). This approach has ~zero local memory cost —
    the actual embedding computation happens on Google's servers.
    """
    client = get_gemini_client()
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
    )
    return result.embeddings[0].values