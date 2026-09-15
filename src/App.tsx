import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SidebarDashboard } from './components/SidebarDashboard';
import { ChatInterface } from './components/ChatInterface';
import { SplitPaperViewer } from './components/SplitPaperViewer';
import { UploadPaperModal } from './components/UploadPaperModal';
import { askPaperQuestion } from './services/ragEngine';
import { Upload, FileText } from 'lucide-react';
import {
  ResearchPaper,
  ChatMessage,
  ThemeStyle,
  ViewMode,
  DashboardTab,
  RAGSettings,
  PaperChunk
} from './types';

export default function App() {
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<ThemeStyle>('dark');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('overview');
  const [highlightedChunkId, setHighlightedChunkId] = useState<string | undefined>();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [ragSettings, setRagSettings] = useState<RAGSettings>({
    topK: 3,
    showReasoning: true,
    autoExpandSources: true,
    speechEnabled: false
  });

  // Handle keyboard shortcuts (e.g. Cmd+B to toggle sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update RAG settings
  const handleUpdateRAGSettings = (newSettings: Partial<RAGSettings>) => {
    setRagSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Send message and get grounded RAG answer
  const handleSendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading || !paper) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const historyForRAG = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await askPaperQuestion(
        query,
        paper,
        historyForRAG,
        ragSettings.topK
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: result.sources,
        reasoningSteps: result.reasoningSteps
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If speech enabled, read aloud automatically
      if (ragSettings.speechEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = result.answer.replace(/\[.*?\]/g, '').replace(/[*#`_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Error querying paper:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an unexpected issue while retrieving data from the paper. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, paper, ragSettings]);

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  // When clicking a source or chunk to highlight in sidebar
  const handleHighlightChunk = (chunkId: string) => {
    setHighlightedChunkId(chunkId);
    setActiveDashboardTab('chunks');
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  };

  // Ask about a specific chunk from the reader or dashboard
  const handleAskAboutChunk = (chunk: PaperChunk) => {
    handleSendMessage(`Explain this finding from ${chunk.section} (Page ${chunk.page}): "${chunk.content.slice(0, 100)}..."`);
  };

  // Reset to the empty (no paper loaded) state
  const handleReset = () => {
    setPaper(null);
    setMessages([]);
    setHighlightedChunkId(undefined);
  };

  // When user uploads a new paper
  const handlePaperLoaded = (newPaper: ResearchPaper) => {
    setPaper(newPaper);
    setMessages([]);
    setHighlightedChunkId(undefined);
  };

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden text-sm select-text transition-colors duration-200"
      style={{
        backgroundColor: theme === 'dark' ? '#111a19' : '#faf8f5',
        color: theme === 'dark' ? '#f5f3ee' : '#221f1d'
      }}
    >
      {/* Top Navbar with App Identity & Comprehensive Toggles */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        theme={theme}
        onThemeChange={setTheme}
        speechEnabled={ragSettings.speechEnabled}
        onToggleSpeech={() => handleUpdateRAGSettings({ speechEnabled: !ragSettings.speechEnabled })}
        onOpenUpload={() => setIsUploadOpen(true)}
        hasPaper={!!paper}
        onReset={handleReset}
      />

      {/* Main Workspace Area */}
      {!paper ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: theme === 'dark' ? '#203330' : '#faede8',
                color: theme === 'dark' ? '#e07a52' : '#c25732',
                border: `1px solid ${theme === 'dark' ? '#293c39' : '#ece7de'}`
              }}
            >
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: theme === 'dark' ? '#f5f3ee' : '#221f1d' }}>
              Upload a paper to get started
            </h2>
            <p className="text-sm" style={{ color: theme === 'dark' ? '#92a6a0' : '#736d65' }}>
              Fly answers questions about your documents, grounded in the actual content — no sample data, just your own PDF.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-xs transition-transform active:scale-95"
              style={{ backgroundColor: theme === 'dark' ? '#e07a52' : '#c25732' }}
            >
              <Upload className="w-4 h-4" />
              Upload Paper
            </button>
          </div>
        </div>
      ) : (
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left / Split Paper Reader (Shown in 'split' mode on medium+ screens) */}
        {viewMode === 'split' && (
          <SplitPaperViewer
            paper={paper}
            theme={theme}
            highlightedChunkId={highlightedChunkId}
            onAskAboutChunk={handleAskAboutChunk}
          />
        )}

        {/* Center: Main Interactive Chat Experience (Shown in 'split' and 'chat' modes) */}
        {viewMode !== 'dashboard' && (
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onRegenerate={handleRegenerate}
            paper={paper}
            theme={theme}
            ragSettings={ragSettings}
            onHighlightChunk={handleHighlightChunk}
          />
        )}

        {/* Side Dashboard: paper overview metadata */}
        {(isSidebarOpen || viewMode === 'dashboard') && (
          <SidebarDashboard
            paper={paper}
            activeTab={activeDashboardTab}
            onTabChange={setActiveDashboardTab}
            onSelectChunkPrompt={handleSendMessage}
            highlightedChunkId={highlightedChunkId}
            theme={theme}
            ragSettings={ragSettings}
            onUpdateRAGSettings={handleUpdateRAGSettings}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </main>
      )}

      {/* Upload Paper Modal */}
      <UploadPaperModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onPaperLoaded={handlePaperLoaded}
        theme={theme}
      />
    </div>
  );
}