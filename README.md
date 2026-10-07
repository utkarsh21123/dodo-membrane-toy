# MEMBRANE — Elastic Optical Surface
### Dodo Payments — Design Engineer Take-Home

> **A tactile, museum-grade elastic optical medium with real-time viscoelastic wave mechanics, Snell’s Law refraction, Cauchy chromatic dispersion, optical caustics, audio-reactive FFT physics, and spatial gyroscope gravity.**

---

## 🔗 Project Links

* **Live Interactive Demo:** [https://dodo-membrane-toy.vercel.app](https://dodo-membrane-toy.vercel.app)
* **Source Code:** [https://github.com/utkarsh21123/dodo-membrane-toy](https://github.com/utkarsh21123/dodo-membrane-toy)

---

## 1. Concept & Complete Feature Architecture

**MEMBRANE** is a digital physical surface—an elastic optical medium suspended over an editorial typographic substrate.

Rather than assembling a generic 3D scene or an arbitrary collection of shader filters, **MEMBRANE** is engineered as a deep, cohesive physical instrument.

### Core Capabilities & Interactions

1. **Viscoelastic Tug & Strain (Drag):** Clicking and dragging stretches the surface with non-linear spring tension ($F = -k x - c v$), warping and magnifying the underlying typography along the strain vector.
2. **Elastic Recoil (Release):** Releasing the mouse converts accumulated strain into a high-frequency shockwave that radiates across the surface and reflects naturally off absorbing boundaries.
3. **Kinetic Strike (Click / Tap):** Injects a localized Gaussian impulse with dual-oscillator acoustic crystal feedback.
4. **Multi-layer Optical Caustics:** Real-time divergence and 2D Laplacian surface curvature calculations in GLSL produce razor-sharp light concentration filaments in concave wave troughs and soft refractive shadows behind crests.
5. **Interactive Typography & Drag-and-Drop Assets:**
   * **Live Custom Text:** Click the `TYPE` button to input custom editorial headlines and taglines in real time.
   * **Drag-and-Drop Image / SVG:** Drop any PNG, JPG, or SVG file directly onto the canvas to watch it immediately rasterize and refract through the elastic medium.
6. **Audio-Reactive Microphone Input (`MIC`):**
   * Connects live microphone audio to a Web Audio `AnalyserNode` with Fast Fourier Transform (FFT).
   * Sub-bass pulses center shockwaves, mid frequencies inject orbiting harmonic nodes, and treble creates micro-ripples.
7. **Spatial Gyroscope / Device Tilt (`GYRO`):**
   * Uses mobile device orientation (`DeviceOrientationEvent`) to apply continuous directional gravity vectors, letting the optical liquid physically slosh against the lower screen edge.
8. **Synthesized Acoustic Haptics (`M` / Sound toggle):** Native Web Audio API synthesizer generates crystal pings, viscous liquid sweeps, and recoil transients mapped to physical kinetic energy.

---

## 2. Material Presets

| Preset | Optics & Material Feel | Key Physics Parameters |
| :--- | :--- | :--- |
| **01 Prismatic Glass** | High-index optical glass with strong Cauchy chromatic dispersion ($R/G/B$ spectral split), sharp caustics, and tungsten specular glints. | $\eta=1.52$, High dispersion, sharp specular & caustics |
| **02 Liquid Mercury** | Dense metallic fluid with high surface tension, reflective chrome rim, and deep curvature distortion. | High tension, high damping, metallic sheen |
| **03 Frosted Silica** | Silky translucent silicone with soft light scattering, micro-roughness jitter, and gentle wave propagation. | High viscosity, diffuse blur |
| **04 Thin-Film Pearl** | Anisotropic soap-bubble membrane with dynamic wavelength interference and cosine chromatic phase shifts. | Thin-film interference, high Fresnel |

---

## 3. Engineering & Architecture

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - Mode & Substrate State                              │
│  - Live Microphone Audio Reactive Controller           │
│  - Spatial Gyroscope Tilt Controller                   │
│  - Global Keyboard Shortcuts (Space, 1-4, M, R)        │
└───────────┬────────────────────────────────┬───────────┘
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│  MembraneCanvas.tsx   │        │     UIOverlay.tsx     │
│  - WebGL2 Pipeline    │        │  - Laboratory HUD     │
│  - Drag & Drop Target │        │  - Segmented Controls │
│  - Gyro & Mic Loop    │        │  - Typography Editor  │
│  - 120Hz Render Loop  │        │  - Calibration Drawer │
└───────────┬───────────┘        └───────────────────────┘
            │
            ├─────────────────────────┬─────────────────────────┐
            ▼                         ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│    PhysicsGrid.ts     │ │ SubstrateRenderer.ts  │ │  AudioSynthesizer.ts  │
│ - 2D Wave Solver      │ │ - Offscreen 2D Canvas │ │ - Web Audio API Engine│
│ - 9-point Laplacian   │ │ - Custom User Type    │ │ - Live FFT Mic Stream │
│ - Gravity Slosh Vector│ │ - Drag & Drop SVG/Img │ │ - Resonant Strikes    │
│ - Audio Frequency Wave│ │ - WebGL Texture Pass  │ │ - Viscous Drag Sweeps │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### Key Technical Decisions
1. **Zero-Dependency Direct WebGL2 Pipeline (~10KB vs ~600KB Three.js):** Direct GLSL vertex and fragment passes instead of heavy 3D engines, keeping the bundle tiny and loading instant.
2. **Decoupled Physics & Render Loop:** Physics simulation runs on a typed `Float32Array` buffer using an isotropic 9-point discrete Laplacian kernel with absorbing boundary damping.
3. **Zero React Render Overhead:** Pointer movement, physics updates, and WebGL drawing run directly via `requestAnimationFrame` without triggering React reconciliation cycles, guaranteeing a constant 120fps/60fps budget.
4. **Offscreen Canvas Substrate:** Typography (`Instrument Serif` + `Syne` + `Space Grotesk` + `IBM Plex Mono`) and user-dropped assets are rasterized onto an offscreen canvas and bound as a GPU texture, allowing infinite resolution crisp text refraction.
5. **Real-Time Snell’s Law, Caustics & Dispersion Shader:** Calculates analytical normals via finite differences, evaluates surface Laplacian for optical light concentration, and computes separate refraction ray vectors for Red, Green, and Blue channels.

---

## 4. Running Locally

### Prerequisites
* Node.js $\ge 18$
* npm or pnpm

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 5. Keyboard & Touch Controls

* <kbd>Drag</kbd> — Pull and stretch elastic surface
* <kbd>Click / Tap</kbd> — Strike radial shockwave
* <kbd>Space</kbd> — Harmonic center pulse
* <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> — Switch material presets
* <kbd>M</kbd> — Toggle acoustic haptics
* <kbd>R</kbd> — Reset to equilibrium
* <kbd>Drop File</kbd> — Drag & drop any image or SVG file directly onto the canvas
* <kbd>TYPE</kbd> — Open typography customization dialog
* <kbd>MIC</kbd> — Toggle live microphone audio reactivity
* <kbd>GYRO</kbd> — Toggle spatial device tilt gravity slosh
* <kbd>Sliders Icon</kbd> — Open optical caustics, dispersion, and physics calibration drawer
