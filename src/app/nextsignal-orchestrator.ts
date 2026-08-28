/**
 * NextSignal Application Orchestrator
 *
 * Coordinates NextSignal product views on top of the underlying global intelligence engine.
 *
 * Architecture:
 *   NextSignal Unified Header (in panel-layout.ts)
 *   ├── Tab switching (Overview / Markets / Signals / Scenarios / Watchlist / Alerts)
 *   ├── Floating intelligence overlays (Scenarios modal, Watchlist panel, Signals drawer, Alerts)
 *   └── Live state synchronization
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import { initNextSignalNavbar, onNavSectionChange, setActiveSection, type NavSection } from './nextsignal-navbar';

type SectionRenderer = {
  mount: () => void;
  unmount: () => void;
  refresh?: () => void;
};

const sectionRegistry = new Map<NavSection, SectionRenderer>();
let currentSectionRenderer: SectionRenderer | null = null;

function registerSection(id: NavSection, renderer: SectionRenderer): void {
  sectionRegistry.set(id, renderer);
}

// ============================================================
// Modal Helper: creates a sleek, dark glassmorphic modal
// ============================================================

function createGlassModal(id: string, width = '820px'): { overlay: HTMLElement; content: HTMLElement } {
  // Remove existing if any
  document.getElementById(id)?.remove();

  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.className = 'ns-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(4, 7, 18, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 60px 16px 24px;
    overflow-y: auto;
    z-index: 9500;
    animation: ns-fade-in 0.2s ease;
  `;

  const content = document.createElement('div');
  content.className = 'ns-modal-content ns-scrollable';
  content.style.cssText = `
    width: min(${width}, 100%);
    max-height: calc(100vh - 84px);
    overflow-y: auto;
    position: relative;
    animation: ns-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'ns-modal-close-btn';
  closeBtn.innerHTML = '✕';
  closeBtn.title = 'Close (Esc)';
  closeBtn.style.cssText = `
    position: absolute;
    top: 14px;
    right: 16px;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: var(--ns-text-dim);
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.15s ease;
  `;
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.12)';
    closeBtn.style.color = '#ffffff';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.06)';
    closeBtn.style.color = 'var(--ns-text-dim)';
  });

  const closeModal = () => {
    setActiveSection('overview');
    handleSectionChange('overview');
  };

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  // Close on backdrop click (outside content)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', escHandler);
    }
  };
  window.addEventListener('keydown', escHandler);

  content.appendChild(closeBtn);
  overlay.appendChild(content);

  return { overlay, content };
}

// ============================================================
// Section: Overview (Dashboard)
// ============================================================

function initOverviewSection(): SectionRenderer {
  return {
    mount: () => {
      // Return focus to the global map and panels
      document.querySelectorAll<HTMLElement>('.ns-modal-overlay').forEach((el) => el.remove());
    },
    unmount: () => {},
  };
}

// ============================================================
// Section: What Happens Next (Flagship Scenario Feature)
// ============================================================

function initScenariosSection(): SectionRenderer {
  let modalEl: HTMLElement | null = null;

  return {
    mount: () => {
      const { overlay, content } = createGlassModal('ns-scenarios-modal', '840px');
      modalEl = overlay;

      const inner = document.createElement('div');
      inner.className = 'ns-whn-container ns-scrollable';
      inner.innerHTML = `
        <div class="ns-whn-header">
          <h1 class="ns-whn-title">What Happens Next?</h1>
          <p class="ns-whn-subtitle">
            Search any asset, country, supply chain, or geopolitical trigger.
            NextSignal evaluates live signals and generates probabilistic Bull/Base/Bear scenarios.
          </p>
        </div>

        <div class="ns-whn-search">
          <input
            type="text"
            id="ns-whn-input"
            class="ns-whn-input"
            placeholder="e.g. NVDA, Brent Crude Oil, Taiwan, Red Sea Chokepoint, Gold..."
            autocomplete="off"
            spellcheck="false"
          />
          <button id="ns-whn-analyze" class="ns-btn-primary">
            Analyze Scenarios →
          </button>
        </div>

        <div class="ns-whn-suggestions" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
          ${['NVDA', 'Brent Oil', 'Spot Gold', 'Taiwan Strait', 'S&P 500', 'Semiconductors', 'Defense Sector'].map(
            (s) => `<button class="ns-btn-secondary ns-whn-suggestion" style="font-size:11px;padding:4px 10px">${s}</button>`
          ).join('')}
        </div>

        <div id="ns-whn-results" style="display:none"></div>

        <div id="ns-whn-loading" style="display:none">
          <div class="ns-loading" style="justify-content:center;padding:40px">
            <div class="ns-loading-spinner"></div>
            Analyzing signals, calculating probability distributions, and synthesizing causal chains...
          </div>
        </div>

        <div id="ns-whn-empty">
          <div class="ns-empty-state">
            <div class="ns-empty-icon" style="font-size:36px;color:var(--ns-signal-blue-light)">◎</div>
            <p class="ns-empty-title">Select or enter any entity to analyze</p>
            <p class="ns-empty-subtitle">
              NextSignal continuously models multi-order impacts across 190+ countries and global financial markets.
            </p>
            <p class="ns-disclaimer" style="margin-top:16px;max-width:560px">
              Probabilistic scenarios are decision-support models based on currently detected signals and historical correlations.
              All scenarios include confidence ratings and invalidation conditions.
            </p>
          </div>
        </div>
      `;

      content.appendChild(inner);
      document.body.appendChild(overlay);

      // Suggestions
      inner.querySelectorAll<HTMLButtonElement>('.ns-whn-suggestion').forEach((btn) => {
        btn.addEventListener('click', () => {
          const input = inner.querySelector<HTMLInputElement>('#ns-whn-input');
          if (input) {
            input.value = btn.textContent ?? '';
            input.focus();
            void triggerAnalysis(input.value);
          }
        });
      });

      // Analyze trigger
      const input = inner.querySelector<HTMLInputElement>('#ns-whn-input');
      const analyzeBtn = inner.querySelector<HTMLButtonElement>('#ns-whn-analyze');

      const triggerAnalysis = async (query: string): Promise<void> => {
        if (!query.trim()) return;

        const loading = inner.querySelector<HTMLElement>('#ns-whn-loading');
        const results = inner.querySelector<HTMLElement>('#ns-whn-results');
        const empty = inner.querySelector<HTMLElement>('#ns-whn-empty');

        if (loading) loading.style.display = 'block';
        if (results) results.style.display = 'none';
        if (empty) empty.style.display = 'none';

        try {
          const { generateWhatHappensNext } = await import('./nextsignal-scenario-engine');
          const scenarioData = await generateWhatHappensNext(query.trim());

          if (loading) loading.style.display = 'none';
          if (results) {
            results.style.display = 'block';
            const { renderWhatHappensNext } = await import('./nextsignal-scenario-ui');
            renderWhatHappensNext(results, scenarioData, query);
          }
        } catch {
          if (loading) loading.style.display = 'none';
          if (results) results.style.display = 'block';
        }
      };

      analyzeBtn?.addEventListener('click', () => {
        if (input?.value) void triggerAnalysis(input.value);
      });

      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value) void triggerAnalysis(input.value);
      });

      // Focus input
      setTimeout(() => input?.focus(), 100);
    },
    unmount: () => {
      if (modalEl) {
        modalEl.remove();
        modalEl = null;
      }
      document.getElementById('ns-scenarios-modal')?.remove();
    },
  };
}

// ============================================================
// Section: Signals (Signal Feed Drawer)
// ============================================================

function initSignalsSection(): SectionRenderer {
  let modalEl: HTMLElement | null = null;

  return {
    mount: () => {
      const { overlay, content } = createGlassModal('ns-signals-modal', '620px');
      modalEl = overlay;

      const widget = document.createElement('div');
      widget.className = 'ns-widget';
      widget.innerHTML = `
        <div class="ns-widget-header" style="padding:16px 20px">
          <div>
            <span class="ns-widget-title" style="font-size:14px">Live Signal Feed</span>
            <p style="margin:4px 0 0;font-size:11px;color:var(--ns-text-dim)">
              Classified intelligence signals across geopolitical, supply chain, and market vectors
            </p>
          </div>
          <span class="ns-widget-status" style="margin-left:auto">
            <span class="ns-widget-status-dot"></span>
            Streaming
          </span>
        </div>
        <div class="ns-widget-content ns-scrollable" style="max-height:calc(100vh - 200px);overflow-y:auto;padding:0">
          <div id="ns-signals-list">
            <div class="ns-loading" style="justify-content:center;padding:32px">
              <div class="ns-loading-spinner"></div>
              Aggregating signals...
            </div>
          </div>
        </div>
      `;

      content.appendChild(widget);
      document.body.appendChild(overlay);

      // Load signal data
      import('./nextsignal-signal-engine').then(async ({ getLatestSignals }) => {
        const list = widget.querySelector<HTMLElement>('#ns-signals-list');
        if (!list) return;
        const signals = await getLatestSignals(30);

        if (signals.length === 0) {
          list.innerHTML = `
            <div class="ns-empty-state" style="padding:40px 20px">
              <div class="ns-empty-icon">◎</div>
              <p class="ns-empty-title">Monitoring Global Vectors</p>
              <p class="ns-empty-subtitle">Signal processing is listening on active live intelligence streams.</p>
            </div>
          `;
          return;
        }

        list.innerHTML = signals.map((s) => `
          <div class="ns-signal-card" style="border-radius:0;border-left:none;border-right:none;border-top:none">
            <div class="ns-signal-card-header">
              <span class="ns-signal-badge ${s.direction}">${s.direction}</span>
              <span style="font-size:10px;color:var(--ns-text-dim);font-family:var(--ns-font-mono)">${s.type.replace(/_/g, ' ').toUpperCase()}</span>
              <span style="font-size:10px;color:var(--ns-signal-blue-light);margin-left:auto;font-weight:700">${s.confidence}% conf</span>
            </div>
            <p class="ns-signal-title">${s.title}</p>
            <p class="ns-signal-summary">${s.summary}</p>
            <div class="ns-signal-meta">
              <span>${s.geographicScope.join(', ') || 'Global'}</span>
              <span>·</span>
              <span>${new Date(s.detectedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        `).join('');
      }).catch(() => {});
    },
    unmount: () => {
      if (modalEl) {
        modalEl.remove();
        modalEl = null;
      }
      document.getElementById('ns-signals-modal')?.remove();
    },
  };
}

// ============================================================
// Section: Watchlist
// ============================================================

function initWatchlistSection(): SectionRenderer {
  let modalEl: HTMLElement | null = null;

  return {
    mount: () => {
      const { overlay, content } = createGlassModal('ns-watchlist-modal', '960px');
      modalEl = overlay;
      document.body.appendChild(overlay);

      import('./nextsignal-watchlist-ui').then(({ renderWatchlistView }) => {
        renderWatchlistView(content);
      }).catch(() => {});
    },
    unmount: () => {
      if (modalEl) {
        modalEl.remove();
        modalEl = null;
      }
      document.getElementById('ns-watchlist-modal')?.remove();
    },
  };
}

// ============================================================
// Section: Alerts
// ============================================================

function initAlertsSection(): SectionRenderer {
  let modalEl: HTMLElement | null = null;

  return {
    mount: () => {
      const { overlay, content } = createGlassModal('ns-alerts-modal', '760px');
      modalEl = overlay;
      document.body.appendChild(overlay);

      import('./nextsignal-alerts-ui').then(({ renderAlertsView }) => {
        renderAlertsView(content);
      }).catch(() => {});
    },
    unmount: () => {
      if (modalEl) {
        modalEl.remove();
        modalEl = null;
      }
      document.getElementById('ns-alerts-modal')?.remove();
    },
  };
}

// ============================================================
// Section: Markets
// ============================================================

function initMarketsSection(): SectionRenderer {
  return {
    mount: () => {
      // Switches the active map layer preset or focuses market panels
      document.querySelectorAll<HTMLElement>('.ns-modal-overlay').forEach((el) => el.remove());
      const financeTab = document.querySelector<HTMLButtonElement>('[data-tab="finance"], .tab-option[data-tab*="market"]');
      if (financeTab) financeTab.click();
    },
    unmount: () => {},
  };
}

// ============================================================
// Navigation Dispatcher
// ============================================================

function handleSectionChange(section: NavSection): void {
  if (currentSectionRenderer) {
    currentSectionRenderer.unmount();
    currentSectionRenderer = null;
  }

  const renderer = sectionRegistry.get(section);
  if (renderer) {
    renderer.mount();
    currentSectionRenderer = renderer;
  }
}

// ============================================================
// Public Entrypoint: initNextSignal
// ============================================================

export function initNextSignal(): void {
  // 1. Initialize Navbar click handlers for the unified header
  initNextSignalNavbar();

  // 2. Register all section handlers
  registerSection('overview',   initOverviewSection());
  registerSection('markets',    initMarketsSection());
  registerSection('signals',    initSignalsSection());
  registerSection('scenarios',  initScenariosSection());
  registerSection('watchlist',  initWatchlistSection());
  registerSection('alerts',     initAlertsSection());
  registerSection('oracle', {
    mount: () => {
      import('./nextsignal-ai-chat').then(({ openNextSignalAiChat }) => {
        openNextSignalAiChat();
      }).catch(() => {});
    },
    unmount: () => {},
  });

  // 3. Initialize Quantum Oracle AI Chat (Gemma 4 local neural predictor)
  import('./nextsignal-ai-chat').then(({ initNextSignalAiChat }) => {
    initNextSignalAiChat();
  }).catch((err) => {
    console.warn('[NextSignal] AI Chat failed to load:', err);
  });

  // 4. Initialize Panel Slot Drag & Drop Reordering
  import('./nextsignal-panel-drag').then(({ initPanelDragAndDrop }) => {
    initPanelDragAndDrop();
  }).catch((err) => {
    console.warn('[NextSignal] Panel Drag & Drop failed to load:', err);
  });

  // 5. Listen for section changes
  onNavSectionChange((section: NavSection) => {
    handleSectionChange(section);
  });

  // 5. Mount initial view
  const initial = location.hash.replace('#', '') as NavSection || 'overview';
  const renderer = sectionRegistry.get(initial) ?? sectionRegistry.get('overview');
  currentSectionRenderer = renderer ?? null;
  currentSectionRenderer?.mount();
}
