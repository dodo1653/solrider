export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 480;

export const GRAVITY = 0.5;
export const BIKE_SPEED = 2.2;
export const MAX_SPEED = 5.5;
export const JUMP_FORCE = -9;
export const ROTATION_SPEED = 0.03;
export const FRICTION = 0.98;
export const CRASH_ANGLE = Math.PI / 3;

export const TERRAIN_PADDING_TOP = 60;
export const TERRAIN_PADDING_BOTTOM = 80;

export const COLORS = {
  bg: '#0A0A0F',
  grid: 'rgba(255,255,255,0.03)',
  terrainLine: '#00f5d4',
  terrainFill: 'rgba(0,245,212,0.15)',
  terrainFillTop: 'rgba(0,245,212,0.08)',
  bike: '#ff6b6b',
  bikeAccent: '#ffd93d',
  wheel: '#fff',
  hud: '#e8e8e8',
  hudDim: 'rgba(255,255,255,0.4)',
  accent: '#00f5d4',
  accent2: '#7c3aed',
  crash: '#ff0040',
  star: 'rgba(255,255,255,0.6)',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#00f5d4',
  medium: '#ffd93d',
  hard: '#ff6b6b',
  insane: '#ff0040',
};
