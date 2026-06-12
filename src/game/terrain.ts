export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: number;
}

export interface TerrainPoint {
  x: number;
  y: number;
  index: number;
}

function smoothstep(a: number, b: number, t: number): number {
  const s = t * t * (3 - 2 * t);
  return a + (b - a) * s;
}

export function generateTerrain(
  candles: Candle[],
  canvasWidth: number,
  canvasHeight: number,
  paddingTop: number,
  paddingBottom: number
): TerrainPoint[] {
  if (candles.length === 0) return [];

  const closes = candles.map(c => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const usableHeight = canvasHeight - paddingTop - paddingBottom;

  const trackWidth = canvasWidth * 4;

  const stepsPerCandle = 3;
  const totalPoints = candles.length * stepsPerCandle + 1;
  const spacingX = trackWidth / (totalPoints - 1);

  const points: TerrainPoint[] = [];

  for (let i = 0; i < totalPoints; i++) {
    const candleIdx = Math.floor(i / stepsPerCandle);
    const t = (i % stepsPerCandle) / stepsPerCandle;

    const idxA = Math.min(candleIdx, candles.length - 1);
    const idxB = Math.min(candleIdx + 1, candles.length - 1);

    const closeA = candles[idxA].close;
    const closeB = candles[idxB].close;

    const price = smoothstep(closeA, closeB, t);
    const normalized = 1 - (price - min) / range;
    const y = paddingTop + normalized * usableHeight;

    points.push({
      x: i * spacingX,
      y: Math.max(20, Math.min(canvasHeight - 20, y)),
      index: candleIdx,
    });
  }

  return points;
}

export function getTerrainHeight(
  points: TerrainPoint[],
  worldX: number
): number | null {
  if (points.length < 2) return null;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    if (worldX >= p0.x && worldX <= p1.x) {
      const t = (worldX - p0.x) / (p1.x - p0.x);
      return p0.y + (p1.y - p0.y) * t;
    }
  }
  return null;
}

export function getTerrainAngle(
  points: TerrainPoint[],
  worldX: number
): number {
  const dx = 15;
  const y1 = getTerrainHeight(points, worldX - dx);
  const y2 = getTerrainHeight(points, worldX + dx);
  if (y1 === null || y2 === null) return 0;
  return Math.atan2(y2 - y1, dx * 2);
}
