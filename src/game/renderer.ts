import { GameState } from './engine';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants';
import { TerrainPoint } from './terrain';

interface Star {
  x: number; y: number; size: number; speed: number; brightness: number;
}

let stars: Star[] = [];
let starsGenerated = false;

function generateStars(): Star[] {
  const s: Star[] = [];
  for (let i = 0; i < 100; i++) {
    s.push({
      x: Math.random() * CANVAS_WIDTH * 4,
      y: Math.random() * CANVAS_HEIGHT * 0.6,
      size: Math.random() * 2 + 0.3,
      speed: Math.random() * 0.2 + 0.05,
      brightness: Math.random() * 0.4 + 0.2,
    });
  }
  return s;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackground(ctx: CanvasRenderingContext2D, cameraX: number) {
  if (!starsGenerated) {
    stars = generateStars();
    starsGenerated = true;
  }

  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#05050A');
  grad.addColorStop(0.3, '#08081A');
  grad.addColorStop(0.6, '#0A0A1E');
  grad.addColorStop(1, '#0F0A18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (const star of stars) {
    const sx = ((star.x - cameraX * star.speed * 0.05) % (CANVAS_WIDTH * 4) + CANVAS_WIDTH * 4) % (CANVAS_WIDTH * 4) - CANVAS_WIDTH;
    ctx.beginPath();
    ctx.arc(sx, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.brightness})`;
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 0.5;
  const gridSize = 50;
  const offsetX = -(cameraX * 0.15) % gridSize;
  for (let x = offsetX; x < CANVAS_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let x = offsetX; x < CANVAS_WIDTH; x += gridSize) {
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize * 4) {
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
    }
  }
}

function drawTerrain(ctx: CanvasRenderingContext2D, points: TerrainPoint[], cameraX: number) {
  if (points.length < 2) return;

  const visible = points.filter(p => p.x - cameraX > -50 && p.x - cameraX < CANVAS_WIDTH + 50);

  ctx.beginPath();
  ctx.moveTo(visible[0].x - cameraX, CANVAS_HEIGHT);
  for (const p of visible) {
    ctx.lineTo(p.x - cameraX, p.y);
  }
  ctx.lineTo(visible[visible.length - 1].x - cameraX, CANVAS_HEIGHT);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, 'rgba(0,245,212,0.2)');
  grad.addColorStop(0.2, 'rgba(0,245,212,0.08)');
  grad.addColorStop(0.5, 'rgba(124,58,237,0.04)');
  grad.addColorStop(1, 'rgba(124,58,237,0.01)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(visible[0].x - cameraX, visible[0].y);
  for (let i = 0; i < visible.length; i++) {
    const p = visible[i];
    const nextP = visible[Math.min(i + 1, visible.length - 1)];
    const isUp = nextP.y < p.y;

    ctx.strokeStyle = isUp ? '#00f5d4' : '#ff6b6b';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = isUp ? '#00f5d4' : '#ff6b6b';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(p.x - cameraX, p.y);
    ctx.lineTo(nextP.x - cameraX, nextP.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  for (let i = 0; i < visible.length; i += 4) {
    const p = visible[i];
    ctx.beginPath();
    ctx.arc(p.x - cameraX, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,245,212,0.3)';
    ctx.fill();
  }
}

function drawBike(ctx: CanvasRenderingContext2D, state: GameState, cameraX: number) {
  const { bike } = state;
  const sx = bike.x - cameraX;
  const sy = bike.y;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(bike.rotation);

  ctx.shadowColor = bike.grounded ? '#ff6b6b' : '#ffd93d';
  ctx.shadowBlur = 20;

  const RAX = -11, FAX = 15, AY = 5, R_WHEEL = 5;
  const PX = 0, PY = -1;
  const SX = 2, SY = -13;
  const HX = 14, HY = -11;

  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#888';
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(RAX, AY);
    ctx.lineTo(RAX + Math.cos(a) * (R_WHEEL - 1), AY + Math.sin(a) * (R_WHEEL - 1));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(RAX, AY, R_WHEEL, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(RAX, AY, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd93d';
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(FAX, AY);
    ctx.lineTo(FAX + Math.cos(a) * (R_WHEEL - 1), AY + Math.sin(a) * (R_WHEEL - 1));
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(FAX, AY, R_WHEEL, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FAX, AY, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd93d';
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ff6b6b';

  ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(HX, HY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(HX, HY); ctx.lineTo(PX, PY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(SX, SY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(RAX, AY); ctx.lineTo(PX, PY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(RAX, AY); ctx.lineTo(SX, SY); ctx.stroke();

  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(HX - 1.5, HY); ctx.lineTo(FAX - 2, AY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(HX + 1.5, HY); ctx.lineTo(FAX + 2, AY); ctx.stroke();

  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(HX - 5, HY - 3);
  ctx.lineTo(HX + 5, HY - 3);
  ctx.stroke();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(HX, HY);
  ctx.lineTo(HX, HY - 3);
  ctx.stroke();
  ctx.fillStyle = '#444';
  ctx.fillRect(HX - 6, HY - 4.5, 2.5, 3);
  ctx.fillRect(HX + 3.5, HY - 4.5, 2.5, 3);

  ctx.fillStyle = '#2a1a10';
  roundRect(ctx, SX - 3, SY - 1, 12, 4, 2);
  ctx.fill();

  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(RAX, AY - 2, R_WHEEL + 2, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  roundRect(ctx, HX - 3, HY - 7, 6, 4, 1);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.font = '4px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('1', HX, HY - 4);
  ctx.textAlign = 'left';

  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PX + 1, PY + 2);
  ctx.lineTo(RAX + 3, AY - 2);
  ctx.lineTo(RAX + 5, AY);
  ctx.stroke();
  ctx.fillStyle = '#555';
  ctx.fillRect(RAX + 4, AY - 1, 3, 2);

  ctx.restore();

  if (bike.vy < -2) {
    for (let i = 0; i < 2; i++) {
      const px = sx - 10 + Math.random() * 20;
      const py = sy + 5 + Math.random() * 10;
      ctx.beginPath();
      ctx.arc(px, py, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,200,50,${Math.random() * 0.3})`;
      ctx.fill();
    }
  }

  if (bike.vx > 2 && bike.grounded) {
    const trailCount = Math.min(Math.floor(bike.vx * 2), 6);
    for (let i = 0; i < trailCount; i++) {
      const px = sx - 15 - Math.random() * 40;
      const py = sy + 8 + Math.random() * 8;
      const ts = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(px, py, ts, 0, Math.PI * 2);
      const alpha = Math.random() * 0.3 + 0.1;
      ctx.fillStyle = `rgba(255,200,100,${alpha})`;
      ctx.fill();
    }
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { score, distance, bike, status } = state;

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  roundRect(ctx, 12, 12, 200, 82, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#e8e8e8';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText(`SCORE  ${score}`, 24, 38);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText(`DIST   ${Math.floor(distance)}m`, 24, 58);
  ctx.fillText(`FLIPS  ${bike.flips}`, 24, 74);

  const speedKmh = Math.floor(Math.abs(bike.vx) * 15);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  roundRect(ctx, CANVAS_WIDTH - 100, 12, 88, 36, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = speedKmh > 80 ? '#ffd93d' : '#00f5d4';
  ctx.font = '20px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${speedKmh}`, CANVAS_WIDTH - 20, 38);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.fillText('SPEED', CANVAS_WIDTH - 20, 46);
  ctx.textAlign = 'left';

  if (status === 'idle') {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#00f5d4';
    ctx.font = '22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 20;
    ctx.fillText('PRESS SPACE TO RIDE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('→ / D = Throttle    ← / A = Brake', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12);
    ctx.fillText('W / ↑ = Jump    Q / E = Lean', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.textAlign = 'left';
  }

  if (status === 'crashed') {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ff0040';
    ctx.font = '36px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0040';
    ctx.shadowBlur = 30;
    ctx.fillText('CRASHED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 45);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e8e8e8';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 5);

    ctx.fillStyle = '#00f5d4';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('SPACE to ride again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    ctx.textAlign = 'left';
  }

  if (status === 'finished') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#00f5d4';
    ctx.font = '36px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 30;
    ctx.fillText('FINISHED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 45);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e8e8e8';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 5);

    ctx.fillStyle = '#00f5d4';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('SPACE to ride again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    ctx.textAlign = 'left';
  }
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
) {
  const cameraX = Math.max(0, state.bike.x - CANVAS_WIDTH * 0.35);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBackground(ctx, cameraX);
  drawTerrain(ctx, state.terrain, cameraX);
  drawBike(ctx, state, cameraX);
  drawHUD(ctx, state);
}
