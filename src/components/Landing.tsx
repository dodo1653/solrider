import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const notes = [
  { title: 'Project Ideas', preview: 'Build a notes app with electron and react...', time: '2h ago' },
  { title: 'Meeting Notes', preview: 'Discussed the new design system and UI components...', time: '1d ago' },
  { title: 'Todo List', preview: '- Finish landing page\n- Add hero section\n- Test on mobile', time: '3d ago' },
]

function Landing() {
  const [visible, setVisible] = useState(false)
  const [hoveredNote, setHoveredNote] = useState(0)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#e8e8e8] font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(157,78,221,0.06)_0%,_transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.05)_0%,_transparent_40%)]" />
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-purple-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 bg-violet-500/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[60%] w-1 h-1 bg-purple-400/20 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        <div className="absolute bottom-[30%] right-[30%] w-2 h-2 bg-violet-500/20 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '0.5s' }} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-[#1e1e22]">
            <img src="./logo.png" alt="Notes app" className="w-full h-full object-cover object-center scale-150" />
          </div>
          <span className="font-mono text-xl font-semibold tracking-tight">Notes app</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/app" className="font-mono text-sm text-[#5f5f66] hover:text-[#96969c] transition-colors">App</Link>
          <a href="https://github.com/dodo1653/dzz-notes-desktop-UI-app" target="_blank" className="font-mono text-sm text-[#5f5f66] hover:text-[#96969c] transition-colors">GitHub</a>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-8">
        <section className={`py-24 flex items-center gap-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex-1">
            <p className="font-mono text-xs text-purple-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              Minimal note-taking
            </p>
            <h1 className="font-mono text-5xl font-bold tracking-tight mb-6 leading-tight">
              Focus on your<br />
              <span className="text-[#e8e8e8]/80">thoughts, not the UI</span>
            </h1>
            <p className="text-lg text-[#96969c] max-w-md mb-8 leading-relaxed">
              A distraction-free dark notes app designed for focused writing. 
              Single stream of consciousness, keyboard-driven, always ready.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/app" className="font-mono text-sm bg-[#e8e8e8] text-[#0e0e10] px-6 py-3 rounded-md hover:bg-white transition-all hover:-translate-y-0.5">
                Open App
              </Link>
              <span className="font-mono text-xs text-[#5f5f66] px-3 py-2 border border-[#1e1e22] rounded-full">
                v1.0.0
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 group">
            <div className="w-[340px] bg-[#141416] border border-[#1e1e22] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-[#2a2a30] group-hover:shadow-3xl group-hover:-translate-y-1">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e22]">
                <div className="w-3 h-3 rounded-full bg-[#5f5f66]" />
                <div className="w-3 h-3 rounded-full bg-[#5f5f66]" />
                <div className="w-3 h-3 rounded-full bg-[#5f5f66]" />
                <span className="ml-2 font-mono text-xs text-[#5f5f66]">Notes app</span>
              </div>
              <div className="flex">
                <div className="w-14 py-4 border-r border-[#1e1e22] flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#2a2a30]">
                    <img src="./logo.png" alt="" className="w-full h-full object-cover object-center scale-150 opacity-60" />
                  </div>
                  {notes.map((_, i) => (
                    <button 
                      key={i}
                      onMouseEnter={() => setHoveredNote(i)}
                      onMouseLeave={() => setHoveredNote(0)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-all cursor-pointer ${hoveredNote === i ? 'bg-[#1e1e22] text-purple-400 border border-purple-500/30 scale-110' : i === 0 ? 'bg-[#1e1e22] text-[#96969c] border border-[#2a2a30]' : 'text-[#5f5f66]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <div className="w-8 h-8 rounded-lg border border-dashed border-[#1e1e22] flex items-center justify-center text-[#5f5f66]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <div className="text-xs font-mono text-[#5f5f66] mb-2">NOTE {notes.length}</div>
                  <h3 className="font-mono text-sm font-medium text-[#e8e8e8] mb-1 transition-all">
                    {notes[hoveredNote]?.title || notes[0].title}
                  </h3>
                  <p className="text-xs text-[#5f5f66] line-clamp-2 transition-all">
                    {notes[hoveredNote]?.preview || notes[0].preview}
                  </p>
                  <div className="mt-6 pt-4 border-t border-[#1e1e22]">
                    <div className="text-xs font-mono text-[#5f5f66]/50">Press</div>
                    <div className="mt-1 flex gap-2">
                      <span className="text-[10px] font-mono bg-[#1e1e22] px-2 py-1 rounded text-purple-400 border border-purple-500/20">Alt</span>
                      <span className="text-[10px] font-mono bg-[#1e1e22] px-2 py-1 rounded text-[#96969c]">↑</span>
                      <span className="text-[10px] font-mono bg-[#1e1e22] px-2 py-1 rounded text-[#96969c]">↓</span>
                      <span className="text-[10px] font-mono text-[#5f5f66]">navigate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-[10px] text-[#5f5f66] tracking-wide group-hover:text-purple-400/60 transition-colors">
              Hover over notes — keyboard-driven interface
            </p>
          </div>
        </section>

        <hr className="border-[#1e1e22]" />

        <section className={`py-16 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-mono text-xs text-[#5f5f66] tracking-widest uppercase mb-6">Features</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-[#141416] border border-[#1e1e22] rounded-lg hover:border-purple-500/20 transition-colors">
              <h3 className="font-mono text-sm font-medium mb-2">Dark by default</h3>
              <p className="text-xs text-[#5f5f66] leading-relaxed">
                Easy on the eyes with a carefully tuned dark theme. No bright flashes, no distractions.
              </p>
            </div>
            <div className="p-5 bg-[#141416] border border-[#1e1e22] rounded-lg hover:border-purple-500/20 transition-colors">
              <h3 className="font-mono text-sm font-medium mb-2">Keyboard-first</h3>
              <p className="text-xs text-[#5f5f66] leading-relaxed">
                Navigate with Alt + Arrow keys. Keep your hands on the keyboard, always.
              </p>
            </div>
            <div className="p-5 bg-[#141416] border border-[#1e1e22] rounded-lg hover:border-purple-500/20 transition-colors">
              <h3 className="font-mono text-sm font-medium mb-2">Single stream</h3>
              <p className="text-xs text-[#5f5f66] leading-relaxed">
                One note after another. No folders, no complexity. Just your thoughts in sequence.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-[#1e1e22]" />

        <section className={`py-16 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-mono text-xs text-[#5f5f66] tracking-widest uppercase mb-6">Downloads</p>
          <p className="text-sm text-[#96969c] mb-6">Available for Windows. All downloads are from GitHub Releases.</p>
          
          <div className="dl-os-group">
            <div className="dl-os-header">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#96969c]">
                <path d="M3 12V6.75l6.5-.9V12H3zm0 .75h6.5v6.15L3 17.25V12.75zM10.25 5.72l10.75-1.47V12h-10.75V5.72zm0 7.03h10.75v7.5l-10.75-1.47V12.75z"/>
              </svg>
              <span>Windows</span>
            </div>
            <div className="grid gap-2 mt-3">
              <a href="https://github.com/dodo1653/dzz-notes-desktop-UI-app/releases/download/v1.0.0/NotesApp.exe" className="dl-row">
                <div className="dl-info">
                  <span className="dl-file">NotesApp.exe</span>
                </div>
                <span className="dl-action">Download</span>
              </a>
              <a href="https://github.com/dodo1653/dzz-notes-desktop-UI-app/releases/download/v1.0.0/NotesApp-Setup.exe" className="dl-row">
                <div className="dl-info">
                  <span className="dl-file">NotesApp-Setup.exe</span>
                </div>
                <span className="dl-action">Download</span>
              </a>
            </div>
          </div>
        </section>

        <hr className="border-[#1e1e22]" />

        <section className={`py-16 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-mono text-xs text-[#5f5f66] tracking-widest uppercase mb-6">Build from source</p>
          <div className="bg-[#141416] border border-[#1e1e22] rounded-lg p-5 font-mono text-sm">
            <div className="text-[#5f5f66]"># Clone and build</div>
            <div className="text-[#e8e8e8] mt-2">git clone https://github.com/dodo1653/dzz-notes-desktop-UI-app.git</div>
            <div className="text-[#e8e8e8]">cd dzz-notes-desktop-UI-app</div>
            <div className="text-[#e8e8e8]">npm install</div>
            <div className="text-[#e8e8e8]">npm run electron</div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#1e1e22] py-8 mt-16">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <div className="font-mono text-xs text-[#5f5f66]">
            © 2026 Notes app
          </div>
          <div className="flex gap-5">
            <a href="https://github.com/dodo1653/dzz-notes-desktop-UI-app" target="_blank" className="font-mono text-xs text-[#5f5f66] hover:text-[#96969c] transition-colors">GitHub</a>
            <a href="https://github.com/dodo1653/dzz-notes-desktop-UI-app/releases" target="_blank" className="font-mono text-xs text-[#5f5f66] hover:text-[#96969c] transition-colors">Releases</a>
          </div>
        </div>
      </footer>

      <style>{`
        .dl-os-group { margin-bottom: 24px; }
        .dl-os-group:last-child { margin-bottom: 0; }
        .dl-os-header { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #e8e8e8; margin-bottom: 10px; }
        .dl-os-header svg { opacity: 0.7; }
        .dl-row { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #141416; border: 1px solid #1e1e22; border-radius: 8px; text-decoration: none; transition: border-color 0.2s, transform 0.15s; }
        .dl-row:hover { border-color: #2a2a30; transform: translateY(-1px); }
        .dl-info { flex: 1; min-width: 0; }
        .dl-file { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #e8e8e8; display: block; }
        .dl-action { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #A855F7; letter-spacing: 0.04em; white-space: nowrap; flex-shrink: 0; }
        .shadow-3xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  )
}

export default Landing