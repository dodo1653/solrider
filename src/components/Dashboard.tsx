import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Star, Clock, Zap, Target, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store';
import { clsx } from 'clsx';

export function Dashboard() {
  const { notes, setSelectedNote, createNote } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const recentNotes = notes.filter(n => !n.isArchived).slice(0, 4);
  const favoriteNotes = notes.filter(n => n.isFavorite);
  const totalWords = notes.reduce((acc, n) => acc + n.content.split(/\s+/).filter(Boolean).length, 0);

  const stats = [
    { label: 'notes', value: notes.length, icon: FileText, color: 'text-accent-cyan' },
    { label: 'favorites', value: favoriteNotes.length, icon: Star, color: 'text-accent-warning' },
    { label: 'words', value: totalWords.toLocaleString(), icon: Zap, color: 'text-accent-success' },
    { label: 'this week', value: notes.filter(n => n.updatedAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length, icon: TrendingUp, color: 'text-accent-magenta' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-void-black overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-magenta/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(26,26,26,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(26,26,26,0.3)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-void-surface border border-void-border flex items-center justify-center">
                <div className="w-6 h-6 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">welcome back</h1>
                <p className="text-sm text-text-muted">your workspace is ready</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-6 p-4 rounded-2xl bg-void-surface/50 border border-void-border"
            >
              <div className="text-right">
                <p className="text-3xl font-bold text-text-primary">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="h-10 w-px bg-void-border" />
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 16, 8] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 bg-accent-cyan/50 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs text-text-muted">system online</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-xl bg-void-surface border border-void-border hover:border-void-border-glow transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon size={16} className={stat.color} />
                  <span className="text-[10px] font-medium tracking-wider text-text-muted uppercase">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-muted tracking-wider uppercase">recent notes</h2>
              <button
                onClick={() => createNote()}
                className="text-xs text-accent-cyan hover:underline"
              >
                create new
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentNotes.map((note, index) => (
                <motion.button
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => setSelectedNote(note.id)}
                  className="p-4 rounded-xl bg-void-surface border border-void-border hover:border-accent-cyan/30 transition-all duration-300 text-left group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
                      {note.title || 'untitled'}
                    </h3>
                    {note.isPinned && (
                      <Star size={12} className="text-accent-warning" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2">
                    {note.content.replace(/[#*`]/g, '').slice(0, 100) || 'no content'}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-void-surface/30 border border-void-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target size={16} className="text-accent-cyan" />
              <span className="text-xs font-medium tracking-wider text-text-muted uppercase">productivity tip</span>
            </div>
            <p className="text-sm text-text-secondary">
              press <span className="px-2 py-1 rounded-md bg-void-dark text-accent-cyan text-xs">⌘ + K</span> to open command palette for quick actions
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}