# MEMBRANE — Elastic Optical Toy
### Dodo Payments — Design Engineer Take-Home

> **A tactile, museum-grade elastic optical surface with real-time viscoelastic wave mechanics, Snell’s Law refraction, Cauchy chromatic dispersion, and synthesized acoustic haptics.**

---

## 🔗 Project Links

* **Live Interactive Demo:** [https://dodo-membrane-toy.vercel.app](https://dodo-membrane-toy.vercel.app)
* **Source Code:** [https://github.com/utkarsh21123/dodo-membrane-toy](https://github.com/utkarsh21123/dodo-membrane-toy)

---

## 1. Concept & Experience

**MEMBRANE** is a digital physical surface—an elastic optical medium suspended over an editorial typographic substrate. 

Instead of a generic 3D scene or an arbitrary collection of shader filters, **MEMBRANE** focuses on **one cohesive, deeply tactile core interaction**: grabbing, pulling, and rippling an elastic refractive surface that bends, magnifies, and disperses light through the typography beneath it.

### Core Interactions
* **Tug & Strain (Drag):** Clicking and dragging stretches the surface with non-linear viscoelastic spring tension ($F = -k x - c v$), magnifying and warping the underlying typography along the strain vector.
* **Elastic Recoil (Release):** Releasing the mouse converts accumulated strain into a high-frequency shockwave that radiates across the surface and reflects naturally off absorbing boundaries.
* **Kinetic Strike (Click / Tap):** Injects a localized Gaussian impulse with dual-oscillator acoustic crystal feedback.
* **Continuous Kinetic Wake (Scrub):** Moving across the surface leaves a dynamic wake modulated by cursor velocity.
* **Harmonic Pulse (`Spacebar` / `Pulse` button):** Resonates a low-frequency radial standing wave with a deep acoustic sub-bass chime.
* **Acoustic Haptics (`M` / Sound toggle):** Native Web Audio API synthesizer generates crystal pings, viscous liquid sweeps, and recoil transients mapped to physical kinetic energy.

---

## 2. Material Presets

The toy includes four meticulously calibrated optical materials:

| Preset | Optics & Material Feel | Key Physics Parameters |
| :--- | :--- | :--- |
| **01 Prismatic Glass** | High-index optical glass with strong Cauchy chromatic dispersion ($R/G/B$ spectral split) and sharp tungsten specular glints. | $\eta=1.52$, High dispersion, sharp specular |
| **02 Liquid Mercury** | Dense metallic fluid with high surface tension, reflective chrome rim, and deep curvature distortion. | High tension, high damping, metallic sheen |
| **03 Frosted Silica** | Silky translucent silicone with soft light scattering, micro-roughness jitter, and gentle wave propagation. | High viscosity, diffuse blur |
| **04 Thin-Film Pearl** | Anisotropic soap-bubble membrane with dynamic wavelength interference and cosine chromatic phase shifts. | Thin-film interference, high Fresnel |

---

## 3. Engineering & Architecture

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - Mode & Substrate State                              │
│  - Global Keyboard Shortcuts (Space, 1-4, M, R)        │
└───────────┬────────────────────────────────┬───────────┘
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│  MembraneCanvas.tsx   │        │     UIOverlay.tsx     │
│  - WebGL2 Pipeline    │        │  - Laboratory HUD     │
│  - Pointer Physics    │        │  - Segmented Controls │
│  - 120Hz Render Loop  │        │  - Calibration Drawer │
└───────────┬───────────┘        └───────────────────────┘
            │
            ├─────────────────────────┬─────────────────────────┐
            ▼                         ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│    PhysicsGrid.ts     │ │ SubstrateRenderer.ts  │ │  AudioSynthesizer.ts  │
│ - 2D Wave Solver      │ │ - Offscreen 2D Canvas │ │ - Web Audio API Engine│
│ - 9-point Laplacian   │ │ - Crisp Foundry Type  │ │ - Resonant Strikes    │
│ - Viscoelastic Anchor │ │ - WebGL Texture Pass  │ │ - Viscous Drag Sweeps │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### Key Technical Decisions
1. **Zero-Dependency Direct WebGL2 Pipeline (~10KB vs ~600KB Three.js):** Direct GLSL vertex and fragment passes instead of heavy 3D engines, keeping the bundle tiny and loading instant.
2. **Decoupled Physics & Render Loop:** Physics simulation runs on a typed `Float32Array` buffer using an isotropic 9-point discrete Laplacian kernel with absorbing boundary damping.
3. **Zero React Render Overhead:** Pointer movement, physics updates, and WebGL drawing run directly via `requestAnimationFrame` without triggering React reconciliation cycles, guaranteeing a constant 120fps/60fps budget.
4. **Offscreen Canvas Substrate:** Typography (`Instrument Serif` + `Syne` + `Space Grotesk` + `IBM Plex Mono`) is rasterized onto an offscreen canvas and bound as a GPU texture, allowing infinite resolution crisp text refraction.
5. **Real-Time Snell’s Law & Dispersion Shader:** Calculates analytical normals via finite differences and computes separate refraction ray vectors for Red, Green, and Blue channels.

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
* <kbd>Sliders Icon</kbd> — Open physics & optics fine-tuning drawer

---

## 6. What Could Be Explored Next

1. **Interactive Substrate Typography:** Allow the user to type custom text or drop an SVG/image onto the canvas to see it refracted in real time.
2. **Multi-layer Caustic Shadows:** Add a second optical pass computing light concentration caustics (photons focusing through wave crests onto a backplane).
3. **Spatial Gyroscope / Device Tilt:** Use mobile device orientation (`DeviceMotionEvent`) to let liquid slosh under physical gravity.
4. **Audio Reactive Mode:** Connect Web Audio microphone input to drive membrane resonance directly from ambient sound.
