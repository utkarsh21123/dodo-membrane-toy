# MEMBRANE — Elastic Optical Surface
### Dodo Payments — Design Engineer Take-Home Assignment

> **A tactile, museum-grade elastic optical medium with real-time viscoelastic wave mechanics, Snell’s Law refraction, Cauchy chromatic dispersion, multi-layer optical caustics, audio-reactive FFT physics, and spatial gyroscope gravity.**

---

## 🔗 Project Links

* **Live Interactive Demo:** [https://dodo-membrane-toy.vercel.app](https://dodo-membrane-toy.vercel.app)
* **Source Code Repository:** [https://github.com/utkarsh21123/dodo-membrane-toy](https://github.com/utkarsh21123/dodo-membrane-toy)

---

## 1. Concept & Experience

**MEMBRANE** is a digital physical surface—an elastic optical medium suspended over an editorial typographic substrate.

Rather than assembling a generic 3D scene or an arbitrary collection of shader filters, **MEMBRANE** is engineered as a deep, cohesive physical instrument. Every visual and technical decision is authored to provide an immediate, satisfying tactile sensation: pulling, stretching, and rippling an elastic refractive surface that disperses light through the typography beneath it.

---

## 2. Core Capabilities & Mechanics

### 🌊 Physical Mechanics & Optics
1. **Viscoelastic Tug & Strain (Drag):** Clicking and dragging anchors to the elastic surface with non-linear spring tension ($F = -k x - c v$), warping and magnifying the underlying typography along the strain vector.
2. **Elastic Recoil (Release):** Releasing the mouse instantly converts accumulated strain into a high-frequency shockwave that radiates outwards and reflects naturally off absorbing boundaries.
3. **Kinetic Strike (Click / Tap):** Injects a localized Gaussian impulse with synthesized dual-oscillator crystal chime feedback.
4. **Multi-layer Optical Caustics:** Real-time 2D Laplacian curvature calculations in GLSL produce razor-sharp light concentration filaments in concave wave troughs and soft refractive shadows behind crests.
5. **Cauchy Chromatic Dispersion:** Snell’s law refraction splits light into distinct Red, Green, and Blue rays proportional to surface normal gradients.

### 🎛️ Interactive Customization & Multi-Modal Inputs
6. **Live Substrate Typography & Asset Drag-and-Drop:**
   * **Live Custom Text (`TYPE`):** Input custom editorial headlines and taglines in real time.
   * **Drag & Drop Assets:** Drop any PNG, JPG, or SVG file directly onto the canvas to watch it immediately rasterize and refract through the elastic medium.
7. **Audio-Reactive Microphone Input (`MIC`):**
   * Live microphone FFT frequency analysis: sub-bass pulses center shockwaves, mid frequencies inject orbiting harmonic nodes, and treble scatters micro-ripples.
8. **Spatial Gyroscope / Device Tilt (`GYRO`):**
   * Translates mobile/tablet orientation (`DeviceOrientationEvent`) into real-time gravitational acceleration vectors $(\vec{g}_x, \vec{g}_y)$, causing the optical liquid to slosh and pile up against the lower screen edge.
9. **Synthesized Acoustic Haptics (`M` / Sound toggle):** Native Web Audio API synthesizer generates crystal pings, viscous liquid sweeps, and recoil transients mapped to physical kinetic energy.

---

## 3. Optical Material Presets

| Preset | Optics & Material Feel | Key Physical & Shader Parameters |
| :--- | :--- | :--- |
| **01 Prismatic Glass** | High-index optical glass with pronounced Cauchy chromatic dispersion ($R/G/B$ spectral split), sharp caustics, and tungsten specular glints. | $\eta=1.52$, High dispersion, sharp caustics & specular |
| **02 Liquid Mercury** | Dense metallic fluid with high surface tension, reflective chrome rim, and deep curvature distortion. | High tension, high damping, metallic sheen |
| **03 Frosted Silica** | Silky translucent silicone with soft light scattering, micro-roughness jitter, and gentle wave propagation. | High viscosity, diffuse scattering |
| **04 Thin-Film Pearl** | Anisotropic soap-bubble membrane with dynamic wavelength interference and cosine chromatic phase shifts. | Thin-film interference, high Fresnel |

---

## 4. Substrate Art Themes

* **`Editorial`**: Monumental *Elastic Light* display serif typography (`Instrument Serif`), concentric guilloché resonance rings, and a 3-column micro-etched Swiss data matrix.
* **`Ledger Spec`**: Luxury financial infrastructure theme featuring real-time settlement tables, cryptographic hash nodes, and monumental monospace currency figures (`$4,892,104.50`).
* **`Geometric`**: High-density optical vernier matrix with 64-division polar ticks, golden ratio rings, and alignment crosshairs.
* **`Custom`**: Live user-edited typography and drag-and-dropped image/SVG graphics.

---

## 5. Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│  - Active Material Preset & Substrate State Management                 │
│  - Live Microphone Audio Reactive Loop                                 │
│  - Spatial Gyroscope Gravity Vector Controller                         │
│  - Global Keyboard Shortcuts (Space, 1-4, M, R)                        │
└───────────────────┬────────────────────────────────┬───────────────────┘
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

### Key Engineering Decisions ("Not Vibe Coded")
1. **Zero-Dependency Direct WebGL2 Pipeline (~10KB bundle footprint):** Direct GLSL vertex and fragment passes avoid heavy 3D engine overhead (~600KB Three.js), ensuring sub-50ms load times and 120Hz frame rates.
2. **Decoupled Physics & Render Loop:** Physics simulation runs in a typed `Float32Array` buffer using an isotropic 9-point discrete Laplacian kernel with absorbing boundary damping.
3. **Zero React Render Overhead:** Pointer movement, physics updates, and WebGL drawing run directly via `requestAnimationFrame` without triggering React reconciliation cycles.
4. **Offscreen Canvas Substrate:** Typography (`Instrument Serif` + `Syne` + `Space Grotesk` + `IBM Plex Mono`) and user-dropped assets are rasterized onto an offscreen canvas and bound as a GPU texture, allowing infinite resolution crisp text refraction.
5. **Real-Time Snell’s Law, Caustics & Dispersion Shader:** Calculates analytical normals via finite differences, evaluates surface Laplacian for optical light concentration, and computes separate refraction ray vectors for Red, Green, and Blue channels.

---

## 6. Running Locally

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

## 7. Keyboard & Touch Controls Cheatsheet

| Input / Shortcut | Action |
| :--- | :--- |
| <kbd>Drag</kbd> | Pull and stretch elastic surface with viscoelastic strain |
| <kbd>Click / Tap</kbd> | Strike localized radial shockwave |
| <kbd>Space</kbd> / <kbd>PULSE</kbd> | Resonate low-frequency standing wave pulse |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Switch optical material presets |
| <kbd>M</kbd> | Toggle acoustic haptics |
| <kbd>R</kbd> | Reset medium to equilibrium |
| <kbd>Drop File</kbd> | Drag & drop any PNG/JPG/SVG file directly onto the canvas |
| <kbd>TYPE</kbd> | Open typography customization dialog |
| <kbd>MIC</kbd> | Toggle live microphone audio reactivity |
| <kbd>GYRO</kbd> | Toggle spatial device tilt gravity slosh |
| <kbd>Sliders Icon</kbd> | Open optical caustics, dispersion, and physics calibration drawer |
