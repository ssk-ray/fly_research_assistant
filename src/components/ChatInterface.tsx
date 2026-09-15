import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, CitationSource, ResearchPaper, ThemeStyle, RAGSettings } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (query: string) => void;
  onClearChat: () => void;
  onRegenerate: () => void;
  paper: ResearchPaper;
  theme: ThemeStyle;
  ragSettings: RAGSettings;
  onHighlightChunk: (chunkId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  onRegenerate,
  paper,
  theme,
  ragSettings,
  onHighlightChunk
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (customQuery?: string) => {
    const textToSend = customQuery || inputQuery;
    if (!textToSend.trim() || isLoading) return;
    onSendMessage(textToSend.trim());
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text for speech
    const cleanText = text.replace(/\[.*?\]/g, '').replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: prev[msgId] === undefined ? !ragSettings.autoExpandSources : !prev[msgId]
    }));
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [msgId]: prev[msgId] === undefined ? !ragSettings.showReasoning : !prev[msgId]
    }));
  };

  // Theme palettes
  const isDark = theme === 'dark';
  const accentColor = isDark ? '#e07a52' : '#c25732';
  const bubbleUserBg = isDark ? '#243b37' : '#f2ebe4';
  const bubbleAssistantBg = isDark ? '#182523' : '#ffffff';
  const borderColor = isDark ? '#293c39' : '#ece7de';
  const textPrimary = isDark ? '#f5f3ee' : '#221f1d';
  const textMuted = isDark ? '#92a6a0' : '#736d65';

  const quickPrompts = [
    {
      title: "Summarize",
      query: "Give me a concise summary of this document."
    },
    {
      title: "Key Findings",
      query: "What are the main findings or conclusions in this document?"
    },
    {
      title: "Methodology",
      query: "What methodology or approach does this document use?"
    },
    {
      title: "Limitations",
      query: "What limitations or open questions does this document mention?"
    }
  ];

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden relative"
      style={{ backgroundColor: isDark ? '#111a19' : '#faf8f5' }}
    >
      {/* Top message stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="max-w-2xl mx-auto pt-8 pb-12 text-center space-y-6 animate-in fade-in duration-300">
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-xs transition-transform hover:scale-105"
              style={{
                backgroundColor: isDark ? '#203330' : '#faede8',
                color: accentColor,
                border: `1px solid ${borderColor}`
              }}
            >
              <FileText className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight mb-2" style={{ color: textPrimary }}>
                Welcome to Fly
              </h2>
              <p className="text-xs md:text-sm max-w-lg mx-auto leading-relaxed" style={{ color: textMuted }}>
                Your research paper copilot. Ask any question to get precise answers strictly grounded in{' '}
                <strong className="font-semibold" style={{ color: textPrimary }}>
                  "{paper.shortTitle}"
                </strong>{' '}
                with exact page citations and source quotes.
              </p>
            </div>

            {/* Quick Starters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(p.query)}
                  className="p-3.5 rounded-xl border text-xs text-left transition-all hover:translate-y-[-1px] hover:shadow-sm flex flex-col justify-between group"
                  style={{
                    backgroundColor: bubbleAssistantBg,
                    borderColor: borderColor
                  }}
                >
                  <span className="font-semibold text-xs mb-1 flex items-center justify-between" style={{ color: textPrimary }}>
                    {p.title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accentColor }} />
                  </span>
                  <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: textMuted }}>
                    {p.query}
                  </p>
                </button>
              ))}
            </div>

            {/* Active Document Info Banner */}
            <div
              className="p-3 rounded-xl border text-[11px] flex items-center justify-center gap-2"
              style={{
                backgroundColor: isDark ? '#162220' : '#f5f1ea',
                borderColor: borderColor,
                color: textMuted
              }}
            >
              <FileText className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>
                Active Document:{' '}
                <strong className="font-semibold" style={{ color: textPrimary }}>
                  {paper.title.slice(0, 55)}...
                </strong>{' '}
                ({paper.totalPages} pages, {paper.chunks.length} vectorized chunks ready)
              </span>
            </div>
          </div>
        ) : (
          /* Conversation History */
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isLatest = index === messages.length - 1;
            const sourcesVisible =
              expandedSources[msg.id] ?? ragSettings.autoExpandSources;
            const reasoningVisible =
              expandedReasoning[msg.id] ?? ragSettings.showReasoning;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 md:gap-4 max-w-3xl mx-auto animate-in fade-in duration-200 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-xs"
                    style={{
                      backgroundColor: isDark ? '#203330' : '#faede8',
                      color: accentColor,
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[88%] sm:max-w-[82%]`}>
                  {/* Assistant Reasoning Step Expander */}
                  {!isUser && msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                    <div
                      className="rounded-xl border overflow-hidden text-xs"
                      style={{
                        backgroundColor: isDark ? '#152220' : '#fcfbf8',
                        borderColor: borderColor
                      }}
                    >
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-medium opacity-80 hover:opacity-100 transition-opacity"
                        style={{ color: textMuted }}
                      >
                        <span className="flex items-center gap-1.5 font-mono-code">
                          <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
                          Vector Reasoning Chain ({msg.reasoningSteps.length} steps)
                        </span>
                        {reasoningVisible ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {reasoningVisible && (
                        <div
                          className="px-3 pb-2.5 pt-1 border-t space-y-1 text-[11px] font-mono-code"
                          style={{
                            borderColor: borderColor,
                            color: textMuted
                          }}
                        >
                          {msg.reasoningSteps.map(step => (
                            <div key={step.step} className="flex gap-2">
                              <span className="opacity-50">[{step.step}]</span>
                              <span>
                                <strong style={{ color: textPrimary }}>{step.action}:</strong> {step.detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className="p-4 rounded-2xl border shadow-xs text-xs md:text-sm leading-relaxed"
                    style={{
                      backgroundColor: isUser ? bubbleUserBg : bubbleAssistantBg,
                      borderColor: isUser ? 'transparent' : borderColor,
                      color: textPrimary
                    }}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert space-y-2">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="font-semibold" style={{ color: textPrimary }}>
                                {children}
                              </strong>
                            ),
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            h3: ({ children }) => (
                              <h3 className="font-bold text-sm mt-3 mb-1 font-display text-base" style={{ color: textPrimary }}>
                                {children}
                              </h3>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-2 rounded-lg border text-xs" style={{ borderColor }}>
                                <table className="w-full text-left border-collapse">{children}</table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th
                                className="p-2 border-b font-semibold text-[11px] uppercase tracking-wider"
                                style={{ borderColor, backgroundColor: isDark ? '#1f302d' : '#f5f0e6' }}
                              >
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="p-2 border-b text-xs" style={{ borderColor }}>
                                {children}
                              </td>
                            ),
                            code: ({ children }) => (
                              <code
                                className="px-1.5 py-0.5 rounded font-mono-code text-[11px]"
                                style={{
                                  backgroundColor: isDark ? '#203330' : '#f0ece3',
                                  color: accentColor
                                }}
                              >
                                {children}
                              </code>
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Assistant Sources Expander (Matching & Elevating Streamlit sources used) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div
                      className="rounded-xl border overflow-hidden text-xs"
                      style={{
                        backgroundColor: isDark ? '#152220' : '#fbf9f5',
                        borderColor: borderColor
                      }}
                    >
                      <button
                        onClick={() => toggleSources(msg.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold transition-colors hover:opacity-100"
                        style={{ color: textPrimary }}
                      >
                        <span className="flex items-center gap-1.5">
                          📚 Sources Used ({msg.sources.length} Grounded Excerpts)
                        </span>
                        {sourcesVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {sourcesVisible && (
                        <div className="px-3 pb-3 pt-1 border-t space-y-2" style={{ borderColor }}>
                          {msg.sources.map((src, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg border text-xs space-y-1 transition-all hover:border-opacity-100"
                              style={{
                                backgroundColor: isDark ? '#1c2d2a' : '#ffffff',
                                borderColor: borderColor
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className="font-mono-code text-[10px] font-bold px-2 py-0.5 rounded"
                                  style={{
                                    backgroundColor: isDark ? '#273f3a' : '#faede8',
                                    color: accentColor
                                  }}
                                >
                                  Source {idx + 1} • Page {src.page}
                                </span>
                                <span className="text-[10px] font-medium" style={{ color: textMuted }}>
                                  {(src.similarityScore * 100).toFixed(0)}% Match
                                </span>
                              </div>

                              <div className="font-semibold text-[11px]" style={{ color: textPrimary }}>
                                {src.section}
                              </div>

                              <p className="text-[11px] leading-relaxed italic opacity-90" style={{ color: textMuted }}>
                                "{src.text}"
                              </p>

                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => onHighlightChunk(src.chunkId)}
                                  className="text-[10px] font-medium flex items-center gap-1 underline hover:opacity-100"
                                  style={{ color: accentColor }}
                                >
                                  Inspect Chunk in Sidebar →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assistant Action Bar */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-xs pt-1" style={{ color: textMuted }}>
                      {/* TTS Play / Stop */}
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-black/5 flex items-center gap-1 text-[11px] transition-colors"
                        title={speakingMessageId === msg.id ? "Stop voice reading" : "Listen to answer"}
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-rose-500 font-medium">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </>
                        )}
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-black/5 flex items-center gap-1 text-[11px] transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Regenerate if latest */}
                      {isLatest && (
                        <button
                          onClick={onRegenerate}
                          className="p-1 rounded hover:bg-black/5 flex items-center gap-1 text-[11px] transition-colors"
                          title="Regenerate answer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Regenerate</span>
                        </button>
                      )}

                      <span className="text-[10px] ml-auto opacity-50 font-mono-code">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mx-auto animate-in fade-in duration-150">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
              style={{
                backgroundColor: isDark ? '#203330' : '#faede8',
                color: accentColor,
                border: `1px solid ${borderColor}`
              }}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div
              className="p-4 rounded-2xl border shadow-xs text-xs space-y-2"
              style={{ backgroundColor: bubbleAssistantBg, borderColor }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: accentColor }} />
                <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: accentColor }} />
                <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: accentColor }} />
                <span className="text-xs font-medium ml-1" style={{ color: textMuted }}>
                  Fly is synthesizing grounded answer from {paper.shortTitle}...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating suggestion pills above prompt input */}
      {messages.length > 0 && (
        <div className="px-4 md:px-8 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 border-t" style={{ borderColor }}>
          <span className="opacity-50 shrink-0" style={{ color: textMuted }}>
            Follow-up:
          </span>
          <button
            onClick={() => handleSubmit("Can you go into more detail on that?")}
            className="px-2.5 py-1 rounded-full border shrink-0 transition-colors hover:bg-black/5"
            style={{ borderColor, color: textPrimary }}
          >
            More detail
          </button>
          <button
            onClick={() => handleSubmit("What page or section is that from?")}
            className="px-2.5 py-1 rounded-full border shrink-0 transition-colors hover:bg-black/5"
            style={{ borderColor, color: textPrimary }}
          >
            Where in the document?
          </button>
          <button
            onClick={() => handleSubmit("Are there any limitations or caveats related to that?")}
            className="px-2.5 py-1 rounded-full border shrink-0 transition-colors hover:bg-black/5"
            style={{ borderColor, color: textPrimary }}
          >
            Any caveats?
          </button>
        </div>
      )}

      {/* Bottom Fixed Prompt Bar */}
      <div
        className="p-3 md:p-4 border-t shrink-0"
        style={{
          backgroundColor: isDark ? '#14201e' : '#ffffff',
          borderColor
        }}
      >
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="Clear Conversation"
              className="p-2.5 rounded-xl border text-xs transition-colors hover:text-rose-600 hover:border-rose-300 shrink-0"
              style={{ borderColor, color: textMuted }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div
            className="flex-1 rounded-xl border flex items-end p-2 transition-all focus-within:ring-1"
            style={{
              backgroundColor: isDark ? '#182523' : '#faf8f5',
              borderColor
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Fly anything about ${paper.shortTitle}...`}
              className="w-full text-xs md:text-sm resize-none bg-transparent outline-hidden px-1 max-h-36"
              style={{ color: textPrimary }}
            />

            <button
              onClick={() => handleSubmit()}
              disabled={!inputQuery.trim() || isLoading}
              className={`p-2 rounded-lg font-medium text-white transition-transform active:scale-95 shrink-0 ${
                inputQuery.trim() && !isLoading
                  ? 'opacity-100 cursor-pointer shadow-xs'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              style={{ backgroundColor: accentColor }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex items-center justify-between text-[10px] mt-1.5 px-1" style={{ color: textMuted }}>
          <span>
            Strictly Grounded RAG • Press <kbd className="px-1 py-0.5 rounded bg-black/10">↵ Enter</kbd> to ask
          </span>
          <span>Fly Research Assistant</span>
        </div>
      </div>
    </div>
  );
};