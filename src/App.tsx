import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MembraneMode, SubstrateTheme, PhysicsParams, InteractionTelemetry } from './types';
import { PRESETS } from './engine/presets';
import { AudioSynthesizer } from './engine/AudioSynthesizer';
import { MembraneCanvas } from './components/MembraneCanvas';
import { UIOverlay } from './components/UIOverlay';

export const App: React.FC = () => {
  const [mode, setMode] = useState<MembraneMode>('prismatic');
  const [substrateTheme, setSubstrateTheme] = useState<SubstrateTheme>('editorial');
  const [customHeadline, setCustomHeadline] = useState<string>('Elastic Light');
  const [customSubtext, setCustomSubtext] = useState<string>('The Tactile Anatomy of Refraction');
  
  const [params, setParams] = useState<PhysicsParams>(PRESETS.prismatic.params);
  const [isMuted, setIsMuted] = useState<boolean>(() => localStorage.getItem('dodo_membrane_muted') === 'true');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isGyroEnabled, setIsGyroEnabled] = useState<boolean>(false);

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

  // Live Microphone Audio Reactive toggle
  const handleToggleMic = useCallback(async () => {
    if (audioSynthRef.current) {
      const active = await audioSynthRef.current.toggleMic();
      setIsMicActive(active);
    }
  }, []);

  // Gyroscope / Device Tilt Physics toggle
  const handleToggleGyro = useCallback(async () => {
    if (!isGyroEnabled) {
      // Handle iOS 13+ permission request
      if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
        try {
          const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
          if (permission === 'granted') {
            setIsGyroEnabled(true);
          }
        } catch (err) {
          console.warn('Gyroscope permission error:', err);
        }
      } else {
        setIsGyroEnabled(true);
      }
    } else {
      setIsGyroEnabled(false);
    }
  }, [isGyroEnabled]);

  // Update custom typography
  const handleUpdateCustomText = useCallback((headline: string, subtext: string) => {
    setCustomHeadline(headline);
    setCustomSubtext(subtext);
    setSubstrateTheme('custom');
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
        customHeadline={customHeadline}
        customSubtext={customSubtext}
        params={params}
        audioSynth={audioSynthRef.current}
        isGyroEnabled={isGyroEnabled}
        onTelemetryUpdate={setTelemetry}
        onCustomImageDropped={() => setSubstrateTheme('custom')}
        pulseTrigger={pulseTrigger}
        resetTrigger={resetTrigger}
      />

      <UIOverlay
        mode={mode}
        onSelectMode={handleSelectMode}
        substrateTheme={substrateTheme}
        onSelectSubstrateTheme={setSubstrateTheme}
        customHeadline={customHeadline}
        customSubtext={customSubtext}
        onUpdateCustomText={handleUpdateCustomText}
        params={params}
        onUpdateParams={handleUpdateParams}
        onReset={handleReset}
        onPulse={handlePulse}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        isGyroEnabled={isGyroEnabled}
        onToggleGyro={handleToggleGyro}
        telemetry={telemetry}
      />
    </main>
  );
};
