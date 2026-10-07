import { SubstrateTheme } from '../types';

/**
 * Museum-Grade 2D Substrate Renderer.
 * Rasterizes crisp, high-DPI typographic lithographs and guilloché security geometry
 * to be refracted and dispersed through the WebGL2 elastic membrane.
 */
export class SubstrateRenderer {
  public readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public width: number = 2048;
  public height: number = 2048;

  constructor(width: number = 2048, height: number = 2048) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    const context = this.canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Failed to create 2D canvas context for substrate');
    }
    this.ctx = context;
    this.render('editorial');
  }

  public resize(width: number, height: number, theme: SubstrateTheme = 'editorial'): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.max(1536, Math.floor(width * dpr));
    this.height = Math.max(1536, Math.floor(height * dpr));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.render(theme);
  }

  public render(theme: SubstrateTheme = 'editorial'): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Deep volcanic obsidian substrate
    ctx.fillStyle = '#07080a';
    ctx.fillRect(0, 0, w, h);

    // Subtle warm radial vignette
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.1, w * 0.5, h * 0.5, w * 0.75);
    grad.addColorStop(0, '#0d0f14');
    grad.addColorStop(1, '#050608');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    switch (theme) {
      case 'editorial':
        this.renderEditorial(ctx, w, h);
        break;
      case 'dodo_spec':
        this.renderDodoSpec(ctx, w, h);
        break;
      case 'geometric':
        this.renderGeometric(ctx, w, h);
        break;
    }

    // Precision Swiss Corner Registration & Axis Markers
    this.renderFrameRegistration(ctx, w, h);
  }

  private renderEditorial(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const cx = w * 0.5;
    const cy = h * 0.5;

    // Subtle background architectural grid
    ctx.strokeStyle = 'rgba(250, 248, 245, 0.03)';
    ctx.lineWidth = 1;
    const step = Math.floor(w / 24);
    for (let x = step; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top Header Specimen Label
    ctx.fillStyle = 'rgba(250, 248, 245, 0.45)';
    ctx.font = `500 ${Math.floor(w * 0.0105)}px "IBM Plex Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('NO. 001 // DODO PAYMENTS DESIGN ENGINEERING', w * 0.12, h * 0.18);

    ctx.textAlign = 'right';
    ctx.fillText('SPECIMEN: ELASTIC VISCOUS MEDIUM [120Hz]', w * 0.88, h * 0.18);

    // Hairline divider
    ctx.strokeStyle = 'rgba(250, 248, 245, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.205);
    ctx.lineTo(w * 0.88, h * 0.205);
    ctx.stroke();

    // Guilloché concentric background rings (subtle optical resonance)
    const ringRadius = Math.min(w, h) * 0.32;
    for (let i = 1; i <= 6; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(250, 248, 245, 0.06)' : 'rgba(250, 248, 245, 0.025)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.02, (ringRadius / 6) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Super-graphic Editorial Typography
    ctx.fillStyle = '#FAF8F5';
    ctx.font = `italic 400 ${Math.floor(w * 0.11)}px "Instrument Serif", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Elastic Light', cx, cy - h * 0.04);

    // Secondary Modern Grotesk Subtitle
    ctx.fillStyle = 'rgba(250, 248, 245, 0.8)';
    ctx.font = `600 ${Math.floor(w * 0.016)}px "Syne", sans-serif`;
    ctx.letterSpacing = '5px';
    ctx.fillText('THE TACTILE ANATOMY OF REFRACTION', cx, cy + h * 0.045);

    // Editorial Thesis Statement Paragraph
    ctx.fillStyle = 'rgba(250, 248, 245, 0.45)';
    ctx.font = `400 ${Math.floor(w * 0.011)}px "Space Grotesk", sans-serif`;
    ctx.letterSpacing = '1px';
    ctx.fillText('A physical simulation of viscoelastic tension, Snell’s law, and Cauchy spectral dispersion.', cx, cy + h * 0.10);

    // Micro-etched Swiss Data Blocks
    const blockY = cy + h * 0.17;
    const blockW = w * 0.76;
    const startX = cx - blockW * 0.5;

    ctx.strokeStyle = 'rgba(250, 248, 245, 0.1)';
    ctx.strokeRect(startX, blockY, blockW, h * 0.12);

    const cols = 3;
    const colW = blockW / cols;

    const dataItems = [
      { tag: '01 / SURFACE TENSION', val: 'NON-LINEAR HOOKE DAMPING', sub: 'c² = 0.45 • γ = 0.982' },
      { tag: '02 / OPTICAL DISPERSION', val: 'SNELL RAY SPLITTING', sub: 'η_red: 1.48 • η_blue: 1.54' },
      { tag: '03 / INTERACTION KINETICS', val: 'VISCOELASTIC RECOIL', sub: 'Tug strain → Snap release' },
    ];

    dataItems.forEach((item, idx) => {
      const colX = startX + idx * colW + 28;
      
      if (idx > 0) {
        ctx.beginPath();
        ctx.moveTo(startX + idx * colW, blockY);
        ctx.lineTo(startX + idx * colW, blockY + h * 0.12);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(250, 248, 245, 0.35)';
      ctx.font = `500 ${Math.floor(w * 0.0085)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(item.tag, colX, blockY + 34);

      ctx.fillStyle = '#FAF8F5';
      ctx.font = `600 ${Math.floor(w * 0.0105)}px "Syne", sans-serif`;
      ctx.fillText(item.val, colX, blockY + 62);

      ctx.fillStyle = 'rgba(250, 248, 245, 0.4)';
      ctx.font = `400 ${Math.floor(w * 0.009)}px "IBM Plex Mono", monospace`;
      ctx.fillText(item.sub, colX, blockY + 86);
    });

    // Substrate Footer Quote
    ctx.fillStyle = 'rgba(250, 248, 245, 0.3)';
    ctx.font = `italic 400 ${Math.floor(w * 0.0115)}px "Instrument Serif", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('“One really good interaction is better than ten mediocre ones.” — Dodo Payments', cx, h * 0.85);
  }

  private renderDodoSpec(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const cx = w * 0.5;
    const cy = h * 0.5;

    // Security Guilloché Micro-Lines
    ctx.strokeStyle = 'rgba(250, 248, 245, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 360; i += 8) {
      const rad = (i * Math.PI) / 180;
      ctx.beginPath();
      ctx.ellipse(cx, cy - h * 0.05, w * 0.36, h * 0.22, rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Top Category
    ctx.fillStyle = 'rgba(250, 248, 245, 0.45)';
    ctx.font = `500 ${Math.floor(w * 0.011)}px "IBM Plex Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('DODO PAYMENTS // GLOBAL SETTLEMENT PROTOCOL', cx, h * 0.18);

    // Monumental Hero Currency Value
    ctx.fillStyle = '#FAF8F5';
    ctx.font = `700 ${Math.floor(w * 0.085)}px "Space Grotesk", sans-serif`;
    ctx.letterSpacing = '-2px';
    ctx.fillText('$4,892,104.50', cx, cy - h * 0.07);

    // Currency Subtext
    ctx.fillStyle = 'rgba(250, 248, 245, 0.7)';
    ctx.font = `italic 400 ${Math.floor(w * 0.028)}px "Instrument Serif", serif`;
    ctx.fillText('Autonomous Ledger Clearance • 42ms Latency', cx, cy - h * 0.01);

    // Financial Transaction Matrix Table
    const tableW = w * 0.78;
    const tableH = h * 0.22;
    const tableX = cx - tableW * 0.5;
    const tableY = cy + h * 0.06;

    ctx.strokeStyle = 'rgba(250, 248, 245, 0.12)';
    ctx.strokeRect(tableX, tableY, tableW, tableH);

    const rows = 4;
    const rowH = tableH / rows;

    const transactions = [
      { id: 'TX_9482_US_EAST', route: 'STRIPE_INTL → DODO_CORE', status: 'SETTLED [0x9A4F]', val: '+ $142,500.00 USD' },
      { id: 'TX_9483_EU_CENTRAL', route: 'SEPA_INSTANT → CLEARING_02', status: 'SETTLED [0x8B3C]', val: '+ €89,240.00 EUR' },
      { id: 'TX_9484_AP_SOUTH', route: 'UPI_CROSS_BORDER → NODE_07', status: 'VERIFIED [0x7D2A]', val: '+ ₹1,250,000.00 INR' },
      { id: 'TX_9485_UK_LONDON', route: 'FASTER_PAYMENTS → VAULT_01', status: 'COMPLETED [0x6E1F]', val: '+ £64,800.00 GBP' },
    ];

    transactions.forEach((tx, idx) => {
      const y = tableY + idx * rowH;

      if (idx > 0) {
        ctx.beginPath();
        ctx.moveTo(tableX, y);
        ctx.lineTo(tableX + tableW, y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(250, 248, 245, 0.4)';
      ctx.font = `500 ${Math.floor(w * 0.009)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(tx.id, tableX + 24, y + rowH * 0.6);

      ctx.fillStyle = '#FAF8F5';
      ctx.font = `500 ${Math.floor(w * 0.010)}px "Space Grotesk", sans-serif`;
      ctx.fillText(tx.route, tableX + tableW * 0.28, y + rowH * 0.6);

      ctx.fillStyle = 'rgba(250, 248, 245, 0.5)';
      ctx.font = `400 ${Math.floor(w * 0.0085)}px "IBM Plex Mono", monospace`;
      ctx.fillText(tx.status, tableX + tableW * 0.62, y + rowH * 0.6);

      ctx.fillStyle = '#FAF8F5';
      ctx.font = `600 ${Math.floor(w * 0.0105)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(tx.val, tableX + tableW - 24, y + rowH * 0.6);
    });

    // Bottom Cryptographic Hash
    ctx.fillStyle = 'rgba(250, 248, 245, 0.25)';
    ctx.font = `400 ${Math.floor(w * 0.0085)}px "IBM Plex Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('BLOCK HASH: 0x7c94b2f0a1e38d56c8b9a0123e456f7890abcdef1234567890abcdef12345678', cx, h * 0.85);
  }

  private renderGeometric(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const cx = w * 0.5;
    const cy = h * 0.5;

    // High-density precision optical vernier grid
    const maxR = Math.min(w, h) * 0.38;
    const rings = 12;

    for (let i = 1; i <= rings; i++) {
      const r = (maxR / rings) * i;
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(250, 248, 245, 0.16)' : 'rgba(250, 248, 245, 0.04)';
      ctx.lineWidth = i % 3 === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Polar radial angle divisions
    const divisions = 64;
    for (let i = 0; i < divisions; i++) {
      const angle = (i / divisions) * Math.PI * 2;
      const isMajor = i % 8 === 0;
      const r1 = maxR * (isMajor ? 0.88 : 0.94);
      const r2 = isMajor ? maxR * 1.05 : maxR;

      ctx.strokeStyle = isMajor ? 'rgba(250, 248, 245, 0.3)' : 'rgba(250, 248, 245, 0.08)';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }

    // Bold Modernist Centerpiece
    ctx.fillStyle = '#FAF8F5';
    ctx.font = `italic 400 ${Math.floor(w * 0.08)}px "Instrument Serif", serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Prism & Form', cx, cy - 12);

    ctx.fillStyle = 'rgba(250, 248, 245, 0.6)';
    ctx.font = `600 ${Math.floor(w * 0.014)}px "Syne", sans-serif`;
    ctx.letterSpacing = '8px';
    ctx.fillText('OPTICAL VERNIER MATRIX', cx, cy + 32);

    // Crosshairs
    ctx.strokeStyle = 'rgba(250, 248, 245, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - maxR * 1.15, cy);
    ctx.lineTo(cx + maxR * 1.15, cy);
    ctx.moveTo(cx, cy - maxR * 1.15);
    ctx.lineTo(cx, cy + maxR * 1.15);
    ctx.stroke();
  }

  private renderFrameRegistration(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const pad = Math.floor(w * 0.035);
    const len = 24;

    ctx.strokeStyle = 'rgba(250, 248, 245, 0.3)';
    ctx.lineWidth = 1.5;

    // 4 Corner Registration Hairlines
    ctx.beginPath();
    ctx.moveTo(pad, pad + len);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + len, pad);

    ctx.moveTo(w - pad - len, pad);
    ctx.lineTo(w - pad, pad);
    ctx.lineTo(w - pad, pad + len);

    ctx.moveTo(pad, h - pad - len);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(pad + len, h - pad);

    ctx.moveTo(w - pad - len, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.lineTo(w - pad, h - pad - len);
    ctx.stroke();
  }
}
