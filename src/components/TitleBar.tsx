import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { useState } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      onMaximizedChange: (callback: (maximized: boolean) => void) => void;
    };
  }
}

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximize();
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <div className="h-10 bg-void-darker border-b border-void-border flex items-center justify-between px-4 select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-void-surface border border-void-border flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-accent-cyan animate-pulse" />
        </div>
        <span className="text-[10px] font-medium tracking-widest text-text-muted">VOID</span>
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-void-surface-hover transition-colors group"
        >
          <Minus size={14} className="text-text-muted group-hover:text-text-primary" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-void-surface-hover transition-colors group"
        >
          {isMaximized ? (
            <Square size={12} className="text-text-muted group-hover:text-text-primary" />
          ) : (
            <Maximize2 size={12} className="text-text-muted group-hover:text-text-primary" />
          )}
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent-error/20 transition-colors group"
        >
          <X size={14} className="text-text-muted group-hover:text-accent-error" />
        </button>
      </div>
    </div>
  );
}