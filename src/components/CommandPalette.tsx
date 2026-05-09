import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Plus, 
  Star, 
  Command,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../store';
import { clsx } from 'clsx';

export function CommandPalette() {
  const { 
    isCommandPaletteOpen, 
    toggleCommandPalette, 
    notes, 
    setSelectedNote,
    createNote
  } = useAppStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'new-note', icon: Plus, label: 'create new note', action: () => createNote() },
    { id: 'search', icon: Search, label: 'search notes', action: () => {} },
  ];

  const filteredNotes = notes
    .filter(n => !n.isArchived)
    .filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const allItems = [...commands, ...filteredNotes.map(n => ({
    id: n.id,
    icon: FileText,
    label: n.title,
    action: () => setSelectedNote(n.id),
    isFavorite: n.isFavorite
  }))];

  const filteredItems = allItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
      toggleCommandPalette();
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        onClick={toggleCommandPalette}
      >
        <div className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-void-surface border border-void-border rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-void-border">
            <Search size={18} className="text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="search notes, commands..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
            />
            <span className="text-[10px] px-2 py-1 rounded-md bg-void-dark text-text-muted">ESC</span>
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-text-muted">no results found</p>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    toggleCommandPalette();
                  }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                    selectedIndex === index 
                      ? 'bg-accent-cyan/10' 
                      : 'hover:bg-void-surface-hover'
                  )}
                >
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selectedIndex === index 
                      ? 'bg-accent-cyan/20' 
                      : 'bg-void-dark'
                  )}>
                    <item.icon 
                      size={16} 
                      className={selectedIndex === index ? 'text-accent-cyan' : 'text-text-muted'} 
                    />
                  </div>
                  <span className={clsx(
                    'flex-1 text-left text-sm',
                    selectedIndex === index ? 'text-text-primary' : 'text-text-secondary'
                  )}>
                    {item.label}
                  </span>
                  {(item as { isFavorite?: boolean }).isFavorite && (
                    <Star size={14} className="text-accent-warning" fill="currentColor" />
                  )}
                  {selectedIndex === index && (
                    <ArrowRight size={14} className="text-accent-cyan" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-void-border bg-void-dark/50">
            <div className="flex items-center gap-4 text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <Command size={10} />
                <span>↑↓</span>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <span>↵</span>
                select
              </span>
            </div>
            <span className="text-[10px] text-text-muted">{filteredItems.length} results</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}