import {
  CitationSource,
  ReasoningStep,
  ResearchPaper,
} from '../types';


// In local development, this stays '/api' and Vite's proxy (see
// vite.config.ts) forwards it to your backend on localhost:8000.
// In production (Vercel), set VITE_API_URL to your deployed Render/Railway
// backend's full URL (e.g. https://fly-backend.onrender.com) as an
// environment variable in the Vercel project settings — no /api prefix,
// since the deployed backend's routes are just /ask, /upload, etc.
const API_URL = import.meta.env.VITE_API_URL || '/api';


export async function askPaperQuestion(
  question: string,
  paper: ResearchPaper,
  history: { role: 'user' | 'assistant'; content: string }[],
  topK: number = 3
): Promise<{
  answer: string;
  sources: CitationSource[];
  reasoningSteps: ReasoningStep[];
}> {

  const response = await fetch(`${API_URL}/ask`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      question: question,
      history: history.slice(-4),
      top_k: topK,
    }),
  });


  if (!response.ok) {
    throw new Error(
      `Backend request failed: ${response.status}`
    );
  }


  const data = await response.json();


  if (!data.success) {
    throw new Error(
      data.error || 'Failed to get answer'
    );
  }


  return {
    answer: data.answer,

    sources: data.sources || [],

    reasoningSteps: data.reasoningSteps || [],
  };
}


/**
 * Actually sends the uploaded PDF to the FastAPI backend so it gets
 * ingested into ChromaDB. Returns the real page/chunk counts from your
 * RAG pipeline, so the UI reflects what was genuinely indexed.
 */
export async function uploadPaper(
  file: File
): Promise<{
  pages: number;
  chunks: number;
  filename: string;
  chunkData: { id: string; page: number; content: string }[];
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to process document');
  }

  return {
    pages: data.pages,
    chunks: data.chunks,
    filename: data.filename,
    chunkData: data.chunkData || [],
  };
}