export interface BikeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVel: number;
  grounded: boolean;
  totalRotation: number;
  flips: number;
  suspensionFront: number;
  suspensionRear: number;
  wheelRot: number;
  sparkTimer: number;
}

export function createBike(startX: number, startY: number): BikeState {
  return {
    x: startX,
    y: startY,
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
  };
}
