import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Star, Pin, Clock, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export function NotesList() {
  const { 
    notes, 
    selectedNoteId, 
    setSelectedNote,
    selectedFolderId,
    searchQuery,
    deleteNote,
    toggleFavorite,
    togglePin
  } = useAppStore();

  const filteredNotes = notes.filter(note => {
    if (note.isArchived) return false;
    
    if (selectedFolderId === 'favorites') {
      return note.isFavorite;
    }
    
    if (selectedFolderId === 'recent') {
      return true;
    }
    
    if (selectedFolderId && selectedFolderId !== 'all') {
      return note.folderId === selectedFolderId;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(query) || 
             note.content.toLowerCase().includes(query);
    }
    
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="w-80 h-full bg-void-darker border-r border-void-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-void-border">
        <h2 className="text-xs font-medium tracking-widest text-text-muted uppercase">
          {selectedFolderId === 'favorites' 
            ? 'favorites' 
            : selectedFolderId === 'recent' 
              ? 'recent notes'
              : selectedFolderId 
                ? selectedFolderId
                : 'all notes'}
        </h2>
        <p className="text-[10px] text-text-muted mt-1">{sortedNotes.length} notes</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {sortedNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-4"
            >
              <div className="w-12 h-12 rounded-xl bg-void-surface border border-void-border flex items-center justify-center mb-4">
                <FileText size={20} className="text-text-muted" />
              </div>
              <p className="text-xs text-text-muted">no notes yet</p>
              <p className="text-[10px] text-text-muted mt-1">create your first note</p>
            </motion.div>
          ) : (
            sortedNotes.map((note, index) => (
              <motion.button
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedNote(note.id)}
                className={clsx(
                  'w-full p-3 rounded-xl mb-2 text-left group transition-all duration-200',
                  selectedNoteId === note.id
                    ? 'bg-void-surface border border-void-border-glow'
                    : 'bg-void-dark border border-transparent hover:bg-void-surface hover:border-void-border'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={clsx(
                    'w-1.5 h-1.5 rounded-full mt-2',
                    selectedNoteId === note.id ? 'bg-accent-cyan' : 'bg-void-border'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {note.isPinned && (
                        <Pin size={10} className="text-accent-warning" />
                      )}
                      <h3 className={clsx(
                        'text-sm font-medium truncate',
                        selectedNoteId === note.id ? 'text-text-primary' : 'text-text-secondary'
                      )}>
                        {note.title || 'untitled'}
                      </h3>
                    </div>
                    
                    <p className="text-[11px] text-text-muted line-clamp-2 mt-1">
                      {note.content.replace(/[#*`]/g, '').slice(0, 100) || 'no content'}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Clock size={10} />
                        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                      </span>
                      
                      {note.isFavorite && (
                        <Star size={10} className="text-accent-warning" fill="currentColor" />
                      )}
                      
                      {note.tags.length > 0 && (
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-void-surface text-text-muted">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}