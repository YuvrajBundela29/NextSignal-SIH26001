export class IntroAnimation {
  private onComplete: () => void;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private startTime: number = 0;
  private duration: number = 3200; // 3.2 seconds
  private isSkipped: boolean = false;
  private overlay: HTMLElement | null = null;

  constructor(onComplete: () => void) {
    this.onComplete = onComplete;
  }

  public play() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'nexsignal-futuristic-intro';
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #020617; z-index: 999999; overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    `;

    this.overlay.innerHTML = `
      <canvas id="intro-futuristic-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
      
      <!-- Holographic Overlay UI -->
      <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 720px; padding: 20px;">
        
        <!-- Cyber Scanner Frame -->
        <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(2, 132, 199, 0.12); border: 1px solid #0284c7; padding: 6px 16px; border-radius: 30px; margin-bottom: 20px; backdrop-filter: blur(10px); box-shadow: 0 0 24px rgba(2, 132, 199, 0.3);">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #00f0ff; animation: pulse 1.2s infinite; box-shadow: 0 0 10px #00f0ff;"></span>
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 2.5px; color: #38bdf8; text-transform: uppercase;">
            NER GEOSPATIAL INTELLIGENCE CORE v4.8
          </span>
        </div>

        <!-- Main Title -->
        <h1 id="intro-cyber-title" style="font-size: 42px; font-weight: 900; letter-spacing: 4px; color: #ffffff; margin: 0 0 8px; text-shadow: 0 0 30px rgba(56, 189, 248, 0.6); text-transform: uppercase;">
          NEXSIGNAL
        </h1>
        
        <div style="font-size: 14px; font-weight: 800; letter-spacing: 3px; color: #00f0ff; text-transform: uppercase; margin-bottom: 24px;">
          AI GEOHAZARD EARLY WARNING NETWORK
        </div>

        <!-- Telemetry Pipeline Scanner -->
        <div style="width: 100%; max-width: 440px; background: rgba(11, 17, 32, 0.85); border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); backdrop-filter: blur(8px);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; font-family: monospace; margin-bottom: 8px;">
            <span id="intro-status-text">INITIALIZING SATELLITE RADAR...</span>
            <span id="intro-pct-text" style="color: #00f0ff; font-weight: bold;">0%</span>
          </div>

          <!-- Progress Bar -->
          <div style="width: 100%; height: 6px; background: #050811; border-radius: 3px; overflow: hidden; border: 1px solid #1e293b;">
            <div id="intro-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0284c7, #00f0ff, #10b981); box-shadow: 0 0 12px #00f0ff; transition: width 0.08s linear;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #64748b; font-family: monospace; margin-top: 10px;">
            <span>USGS SEISMIC: SYNCED</span>
            <span>OPEN-METEO: 28/28</span>
            <span>InSAR SAR: ACTIVE</span>
          </div>
        </div>

        <!-- Skip Action -->
        <button id="btn-skip-intro" style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 8px 20px; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(4px);">
          SKIP INITIALIZATION &rarr;
        </button>

      </div>
    `;

    document.body.appendChild(this.overlay);

    this.canvas = this.overlay.querySelector('#intro-futuristic-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    this.overlay.querySelector('#btn-skip-intro')?.addEventListener('click', () => {
      this.finish();
    });

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        window.removeEventListener('keydown', keyHandler);
        this.finish();
      }
    };
    window.addEventListener('keydown', keyHandler);

    this.playAudioSynthBoot();
    this.startTime = performance.now();
    this.animate();
  }

  private playAudioSynthBoot() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.2);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    } catch (e) {
      // Audio not permitted without direct gesture
    }
  }

  private resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private animate() {
    if (this.isSkipped) return;

    const now = performance.now();
    const elapsed = now - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);

    this.drawFuturisticScene(progress, now);
    this.updateStatus(progress);

    if (progress < 1) {
      this.animFrameId = requestAnimationFrame(this.animate.bind(this));
    } else {
      setTimeout(() => this.finish(), 300);
    }
  }

  private updateStatus(progress: number) {
    const pBar = document.getElementById('intro-progress-bar');
    const pText = document.getElementById('intro-pct-text');
    const sText = document.getElementById('intro-status-text');

    const pct = Math.floor(progress * 100);
    if (pBar) pBar.style.width = `${pct}%`;
    if (pText) pText.textContent = `${pct}%`;

    if (sText) {
      if (progress < 0.25) {
        sText.textContent = 'CONNECTING GEOSPATIAL SATELLITE LINKS...';
      } else if (progress < 0.55) {
        sText.textContent = 'FUSING DEM TERRAIN & SOIL MOISTURE DATA...';
      } else if (progress < 0.85) {
        sText.textContent = 'EXECUTING 5-FACTOR MULTI-HAZARD AI INFERENCE...';
      } else {
        sText.textContent = 'TWO-WAY GROUND INTELLIGENCE SYSTEM READY';
      }
    }
  }

  private drawFuturisticScene(progress: number, now: number) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, w, h);

    // 1. Perspective Cyber Grid
    this.ctx.strokeStyle = 'rgba(2, 132, 199, 0.15)';
    this.ctx.lineWidth = 1;
    const gridCols = 16;
    for (let i = 0; i <= gridCols; i++) {
      const gx = (w / gridCols) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(gx, 0);
      this.ctx.lineTo(gx, h);
      this.ctx.stroke();
    }
    const gridRows = 12;
    for (let j = 0; j <= gridRows; j++) {
      const gy = (h / gridRows) * j;
      this.ctx.beginPath();
      this.ctx.moveTo(0, gy);
      this.ctx.lineTo(w, gy);
      this.ctx.stroke();
    }

    // 2. Rotating Radar Sweep Waves
    const radarAngle = (now * 0.003) % (Math.PI * 2);
    const maxRadius = Math.min(w, h) * 0.45;

    // Concentric Target Rings
    for (let r = 0.25; r <= 1.0; r += 0.25) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, maxRadius * r, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 + r * 0.1})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Radar Beam Sweep
    const sweepGrad = this.ctx.createConicGradient ? (this.ctx as any).createConicGradient(cx, cy, radarAngle) : null;
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(radarAngle);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, maxRadius, -0.4, 0);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    this.ctx.fill();

    // Radar Lead Line
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(maxRadius, 0);
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 10;
    this.ctx.stroke();
    this.ctx.restore();

    // 3. Northeast India Tactical Nodes Popping In
    const nodes = [
      { name: 'MANGAN 27.51°N', ox: -120, oy: -80, color: '#ef4444' },
      { name: 'CHUNGTHANG 27.60°N', ox: -90, oy: -110, color: '#ef4444' },
      { name: 'SHILLONG 25.57°N', ox: -30, oy: 40, color: '#f59e0b' },
      { name: 'NONEY 24.78°N', ox: 90, oy: 60, color: '#ef4444' },
      { name: 'HAFLONG 25.16°N', ox: 40, oy: 20, color: '#38bdf8' },
      { name: 'TAWANG 27.58°N', ox: -40, oy: -120, color: '#38bdf8' },
      { name: 'AIZAWL 23.72°N', ox: 50, oy: 120, color: '#10b981' },
      { name: 'KOHIMA 25.67°N', ox: 120, oy: 0, color: '#38bdf8' },
    ];

    nodes.forEach((n, idx) => {
      const nodeAppearTime = idx / nodes.length;
      if (progress >= nodeAppearTime) {
        const nx = cx + n.ox;
        const ny = cy + n.oy;

        // Pulsing Circle
        const pingSize = 6 + (Math.sin(now * 0.01 + idx) + 1) * 6;
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, pingSize, 0, Math.PI * 2);
        this.ctx.strokeStyle = n.color;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();

        // Node Label
        this.ctx.font = '9px monospace';
        this.ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        this.ctx.fillText(n.name, nx + 10, ny + 3);
      }
    });
  }

  private finish() {
    if (this.isSkipped) return;
    this.isSkipped = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.overlay) {
      this.overlay.style.transition = 'opacity 0.3s ease';
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
        this.onComplete();
      }, 300);
    } else {
      this.onComplete();
    }
  }
}
