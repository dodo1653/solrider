import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Star, 
  Pin, 
  Trash2, 
  Archive, 
  MoreVertical,
  Eye,
  Edit3,
  Copy,
  Download
} from 'lucide-react';
import { useAppStore } from '../store';
import { clsx } from 'clsx';

export function Editor() {
  const { notes, selectedNoteId, updateNote, deleteNote, toggleFavorite, togglePin, archiveNote } = useAppStore();
  const [isEditing, setIsEditing] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleContentChange = useCallback((content: string) => {
    if (!selectedNoteId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(selectedNoteId, { content });
    }, 500);
  }, [selectedNoteId, updateNote]);

  const handleTitleChange = useCallback((title: string) => {
    if (!selectedNoteId) return;
    updateNote(selectedNoteId, { title });
  }, [selectedNoteId, updateNote]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-void-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-void-surface border border-void-border flex items-center justify-center mx-auto mb-4">
            <Edit3 size={24} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-muted">select a note to edit</p>
          <p className="text-xs text-text-muted mt-2">or create a new one</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-void-black overflow-hidden relative">
      <div className="absolute inset-0 gradient-radial opacity-30" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-void-border"
      >
        <div className="flex-1">
          <input
            type="text"
            value={selectedNote.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="untitled"
            className="bg-transparent text-xl font-semibold text-text-primary placeholder-text-muted outline-none w-full"
          />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-text-muted">
              {new Date(selectedNote.updatedAt).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-text-muted">•</span>
            <span className="text-[10px] text-text-muted">
              {selectedNote.content.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(selectedNote.id)}
            className={clsx(
              'p-2 rounded-lg transition-all duration-200',
              selectedNote.isFavorite 
                ? 'text-accent-warning' 
                : 'text-text-muted hover:text-accent-warning'
            )}
          >
            <Star size={18} fill={selectedNote.isFavorite ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={() => togglePin(selectedNote.id)}
            className={clsx(
              'p-2 rounded-lg transition-all duration-200',
              selectedNote.isPinned 
                ? 'text-accent-cyan' 
                : 'text-text-muted hover:text-accent-cyan'
            )}
          >
            <Pin size={18} fill={selectedNote.isPinned ? 'currentColor' : 'none'} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-void-surface transition-all duration-200"
            >
              <MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-void-surface border border-void-border shadow-xl z-50"
                >
                  <button
                    onClick={() => { setShowPreview(!showPreview); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:bg-void-surface-hover hover:text-text-primary transition-colors"
                  >
                    <Eye size={14} />
                    {showPreview ? 'edit mode' : 'preview mode'}
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:bg-void-surface-hover hover:text-text-primary transition-colors"
                  >
                    <Copy size={14} />
                    duplicate
                  </button>
                  <button
                    onClick={() => { archiveNote(selectedNote.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:bg-void-surface-hover hover:text-text-primary transition-colors"
                  >
                    <Archive size={14} />
                    archive
                  </button>
                  <button
                    onClick={() => { deleteNote(selectedNote.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-accent-error hover:bg-accent-error/10 transition-colors"
                  >
                    <Trash2 size={14} />
                    delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-6"
            >
              <div className="max-w-3xl mx-auto">
                <div className="markdown-body">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {selectedNote.content || '*no content*'}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <textarea
                ref={textareaRef}
                value={selectedNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="start writing..."
                className="w-full h-full p-6 bg-transparent text-sm text-text-secondary placeholder-text-muted outline-none resize-none font-mono leading-relaxed"
                spellCheck={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}