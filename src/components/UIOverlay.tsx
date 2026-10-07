import React, { useState } from 'react';
import { MembraneMode, SubstrateTheme, PhysicsParams, InteractionTelemetry } from '../types';
import { PRESETS } from '../engine/presets';
import { Volume2, VolumeX, RotateCcw, Sliders, Sparkles, Layers, Info, X } from 'lucide-react';

interface UIOverlayProps {
  mode: MembraneMode;
  onSelectMode: (mode: MembraneMode) => void;
  substrateTheme: SubstrateTheme;
  onSelectSubstrateTheme: (theme: SubstrateTheme) => void;
  params: PhysicsParams;
  onUpdateParams: (newParams: Partial<PhysicsParams>) => void;
  onReset: () => void;
  onPulse: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  telemetry: InteractionTelemetry;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  mode,
  onSelectMode,
  substrateTheme,
  onSelectSubstrateTheme,
  params,
  onUpdateParams,
  onReset,
  onPulse,
  isMuted,
  onToggleMute,
  telemetry,
}) => {
  const [showSliders, setShowSliders] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const modes: { id: MembraneMode; num: string; label: string }[] = [
    { id: 'prismatic', num: '01', label: 'Prismatic Glass' },
    { id: 'mercury', num: '02', label: 'Liquid Mercury' },
    { id: 'frosted', num: '03', label: 'Frosted Silica' },
    { id: 'iridescent', num: '04', label: 'Thin-Film Pearl' },
  ];

  const themes: { id: SubstrateTheme; label: string }[] = [
    { id: 'editorial', label: 'Editorial' },
    { id: 'dodo_spec', label: 'Ledger Spec' },
    { id: 'geometric', label: 'Geometric' },
  ];

  return (
    <div className="instrument-overlay pointer-events-none">
      {/* Top Precision Bar */}
      <header className="console-header pointer-events-auto">
        <div className="console-brand">
          <div className="brand-mark">
            <span className="optic-dot" style={{ backgroundColor: PRESETS[mode].colorAccent }} />
            <span className="brand-name">MEMBRANE</span>
          </div>
          <span className="console-separator">/</span>
          <span className="console-meta">DODO PAYMENTS DE</span>
          <span className="console-separator">/</span>
          <div className="telemetry-readout">
            <span className="metric">{telemetry.fps} FPS</span>
            <span className="metric-sub">({telemetry.frameTimeMs.toFixed(1)}ms)</span>
          </div>
        </div>

        {/* Precision Segmented Material Switcher */}
        <nav className="segmented-nav" aria-label="Optical Material Modes">
          {modes.map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`segmented-btn ${isActive ? 'active' : ''}`}
                title={PRESETS[m.id].description}
              >
                <span className="btn-idx">{m.num}</span>
                <span className="btn-text">{m.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Floating Info Modal */}
      {showInfo && (
        <aside className="dialog-panel info-modal pointer-events-auto" role="dialog" aria-label="About Membrane">
          <div className="panel-header">
            <span className="panel-tag">// SYSTEM OVERVIEW</span>
            <button onClick={() => setShowInfo(false)} className="panel-close" aria-label="Close dialog">
              <X size={14} />
            </button>
          </div>
          <h3 className="panel-title">MEMBRANE &mdash; Elastic Optical Surface</h3>
          <p className="panel-text">
            A bespoke tactile visual medium engineered for Dodo Payments.
            Combines a 2D discrete viscoelastic wave solver (9-point isotropic Laplacian)
            with a custom WebGL2 fragment pipeline computing real-time Snell’s law refraction,
            Cauchy chromatic dispersion, and synthesized acoustic haptics.
          </p>
          <div className="shortcuts-grid">
            <div className="shortcut-item"><kbd>Drag</kbd> <span>Tug & stretch elastic surface</span></div>
            <div className="shortcut-item"><kbd>Click</kbd> <span>Strike localized shockwave</span></div>
            <div className="shortcut-item"><kbd>Space</kbd> <span>Harmonic standing pulse</span></div>
            <div className="shortcut-item"><kbd>1 – 4</kbd> <span>Switch material presets</span></div>
            <div className="shortcut-item"><kbd>M</kbd> <span>Toggle acoustic haptics</span></div>
            <div className="shortcut-item"><kbd>R</kbd> <span>Reset to equilibrium</span></div>
          </div>
        </aside>
      )}

      {/* Physics & Optics Tuning Drawer */}
      {showSliders && (
        <aside className="dialog-panel tuning-panel pointer-events-auto" aria-label="Parameter tuning drawer">
          <div className="panel-header">
            <span className="panel-tag">// OPTICAL CALIBRATION</span>
            <button onClick={() => setShowSliders(false)} className="panel-close" aria-label="Close drawer">
              <X size={14} />
            </button>
          </div>

          <div className="sliders-stack">
            <div className="control-group">
              <div className="control-label">
                <span>Wave Stiffness</span>
                <span className="val-display">{params.stiffness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.01"
                value={params.stiffness}
                onChange={(e) => onUpdateParams({ stiffness: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <div className="control-label">
                <span>Elastic Tension</span>
                <span className="val-display">{params.tension.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.05"
                value={params.tension}
                onChange={(e) => onUpdateParams({ tension: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <div className="control-label">
                <span>Snell Refraction</span>
                <span className="val-display">{params.refractionStrength.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.12"
                step="0.002"
                value={params.refractionStrength}
                onChange={(e) => onUpdateParams({ refractionStrength: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <div className="control-label">
                <span>Cauchy Dispersion</span>
                <span className="val-display">{params.dispersionStrength.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.05"
                step="0.001"
                value={params.dispersionStrength}
                onChange={(e) => onUpdateParams({ dispersionStrength: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <div className="control-label">
                <span>Wave Damping</span>
                <span className="val-display">{params.damping.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.94"
                max="0.995"
                step="0.001"
                value={params.damping}
                onChange={(e) => onUpdateParams({ damping: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </aside>
      )}

      {/* Bottom Console Deck */}
      <footer className="console-footer pointer-events-auto">
        {/* State & Energy Monitor */}
        <div className="status-monitor">
          <div className="state-pill">
            <span className="state-tag">STATE</span>
            <span className="state-name">{telemetry.interactionMode}</span>
          </div>
          <div className="energy-meter-track" title="Surface Kinetic Energy">
            <div
              className="energy-meter-bar"
              style={{ width: `${Math.min(100, telemetry.surfaceEnergy * 4500)}%` }}
            />
          </div>
        </div>

        {/* Substrate Switcher */}
        <div className="substrate-dock" role="group" aria-label="Substrate Art Selection">
          <span className="dock-label"><Layers size={12} /> SUBSTRATE</span>
          <div className="dock-btns">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectSubstrateTheme(t.id)}
                className={`theme-dock-btn ${substrateTheme === t.id ? 'active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="action-dock">
          <button
            onClick={onPulse}
            className="dock-action-btn pulse-action"
            title="Harmonic Center Pulse (Spacebar)"
            aria-label="Harmonic pulse"
          >
            <Sparkles size={13} />
            <span>PULSE</span>
            <kbd className="dock-kbd">SPACE</kbd>
          </button>

          <button
            onClick={() => setShowSliders(!showSliders)}
            className={`dock-action-btn ${showSliders ? 'active' : ''}`}
            title="Optical Calibration Sliders"
            aria-label="Tune parameters"
          >
            <Sliders size={13} />
          </button>

          <button
            onClick={onToggleMute}
            className={`dock-action-btn ${isMuted ? 'muted' : ''}`}
            title={isMuted ? 'Unmute Acoustic Haptics (M)' : 'Mute Acoustic Haptics (M)'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <button
            onClick={onReset}
            className="dock-action-btn"
            title="Reset to Equilibrium (R)"
            aria-label="Reset simulation"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`dock-action-btn ${showInfo ? 'active' : ''}`}
            title="Documentation & Shortcuts"
            aria-label="About this toy"
          >
            <Info size={13} />
          </button>
        </div>
      </footer>
    </div>
  );
};
