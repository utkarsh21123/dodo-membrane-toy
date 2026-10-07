import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MembraneMode, SubstrateTheme, PhysicsParams, InteractionTelemetry } from './types';
import { PRESETS } from './engine/presets';
import { AudioSynthesizer } from './engine/AudioSynthesizer';
import { MembraneCanvas } from './components/MembraneCanvas';
import { UIOverlay } from './components/UIOverlay';

export const App: React.FC = () => {
  const [mode, setMode] = useState<MembraneMode>('prismatic');
  const [substrateTheme, setSubstrateTheme] = useState<SubstrateTheme>('editorial');
  const [params, setParams] = useState<PhysicsParams>(PRESETS.prismatic.params);
  const [isMuted, setIsMuted] = useState<boolean>(() => localStorage.getItem('dodo_membrane_muted') === 'true');

  const [pulseTrigger, setPulseTrigger] = useState<number>(0);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  const [telemetry, setTelemetry] = useState<InteractionTelemetry>({
    fps: 60,
    frameTimeMs: 16.6,
    activeRipples: 0,
    surfaceEnergy: 0,
    interactionMode: 'IDLE',
  });

  const audioSynthRef = useRef<AudioSynthesizer | null>(null);
  if (!audioSynthRef.current) {
    audioSynthRef.current = new AudioSynthesizer();
  }

  // Sync mode changes with preset params
  const handleSelectMode = useCallback((newMode: MembraneMode) => {
    setMode(newMode);
    setParams(PRESETS[newMode].params);
  }, []);

  // Update specific physics params
  const handleUpdateParams = useCallback((newParams: Partial<PhysicsParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Audio mute toggle
  const handleToggleMute = useCallback(() => {
    if (audioSynthRef.current) {
      const muted = audioSynthRef.current.toggleMute();
      setIsMuted(muted);
    }
  }, []);

  // Pulse & Reset actions
  const handlePulse = useCallback(() => {
    setPulseTrigger((prev) => prev + 1);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePulse();
          break;
        case '1':
          handleSelectMode('prismatic');
          break;
        case '2':
          handleSelectMode('mercury');
          break;
        case '3':
          handleSelectMode('frosted');
          break;
        case '4':
          handleSelectMode('iridescent');
          break;
        case 'm':
        case 'M':
          handleToggleMute();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePulse, handleSelectMode, handleToggleMute, handleReset]);

  return (
    <main className="app-container" role="main">
      <MembraneCanvas
        mode={mode}
        substrateTheme={substrateTheme}
        params={params}
        audioSynth={audioSynthRef.current}
        onTelemetryUpdate={setTelemetry}
        pulseTrigger={pulseTrigger}
        resetTrigger={resetTrigger}
      />

      <UIOverlay
        mode={mode}
        onSelectMode={handleSelectMode}
        substrateTheme={substrateTheme}
        onSelectSubstrateTheme={setSubstrateTheme}
        params={params}
        onUpdateParams={handleUpdateParams}
        onReset={handleReset}
        onPulse={handlePulse}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        telemetry={telemetry}
      />
    </main>
  );
};
