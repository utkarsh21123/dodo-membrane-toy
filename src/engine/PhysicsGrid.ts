import { PhysicsParams } from '../types';

/**
 * High-performance 2D Viscoelastic Wave Equation Solver.
 * Implements an isotropic 9-point discrete Laplacian kernel with
 * absorbing boundary damping, elastic anchor springs, and kinetic wake deposition.
 */
export class PhysicsGrid {
  public readonly width: number;
  public readonly height: number;
  public readonly size: number;

  // Ping-pong height buffers
  private uCurr: Float32Array;
  private uPrev: Float32Array;
  private uNext: Float32Array;

  // Drag anchor state for viscoelastic stretching
  private isAnchorActive: boolean = false;
  private anchorGridX: number = 0;
  private anchorGridY: number = 0;
  private anchorPullX: number = 0;
  private anchorPullY: number = 0;

  // RGBA texture buffer for WebGL upload: R=Height, G=dH/dx, B=dH/dy, A=Energy
  public readonly textureData: Uint8Array;

  // Total surface kinetic energy tracker
  public surfaceEnergy: number = 0;

  // Idle harmonic timer
  private idleTime: number = 0;

  constructor(width: number = 256, height: number = 256) {
    this.width = width;
    this.height = height;
    this.size = width * height;

    this.uCurr = new Float32Array(this.size);
    this.uPrev = new Float32Array(this.size);
    this.uNext = new Float32Array(this.size);

    this.textureData = new Uint8Array(this.size * 4);
  }

  /**
   * Resets all wave energy to equilibrium.
   */
  public reset(): void {
    this.uCurr.fill(0);
    this.uPrev.fill(0);
    this.uNext.fill(0);
    this.isAnchorActive = false;
    this.surfaceEnergy = 0;
  }

