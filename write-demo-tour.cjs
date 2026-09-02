const fs = require('fs');

const code = `
/**
 * DemoTour - Guided spotlight overlay for SIH 26001 judging demo.
 * Single-page overlay that dims dashboard and highlights each panel in sequence.
 * Pure TypeScript/DOM - no dependencies. Keyboard and click navigable.
 */

export interface TourStep {
  targetId: string;           // element ID to spotlight
  calloutPosition: 'right' | 'left' | 'bottom' | 'top';
  headline: string;
  body: string;
  action?: () => void;        // optional: run before highlighting (e.g. switch tabs)
}

export class DemoTour {
  private overlay: HTMLElement | null = null;
  private callout: HTMLElement | null = null;
  private stepIndex = 0;
  private active = false;

  private steps: TourStep[] = [
    {
      targetId: 'sih-risk-score-panel',
      calloutPosition: 'right',
      headline: 'Step 1 of 7: Live Composite Risk Score',
      body: 'This is a live composite risk score computed from 5 real-time factors: slope angle, 24h rainfall, root-zone soil moisture, regional seismic activity, and historical event density. The formula is fully explainable and transparent.',
    },
    {
      targetId: 'sih-unified-map',
      calloutPosition: 'right',
      headline: 'Step 2 of 7: Dual-Mode Geospatial Map',
      body: 'Toggle between 2D tactical map (Leaflet + ESRI/NASA GIBS basemaps) and 3D WebGL Earth Globe. Every district marker is colour-coded by live risk score. No Mapbox or Google Maps tokens - 100% free keyless tiles.',
    },
    {
      targetId: 'hud-tab-content',
      calloutPosition: 'left',
      headline: 'Step 3 of 7: District Risk HUD',
      body: 'Click any district on the map to see its live telemetry: precipitation rate, 72h antecedent rainfall, root-zone soil saturation (NASA POWER API), nearest seismic event, and a weighted breakdown of the composite score with dominant trigger identification.',
    },
    {
      targetId: 'backtest-tab-content',
      calloutPosition: 'left',
      headline: 'Step 4 of 7: Historical Backtest Validation',
      body: 'The model was tested against 10 real NASA COOLR / GSI landslide events in Northeast India (2020-2024) using reconstructed pre-event rainfall archetypes. This illustrates the methodology and scoring behavior on real documented events.',
      action: () => {
        const btn = document.getElementById('tab-btn-backtest') as HTMLButtonElement | null;
        if (btn) btn.click();
      },
    },
    {
      targetId: 'btn-view-citizen',
      calloutPosition: 'bottom',
      headline: 'Step 5 of 7: Multi-Lingual Citizen View',
      body: 'Switch to Citizen View to see emergency directives in Hindi, Assamese, Bengali, Manipuri, Mizo, Khasi, and Nepali. Designed for district-level broadcast and community evacuation messaging.',
      action: () => {
        const btn = document.getElementById('btn-view-citizen') as HTMLButtonElement | null;
        if (btn) btn.click();
      },
    },
    {
      targetId: 'sih-header-bar',
      calloutPosition: 'bottom',
      headline: 'Step 6 of 7: NDRF Decision-Support Dispatch',
      body: 'When composite score exceeds 62 (HIGH), the system generates a structured decision-support draft recommendation for NDRF/SDRF dispatchers: battalion to mobilize, staging point, estimated travel time, and helicopter LZ coordinates. This is a decision-aid for commanders, not an automated order.',
      action: () => {
        const btn = document.getElementById('btn-view-authority') as HTMLButtonElement | null;
        if (btn) btn.click();
      },
    },
    {
      targetId: 'tab-btn-highways',
      calloutPosition: 'left',
      headline: 'Step 7 of 7: Highway Corridor Vulnerability',
      body: 'The Highways tab profiles 8 arterial NER mountain corridors (NH-27, NH-6, NH-29, NH-40, and others) with vulnerability rating, chokepoint count, and step-by-step waypoint navigation for evacuation and logistics planning.',
      action: () => {
        const btn = document.getElementById('tab-btn-highways') as HTMLButtonElement | null;
        if (btn) btn.click();
      },
    },
  ];

  start(): void {
    if (this.active) return;
    this.active = true;
    this.stepIndex = 0;
    this.createOverlay();
    this.showStep(0);
  }

  private createOverlay(): void {
    // Dark overlay covering entire viewport
    this.overlay = document.createElement('div');
    this.overlay.id = 'sih-tour-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed', inset: '0', zIndex: '9000',
      background: 'rgba(0,0,0,0)', pointerEvents: 'none',
      transition: 'background 0.3s ease',
    });
    document.body.appendChild(this.overlay);
    requestAnimationFrame(() => {
      if (this.overlay) this.overlay.style.background = 'rgba(2,6,18,0.78)';
    });

    // Exit button
    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'Exit Tour (Esc)';
    Object.assign(exitBtn.style, {
      position: 'fixed', top: '12px', right: '12px', zIndex: '9100',
      padding: '6px 14px', borderRadius: '6px', border: '1px solid #334155',
      background: '#0f172a', color: '#94a3b8', fontSize: '11px',
      cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: '600',
    });
    exitBtn.addEventListener('click', () => this.end());
    document.body.appendChild(exitBtn);
    (exitBtn as any)._tourExit = true;

    // Keyboard nav
    const keyHandler = (e: KeyboardEvent) => {
      if (!this.active) return;
      if (e.key === 'Escape') this.end();
      if (e.key === 'ArrowRight' || e.key === 'Enter') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    };
    document.addEventListener('keydown', keyHandler);
    (this.overlay as any)._keyHandler = keyHandler;
  }

  private showStep(index: number): void {
    if (index >= this.steps.length) { this.end(); return; }
    const step = this.steps[index];

    // Run optional pre-step action (e.g. switch tab)
    if (step.action) step.action();

    // Get target element
    const target = document.getElementById(step.targetId);

    // Remove old callout
    this.callout?.remove();

    // Build callout box
    this.callout = document.createElement('div');
    Object.assign(this.callout.style, {
      position: 'fixed', zIndex: '9200', width: '340px',
      background: 'linear-gradient(135deg,#0f1e35,#0a1628)',
      border: '1px solid #1d4ed8', borderRadius: '12px',
      padding: '18px 20px', fontFamily: 'Inter,sans-serif',
      boxShadow: '0 8px 40px rgba(29,78,216,0.35)',
      pointerEvents: 'auto',
    });

    const stepPill = document.createElement('div');
    stepPill.textContent = 'LIVE DEMO';
    Object.assign(stepPill.style, {
      display: 'inline-block', background: '#1d4ed8', color: '#fff',
      fontSize: '9px', fontWeight: '800', letterSpacing: '0.12em',
      padding: '2px 8px', borderRadius: '4px', marginBottom: '8px',
    });

    const headline = document.createElement('div');
    headline.textContent = step.headline;
    Object.assign(headline.style, {
      color: '#e2e8f0', fontWeight: '700', fontSize: '13px', marginBottom: '8px',
    });

    const body = document.createElement('div');
    body.textContent = step.body;
    Object.assign(body.style, {
      color: '#94a3b8', fontSize: '11px', lineHeight: '1.65', marginBottom: '16px',
    });

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '8px', alignItems: 'center' });

    if (index > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '&laquo; Back';
      prevBtn.innerHTML = '&laquo; Back';
      Object.assign(prevBtn.style, {
        padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155',
        background: 'transparent', color: '#64748b', fontSize: '11px',
        cursor: 'pointer', fontWeight: '600',
      });
      prevBtn.addEventListener('click', () => this.prev());
      btnRow.appendChild(prevBtn);
    }

    const nextBtn = document.createElement('button');
    const isLast = index === this.steps.length - 1;
    nextBtn.textContent = isLast ? 'Finish' : 'Next &#187;';
    nextBtn.innerHTML = isLast ? 'Finish' : 'Next &#187;';
    Object.assign(nextBtn.style, {
      padding: '6px 16px', borderRadius: '6px', border: 'none',
      background: '#1d4ed8', color: '#fff', fontSize: '11px',
      cursor: 'pointer', fontWeight: '700', marginLeft: 'auto',
    });
    nextBtn.addEventListener('click', () => this.next());
    btnRow.appendChild(nextBtn);

    const progress = document.createElement('div');
    Object.assign(progress.style, {
      marginTop: '12px', height: '3px', background: '#1e293b', borderRadius: '2px',
    });
    const bar = document.createElement('div');
    Object.assign(bar.style, {
      height: '100%', borderRadius: '2px', background: '#3b82f6',
      width: ((index + 1) / this.steps.length * 100) + '%',
      transition: 'width 0.3s ease',
    });
    progress.appendChild(bar);

    this.callout.appendChild(stepPill);
    this.callout.appendChild(headline);
    this.callout.appendChild(body);
    this.callout.appendChild(btnRow);
    this.callout.appendChild(progress);
    document.body.appendChild(this.callout);

    // Spotlight target + position callout
    if (target) {
      const rect = target.getBoundingClientRect();
      target.style.outline = '3px solid #3b82f6';
      target.style.outlineOffset = '3px';
      target.style.zIndex = '9100';
      target.style.position = 'relative';
      (target as any)._tourSpotlit = true;

      // Position callout next to target
      const calloutH = 200;
      const calloutW = 340;
      let top = rect.top;
      let left = rect.right + 16;

      if (step.calloutPosition === 'left') {
        left = rect.left - calloutW - 16;
      } else if (step.calloutPosition === 'bottom') {
        top = rect.bottom + 16;
        left = rect.left;
      } else if (step.calloutPosition === 'top') {
        top = rect.top - calloutH - 16;
        left = rect.left;
      }

      // Clamp to viewport
      top = Math.max(12, Math.min(top, window.innerHeight - calloutH - 12));
      left = Math.max(12, Math.min(left, window.innerWidth - calloutW - 12));

      this.callout.style.top = top + 'px';
      this.callout.style.left = left + 'px';

      // Scroll into view
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // Fallback: center of screen
      this.callout.style.top = '50%';
      this.callout.style.left = '50%';
      this.callout.style.transform = 'translate(-50%,-50%)';
    }
  }

  private clearSpotlights(): void {
    document.querySelectorAll('[data-tour-spotlit], *').forEach(el => {
      const htmlEl = el as HTMLElement;
      if ((htmlEl as any)._tourSpotlit) {
        htmlEl.style.outline = '';
        htmlEl.style.outlineOffset = '';
        htmlEl.style.zIndex = '';
        htmlEl.style.position = '';
        delete (htmlEl as any)._tourSpotlit;
      }
    });
  }

  next(): void {
    this.clearSpotlights();
    this.stepIndex++;
    this.showStep(this.stepIndex);
  }

  prev(): void {
    if (this.stepIndex > 0) {
      this.clearSpotlights();
      this.stepIndex--;
      this.showStep(this.stepIndex);
    }
  }

  end(): void {
    this.active = false;
    this.clearSpotlights();
    this.callout?.remove();

    if (this.overlay) {
      const keyHandler = (this.overlay as any)._keyHandler;
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      this.overlay.remove();
      this.overlay = null;
    }

    // Remove exit button
    document.querySelectorAll('button').forEach(btn => {
      if ((btn as any)._tourExit) btn.remove();
    });
  }
}

export function injectStartTourButton(tourInstance: DemoTour): void {
  const btn = document.createElement('button');
  btn.id = 'sih-start-tour-btn';
  btn.textContent = 'Start Demo Tour';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: '8000',
    padding: '10px 20px', borderRadius: '8px',
    background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
    color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '12px',
    fontWeight: '800', border: 'none', cursor: 'pointer', letterSpacing: '0.05em',
    boxShadow: '0 4px 20px rgba(29,78,216,0.5)',
    animation: 'tourPulse 2s ease-in-out infinite',
  });

  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = '@keyframes tourPulse { 0%,100%{box-shadow:0 4px 20px rgba(29,78,216,0.5)} 50%{box-shadow:0 4px 30px rgba(14,165,233,0.8)} }';
  document.head.appendChild(style);

  btn.addEventListener('click', () => {
    btn.remove();
    tourInstance.start();
  });

  document.body.appendChild(btn);
}
`;

fs.writeFileSync(
  'Y:/Dev/projects/NextSignal-SIH26001/src/ui/components/DemoTour.ts',
  Buffer.from(code, 'utf8')
);
console.log('Written DemoTour.ts');

// Verify zero non-ASCII
const verify = fs.readFileSync('Y:/Dev/projects/NextSignal-SIH26001/src/ui/components/DemoTour.ts');
let nonAscii = 0;
for (const b of verify) { if (b > 127) nonAscii++; }
console.log('Non-ASCII bytes in DemoTour.ts:', nonAscii);