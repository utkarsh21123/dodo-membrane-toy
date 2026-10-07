import React, { useEffect, useRef } from 'react';
import { MembraneMode, SubstrateTheme, PhysicsParams, PointerState, InteractionTelemetry } from '../types';
import { PhysicsGrid } from '../engine/PhysicsGrid';
import { SubstrateRenderer } from '../engine/SubstrateRenderer';
import { ShaderPipeline } from '../engine/ShaderPipeline';
import { AudioSynthesizer } from '../engine/AudioSynthesizer';

interface MembraneCanvasProps {
  mode: MembraneMode;
  substrateTheme: SubstrateTheme;
  params: PhysicsParams;
  audioSynth: AudioSynthesizer;
  onTelemetryUpdate: (telemetry: InteractionTelemetry) => void;
  pulseTrigger: number;
  resetTrigger: number;
}

export const MembraneCanvas: React.FC<MembraneCanvasProps> = ({
  mode,
  substrateTheme,
  params,
  audioSynth,
  onTelemetryUpdate,
  pulseTrigger,
  resetTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engine references kept outside React state for 120fps performance
  const physicsRef = useRef<PhysicsGrid | null>(null);
  const substrateRef = useRef<SubstrateRenderer | null>(null);
  const shaderRef = useRef<ShaderPipeline | null>(null);

  const pointerRef = useRef<PointerState>({
    x: 0.5,
    y: 0.5,
    prevX: 0.5,
    prevY: 0.5,
    vx: 0,
    vy: 0,
    isDown: false,
    isDragging: false,
    dragStartX: 0.5,
    dragStartY: 0.5,
    pressure: 0,
    lastActiveTime: Date.now(),
  });

  const interactionModeRef = useRef<'IDLE' | 'HOVERING' | 'TUGGING' | 'RECOIL' | 'STRIKE' | 'PULSE'>('IDLE');

  // Mode indices for GLSL uniform
  const modeIndexMap: Record<MembraneMode, number> = {
    prismatic: 0,
    mercury: 1,
    frosted: 2,
    iridescent: 3,
  };

  // Pulse trigger effect
  useEffect(() => {
    if (pulseTrigger > 0 && physicsRef.current) {
      physicsRef.current.addImpulse(0.5, 0.5, params.impulseStrength * 2.2, 0.08);
      audioSynth.playPulse();
      interactionModeRef.current = 'PULSE';
      setTimeout(() => {
        if (interactionModeRef.current === 'PULSE') {
          interactionModeRef.current = 'IDLE';
        }
      }, 400);
    }
  }, [pulseTrigger, params.impulseStrength, audioSynth]);

  // Reset trigger effect
  useEffect(() => {
    if (resetTrigger > 0 && physicsRef.current) {
      physicsRef.current.reset();
      interactionModeRef.current = 'IDLE';
    }
  }, [resetTrigger]);

  // Substrate theme update effect
  useEffect(() => {
    if (substrateRef.current && shaderRef.current) {
      substrateRef.current.render(substrateTheme);
      shaderRef.current.updateSubstrate(substrateRef.current.canvas);
    }
  }, [substrateTheme]);

  // Initialize Canvas & Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Instantiate engine components
    const physics = new PhysicsGrid(256, 256);
    physicsRef.current = physics;

    const substrate = new SubstrateRenderer(2048, 2048);
    substrate.render(substrateTheme);
    substrateRef.current = substrate;

    let shader: ShaderPipeline;
    try {
      shader = new ShaderPipeline(canvas);
      shader.initPhysicsGridSize(256, 256);
      shader.updateSubstrate(substrate.canvas);
      shaderRef.current = shader;
    } catch (err) {
      console.error('Failed to initialize WebGL2 ShaderPipeline:', err);
      return;
    }

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let currentFps = 60;
    let currentFrameTime = 16.6;

    // Handle Resize
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(2.0, window.devicePixelRatio || 1);
      const displayWidth = Math.floor(window.innerWidth * dpr);
      const displayHeight = Math.floor(window.innerHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Main 120Hz Animation & Physics Loop
    const renderLoop = (now: number) => {
      const dt = Math.min(32, now - lastTime);
      lastTime = now;

      // Telemetry metrics
      frameCount++;
      if (now - fpsTimer >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - fpsTimer));
        currentFrameTime = dt;
        frameCount = 0;
        fpsTimer = now;

        onTelemetryUpdate({
          fps: currentFps,
          frameTimeMs: currentFrameTime,
          activeRipples: Math.round(physics.surfaceEnergy * 100),
          surfaceEnergy: physics.surfaceEnergy,
          interactionMode: interactionModeRef.current,
        });
      }

      // Step physics simulation
      const currentParams = params;
      physics.step(currentParams, 1.0);

      // Upload heightmap to WebGL texture
      shader.updateHeightmap(physics.textureData);

      // Render WebGL quad
      const pointer = pointerRef.current;
      shader.render(
        now * 0.001,
        canvas.width,
        canvas.height,
        pointer.x,
        pointer.y,
        modeIndexMap[mode],
        currentParams
      );

      // Update Audio Synthesizer drag state
      const speed = Math.hypot(pointer.vx, pointer.vy);
      audioSynth.updateDragVelocity(speed, pointer.isDragging);

      // Velocity decay
      pointer.vx *= 0.85;
      pointer.vy *= 0.85;

      // State timeout to idle
      if (!pointer.isDown && now - pointer.lastActiveTime > 800 && interactionModeRef.current !== 'IDLE') {
        interactionModeRef.current = 'IDLE';
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      shader.dispose();
      physicsRef.current = null;
      substrateRef.current = null;
      shaderRef.current = null;
    };
  }, [mode, substrateTheme, params, audioSynth, onTelemetryUpdate]);

  // Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !physicsRef.current) return;

    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const p = pointerRef.current;
    p.isDown = true;
    p.isDragging = false;
    p.x = normX;
    p.y = normY;
    p.prevX = normX;
    p.prevY = normY;
    p.dragStartX = normX;
    p.dragStartY = normY;
    p.lastActiveTime = performance.now();

    // Strike shockwave
    const strength = params.impulseStrength * (e.pressure > 0 ? e.pressure * 1.5 : 1.0);
    physicsRef.current.addImpulse(normX, normY, strength, 0.045);
    audioSynth.playStrike(strength);
    interactionModeRef.current = 'STRIKE';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !physicsRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const p = pointerRef.current;
    const dx = normX - p.x;
    const dy = normY - p.y;
    p.vx = dx;
    p.vy = dy;
    p.prevX = p.x;
    p.prevY = p.y;
    p.x = normX;
    p.y = normY;
    p.lastActiveTime = performance.now();

    if (p.isDown) {
      const dragDist = Math.hypot(normX - p.dragStartX, normY - p.dragStartY);
      if (dragDist > 0.006) {
        p.isDragging = true;
        interactionModeRef.current = 'TUGGING';
        // Viscoelastic anchor pull
        physicsRef.current.setAnchor(
          p.dragStartX,
          p.dragStartY,
          normX - p.dragStartX,
          normY - p.dragStartY
        );
      }
      // Continuous kinetic wake
      physicsRef.current.addWake(normX, normY, dx, dy, 1.2);
    } else {
      interactionModeRef.current = 'HOVERING';
      // Subtle hover disturbance
      physicsRef.current.addWake(normX, normY, dx, dy, 0.35);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !physicsRef.current) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already lost
    }

    const p = pointerRef.current;
    if (p.isDragging) {
      const pullDist = Math.hypot(p.x - p.dragStartX, p.y - p.dragStartY);
      physicsRef.current.releaseAnchor(params.tension * 1.2);
      audioSynth.playRecoil(pullDist);
      interactionModeRef.current = 'RECOIL';
    }

    p.isDown = false;
    p.isDragging = false;
    p.lastActiveTime = performance.now();
  };

  return (
    <canvas
      ref={canvasRef}
      className="membrane-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Interactive refractive membrane canvas"
    />
  );
};
