/**
 * Web Audio API Synthesizer & Audio-Reactive FFT Engine.
 * Synthesizes crystal strikes, viscous drags, elastic recoils, and resonant chimes,
 * and analyzes live microphone FFT frequency bands to drive real-time wave physics.
 */
export class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public isMuted: boolean = false;

  // Noise generator for viscous drag swoosh
  private noiseNode: AudioBufferSourceNode | null = null;
  private dragFilter: BiquadFilterNode | null = null;
  private dragGain: GainNode | null = null;

  // Live Audio Reactive Microphone FFT
  public isMicActive: boolean = false;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private fftData: Uint8Array | null = null;

  constructor() {
    const saved = localStorage.getItem('dodo_membrane_muted');
    this.isMuted = saved === 'true';
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      const master = this.ctx.createGain();
      master.gain.value = this.isMuted ? 0.0 : 0.45;
      master.connect(this.ctx.destination);
      this.masterGain = master;

      this.setupContinuousDragSynth();
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  private setupContinuousDragSynth(): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.0;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    this.noiseNode = noise;
    this.dragFilter = filter;
    this.dragGain = gain;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('dodo_membrane_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0.0 : 0.45, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /**
   * Toggles live microphone audio stream for audio-reactive mode.
   */
  public async toggleMic(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isMicActive) {
      // Disable mic
      if (this.micStream) {
        this.micStream.getTracks().forEach((track) => track.stop());
        this.micStream = null;
      }
      if (this.micSource) {
        this.micSource.disconnect();
        this.micSource = null;
      }
      this.isMicActive = false;
      return false;
    } else {
      // Enable mic
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.micStream = stream;

        const analyser = this.ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        this.analyser = analyser;
        this.fftData = new Uint8Array(analyser.frequencyBinCount);

        const source = this.ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        this.micSource = source;

        this.isMicActive = true;
        return true;
      } catch (err) {
        console.warn('Microphone access denied or unavailable:', err);
        this.isMicActive = false;
        return false;
      }
    }
  }

  /**
   * Retrieves current FFT frequency spectrum energy levels.
   */
  public getAudioFrequencyData(): { bass: number; mid: number; treble: number; peak: number } | null {
    if (!this.isMicActive || !this.analyser || !this.fftData) return null;

    (this.analyser as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(this.fftData);
    const bins = this.fftData;

    let bassSum = 0;
    for (let i = 0; i < 4; i++) bassSum += bins[i];
    const bass = bassSum / (4 * 255);

    let midSum = 0;
    for (let i = 4; i < 16; i++) midSum += bins[i];
    const mid = midSum / (12 * 255);

    let trebleSum = 0;
    for (let i = 16; i < 48; i++) trebleSum += bins[i];
    const treble = trebleSum / (32 * 255);

    const peak = Math.max(bass, mid, treble);
    return { bass, mid, treble, peak };
  }

  /**
   * Modulates the continuous drag sound based on cursor speed.
   */
  public updateDragVelocity(velocity: number, isDragging: boolean): void {
    if (!this.ctx || !this.dragGain || !this.dragFilter || this.isMuted) return;

    const t = this.ctx.currentTime;
    if (isDragging && velocity > 0.001) {
      const targetGain = Math.min(0.25, velocity * 12.0);
      const targetFreq = Math.min(1800, 300 + velocity * 15000);
      this.dragGain.gain.setTargetAtTime(targetGain, t, 0.08);
      this.dragFilter.frequency.setTargetAtTime(targetFreq, t, 0.08);
    } else {
      this.dragGain.gain.setTargetAtTime(0.0, t, 0.12);
    }
  }

  /**
   * Resonant crystal strike (on click or tap).
   */
  public playStrike(strength: number = 1.0): void {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const baseFreq = 480 + Math.random() * 40;
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, t + 0.35);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2.76, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.3);

    const amp = Math.min(0.6, strength * 0.35);
    gain.gain.setValueAtTime(amp, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.45);
    osc2.stop(t + 0.45);
  }

  /**
   * Elastic recoil transient snap (on drag release).
   */
  public playRecoil(strain: number = 1.0): void {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 + strain * 200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

    const amp = Math.min(0.5, strain * 0.4);
    gain.gain.setValueAtTime(amp, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Resonant harmonic bass pulse (on Spacebar / Pulse).
   */
  public playPulse(): void {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130.81, t);
    osc.frequency.exponentialRampToValueAtTime(65.41, t + 0.9);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, t);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 1.0);
    subOsc.stop(t + 1.0);
  }

  public dispose(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch { /* ignore */ }
    }
    if (this.ctx) {
      this.ctx.close();
    }
  }
}
