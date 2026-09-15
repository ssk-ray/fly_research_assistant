import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ResearchPaper, ThemeStyle } from '../types';
import { uploadPaper } from '../services/ragEngine';

interface UploadPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperLoaded: (newPaper: ResearchPaper) => void;
  theme: ThemeStyle;
}

export const UploadPaperModal: React.FC<UploadPaperModalProps> = ({
  isOpen,
  onClose,
  onPaperLoaded,
  theme
}) => {
  const [paperTitle, setPaperTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setErrorMessage(null);
    if (!paperTitle) {
      setPaperTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) {
      setErrorMessage('Please choose a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // This actually sends the PDF to your Python backend, which loads it,
      // chunks it, embeds it, and stores it in ChromaDB — the same pipeline
      // your ingest.py runs. This is real ingestion, not a preview.
      const { pages, chunks, chunkData } = await uploadPaper(selectedFile);

      const realChunks = chunkData.map((c, idx) => ({
        id: c.id,
        page: c.page,
        section: `Chunk ${idx + 1}`,
        content: c.content,
        charCount: c.content.length,
        tags: ['uploaded']
      }));

      const newPaper: ResearchPaper = {
        id: `custom-${Date.now()}`,
        title: paperTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, ''),
        shortTitle: (paperTitle.trim() || selectedFile.name).slice(0, 35),
        authors: authors.trim() ? authors.split(',').map(a => a.trim()) : ['Uploaded Author'],
        institution: 'Uploaded Document',
        year: new Date().getFullYear(),
        abstract: `This document was uploaded and indexed by Fly (${pages} pages, ${chunks} chunks). Ask any question below — answers are grounded in the actual ingested content.`,
        totalPages: pages,
        totalChunks: chunks,
        sections: [],
        classesCovered: [],
        keyMetrics: [
          { label: 'Pages Indexed', value: `${pages}`, subtext: 'Loaded from PDF' },
          { label: 'Chunks Created', value: `${chunks}`, subtext: 'Embedded into ChromaDB' },
          { label: 'Grounding Mode', value: 'Active', subtext: 'RAG semantic lookup' }
        ],
        modelComparisons: [],
        instanceDistribution: [],
        chunks: realChunks
      };

      onPaperLoaded(newPaper);
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not reach the backend. Is your FastAPI server running on port 8000?'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const isDark = theme === 'dark';
  const accentColor = isDark ? '#e07a52' : '#c25732';
  const cardBg = isDark ? '#182523' : '#ffffff';
  const cardBorder = isDark ? '#293c39' : '#ece7de';
  const textPrimary = isDark ? '#f5f3ee' : '#221f1d';
  const textMuted = isDark ? '#92a6a0' : '#736d65';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: accentColor }}
            >
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: textPrimary }}>
                Upload & Ingest Research Paper
              </h3>
              <p className="text-[11px]" style={{ color: textMuted }}>
                Fly will split, index, and ground citations for your paper
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: textMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* File dropzone */}
          <div>
            <label className="font-medium block mb-1" style={{ color: textPrimary }}>
              Document File (PDF)
            </label>
            <label
              className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-black/5"
              style={{ borderColor: cardBorder }}
            >
              <FileText className="w-8 h-8 mb-2 opacity-50" style={{ color: accentColor }} />
              <span className="font-semibold text-xs mb-0.5" style={{ color: textPrimary }}>
                {fileName ? fileName : 'Click to select or drag a PDF here'}
              </span>
              <span className="text-[11px]" style={{ color: textMuted }}>
                This gets sent to your Fly backend and fully indexed into ChromaDB
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Paper Title input */}
          <div>
            <label className="font-medium block mb-1" style={{ color: textPrimary }}>
              Paper Title
            </label>
            <input
              type="text"
              value={paperTitle}
              onChange={e => setPaperTitle(e.target.value)}
              placeholder="e.g. Audio-Based Insect Classification using Machine Learning"
              className="w-full px-3 py-2 rounded-lg border outline-hidden"
              style={{
                backgroundColor: isDark ? '#131e1c' : '#faf8f5',
                borderColor: cardBorder,
                color: textPrimary
              }}
            />
          </div>

          {/* Authors */}
          <div>
            <label className="font-medium block mb-1" style={{ color: textPrimary }}>
              Authors (optional)
            </label>
            <input
              type="text"
              value={authors}
              onChange={e => setAuthors(e.target.value)}
              placeholder="e.g. Jane Doe, John Smith (MIT)"
              className="w-full px-3 py-2 rounded-lg border outline-hidden"
              style={{
                backgroundColor: isDark ? '#131e1c' : '#faf8f5',
                borderColor: cardBorder,
                color: textPrimary
              }}
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <div
              className="flex items-start gap-2 p-3 rounded-lg border text-[11px]"
              style={{ borderColor: '#e07a52', backgroundColor: isDark ? 'rgba(224,122,82,0.1)' : 'rgba(194,87,50,0.06)', color: isDark ? '#e58f6b' : '#b24c29' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: cardBorder }}>
          <span className="text-[11px]" style={{ color: textMuted }}>
            {selectedFile ? `${selectedFile.name} ready to upload` : 'No file selected yet'}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-black/5"
              style={{ borderColor: cardBorder, color: textPrimary }}
            >
              Cancel
            </button>
            <button
              onClick={handleProcessDocument}
              disabled={!selectedFile || isProcessing}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity flex items-center gap-1.5 shadow-xs"
              style={{
                backgroundColor: accentColor,
                opacity: !selectedFile || isProcessing ? 0.5 : 1
              }}
            >
              {isProcessing ? 'Uploading & Indexing...' : 'Process Paper with Fly'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};