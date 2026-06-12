import { InputManager } from './input';
import { TerrainPoint, getTerrainHeight, getTerrainAngle } from './terrain';
import type { BikeState } from './bike';
import {
  GRAVITY, BIKE_SPEED, MAX_SPEED, JUMP_FORCE,
  ROTATION_SPEED, FRICTION, CRASH_ANGLE, CANVAS_HEIGHT,
} from './constants';

export type GameStatus = 'idle' | 'playing' | 'crashed' | 'finished';

export interface GameState {
  bike: BikeState;
  terrain: TerrainPoint[];
  score: number;
  distance: number;
  status: GameStatus;
  time: number;
}

export function createGameState(terrain: TerrainPoint[]): GameState {
  const startX = terrain[0]?.x ?? 100;
  const startY = terrain[0]?.y ?? 300;

  return {
    bike: {
      x: startX,
      y: startY - 25,
      vx: 0,
      vy: 0,
      rotation: 0,
      angularVel: 0,
      grounded: true,
      totalRotation: 0,
      flips: 0,
      suspensionFront: 0,
      suspensionRear: 0,
      wheelRot: 0,
      sparkTimer: 0,
    },
    terrain,
    score: 0,
    distance: 0,
    status: 'idle',
    time: 0,
  };
}

export function updateGame(
  state: GameState,
  input: InputManager,
  dt: number
): GameState {
  if (state.status === 'crashed' || state.status === 'idle') return state;

  const bike = { ...state.bike };
  const newState = { ...state, bike, time: state.time + dt };

  const targetSpeed = 4;

  if (input.throttle) {
    bike.vx = Math.min(bike.vx + BIKE_SPEED * 0.15 * dt, MAX_SPEED);
  } else if (input.brake) {
    bike.vx = Math.max(bike.vx - BIKE_SPEED * 0.25 * dt, 0.5);
  } else {
    if (bike.vx < targetSpeed) {
      bike.vx += 0.05 * dt;
    } else if (bike.vx > targetSpeed) {
      bike.vx *= FRICTION;
    }
  }

  if (input.jump && bike.grounded) {
    bike.vy = JUMP_FORCE;
    bike.grounded = false;
  }

  if (input.leanForward) {
    bike.angularVel += ROTATION_SPEED * dt;
  } else if (input.leanBack) {
    bike.angularVel -= ROTATION_SPEED * dt;
  } else {
    bike.angularVel *= 0.9;
  }

  if (!bike.grounded) {
    bike.vy += GRAVITY * dt;
  }

  bike.x += bike.vx * dt;
  bike.y += bike.vy * dt;
  bike.rotation += bike.angularVel * dt;
  bike.totalRotation += bike.angularVel * dt;

  if (Math.abs(bike.totalRotation) > Math.PI * 2) {
    bike.flips += Math.sign(bike.totalRotation) > 0 ? 1 : -1;
    bike.totalRotation = bike.totalRotation % (Math.PI * 2);
  }

  bike.wheelRot += (bike.vx * dt) / 5;

  const surfaceY = getTerrainHeight(state.terrain, bike.x);
  const wasGrounded = bike.grounded;

  if (surfaceY !== null) {
    if (wasGrounded && bike.y < surfaceY - 15) {
      bike.grounded = false;
    }

    if (bike.grounded) {
      bike.y = surfaceY - 5;
      bike.vy = 0;
      const angle = getTerrainAngle(state.terrain, bike.x);
      bike.rotation = -angle * 0.8;
    }

    if (!bike.grounded && bike.y >= surfaceY - 2 && bike.vy >= 0) {
      const impact = Math.abs(bike.vy);
      bike.y = surfaceY - 5;
      bike.vy = 0;
      bike.grounded = true;
      bike.suspensionFront += Math.min(impact * 2, 5);
      bike.suspensionRear += Math.min(impact * 1.5, 4);
      if (impact > 1.5) {
        bike.sparkTimer = Math.min(Math.floor(impact * 5), 20);
      }
      if (Math.abs(bike.rotation) > 0.4) {
        newState.status = 'crashed';
      }
    }
  } else {
    if (bike.x > state.terrain[state.terrain.length - 1]?.x) {
      newState.status = 'finished';
    }
    if (bike.x < state.terrain[0]?.x) {
      bike.x = state.terrain[0].x;
      bike.vx = 0;
    }
  }

  if (bike.y > CANVAS_HEIGHT + 100 || bike.y < -300) {
    newState.status = 'crashed';
  }

  if (bike.grounded && Math.abs(bike.angularVel) > 0.03) {
    const terrainAngle = getTerrainAngle(state.terrain, bike.x);
    const relAngle = Math.abs(bike.rotation - (-terrainAngle));
    if (relAngle > CRASH_ANGLE) {
      newState.status = 'crashed';
    }
  }

  if (bike.x < 0) bike.x = 0;

  if (bike.sparkTimer > 0) bike.sparkTimer -= dt;

  if (bike.grounded) {
    bike.suspensionFront += (0 - bike.suspensionFront) * 0.2 * dt;
    bike.suspensionRear += (0 - bike.suspensionRear) * 0.2 * dt;
    bike.suspensionFront *= 0.85;
    bike.suspensionRear *= 0.85;
    if (input.throttle && bike.vx > 1) {
      bike.suspensionRear = Math.min(bike.suspensionRear + 0.5 * dt, 3);
    }
    if (input.brake && bike.vx > 1) {
      bike.suspensionFront = Math.min(bike.suspensionFront + 0.5 * dt, 3);
    }
  } else {
    bike.suspensionFront *= 0.95;
    bike.suspensionRear *= 0.95;
  }

  newState.distance = Math.max(0, bike.x - state.terrain[0]?.x);
  newState.score = Math.floor(newState.distance / 5) + Math.abs(bike.flips) * 500;

  return newState;
}
