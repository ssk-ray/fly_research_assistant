#  Fly — RAG-Powered Research Assistant

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://flyresearchassistant.vercel.app)

Upload a PDF and ask questions about it. Fly finds the most relevant sections of the document and answers using only that content, with source citations so you can verify the answer.

## Tech Stack

- **Backend:** FastAPI, ChromaDB, Google Gemini API
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Deployment:** Render (backend), Vercel (frontend)

## How It Works

1. Upload a PDF → it's split into chunks and embedded into a vector database
2. Ask a question → the most relevant chunks are retrieved and sent to Gemini along with your question
3. Get an answer grounded in the actual document, with the source chunks it used


## Deployment

- **Backend (Render):** build with `pip install -r requirements.txt`, start with `uvicorn api:app --host 0.0.0.0 --port $PORT`, set `GEMINI_API_KEY` as an environment variable
- **Frontend (Vercel):** build with `npm run build`, output directory `dist`, set `VITE_API_URL` to your Render backend URL

## Also Available

A version of this project that runs entirely offline using a local [Ollama](https://ollama.com) model instead of the Gemini API: *[[Fly_ollama_version](https://github.com/ssk-ray/Fly_ollama)]*
