export interface FlowerTouch {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  petals: number;
  color: string;
}

export interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}
