export class IntroAnimation {
  private overlay: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number = 0;
  private onComplete: () => void;
  private isDone: boolean = false;

  constructor(onComplete: () => void) {
    this.onComplete = onComplete;
  }

  public play() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'nexsignal-intro-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #020617;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
      transition: opacity 0.5s ease-out;
    `;

    this.overlay.innerHTML = `
      <canvas id="intro-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.6; pointer-events: none;"></canvas>

      <!-- Skip Button -->
      <button id="btn-skip-intro" style="position: absolute; top: 20px; right: 24px; background: rgba(15, 23, 42, 0.7); border: 1px solid #334155; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 20px; cursor: pointer; backdrop-filter: blur(4px); z-index: 10; transition: all 0.15s ease;">
        SKIP INTRO ⏩
      </button>

      <!-- Center Branding & Sequence -->
      <div style="position: relative; z-index: 5; text-align: center; max-width: 540px; padding: 20px;">
        
        <!-- Logo Emblem -->
        <div style="position: relative; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #0284c7; opacity: 0.3; animation: introPulse 2s infinite;"></div>
          <div style="position: absolute; width: 60px; height: 60px; border-radius: 50%; border: 2px dashed #38bdf8; opacity: 0.6; animation: introSpin 8s linear infinite;"></div>
          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #1e1b4b); display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 0 20px #0284c780;">
            ⚡
          </div>
        </div>

        <h1 style="font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 0 0 4px; color: #ffffff; text-shadow: 0 0 30px rgba(56, 189, 248, 0.4);">
          NEXSIGNAL
        </h1>
        <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 24px;">
          GEOSPATIAL DISASTER INTELLIGENCE
        </div>

        <!-- Dynamic Stage Text -->
        <div id="intro-stage-label" style="font-size: 12px; font-family: monospace; font-weight: 700; color: #cbd5e1; height: 20px; margin-bottom: 12px; letter-spacing: 0.5px;">
          INITIALIZING GEOSPATIAL INTELLIGENCE...
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 4px; background: #1e293b; border-radius: 4px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
          <div id="intro-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0284c7, #38bdf8, #22c55e); transition: width 0.3s ease-out;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #64748b; font-family: monospace;">
          <span>SIH26001 &bull; MDoNER</span>
          <span id="intro-pct-label">0%</span>
          <span>NER INDIA SECTOR</span>
        </div>

      </div>

      <style>
        @keyframes introPulse {
          0% { transform: scale(0.9); opacity: 0.2; }
          50% { transform: scale(1.3); opacity: 0.6; }
          100% { transform: scale(0.9); opacity: 0.2; }
        }
        @keyframes introSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(this.overlay);

    this.canvas = this.overlay.querySelector('#intro-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext('2d');
      this.startCanvasAnimation();
    }

    const skipBtn = this.overlay.querySelector('#btn-skip-intro');
    skipBtn?.addEventListener('click', () => this.finish());

    this.runSequence();
  }

  private runSequence() {
    const stageEl = this.overlay?.querySelector('#intro-stage-label');
    const barEl = this.overlay?.querySelector('#intro-progress-bar') as HTMLElement;
    const pctEl = this.overlay?.querySelector('#intro-pct-label');

    const steps = [
      { t: 0, text: 'INITIALIZING NEXSIGNAL SYSTEM CORE...', pct: 15 },
      { t: 500, text: 'CONNECTING TO GEOSPATIAL DATA FEEDS (NER INDIA)...', pct: 38 },
      { t: 1100, text: 'FUSING WEATHER + USGS SEISMIC + NASA SOIL SIGNALS...', pct: 65 },
      { t: 1700, text: 'SYNTHESIZING 5-FACTOR MULTI-HAZARD RISK MATRIX...', pct: 88 },
      { t: 2300, text: 'SYSTEM READY • ACTIVATING DISASTER INTELLIGENCE', pct: 100 },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        if (this.isDone) return;
        if (stageEl) stageEl.textContent = step.text;
        if (barEl) barEl.style.width = `${step.pct}%`;
        if (pctEl) pctEl.textContent = `${step.pct}%`;
      }, step.t);
    });

    setTimeout(() => {
      this.finish();
    }, 2800);
  }

  private startCanvasAnimation() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 35; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 2 + 1,
      });
    }

    let sweepAngle = 0;

    const render = () => {
      if (this.isDone) return;
      ctx.clearRect(0, 0, w, h);

      // Draw radar sweep
      sweepAngle += 0.03;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.45;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.1)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.33, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.08)';
      ctx.stroke();

      // Radar line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Nodes & Links
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      this.animId = requestAnimationFrame(render);
    };

    render();
  }

  private finish() {
    if (this.isDone) return;
    this.isDone = true;
    cancelAnimationFrame(this.animId);

    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
          this.overlay = null;
        }
        this.onComplete();
      }, 400);
    } else {
      this.onComplete();
    }
  }
}
