import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactLenis from 'lenis/react';
import { usePumpFun, type PumpCoin } from '../hooks/usePumpFun';
import GameView from './GameView';



function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; speed: number }[] = [];
    const w = () => window.innerWidth;
    const h = () => window.innerHeight;
    canvas.width = w();
    canvas.height = h();

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.05,
        speed: Math.random() * 0.2 + 0.05,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w();
        if (p.x > w()) p.x = 0;
        if (p.y < 0) p.y = h();
        if (p.y > h()) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = w(); canvas.height = h(); };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function formatMarketCap(mc: number): string {
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`;
  if (mc >= 1e3) return `$${(mc / 1e3).toFixed(1)}K`;
  return `$${mc.toFixed(0)}`;
}

function CoinCard({ coin, index, onPlay }: { coin: PumpCoin; index: number; onPlay: (c: PumpCoin) => void }) {
  const mcap = coin.marketCapUsd || 0;
  const diff = Math.abs(coin.priceChange24h || 0);
  const difficulty = diff > 40 ? { label: 'INSANE', color: '#ff0040' } :
    diff > 20 ? { label: 'HARD', color: '#ff6b6b' } :
    diff > 10 ? { label: 'MEDIUM', color: '#ffd93d' } :
    { label: 'EASY', color: '#00f5d4' };
  const isUp = (coin.priceChange24h || 0) >= 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onPlay(coin)}
      className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left transition-all duration-300 hover:bg-white/[0.06] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${difficulty.color}08, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center text-sm font-bold font-mono border border-white/[0.08] overflow-hidden">
            {coin.imageUrl ? (
              <img src={coin.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/60">{coin.symbol.slice(0, 2)}</span>
            )}
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold tracking-wider"
            style={{ backgroundColor: difficulty.color + '18', color: difficulty.color }}>
            {difficulty.label}
          </span>
        </div>
        <div className="font-mono font-bold text-base text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00f5d4] group-hover:to-[#7c3aed] transition-all duration-300">
          {coin.symbol}
        </div>
        <div className="font-mono text-xs text-white/40 mb-0.5 truncate">{coin.name}</div>
        <div className="font-mono text-[9px] text-white/20 truncate mb-2">{coin.mint.slice(0, 8)}...{coin.mint.slice(-4)}</div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className={`font-bold ${isUp ? 'text-[#00f5d4]' : 'text-[#ff6b6b]'}`}>
            {isUp ? '+' : ''}{coin.priceChange24h?.toFixed(1) ?? '0.0'}%
          </span>
          <span className="text-white/30">{formatMarketCap(mcap)}</span>
        </div>
      </div>
    </motion.button>
  );
}

export default function Home() {
  const [view, setView] = useState<'home' | 'game'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchPreview, setSearchPreview] = useState<{ name: string; symbol: string; imageUrl?: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { topCoins, loading, fetchTopCoins, fetchCoinByMint, prepareGame, clearGame, selectedCoin, candles } = usePumpFun();

  useEffect(() => { fetchTopCoins(); }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 30) {
      setSearchPreview(null);
      return;
    }
    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [metaRes, dexRes] = await Promise.all([
          fetch(`https://frontend-api-v3.pump.fun/coins/${q}`, {
            headers: { Accept: 'application/json' }
          }),
          fetch(`https://api.dexscreener.com/latest/dex/tokens/${q}`, {
            headers: { Accept: 'application/json' }
          })
        ]);
        let name = q.slice(0, 8), symbol = q.slice(0, 5), imageUrl: string | undefined;
        if (metaRes.ok) {
          const data = await metaRes.json();
          name = data.name || data.symbol || name;
          symbol = data.symbol || symbol;
          imageUrl = data.image_uri || data.uri || imageUrl;
        }
        if (!imageUrl && dexRes.ok) {
          const dexData = await dexRes.json();
          const pair = dexData.pairs?.[0];
          imageUrl = pair?.info?.imageUrl || imageUrl;
        }
        setSearchPreview({ name, symbol, imageUrl });
      } catch { setSearchPreview(null); }
      setPreviewLoading(false);
    }, 400);
    return () => { clearTimeout(timer); setPreviewLoading(false); };
  }, [searchQuery]);

  const handlePlay = async (coin: PumpCoin & { change?: number }) => {
    if (coin.change) {
      const candleCoin = { ...coin, priceChange24h: coin.change, priceUsd: 0.5 };
      await prepareGame(candleCoin);
    } else {
      await prepareGame(coin);
    }
    setView('game');
  };

  const handlePlayCustom = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const coin = await fetchCoinByMint(q);
      if (coin) {
        await prepareGame(coin);
        setView('game');
      }
    } finally { setSearching(false); }
  };

  const handleBack = () => {
    setView('home');
    clearGame();
  };

  if (view === 'game' && selectedCoin && candles.length > 0) {
    return (
      <GameView
        candles={candles}
        tokenName={selectedCoin.name}
        tokenSymbol={selectedCoin.symbol}
        onBack={handleBack}
      />
    );
  }

  return (
    <ReactLenis root>
      <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
        <ParticleBackground />

        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[#00f5d4]/[0.04] rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#7c3aed]/[0.04] rounded-full blur-[200px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#ff6b6b]/[0.02] rounded-full blur-[250px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMTUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="relative z-10">
          <nav className="flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f5d4] via-[#7c3aed] to-[#ff6b6b] flex items-center justify-center font-bold text-sm font-mono text-white shadow-lg shadow-[#00f5d4]/20">
                SR
              </div>
              <div className="font-mono text-lg font-bold tracking-tight">
                <span className="bg-gradient-to-r from-[#00f5d4] to-[#7c3aed] bg-clip-text text-transparent">Sol</span>
                <span className="text-white">Rider</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 ml-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-pulse" />
                <span className="text-[10px] font-mono text-white/40 tracking-wider">ON-CHAIN</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <a href="https://pump.fun" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 transition-all text-xs font-mono">
                pump.fun
              </a>
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-white/30">
                <span className="w-1 h-1 rounded-full bg-[#7c3aed]" />
                SOLANA
              </div>
            </motion.div>
          </nav>

          <main className="max-w-7xl mx-auto px-6 md:px-10">
            <section className="pt-20 pb-16 text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/50 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-pulse" />
                  Turn any pump.fun memecoin into a motocross track
                </div>

                <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tight mb-5 leading-tight">
                  Ride the{' '}
                  <span className="bg-gradient-to-r from-[#00f5d4] via-[#ffd93d] to-[#ff6b6b] bg-clip-text text-transparent">
                    memecoin
                  </span>
                  <br />
                  <span className="text-white/40">charts on Solana</span>
                </h1>
                <p className="text-base md:text-lg text-white/40 font-mono max-w-2xl mx-auto mb-10 leading-relaxed">
                  Every pump.fun token on Solana becomes a playable motocross track. 
                  Throttle through parabolic on-chain runs. Survive the dumps. 
                  How far can you ride?
                </p>

                <div className="flex items-center justify-center gap-3 mb-8">
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePlayCustom()}
                    placeholder="Paste any pump.fun contract address..."
                    className="w-80 md:w-96 px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-mono placeholder-white/20 outline-none focus:border-[#00f5d4]/40 focus:bg-white/[0.06] transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePlayCustom}
                    disabled={searching}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#00f5d4] to-[#7c3aed] text-black font-bold text-sm font-mono hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#00f5d4]/20"
                  >
                    {searching ? 'LOADING...' : 'RIDE →'}
                  </motion.button>
                </div>

                {searchPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] mx-auto mb-4 w-fit"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center text-xs font-bold font-mono border border-white/[0.08] overflow-hidden">
                      {searchPreview.imageUrl ? (
                        <img src={searchPreview.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/40">{searchPreview.symbol.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-mono text-xs font-bold text-white/80">{searchPreview.symbol}</div>
                      <div className="font-mono text-[10px] text-white/40">{searchPreview.name}</div>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-pulse ml-1" />
                  </motion.div>
                )}
                {previewLoading && searchQuery.trim().length >= 30 && !searchPreview && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-4 h-4 border-2 border-[#00f5d4]/30 border-t-[#00f5d4] rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-white/30">looking up token...</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-white/25">
                  <span className="w-1 h-1 rounded-full bg-[#00f5d4]" />
                  Powered by real on-chain data from Solana
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-14"
              >
                {[
                  { label: 'ON-CHAIN RIDES', value: '0' },
                  { label: 'VIRTUAL $ TRADED', value: '$0' },
                  { label: 'TOTAL CRASHES', value: '0' },
                ].map((s, i) => (
                  <div key={i} className="px-4 py-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="text-xl font-bold font-mono text-white">{s.value}</div>
                    <div className="text-[9px] font-mono text-white/30 tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </section>

            <section className="pb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h2 className="text-sm font-mono text-white/50 tracking-widest uppercase">Trending on pump.fun</h2>
                  <p className="text-xs font-mono text-white/20 mt-1">Live top memecoins by on-chain market cap</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-pulse" />
                  <span className="text-[10px] font-mono text-white/30">LIVE</span>
                </div>
              </motion.div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] mb-3" />
                      <div className="h-4 w-20 bg-white/[0.05] rounded mb-2" />
                      <div className="h-3 w-16 bg-white/[0.03] rounded mb-2" />
                      <div className="h-3 w-12 bg-white/[0.03] rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {topCoins.map((coin, i) => (
                    <CoinCard key={coin.mint} coin={coin} index={i} onPlay={handlePlay} />
                  ))}
                </div>
              )}
            </section>

          </main>

          <footer className="border-t border-white/[0.04] py-8">
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="font-mono text-xs text-white/25">
                Built with real on-chain data from Solana · Not financial advice
              </div>
              <div className="flex items-center gap-6 font-mono text-xs text-white/25">
                <span className="hover:text-white/50 transition-colors">loosely inspired by stonkrider.com</span>
                <a href="https://twitter.com/dazzoxx" target="_blank" rel="noopener noreferrer" className="hover:text-[#00f5d4] transition-colors">built by @dazzoxx</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ReactLenis>
  );
}
