import { GameState } from './engine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { TerrainPoint } from './terrain';

interface Star {
  x: number; y: number; size: number; speed: number; brightness: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; color: string;
}

let stars: Star[] = [];
let starsGenerated = false;
let particles: Particle[] = [];

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

function drawWheel(ctx: CanvasRenderingContext2D, cx: number, cy: number, wheelRot: number, grounded: boolean) {
  const R = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a12';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,200,200,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(200,200,200,0.12)';
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + wheelRot;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 1.8, cy + Math.sin(a) * 1.8);
    ctx.lineTo(cx + Math.cos(a) * (R - 0.5), cy + Math.sin(a) * (R - 0.5));
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(220,220,220,0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,200,200,0.2)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  if (!grounded) {
    ctx.strokeStyle = 'rgba(255,217,61,0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 1, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSuspensionFork(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, compression: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;
  const nx = dx / len;
  const ny = dy / len;

  const compressedLen = Math.max(len - compression * 2.5, len * 0.5);
  const forkEndX = x1 + nx * compressedLen;
  const forkEndY = y1 + ny * compressedLen;

  ctx.strokeStyle = 'rgba(180,180,180,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x1 - 0.8, y1); ctx.lineTo(forkEndX - 0.8, forkEndY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1 + 0.8, y1); ctx.lineTo(forkEndX + 0.8, forkEndY); ctx.stroke();

  if (compression > 0.5) {
    ctx.strokeStyle = 'rgba(255,200,50,0.15)';
    ctx.lineWidth = 0.8;
    const midY = (y1 + forkEndY) / 2;
    for (let i = 0; i < 3; i++) {
      const sy = midY + (i - 1) * 1.5;
      ctx.beginPath();
      ctx.moveTo(x1 - 1.2, sy);
      ctx.quadraticCurveTo(x1 - 2, sy + 0.8, x1 - 1.2, sy + 1.5);
      ctx.moveTo(x1 + 1.2, sy);
      ctx.quadraticCurveTo(x1 + 2, sy + 0.8, x1 + 1.2, sy + 1.5);
      ctx.stroke();
    }
  }
}

function drawBike(ctx: CanvasRenderingContext2D, state: GameState, cameraX: number) {
  const { bike } = state;
  const sx = bike.x - cameraX;
  const sy = bike.y;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(bike.rotation);

  const sf = Math.min(bike.suspensionFront, 4);
  const sr = Math.min(bike.suspensionRear, 3);
  const RAX = -11, FAX = 16;
  const AY = 5 + sf * 0.5;
  const RAY = 5 + sr * 0.3;
  const PX = 0, PY = -1 + sf * 0.15;
  const SX = 3, SY = -14;
  const HX = 15, HY = -12;

  ctx.shadowBlur = 0;

  drawWheel(ctx, RAX, RAY, bike.wheelRot, bike.grounded);
  drawWheel(ctx, FAX, AY, bike.wheelRot + 0.3, bike.grounded);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = 'rgba(220,220,220,0.25)';
  ctx.lineWidth = 0.3;
  for (let i = 0; i < 2; i++) {
    const t = 0.15 + i * 0.55;
    ctx.beginPath();
    ctx.moveTo(PX + (HX - PX) * t - (HY - PY) * 0.04, PY + (HY - PY) * t + (HX - PX) * 0.04);
    ctx.lineTo(PX + (HX - PX) * t + (HY - PY) * 0.04, PY + (HY - PY) * t - (HX - PX) * 0.04);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(200,200,200,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(HX, HY); ctx.stroke();

  ctx.strokeStyle = 'rgba(200,200,200,0.3)';
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(HX, HY); ctx.lineTo(PX, PY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(SX, SY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(RAX, RAY - 1); ctx.lineTo(PX, PY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(RAX, RAY - 1); ctx.lineTo(SX, SY); ctx.stroke();

  ctx.strokeStyle = 'rgba(200,200,200,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(FAX - 2, AY - 1); ctx.stroke();

  drawSuspensionFork(ctx, HX, HY, FAX, AY, sf);

  ctx.strokeStyle = 'rgba(180,180,180,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HX - 4, HY - 2.5);
  ctx.lineTo(HX + 4, HY - 2.5);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(180,180,180,0.2)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(HX, HY);
  ctx.lineTo(HX, HY - 2.5);
  ctx.stroke();
  ctx.fillStyle = 'rgba(80,80,80,0.4)';
  ctx.fillRect(HX - 5, HY - 3.5, 2, 2.5);
  ctx.fillRect(HX + 3, HY - 3.5, 2, 2.5);

  ctx.fillStyle = 'rgba(40,30,25,0.6)';
  roundRect(ctx, SX - 2, SY - 1, 10, 3.5, 1.5);
  ctx.fill();

  ctx.strokeStyle = 'rgba(200,200,200,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(RAX, RAY - 1, 7, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(ctx, HX - 2.5, HY - 6.5, 5, 3.5, 0.8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 0.3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '3.5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('1', HX, HY - 3.8);
  ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(150,150,150,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PX + 1, PY + 2);
  ctx.lineTo(RAX + 3, RAY - 1);
  ctx.lineTo(RAX + 5, RAY + 1);
  ctx.stroke();
  ctx.fillStyle = 'rgba(100,100,100,0.3)';
  ctx.fillRect(RAX + 4, RAY, 2.5, 1.5);

  ctx.restore();

  if (state.status === 'playing' && Math.abs(bike.vx) > 1) {
    const exX = sx + Math.cos(bike.rotation) * (RAX + 6) - Math.sin(bike.rotation) * (RAY);
    const exY = sy + Math.sin(bike.rotation) * (RAX + 6) + Math.cos(bike.rotation) * (RAY);
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: exX + (Math.random() - 0.5) * 3,
        y: exY + (Math.random() - 0.5) * 3,
        vx: (Math.random() - 0.5) * 0.3 - 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.2,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? 'rgba(180,180,180,' : 'rgba(200,200,200,',
      });
    }
  }

  if (bike.sparkTimer > 0 && bike.grounded) {
    for (let i = 0; i < 3; i++) {
      const sx2 = sx + (Math.random() - 0.5) * 20 - 10;
      const sy2 = sy + 5 + Math.random() * 5;
      const svx = (Math.random() - 0.5) * 4;
      const svy = -(Math.random() * 3 + 1);
      particles.push({
        x: sx2, y: sy2, vx: svx, vy: svy,
        life: 8 + Math.random() * 6,
        maxLife: 14,
        size: 1 + Math.random() * 1.5,
        color: Math.random() > 0.5 ? 'rgba(255,200,50,' : 'rgba(255,150,50,',
      });
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    const alpha = (p.life / p.maxLife);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.3 + 0.7 * alpha), 0, Math.PI * 2);
    ctx.fillStyle = p.color + alpha * 0.5 + ')';
    ctx.fill();
  }

  if (particles.length > 200) {
    particles.splice(0, particles.length - 200);
  }

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
