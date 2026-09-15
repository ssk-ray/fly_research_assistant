import React, { useState } from 'react';
import { Info, Layers } from 'lucide-react';
import { ResearchPaper, ThemeStyle, DashboardTab, RAGSettings } from '../types';

interface SidebarDashboardProps {
  paper: ResearchPaper;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onSelectChunkPrompt: (prompt: string) => void;
  highlightedChunkId?: string;
  theme: ThemeStyle;
  ragSettings: RAGSettings;
  onUpdateRAGSettings: (settings: Partial<RAGSettings>) => void;
  onClose?: () => void;
}

// This panel is intentionally a single, paper-agnostic overview now —
// no benchmarks/RAG-settings/chunk-explorer tabs, since those were either
// hardcoded to one specific sample paper (and broke for any other upload)
// or duplicated what the left-hand paper reader already shows.
export const SidebarDashboard: React.FC<SidebarDashboardProps> = ({
  paper,
  theme
}) => {
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const isDark = theme === 'dark';
  const cardBg = isDark ? '#182523' : '#ffffff';
  const cardBorder = isDark ? '#293c39' : '#ece7de';
  const textPrimary = isDark ? '#f5f3ee' : '#221f1d';
  const textMuted = isDark ? '#92a6a0' : '#736d65';
  const accentColor = isDark ? '#e07a52' : '#c25732';

  return (
    <aside
      className="hidden lg:flex lg:w-80 xl:w-96 flex-col h-full border-l shrink-0 transition-colors duration-200 z-10"
      style={{
        backgroundColor: isDark ? '#131e1c' : '#fcfbfa',
        borderColor: cardBorder
      }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Metadata Card */}
        <div
          className="p-4 rounded-xl border shadow-xs"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{
                backgroundColor: isDark ? 'rgba(224, 122, 82, 0.15)' : 'rgba(194, 87, 50, 0.1)',
                color: accentColor
              }}
            >
              Indexed Document
            </span>
            {paper.doiOrArxiv && (
              <span className="text-[11px] font-mono-code opacity-60">
                {paper.doiOrArxiv.split(' ')[0]}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-base leading-snug mb-2 font-display" style={{ color: textPrimary }}>
            {paper.title}
          </h3>

          <div className="text-xs space-y-1 mb-3" style={{ color: textMuted }}>
            {paper.authors.length > 0 && paper.authors[0] !== 'Uploaded Author' && (
              <p>
                <strong className="font-medium" style={{ color: textPrimary }}>Authors:</strong>{' '}
                {paper.authors.join(', ')}
              </p>
            )}
            <p className="text-[11px] leading-relaxed opacity-80">
              {paper.institution}
            </p>
          </div>

          {/* Abstract preview */}
          <div
            className="p-3 rounded-lg text-xs leading-relaxed border"
            style={{
              backgroundColor: isDark ? '#14201e' : '#fbf9f5',
              borderColor: cardBorder,
              color: textMuted
            }}
          >
            <div className="flex items-center justify-between mb-1.5 font-medium" style={{ color: textPrimary }}>
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Info className="w-3 h-3" /> Summary
              </span>
              {paper.abstract.length > 210 && (
                <button
                  onClick={() => setShowFullAbstract(!showFullAbstract)}
                  className="text-[10px] underline hover:opacity-100"
                >
                  {showFullAbstract ? 'Show less' : 'Read all'}
                </button>
              )}
            </div>
            <p>
              {showFullAbstract || paper.abstract.length <= 210
                ? paper.abstract
                : `${paper.abstract.slice(0, 210)}...`}
            </p>
          </div>
        </div>

        {/* Key Metrics Grid — generic, works for any uploaded document */}
        <div className="grid grid-cols-2 gap-2.5">
          {paper.keyMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border shadow-xs flex flex-col justify-between"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <span className="text-[10px] font-medium tracking-wide uppercase" style={{ color: textMuted }}>
                {metric.label}
              </span>
              <div className="text-xl font-bold my-1 font-display" style={{ color: accentColor }}>
                {metric.value}
              </div>
              <p className="text-[10px] leading-tight" style={{ color: textMuted }}>
                {metric.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Pointer to the real chunk content, now shown in the left reader panel */}
        <div
          className="p-3.5 rounded-xl border text-xs flex items-start gap-2.5"
          style={{ backgroundColor: cardBg, borderColor: cardBorder, color: textMuted }}
        >
          <Layers className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
          <span>
            All <strong style={{ color: textPrimary }}>{paper.totalChunks}</strong> indexed chunks across{' '}
            <strong style={{ color: textPrimary }}>{paper.totalPages}</strong> pages are browsable in the
            document reader panel on the left.
          </span>
        </div>
      </div>
    </aside>
  );
};