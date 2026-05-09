import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Star, 
  Archive, 
  Clock, 
  Folder, 
  Tag,
  Plus,
  ChevronLeft,
  Home,
  Search
} from 'lucide-react';
import { useAppStore } from '../store';
import { clsx } from 'clsx';

export function Sidebar() {
  const { 
    folders, 
    tags, 
    notes,
    selectedFolderId,
    setSelectedFolder,
    selectedNoteId,
    setSelectedNote,
    isSidebarCollapsed,
    toggleSidebar,
    createNote,
    searchQuery,
    setSearchQuery
  } = useAppStore();

  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  const favoriteNotes = notes.filter(n => n.isFavorite);

  const sidebarItems = [
    { id: 'all', icon: Home, label: 'all notes', count: notes.length },
    { id: 'favorites', icon: Star, label: 'favorites', count: favoriteNotes.length },
    { id: 'recent', icon: Clock, label: 'recent' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-full bg-void-darker border-r border-void-border flex flex-col relative overflow-hidden"
    >
      <div className="absolute inset-0 gradient-radial opacity-50" />
      
      <div className="relative z-10 p-3 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-md bg-accent-cyan/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              </div>
              <span className="text-xs font-semibold tracking-widest text-text-primary">VOID</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-void-surface-hover transition-all duration-200 group"
        >
          <motion.div
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={16} className="text-text-muted group-hover:text-accent-cyan" />
          </motion.div>
        </button>
      </div>

      {!isSidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 mb-4"
        >
          <button
            onClick={() => useAppStore.getState().toggleCommandPalette()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-void-surface border border-void-border hover:border-void-border-glow transition-all duration-200 group"
          >
            <Search size={14} className="text-text-muted group-hover:text-accent-cyan" />
            <span className="text-xs text-text-muted">search...</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-void-dark text-text-muted">⌘K</span>
          </button>
        </motion.div>
      )}

      <nav className="relative z-10 flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-1 mb-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFolder(item.id === 'all' ? null : item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                selectedFolderId === item.id || (item.id === 'all' && selectedFolderId === null)
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'hover:bg-void-surface-hover text-text-secondary'
              )}
            >
              <item.icon size={16} className={selectedFolderId === item.id ? 'text-accent-cyan' : 'group-hover:text-accent-cyan'} />
              {!isSidebarCollapsed && (
                <span className="text-xs tracking-wide">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        {!isSidebarCollapsed && folders.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-medium tracking-widest text-text-muted uppercase">folders</span>
              <button className="p-1 rounded hover:bg-void-surface-hover transition-colors">
                <Plus size={12} className="text-text-muted hover:text-accent-cyan" />
              </button>
            </div>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                    selectedFolderId === folder.id
                      ? 'bg-void-surface-hover'
                      : 'hover:bg-void-surface-hover'
                  )}
                >
                  <Folder size={14} style={{ color: folder.color }} />
                  <span className="text-xs text-text-secondary">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isSidebarCollapsed && tags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-medium tracking-widest text-text-muted uppercase">tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-[10px] rounded-md bg-void-surface border border-void-border"
                  style={{ color: tag.color, borderColor: tag.color + '40' }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isSidebarCollapsed && recentNotes.length > 0 && (
          <div>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-medium tracking-widest text-text-muted uppercase">recent</span>
            </div>
            <div className="space-y-1">
              {recentNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note.id)}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group',
                    selectedNoteId === note.id
                      ? 'bg-accent-cyan/10'
                      : 'hover:bg-void-surface-hover'
                  )}
                >
                  <FileText size={12} className={selectedNoteId === note.id ? 'text-accent-cyan' : 'text-text-muted'} />
                  <span className="text-xs text-text-secondary truncate">{note.title}</span>
                  {note.isPinned && <Star size={10} className="text-accent-warning ml-auto" fill="currentColor" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="relative z-10 p-3 border-t border-void-border">
        <button
          onClick={() => createNote()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 hover:bg-accent-cyan/20 hover:border-accent-cyan/50 transition-all duration-200 group"
        >
          <Plus size={14} className="text-accent-cyan" />
          {!isSidebarCollapsed && (
            <span className="text-xs text-accent-cyan tracking-wide">new note</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}