  /**
   * Depositing a localized Gaussian impulse (e.g. on click / tap).
   */
  public addImpulse(normX: number, normY: number, strength: number, radius: number = 0.04): void {
    const cx = Math.floor(normX * this.width);
    const cy = Math.floor(normY * this.height);
    const r = Math.max(2, Math.floor(radius * this.width));
    const rSq = r * r;

    const minX = Math.max(1, cx - r);
    const maxX = Math.min(this.width - 2, cx + r);
    const minY = Math.max(1, cy - r);
    const maxY = Math.min(this.height - 2, cy + r);

    for (let y = minY; y <= maxY; y++) {
      const dy = y - cy;
      const dySq = dy * dy;
      const rowOffset = y * this.width;

      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const distSq = dx * dx + dySq;

        if (distSq <= rSq) {
          const factor = Math.exp(-distSq / (2 * (r * 0.45) * (r * 0.45)));
          const impulse = strength * factor;
          const idx = rowOffset + x;
          this.uCurr[idx] += impulse;
          this.uPrev[idx] -= impulse * 0.5; // Impart forward momentum
        }
      }
    }
  }

  /**
   * Set or update elastic anchor during drag.
   */
  public setAnchor(normX: number, normY: number, pullNormX: number, pullNormY: number): void {
    this.isAnchorActive = true;
    this.anchorGridX = Math.floor(normX * this.width);
    this.anchorGridY = Math.floor(normY * this.height);
    this.anchorPullX = pullNormX;
    this.anchorPullY = pullNormY;
  }

  /**
   * Release elastic anchor, converting strain into a shockwave recoil.
   */
  public releaseAnchor(recoilStrength: number): void {
    if (!this.isAnchorActive) return;

    const dist = Math.hypot(this.anchorPullX, this.anchorPullY);
    if (dist > 0.005) {
      this.addImpulse(
        (this.anchorGridX / this.width) + this.anchorPullX * 0.5,
        (this.anchorGridY / this.height) + this.anchorPullY * 0.5,
        -dist * recoilStrength * 8.0,
        0.06
      );
    }
    this.isAnchorActive = false;
  }

  /**
   * Continuous kinetic wake deposition during drag/move.
   */
  public addWake(normX: number, normY: number, normVx: number, normVy: number, scale: number = 1.0): void {
    const speed = Math.hypot(normVx, normVy);
    if (speed < 0.0005) return;

    const cx = Math.floor(normX * this.width);
    const cy = Math.floor(normY * this.height);
    const r = Math.max(2, Math.floor(0.025 * this.width));

    const minX = Math.max(1, cx - r);
    const maxX = Math.min(this.width - 2, cx + r);
    const minY = Math.max(1, cy - r);
    const maxY = Math.min(this.height - 2, cy + r);

    const amp = Math.min(1.2, speed * 25.0 * scale);

    for (let y = minY; y <= maxY; y++) {
      const dy = y - cy;
      const rowOffset = y * this.width;
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dSq = dx * dx + dy * dy;
        if (dSq <= r * r) {
          const falloff = 1.0 - Math.sqrt(dSq) / r;
          const idx = rowOffset + x;
          this.uCurr[idx] += amp * falloff * 0.3;
        }
      }
    }
  }

  /**
   * Step the physics simulation using the 2D wave equation.
   */
  public step(params: PhysicsParams, dt: number = 1.0): void {
    this.idleTime += dt * 0.03;
    const w = this.width;
    const h = this.height;

    const cSq = Math.min(0.48, params.stiffness * 0.45); // CFL stability condition
    const damping = params.damping;
    let energyAccum = 0;

    // Apply active anchor elastic tension to mesh
    if (this.isAnchorActive) {
      const r = Math.floor(0.08 * w);
      const minX = Math.max(1, this.anchorGridX - r);
      const maxX = Math.min(w - 2, this.anchorGridX + r);
      const minY = Math.max(1, this.anchorGridY - r);
      const maxY = Math.min(h - 2, this.anchorGridY + r);
      const displacement = Math.hypot(this.anchorPullX, this.anchorPullY) * params.tension * 4.0;

      for (let y = minY; y <= maxY; y++) {
        const dy = y - this.anchorGridY;
        const row = y * w;
        for (let x = minX; x <= maxX; x++) {
          const dx = x - this.anchorGridX;
          const dSq = dx * dx + dy * dy;
          if (dSq <= r * r) {
            const factor = Math.cos((Math.sqrt(dSq) / r) * (Math.PI * 0.5));
            this.uCurr[row + x] += displacement * factor * 0.25;
          }
        }
      }
    }

    // Subtle ambient breathing when near equilibrium
    if (params.ambientUndulation > 0.0001) {
      const midX = Math.floor(w * 0.5);
      const midY = Math.floor(h * 0.5);
      const breathe = Math.sin(this.idleTime * 2.0) * params.ambientUndulation * 0.4;
      this.uCurr[midY * w + midX] += breathe;
    }

    // 2D Wave Propagation with 9-point isotropic Laplacian
    for (let y = 1; y < h - 1; y++) {
      const row = y * w;
      const rowUp = (y - 1) * w;
      const rowDown = (y + 1) * w;

      for (let x = 1; x < w - 1; x++) {
        const idx = row + x;

        // 9-point Laplacian stencil for radial symmetry
        const directNeighbors = this.uCurr[idx - 1] + this.uCurr[idx + 1] +
                                this.uCurr[rowUp + x] + this.uCurr[rowDown + x];
        const diagonalNeighbors = this.uCurr[rowUp + x - 1] + this.uCurr[rowUp + x + 1] +
                                  this.uCurr[rowDown + x - 1] + this.uCurr[rowDown + x + 1];
        
        const laplacian = (directNeighbors * 0.5 + diagonalNeighbors * 0.25 - 3.0 * this.uCurr[idx]);

        // Standard 2D wave update: u(t+1) = (2u(t) - u(t-1) + c^2 * laplacian) * damping
        let val = (2.0 * this.uCurr[idx] - this.uPrev[idx] + cSq * laplacian) * damping;

        // Viscosity spatial smoothing
        if (params.viscosity > 0.01) {
          const localAvg = (directNeighbors + this.uCurr[idx]) * 0.2;
          val = val * (1.0 - params.viscosity * 0.05) + localAvg * (params.viscosity * 0.05);
        }

        // Clamp extreme values to prevent numerical explosion
        if (val > 4.0) val = 4.0;
        else if (val < -4.0) val = -4.0;

        this.uNext[idx] = val;

        const delta = Math.abs(val - this.uCurr[idx]);
        energyAccum += delta;
      }
    }

    // Absorbing boundary conditions (damped edges)
    for (let x = 0; x < w; x++) {
      this.uNext[x] = this.uNext[w + x] * 0.7;
      this.uNext[(h - 1) * w + x] = this.uNext[(h - 2) * w + x] * 0.7;
    }
    for (let y = 0; y < h; y++) {
      this.uNext[y * w] = this.uNext[y * w + 1] * 0.7;
      this.uNext[y * w + (w - 1)] = this.uNext[y * w + (w - 2)] * 0.7;
    }

    // Ping-pong buffer swap
    const temp = this.uPrev;
    this.uPrev = this.uCurr;
    this.uCurr = this.uNext;
    this.uNext = temp;

    this.surfaceEnergy = energyAccum / this.size;

    // Update RGBA texture data with height and finite-difference gradients
    this.updateTextureData();
  }

  /**
   * Packs height, finite-difference normals, and energy into Uint8Array for WebGL texture.
   */
  private updateTextureData(): void {
    const w = this.width;
    const h = this.height;
    const data = this.textureData;

    let p = 0;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      const rowUp = Math.max(0, y - 1) * w;
      const rowDown = Math.min(h - 1, y + 1) * w;

      for (let x = 0; x < w; x++) {
        const idx = row + x;
        const leftIdx = row + Math.max(0, x - 1);
        const rightIdx = row + Math.min(w - 1, x + 1);

        const height = this.uCurr[idx];
        const dhdx = (this.uCurr[rightIdx] - this.uCurr[leftIdx]) * 0.5;
        const dhdy = (this.uCurr[rowDown + x] - this.uCurr[rowUp + x]) * 0.5;

        // Map [-2.0, 2.0] to [0, 255]
        const r = Math.max(0, Math.min(255, Math.floor((height * 0.25 + 0.5) * 255)));
        const g = Math.max(0, Math.min(255, Math.floor((dhdx * 0.5 + 0.5) * 255)));
        const b = Math.max(0, Math.min(255, Math.floor((dhdy * 0.5 + 0.5) * 255)));
        const a = Math.max(0, Math.min(255, Math.floor(Math.min(1.0, Math.abs(height - this.uPrev[idx]) * 10.0) * 255)));

        data[p++] = r;
        data[p++] = g;
        data[p++] = b;
        data[p++] = a;
      }
    }
  }
}
