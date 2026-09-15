export interface PaperSection {
  id: string;
  title: string;
  page: number;
  snippet: string;
}

export interface PaperChunk {
  id: string;
  page: number;
  section: string;
  content: string;
  charCount: number;
  tags?: string[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  shortTitle: string;
  authors: string[];
  institution: string;
  year: number;
  doiOrArxiv?: string;
  abstract: string;
  totalPages: number;
  totalChunks: number;
  sections: PaperSection[];
  classesCovered: string[];
  keyMetrics: {
    label: string;
    value: string;
    subtext: string;
  }[];
  modelComparisons: {
    model: string;
    accuracyPreAug: number;
    accuracyPostAug: number;
    notes: string;
  }[];
  instanceDistribution: {
    species: string;
    clip1: number;
    clip2: number;
    clip3: number;
    clip4: number;
    clip5: number;
    total: number;
  }[];
  chunks: PaperChunk[];
}

export interface CitationSource {
  chunkId: string;
  page: number;
  section: string;
  text: string;
  similarityScore: number;
}

export interface ReasoningStep {
  step: number;
  action: string;
  detail: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: CitationSource[];
  reasoningSteps?: ReasoningStep[];
  bookmarked?: boolean;
}

export type ThemeStyle = 'dark' | 'light';
export type ViewMode = 'split' | 'chat' | 'dashboard';
export type DashboardTab = 'overview' | 'chunks' | 'models' | 'settings';

export interface RAGSettings {
  topK: number;
  showReasoning: boolean;
  autoExpandSources: boolean;
  speechEnabled: boolean;
  filterBySpecies?: string;
}
