import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { InputManager } from '../game/input';
import { GameState, createGameState, updateGame } from '../game/engine';
import { render } from '../game/renderer';
import { generateTerrain } from '../game/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TERRAIN_PADDING_TOP, TERRAIN_PADDING_BOTTOM } from '../game/constants';
import type { Candle } from '../game/terrain';

interface GameViewProps {
  candles: Candle[];
  tokenName: string;
  tokenSymbol: string;
  onBack: () => void;
}

export default function GameView({ candles, tokenName, tokenSymbol, onBack }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const inputRef = useRef<InputManager | null>(null);
  const animRef = useRef<number>(0);
  const [status, setStatus] = useState<string>('loading');

  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const terrain = generateTerrain(candles, CANVAS_WIDTH, CANVAS_HEIGHT, TERRAIN_PADDING_TOP, TERRAIN_PADDING_BOTTOM);
    if (terrain.length < 2) return;
    gameRef.current = createGameState(terrain);
    inputRef.current = new InputManager();
    setStatus('idle');
  }, [candles]);

  const startGame = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.status = 'playing';
    setStatus('playing');
  }, []);

  const restartGame = useCallback(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    initGame();
    return () => {
      inputRef.current?.destroy();
      cancelAnimationFrame(animRef.current);
    };
  }, [initGame]);

  useEffect(() => {
    if (status === 'loading') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const gs = gameRef.current;
        if (!gs) return;
        if (gs.status === 'idle') {
          startGame();
        } else if (gs.status === 'crashed' || gs.status === 'finished') {
          restartGame();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, startGame, restartGame]);

  useEffect(() => {
    let lastTime = performance.now();
    let running = true;

    const loop = (time: number) => {
      if (!running) return;

      const dt = Math.min((time - lastTime) / 16.667, 3);
      lastTime = time;

      const gs = gameRef.current;
      const inp = inputRef.current;
      const canvas = canvasRef.current;
      if (!gs || !inp || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (gs.status === 'playing') {
        const newState = updateGame(gs, inp, dt);
        gameRef.current = newState;

        if (newState.status === 'crashed' || newState.status === 'finished') {
          setStatus(newState.status);
        }
      }

      render(ctx, gs);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [status]);

  return (
    <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#00f5d4]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#7c3aed]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 mb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#888] hover:text-white hover:border-white/20 transition-all text-sm font-mono"
          >
            ← BACK
          </motion.button>
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[#00f5d4] font-mono text-sm font-bold">{tokenSymbol}</span>
            <span className="text-[#666] font-mono text-xs ml-2">{tokenName}</span>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block w-[960px] h-[480px]"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="flex items-center gap-6 text-[10px] font-mono text-[#555]">
          <span>→ / D = Throttle</span>
          <span>← / A = Brake</span>
          <span>W / ↑ = Jump</span>
          <span>Q / E = Lean</span>
          <span>SPACE = Start</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-white/15">
          <span>loosely inspired by stonkrider.com</span>
          <a href="https://twitter.com/dazzoxx" target="_blank" rel="noopener noreferrer" className="hover:text-[#00f5d4] transition-colors">built by @dazzoxx</a>
        </div>
      </div>
    </div>
  );
}
