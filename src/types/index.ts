export type MembraneMode = 'prismatic' | 'mercury' | 'frosted' | 'iridescent';

export type SubstrateTheme = 'editorial' | 'dodo_spec' | 'geometric';

export interface PhysicsParams {
  stiffness: number;       // Wave propagation speed (c^2)
  damping: number;         // Energy dissipation factor (0.96 - 0.998)
  viscosity: number;       // Spatial blur smoothing
  tension: number;         // Elastic return strength
  impulseStrength: number; // Click / tap strike power
  refractionStrength: number; // Optical distortion scale
  dispersionStrength: number; // Chromatic aberration (RGB split)
  specularPower: number;   // Surface glossiness exponent
  fresnelPower: number;    // Rim reflectance strength
  ambientUndulation: number; // Subtle organic idle breathing
}

export interface PresetConfig {
  name: string;
  label: string;
  description: string;
  params: PhysicsParams;
  colorAccent: string;
}

export interface PointerState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  isDown: boolean;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  pressure: number;
  lastActiveTime: number;
}

export interface InteractionTelemetry {
  fps: number;
  frameTimeMs: number;
  activeRipples: number;
  surfaceEnergy: number;
  interactionMode: 'IDLE' | 'HOVERING' | 'TUGGING' | 'RECOIL' | 'STRIKE' | 'PULSE';
}
