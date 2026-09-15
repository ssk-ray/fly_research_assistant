from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os

from ingest import ingest_pdf
from rag import ask_paper


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "RAG backend is running"
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    suffix = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:

        contents = await file.read()
        temp.write(contents)

        temp_path = temp.name


    try:

        pages, chunks, chunk_data = ingest_pdf(temp_path)

        return {
            "success": True,
            "filename": file.filename,
            "pages": pages,
            "chunks": chunks,
            "chunkData": chunk_data
        }

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/ask")
async def ask_question(data: dict):

    question = data.get("question", "")
    history = data.get("history", [])
    top_k = data.get("top_k", 3)


    if not question.strip():

        return {
            "success": False,
            "error": "Question cannot be empty"
        }


    answer, sources = ask_paper(
        question,
        n_results=top_k,
        history=history
    )


    formatted_sources = []

    for i, source in enumerate(sources):

        formatted_sources.append({

            "chunkId": f"source-{i}",

            "page": source.get("page", 0),

            "section": "Paper",

            "text": source.get("text", ""),

            "similarityScore": 0

        })


    return {

        "success": True,

        "answer": answer,

        "sources": formatted_sources,

        "reasoningSteps": []

    }