import React from 'react';
import { 
  Layers, 
  FileText, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Upload, 
  PanelRightClose, 
  PanelRightOpen,
  Sun,
  Moon,
  RotateCcw
} from 'lucide-react';
import { ThemeStyle, ViewMode } from '../types';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: ThemeStyle;
  onThemeChange: (theme: ThemeStyle) => void;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onOpenUpload: () => void;
  hasPaper: boolean;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  isSidebarOpen,
  onToggleSidebar,
  theme,
  onThemeChange,
  speechEnabled,
  onToggleSpeech,
  onOpenUpload,
  hasPaper,
  onReset
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="h-16 px-4 md:px-6 border-b flex items-center justify-between transition-colors duration-200 z-20 shrink-0 sticky top-0 backdrop-blur-md bg-opacity-95"
      style={{
        backgroundColor: isDark ? 'rgba(24, 37, 35, 0.95)' : 'rgba(254, 253, 251, 0.94)',
        borderColor: isDark ? '#293c39' : '#ece7de'
      }}>
      
      {/* Brand */}
      <div className="flex items-center gap-3 md:gap-5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight font-display"
            style={{ color: isDark ? '#f5f3ee' : '#221f1d' }}>
            Fly
          </span>
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded tracking-wider"
            style={{
              backgroundColor: isDark ? 'rgba(224, 122, 82, 0.18)' : 'rgba(194, 87, 50, 0.1)',
              color: isDark ? '#e58f6b' : '#b24c29'
            }}>
            RAG Engine
          </span>
        </div>

        {/* Reset / start over, only relevant once a paper is loaded */}
        {hasPaper && (
          <button
            onClick={onReset}
            title="Clear current document and start over"
            className="hidden lg:inline-flex text-[11px] font-medium items-center gap-1 px-2.5 py-1 rounded-md border transition-colors hover:bg-black/5"
            style={{
              borderColor: isDark ? '#38514d' : '#ded7ca',
              color: isDark ? '#c4d7d1' : '#575047'
            }}>
            <RotateCcw className="w-3 h-3" />
            Start Over
          </button>
        )}
      </div>

      {/* Center: View Mode Toggles */}
      <div className="hidden md:flex items-center p-1 rounded-lg border text-xs font-medium"
        style={{
          backgroundColor: isDark ? '#131e1c' : '#f4efe8',
          borderColor: isDark ? '#293c39' : '#e4ded2'
        }}>
        <button
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            viewMode === 'split' 
              ? 'shadow-xs font-semibold' 
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: viewMode === 'split' ? (isDark ? '#203330' : '#ffffff') : 'transparent',
            color: isDark ? '#f0ede6' : '#221f1d'
          }}>
          <Layers className="w-3.5 h-3.5" />
          <span>Workspace</span>
        </button>

        <button
          onClick={() => onViewModeChange('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            viewMode === 'chat' 
              ? 'shadow-xs font-semibold' 
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: viewMode === 'chat' ? (isDark ? '#203330' : '#ffffff') : 'transparent',
            color: isDark ? '#f0ede6' : '#221f1d'
          }}>
          <FileText className="w-3.5 h-3.5" />
          <span>Focus Chat</span>
        </button>
      </div>

      {/* Right Controls: Voice, Dark/Light Mode, Upload, and Dashboard drawer toggle */}
      <div className="flex items-center gap-2">


        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode (Deep Mineral Pine)"}
          className="px-2.5 py-1.5 rounded-lg border text-xs transition-colors hover:opacity-100 flex items-center gap-1.5"
          style={{
            borderColor: isDark ? '#2f4441' : '#dfd9cd',
            backgroundColor: isDark ? '#1c2c29' : '#f8f5ee',
            color: isDark ? '#e2ebe8' : '#4a443c'
          }}>
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] font-medium hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-[11px] font-medium hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Upload Paper Modal Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-transform active:scale-95"
          style={{
            backgroundColor: isDark ? '#e07a52' : '#c25732',
            color: '#ffffff'
          }}>
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Paper</span>
        </button>

        {/* Sidebar / Dashboard Toggle */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Paper Dashboard" : "Show Paper Dashboard"}
          className="p-1.5 rounded-lg border text-xs transition-colors hover:opacity-100 flex items-center gap-1"
          style={{
            borderColor: isDark ? '#2f4441' : '#dfd9cd',
            backgroundColor: isSidebarOpen 
              ? (isDark ? 'rgba(224, 122, 82, 0.15)' : 'rgba(194, 87, 50, 0.08)') 
              : 'transparent',
            color: isDark ? '#e8f0ed' : '#332e29'
          }}>
          {isSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};