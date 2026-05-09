import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [{ id: '1', content: 'Welcome. This is your infinite canvas.\n\nJust type. Your thoughts flow here.\n\n• Each note is a stream\n• No titles, no folders\n• Just you and your words\n• Navigate with arrow keys\n• New note with + button below', createdAt: Date.now() }];
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { localStorage.setItem('notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { setTimeout(() => setIsLoaded(true), 800); }, []);

  const activeNote = notes[activeIndex];

  const updateNote = (content: string) => {
    if (content === '' && notes.length > 1) {
      const newNotes = notes.filter((_, i) => i !== activeIndex);
      setNotes(newNotes);
      setActiveIndex(Math.min(activeIndex, newNotes.length - 1));
    } else {
      setNotes(notes.map((n, i) => i === activeIndex ? { ...n, content } : n));
    }
  };

  const createNote = () => {
    console.log('Creating new note');
    const newNote = { id: Date.now().toString(), content: '', createdAt: Date.now() };
    setNotes([newNote, ...notes]);
    setActiveIndex(0);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const deleteNote = () => {
    console.log('Deleting note');
    if (notes.length <= 1) return;
    const newNotes = notes.filter((_, i) => i !== activeIndex);
    setNotes(newNotes);
    setActiveIndex(Math.min(activeIndex, newNotes.length - 1));
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        console.log('Alt+Up pressed');
        setActiveIndex(Math.max(0, activeIndex - 1));
      }
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        console.log('Alt+Down pressed');
        setActiveIndex(Math.min(notes.length - 1, activeIndex + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, notes.length]);

  if (!isLoaded) {
    return (
      <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-32 h-32 rounded-full border border-[#222] relative">
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-2 rounded-full border border-dashed border-[#333]" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute inset-4 rounded-full border border-[#222]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#666]" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0A] flex overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(120,0,255,0.08)_0%,_transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial_gradient(ellipse_at_bottom_right,_rgba(0,200,255,0.06)_0%,_transparent_40%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      </div>

      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            className="w-16 flex-shrink-0 border-r border-[#1A1A1A] py-4 flex flex-col items-center gap-3 relative z-20"
          >
            <img src="./logo.png" alt="Notes app" className="w-10 h-10 object-contain rounded-xl" />
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto py-2">
              {notes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium transition-all ${activeIndex === i ? 'bg-[#1A1A1A] text-[#888] border-2 border-[#444]' : 'text-[#444] hover:text-[#666] border-2 border-transparent'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={createNote} className="w-10 h-10 rounded-xl border border-dashed border-[#222] flex items-center justify-center text-[#444] hover:border-[#444] hover:text-[#666] transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!showSidebar && (
        <button onClick={() => setShowSidebar(true)} className="absolute top-4 left-4 z-30 w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center hover:border-[#444] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      )}

      <main className="flex-1 flex items-center justify-center p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl"
          >
            
            <textarea
              ref={textareaRef}
              value={activeNote.content}
              onChange={(e) => updateNote(e.target.value)}
              placeholder="Take your notes.."
              className="w-full h-[60vh] bg-transparent text-[#888] text-lg leading-relaxed placeholder-[#333] outline-none resize-none"
              spellCheck={false}
            />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between text-xs text-[#333] mt-4">
              <span>alt + ↑ ↓ to navigate</span>
              <span>{activeNote.content.split(/\s+/).filter(Boolean).length} words</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="absolute bottom-4 right-4 flex gap-2 z-30">
        {notes.length > 1 && (
          <button 
            type="button"
            onClick={() => { console.log('Delete clicked'); setShowDeleteConfirm(true); }} 
            className="px-4 py-2 rounded-lg bg-[#111] border border-[#222] text-[#666] text-xs hover:text-[#888] hover:border-[#444] transition-all cursor-pointer"
          >
            delete
          </button>
        )}
        <button 
          type="button"
          onClick={() => { console.log('New clicked'); createNote(); }} 
          className="px-4 py-2 rounded-lg bg-[#111] border border-[#222] text-[#666] text-xs hover:text-[#888] hover:border-[#444] transition-all cursor-pointer"
        >
          + new
        </button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#111] border border-[#222] rounded-xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-[#888] text-sm mb-4">Delete this note?</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 rounded-lg text-[#666] text-xs hover:text-[#888]">cancel</button>
                <button onClick={deleteNote} className="px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-800/50 text-red-400 text-xs">delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;