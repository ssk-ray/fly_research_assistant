import React, { useState } from 'react';
import { BookOpen, Search, ArrowLeft, ArrowRight, Bookmark, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { ResearchPaper, ThemeStyle, PaperChunk } from '../types';

interface SplitPaperViewerProps {
  paper: ResearchPaper;
  theme: ThemeStyle;
  highlightedChunkId?: string;
  onAskAboutChunk: (chunk: PaperChunk) => void;
}

export const SplitPaperViewer: React.FC<SplitPaperViewerProps> = ({
  paper,
  theme,
  highlightedChunkId,
  onAskAboutChunk
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const pages = Array.from({ length: paper.totalPages }, (_, i) => i + 1);

  const pageChunks = paper.chunks.filter(c => c.page === currentPage);

  // Theme palettes
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#182523' : '#ffffff';
  const cardBorder = isDark ? '#293c39' : '#ece7de';
  const textPrimary = isDark ? '#f5f3ee' : '#221f1d';
  const textMuted = isDark ? '#92a6a0' : '#736d65';
  const accentColor = isDark ? '#e07a52' : '#c25732';

  return (
    <div
      className="hidden md:flex md:w-80 lg:w-96 xl:w-[420px] flex-col h-full border-r shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: isDark ? '#14201e' : '#fcfbfa',
        borderColor: cardBorder
      }}
    >
      {/* Top Page Navigator Bar */}
      <div
        className="p-3 border-b flex items-center justify-between shrink-0"
        style={{
          borderColor: cardBorder,
          backgroundColor: isDark ? '#172623' : '#f8f5ee'
        }}
      >
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
          <span className="font-semibold text-xs" style={{ color: textPrimary }}>
            Document Reader
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded opacity-75 font-mono-code" style={{ color: textMuted }}>
            Pg {currentPage} / {paper.totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border text-xs disabled:opacity-30 hover:bg-black/5"
            style={{ borderColor: cardBorder, color: textPrimary }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(paper.totalPages, prev + 1))}
            disabled={currentPage === paper.totalPages}
            className="p-1 rounded border text-xs disabled:opacity-30 hover:bg-black/5"
            style={{ borderColor: cardBorder, color: textPrimary }}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Page jump selector */}
      <div className="p-2 border-b flex items-center gap-1 overflow-x-auto text-[10px] shrink-0" style={{ borderColor: cardBorder }}>
        {pages.map(pg => (
          <button
            key={pg}
            onClick={() => setCurrentPage(pg)}
            className={`px-2 py-0.5 rounded transition-all shrink-0 font-mono-code ${
              currentPage === pg ? 'font-bold shadow-xs' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: currentPage === pg ? accentColor : 'transparent',
              color: currentPage === pg ? '#ffffff' : textPrimary
            }}
          >
            p.{pg}
          </button>
        ))}
      </div>

      {/* Page Content Chunks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pageChunks.length === 0 ? (
          <div className="p-6 text-center text-xs opacity-60" style={{ color: textMuted }}>
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Page {currentPage} contains figures, tables, or supplementary appendix.</p>
            <p className="text-[11px] mt-1">Navigate to pages 1-13 to view indexed sections.</p>
          </div>
        ) : (
          pageChunks.map(chunk => {
            const isHighlighted = highlightedChunkId === chunk.id;
            return (
              <div
                key={chunk.id}
                className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                  isHighlighted ? 'ring-2' : 'hover:border-opacity-100'
                }`}
                style={{
                  backgroundColor: isHighlighted
                    ? (isDark ? 'rgba(224, 122, 82, 0.18)' : 'rgba(194, 87, 50, 0.08)')
                    : cardBg,
                  borderColor: isHighlighted ? accentColor : cardBorder
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs" style={{ color: accentColor }}>
                    {chunk.section}
                  </span>
                  <span className="text-[10px] font-mono-code opacity-60" style={{ color: textMuted }}>
                    {chunk.id}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed mb-3 whitespace-pre-line" style={{ color: textPrimary }}>
                  {chunk.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: cardBorder }}>
                  <span className="text-[10px] opacity-60" style={{ color: textMuted }}>
                    Page {chunk.page}
                  </span>
                  <button
                    onClick={() => onAskAboutChunk(chunk)}
                    className="text-[11px] font-semibold flex items-center gap-1 hover:underline"
                    style={{ color: accentColor }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Ask about this excerpt →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};