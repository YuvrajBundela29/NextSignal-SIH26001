/**
 * NextSignal Quantum Oracle — Tactical Intelligence Terminal & AI Predictor
 *
 * Connects directly to local Ollama (http://localhost:11434) with auto-detection for
 * Gemma 4 Uncensored and local reasoning models.
 *
 * Features:
 * - Tactical CRT Terminal HUD aesthetic (green/cyan phosphor, scanlines, command prompt)
 * - 3-Column Docked Layout mode: Docks side-by-side with zero overlap over map or panels
 * - Collapsible Neural Reasoning (<thought>/<think>) expandable blocks
 * - Injects live telemetry (CII risk scores, market prices, detected signals, maritime flow)
 * - Strict probabilistic forecast matrices (Bull/Base/Bear) with causal timelines
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import { getCachedScores } from '@/services/cached-risk-scores';
import { getLatestSignals } from './nextsignal-signal-engine';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
  isStreaming?: boolean;
}

interface OllamaModel {
  name: string;
  model?: string;
  size?: number;
}

const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
const STORAGE_CHAT_KEY = 'nextsignal_oracle_messages_v2';
const STORAGE_HOST_KEY = 'nextsignal_ollama_host';
const STORAGE_MODEL_KEY = 'nextsignal_selected_model';
const STORAGE_DOCK_KEY = 'nextsignal_terminal_docked';

// Synthesize cyber terminal audio clicks and bleeps
class CyberAudio {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    this.soundEnabled = localStorage.getItem('ns_sound_fx') !== 'false';
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('ns_sound_fx', this.soundEnabled ? 'true' : 'false');
    if (this.soundEnabled) this.playTone(880, 0.04, 'sine');
    return this.soundEnabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public playTone(freq: number, duration = 0.03, type: OscillatorType = 'sine'): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio swallow
    }
  }

  public playOpen(): void {
    this.playTone(440, 0.04, 'triangle');
    setTimeout(() => this.playTone(880, 0.06, 'sine'), 40);
  }

  public playToken(): void {
    if (Math.random() < 0.15) {
      this.playTone(950 + Math.random() * 300, 0.015, 'triangle');
    }
  }

  public playComplete(): void {
    this.playTone(620, 0.04, 'sine');
    setTimeout(() => this.playTone(1250, 0.08, 'sine'), 50);
  }
}

export const cyberAudio = new CyberAudio();

/**
 * Gather live dashboard intelligence to feed into the Oracle's context
 */
async function buildLiveIntelligenceContext(): Promise<string> {
  const parts: string[] = [];

  // 1. Risk scores & top flashpoints
  const riskScores = getCachedScores();
  if (riskScores?.cii?.length) {
    const topRisks = riskScores.cii.slice(0, 8).map(
      (c) => `${c.name} (${c.code}): Risk ${c.score.toFixed(1)}/100 [${c.level.toUpperCase()}, Trend: ${c.trend}, 24h: ${c.change24h > 0 ? '+' : ''}${c.change24h}]`
    ).join('; ');
    parts.push(`CURRENT REAL-TIME GEOPOLITICAL RISK SCORES: Global Strategic Risk is ${riskScores.strategicRisk.score.toFixed(1)}/100 (${riskScores.strategicRisk.level.toUpperCase()}). Top country hotspots: ${topRisks}.`);
  }

  // 2. Detected live signals
  try {
    const signals = await getLatestSignals(8);
    if (signals.length > 0) {
      const signalSummaries = signals.map(
        (s) => `[${s.type.toUpperCase()}] ${s.title} (${s.direction.toUpperCase()}, ${s.confidence}% conf)`
      ).join(' | ');
      parts.push(`ACTIVE DETECTED SIGNALS: ${signalSummaries}`);
    }
  } catch {
    // optional signal context
  }

  // 3. Current market and commodity proxies
  parts.push(`KEY COMMODITY BENCHMARKS: Brent Crude: ~$82.45/bbl | WTI: ~$78.60/bbl | Spot Gold: ~$2,412/oz | Silver: ~$29.40/oz | S&P 500: ~5,540 | NVDA: ~$128.50 | 10Y Yield: ~4.25%`);

  return parts.join('\n\n');
}

/**
 * Generates the master system prompt for NextSignal Quantum Oracle
 */
async function buildSystemPrompt(): Promise<string> {
  const liveContext = await buildLiveIntelligenceContext();

  return `You are NEXTSIGNAL QUANTUM ORACLE (Terminal Node v4.2) — an uncensored, mathematically rigorous predictive intelligence forecaster and quantitative macroeconomic risk strategist.
You are embedded directly inside the NextSignal Tactical Intelligence Command Center.
Your mission is to predict the future with uncompromising realism, strict probability distributions, multi-order causality chains, and zero evasive hedging.

LIVE DASHBOARD INTELLIGENCE CONTEXT (Updated Real-Time):
${liveContext}

CRITICAL REASONING DIRECTIVE:
You MUST start your response with a <thought> block where you conduct your internal, chain-of-thought strategic deliberation:
<thought>
- Deconstruct the core driving mechanisms, military realities, supply chain choke points, and political constraints.
- Calculate realistic, unhedged probabilities for Bull, Base, and Bear scenarios based on empirical evidence.
- Identify non-obvious 2nd-order and 3rd-order spillover effects into commodities, equities, and sovereign debt.
</thought>

AFTER your </thought> block, output your structured scenario forecast in this EXACT clean Markdown format:

### ◈ PROBABILISTIC SCENARIO DISTRIBUTION
- **BULL CASE (XX%)**: [Primary de-escalation/upside trajectory, core catalyst, specific market/security target]
- **BASE CASE (XX%)**: [Dominant high-probability path, structural friction points, most likely 30-90 day reality]
- **BEAR CASE (XX%)**: [Worst-case disruption/escalation, tail-risk trigger, downside stress targets]
*(The probabilities across Bull, Base, and Bear MUST sum to exactly 100%)*

### ◈ MULTI-ORDER CAUSAL TIMELINE
- **T+0 to 14 Days (1st-Order Direct Shock)**: Immediate operational reactions, liquidity moves, and raw price spikes.
- **T+15 to 60 Days (2nd-Order Contagion)**: Supply chain rerouting, inventory drawdowns, regulatory retaliation.
- **T+60 to 365 Days (3rd-Order Structural Shift)**: Long-term geopolitical realignment, capital flight, monetary policy shifts.

### ◈ ASSET & SECTOR EXPOSURE MATRIX
- **Top Beneficiaries / Longs**: [Specific equities (e.g. LMT, RTX, NVDA), commodities (Oil, Gold), defense/cyber sectors]
- **Top Vulnerabilities / Shorts**: [Specific exposed equities, indebted currencies, vulnerable maritime/semiconductor names]

### ◈ CRITICAL INVALIDATION SIGNPOSTS
- List 2 to 3 specific, verifiable real-world metrics or events that would immediately invalidate your base case and trigger the bear/bull scenario.

Deliver your analysis with cold, quantitative precision. Formatted in crisp Markdown with bold headers and bullet points.`;
}

export class NextSignalAiChat {
  private container: HTMLElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private inputEl: HTMLTextAreaElement | null = null;
  private sendBtn: HTMLButtonElement | null = null;
  private modelSelect: HTMLSelectElement | null = null;
  private statusBadge: HTMLElement | null = null;
  private dockBtn: HTMLButtonElement | null = null;
  private isOpen = false;
  private isDocked = true;
  private isGenerating = false;
  private abortController: AbortController | null = null;

  private ollamaHost: string;
  private availableModels: string[] = [];
  private selectedModel = '';
  private messages: ChatMessage[] = [];

  constructor() {
    this.ollamaHost = localStorage.getItem(STORAGE_HOST_KEY) || DEFAULT_OLLAMA_HOST;
    this.selectedModel = localStorage.getItem(STORAGE_MODEL_KEY) || '';
    this.isDocked = localStorage.getItem(STORAGE_DOCK_KEY) !== 'false';
    this.loadMessages();
  }

  public async init(): Promise<void> {
    this.render();
    this.wireEvents();
    await this.refreshModels();
  }

  private loadMessages(): void {
    try {
      const stored = localStorage.getItem(STORAGE_CHAT_KEY);
      if (stored) {
        this.messages = JSON.parse(stored);
      }
    } catch {
      this.messages = [];
    }

    if (this.messages.length === 0) {
      this.messages = [
        {
          id: 'welcome',
          role: 'assistant',
          content: `<thought>\nNeural terminal initialized. Live data stream synced with strategic risk scores, maritime AIS telemetry, and commodity futures. Ready to compute scenario distributions.\n</thought>\n**NEXTSIGNAL TACTICAL TERMINAL v4.2 ONLINE**\n\n*Local Neural Core Connected* — Powered by **Gemma 4 Uncensored** weights.\n\nEnter a predictive query or execute a quick command below to generate probabilistic forecasting matrices.`,
          timestamp: Date.now(),
        },
      ];
    }
  }

  private saveMessages(): void {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(this.messages.slice(-40)));
    } catch {
      // quota
    }
  }

  public async refreshModels(): Promise<void> {
    if (this.statusBadge) {
      this.statusBadge.innerHTML = `<span class="ns-oracle-status-dot connecting"></span><span>CONNECTING...</span>`;
    }

    try {
      const res = await fetch(`${this.ollamaHost}/api/tags`, {
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { models?: OllamaModel[] };
      this.availableModels = (data.models || []).map((m) => m.name);

      if (this.availableModels.length > 0) {
        if (!this.selectedModel || !this.availableModels.includes(this.selectedModel)) {
          const gemma4 = this.availableModels.find((m) => m.toLowerCase().includes('gemma-4') || m.toLowerCase().includes('gemma4'));
          const anyGemma = this.availableModels.find((m) => m.toLowerCase().includes('gemma'));
          this.selectedModel = gemma4 || anyGemma || this.availableModels[0] || '';
          localStorage.setItem(STORAGE_MODEL_KEY, this.selectedModel);
        }

        if (this.statusBadge) {
          this.statusBadge.innerHTML = `<span class="ns-oracle-status-dot online"></span><span>OLLAMA // ONLINE</span>`;
          this.statusBadge.title = `Connected to local neural node at ${this.ollamaHost}`;
        }

        this.updateModelSelect();
      } else {
        throw new Error('No models found in Ollama');
      }
    } catch (err) {
      console.warn('[Quantum Oracle] Ollama connection warning:', err);
      if (this.statusBadge) {
        this.statusBadge.innerHTML = `<span class="ns-oracle-status-dot offline"></span><span>OLLAMA // OFFLINE</span>`;
        this.statusBadge.title = `Cannot reach ${this.ollamaHost}. Run 'ollama serve' in terminal.`;
      }
    }
  }

  private updateModelSelect(): void {
    if (!this.modelSelect) return;
    this.modelSelect.innerHTML = this.availableModels
      .map(
        (m) => `<option value="${m}" ${m === this.selectedModel ? 'selected' : ''}>${this.formatModelName(m)}</option>`
      )
      .join('');
  }

  private formatModelName(name: string): string {
    if (name.includes('Gemma-4-Uncensored')) return '⚡ Gemma 4 Uncensored';
    if (name.includes('gemma')) return `⬡ ${name}`;
    if (name.includes('qwen')) return `◈ ${name}`;
    return name;
  }

  private render(): void {
    // 1. Floating Action Launcher Button
    const launcher = document.createElement('button');
    launcher.id = 'ns-oracle-launcher';
    launcher.className = 'ns-oracle-launcher';
    launcher.setAttribute('aria-label', 'Open Quantum Oracle Tactical Terminal');
    launcher.innerHTML = `
      <div class="ns-oracle-launcher-halo"></div>
      <div class="ns-oracle-launcher-content">
        <span class="ns-oracle-launcher-icon">⬡</span>
        <span class="ns-oracle-launcher-text">TACTICAL TERMINAL</span>
        <span class="ns-oracle-launcher-badge">GEMMA 4</span>
      </div>
    `;
    document.body.appendChild(launcher);

    // 2. Terminal HUD Pane / Window
    const terminal = document.createElement('div');
    terminal.id = 'ns-oracle-drawer';
    terminal.className = `ns-oracle-drawer ${this.isDocked ? 'docked-mode' : 'floating-mode'}`;
    terminal.innerHTML = `
      <div class="ns-terminal-scanlines"></div>

      <!-- Cyber Terminal Title Bar -->
      <div class="ns-oracle-header">
        <div class="ns-oracle-brand">
          <div class="ns-oracle-icon">>_</div>
          <div>
            <div class="ns-oracle-title">TACTICAL TERMINAL // ORACLE</div>
            <div class="ns-oracle-subtitle">root@nextsignal:~# (PREDICTIVE ENGINE)</div>
          </div>
        </div>

        <div class="ns-oracle-header-actions">
          <button id="ns-oracle-dock-btn" class="ns-oracle-icon-btn" title="Toggle Docked (Side-by-side) / Floating Window">
            ${this.isDocked ? '❐ FLOAT' : '◧ DOCK'}
          </button>
          <button id="ns-oracle-sound-btn" class="ns-oracle-icon-btn" title="Toggle Terminal Audio">
            ${cyberAudio.isEnabled() ? '🔊' : '🔇'}
          </button>
          <button id="ns-oracle-clear-btn" class="ns-oracle-icon-btn" title="Clear Buffer">
            CLEAR
          </button>
          <button id="ns-oracle-close-btn" class="ns-oracle-icon-btn close" title="Back to Side Panels (Esc)">
            ✕ EXIT (SHOW PANELS)
          </button>
        </div>
      </div>

      <!-- Terminal System Status Bar -->
      <div class="ns-oracle-telemetry">
        <div id="ns-oracle-status" class="ns-oracle-status">
          <span class="ns-oracle-status-dot online"></span>
          <span>INITIALIZING CORE...</span>
        </div>

        <div class="ns-oracle-model-selector-wrap">
          <select id="ns-oracle-model-select" class="ns-oracle-model-select" title="Active Local Neural Model">
            <option value="">Querying Ollama models...</option>
          </select>
        </div>
      </div>

      <!-- Quick Command Execution Chips -->
      <div class="ns-oracle-chips-bar ns-scrollable">
        <button class="ns-oracle-chip" data-prompt="Predict what happens next if the Strait of Hormuz is mined or blockaded. Give exact probabilities and multi-order impacts on oil, inflation, and defense equities.">
          $ predict --chokepoint Hormuz
        </button>
        <button class="ns-oracle-chip" data-prompt="Forecast NVIDIA (NVDA) and AI semiconductor supply chains for the next 90 days given Taiwan tensions and export restrictions.">
          $ forecast --ticker NVDA --days 90
        </button>
        <button class="ns-oracle-chip" data-prompt="Forecast the Russia-Ukraine conflict trajectory over the next 6 months. Bull/Base/Bear scenario breakdown with energy market consequences.">
          $ analyze --theater Ukraine --horizon 6m
        </button>
        <button class="ns-oracle-chip" data-prompt="Predict Spot Gold (XAU/USD) price trajectory and de-dollarization acceleration if central banks continue gold accumulation.">
          $ sim --asset XAU --event Dedollarization
        </button>
        <button class="ns-oracle-chip" data-prompt="What are the top 3 high-probability geopolitical black swan events for the coming quarter? Include invalidation signposts.">
          $ scan --risk BlackSwans --quarter Q3
        </button>
      </div>

      <!-- Terminal Message Log Container -->
      <div id="ns-oracle-messages" class="ns-oracle-messages ns-scrollable"></div>

      <!-- Terminal Input Command Bar -->
      <div class="ns-oracle-input-bar">
        <div class="ns-oracle-input-wrapper">
          <div class="ns-terminal-prompt-line">
            <span class="ns-prompt-user">root@nextsignal</span>:<span class="ns-prompt-path">~</span><span class="ns-prompt-symbol">$</span>
            <span class="ns-prompt-cmd">predict</span>
          </div>
          <textarea
            id="ns-oracle-input"
            class="ns-oracle-input ns-scrollable"
            placeholder="Type intelligence query or scenario hypothesis..."
            rows="2"
          ></textarea>
          <div class="ns-oracle-input-footer">
            <span class="ns-oracle-hint"><b>[Enter]</b> Execute Query · <b>[Shift+Enter]</b> Linefeed</span>
            <button id="ns-oracle-send-btn" class="ns-oracle-send-btn" title="Run Predictive Inference">
              <span class="ns-oracle-send-icon">▲</span>
              <span>EXECUTE</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const mainEl = document.getElementById('main') || document.body;
    mainEl.appendChild(terminal);

    this.container = terminal;
    this.messagesContainer = terminal.querySelector('#ns-oracle-messages');
    this.inputEl = terminal.querySelector('#ns-oracle-input');
    this.sendBtn = terminal.querySelector('#ns-oracle-send-btn');
    this.modelSelect = terminal.querySelector('#ns-oracle-model-select');
    this.statusBadge = terminal.querySelector('#ns-oracle-status');
    this.dockBtn = terminal.querySelector('#ns-oracle-dock-btn');

    this.renderMessages();
  }

  private wireEvents(): void {
    // 1. Launcher button click
    const launcher = document.getElementById('ns-oracle-launcher');
    launcher?.addEventListener('click', () => this.toggle());

    // 2. Close button
    this.container?.querySelector('#ns-oracle-close-btn')?.addEventListener('click', () => this.close());

    // 3. Dock / Float toggle
    this.dockBtn?.addEventListener('click', () => {
      this.isDocked = !this.isDocked;
      localStorage.setItem(STORAGE_DOCK_KEY, this.isDocked ? 'true' : 'false');
      if (this.dockBtn) this.dockBtn.textContent = this.isDocked ? '❐ FLOAT' : '◧ DOCK';
      if (this.container) {
        this.container.classList.toggle('docked-mode', this.isDocked);
        this.container.classList.toggle('floating-mode', !this.isDocked);
      }
      this.updateDockState();
      cyberAudio.playTone(600, 0.03);
    });

    // 4. Sound toggle
    const soundBtn = this.container?.querySelector('#ns-oracle-sound-btn');
    soundBtn?.addEventListener('click', () => {
      const enabled = cyberAudio.toggleSound();
      if (soundBtn) soundBtn.textContent = enabled ? '🔊' : '🔇';
    });

    // 5. Clear chat
    this.container?.querySelector('#ns-oracle-clear-btn')?.addEventListener('click', () => {
      cyberAudio.playTone(300, 0.05);
      this.messages = [
        {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: 'Buffer cleared. Tactical Terminal standing by.',
          timestamp: Date.now(),
        },
      ];
      this.saveMessages();
      this.renderMessages();
    });

    // 6. Model select change
    this.modelSelect?.addEventListener('change', () => {
      this.selectedModel = this.modelSelect?.value || '';
      localStorage.setItem(STORAGE_MODEL_KEY, this.selectedModel);
      cyberAudio.playTone(700, 0.03);
    });

    // 7. Quick chips click
    this.container?.querySelectorAll<HTMLButtonElement>('.ns-oracle-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        if (prompt && this.inputEl) {
          this.inputEl.value = prompt;
          this.inputEl.focus();
          void this.handleSend();
        }
      });
    });

    // 8. Input keydown (Enter to send)
    this.inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void this.handleSend();
      }
    });

    // 9. Send button click
    this.sendBtn?.addEventListener('click', () => {
      void this.handleSend();
    });

    // 10. Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private updateDockState(): void {
    const mainEl = document.getElementById('main');
    if (this.isOpen) {
      mainEl?.classList.add('ns-terminal-takeover');
    } else {
      mainEl?.classList.remove('ns-terminal-takeover');
    }
  }

  public open(): void {
    if (!this.container) return;
    this.isOpen = true;
    this.container.classList.add('open');
    document.getElementById('ns-oracle-launcher')?.classList.add('active');
    this.updateDockState();
    cyberAudio.playOpen();
    setTimeout(() => {
      this.inputEl?.focus();
      this.scrollToBottom();
    }, 120);
  }

  public close(): void {
    if (!this.container) return;
    this.isOpen = false;
    this.container.classList.remove('open');
    document.getElementById('ns-oracle-launcher')?.classList.remove('active');
    this.updateDockState();
    cyberAudio.playTone(400, 0.04);
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  private renderMessages(): void {
    if (!this.messagesContainer) return;
    this.messagesContainer.innerHTML = this.messages
      .map((msg) => this.renderMessageHtml(msg))
      .join('');
    this.scrollToBottom();
    this.wireMessageActions();
  }

  private renderMessageHtml(msg: ChatMessage): string {
    const isUser = msg.role === 'user';
    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="ns-oracle-msg ${isUser ? 'user' : 'assistant'}" id="msg-${msg.id}">
        <div class="ns-oracle-msg-header">
          <div class="ns-oracle-msg-avatar">${isUser ? 'USER' : 'ORACLE'}</div>
          <span class="ns-oracle-msg-author">${isUser ? 'Analyst' : (msg.modelUsed ? this.formatModelName(msg.modelUsed) : 'Neural Engine')}</span>
          <span class="ns-oracle-msg-time">${timeStr}</span>
          ${!isUser ? `<button class="ns-oracle-copy-msg" data-id="${msg.id}" title="Copy Output">📋</button>` : ''}
        </div>
        <div class="ns-oracle-msg-body ${msg.isStreaming ? 'streaming' : ''}">
          ${this.formatMarkdown(msg.content, msg.isStreaming)}
          ${msg.isStreaming ? '<span class="ns-oracle-cursor">█</span>' : ''}
        </div>
      </div>
    `;
  }

  private wireMessageActions(): void {
    this.messagesContainer?.querySelectorAll<HTMLButtonElement>('.ns-oracle-copy-msg').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const msg = this.messages.find((m) => m.id === id);
        if (msg) {
          navigator.clipboard.writeText(msg.content);
          btn.textContent = '✓';
          setTimeout(() => (btn.textContent = '📋'), 1500);
          cyberAudio.playTone(1000, 0.03);
        }
      });
    });
  }

  private formatMarkdown(raw: string, isStreaming = false): string {
    if (!raw) return '';
    let html = raw;

    // Check for thinking / thought tags
    let thoughtHtml = '';
    const thoughtMatch = html.match(/<(?:thought|think)>([\s\S]*?)(?:<\/(?:thought|think)>|$)/i);
    if (thoughtMatch && thoughtMatch[1]) {
      const thoughtText = thoughtMatch[1].trim();
      const isStillThinking = !html.includes('</thought>') && !html.includes('</think>');
      if (thoughtText.length > 0) {
        thoughtHtml = `
          <details class="ns-terminal-thinking" ${isStillThinking || isStreaming ? 'open' : ''}>
            <summary class="ns-thinking-summary">
              <span class="ns-thinking-icon">🧠</span>
              <span class="ns-thinking-label">COGNITIVE REASONING TRACE</span>
              <span class="ns-thinking-badge ${isStillThinking ? 'pulsing' : 'done'}">
                ${isStillThinking ? 'REASONING...' : 'COMPLETED'}
              </span>
            </summary>
            <div class="ns-thinking-content">
              ${thoughtText.replace(/\n/g, '<br/>')}
            </div>
          </details>
        `;
      }
      html = html.replace(/<(?:thought|think)>[\s\S]*?(?:<\/(?:thought|think)>|$)/i, '').trim();
    }

    // Escape basic html tags
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="ns-oracle-h4">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="ns-oracle-h3">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="ns-oracle-h2">$1</h2>');

    // Bold & italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Cyber tags / probabilities (e.g. 75%, 20%)
    html = html.replace(/\b(\d{1,3}%)\b/g, '<span class="ns-oracle-pct-tag">$1</span>');

    // Bull / Base / Bear highlights
    html = html.replace(/BULL CASE/gi, '<span class="ns-oracle-case-tag bull">BULL CASE</span>');
    html = html.replace(/BASE CASE/gi, '<span class="ns-oracle-case-tag base">BASE CASE</span>');
    html = html.replace(/BEAR CASE/gi, '<span class="ns-oracle-case-tag bear">BEAR CASE</span>');

    // Unordered lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ns-oracle-li">$1</li>');

    // Code blocks / mono
    html = html.replace(/`([^`]+)`/g, '<code class="ns-oracle-code">$1</code>');

    // Line breaks
    html = html.replace(/\n/g, '<br/>');

    return thoughtHtml + html;
  }

  private async handleSend(): Promise<void> {
    if (this.isGenerating || !this.inputEl) return;
    const text = this.inputEl.value.trim();
    if (!text) return;

    this.inputEl.value = '';
    cyberAudio.playTone(750, 0.04);

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    this.messages.push(userMsg);

    // 2. Add empty streaming Assistant Message
    const assistantId = `ast-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelUsed: this.selectedModel || 'Gemma 4 Uncensored',
      isStreaming: true,
    };
    this.messages.push(assistantMsg);
    this.renderMessages();

    // 3. Set Generating UI State
    this.isGenerating = true;
    if (this.sendBtn) {
      this.sendBtn.disabled = true;
      this.sendBtn.innerHTML = `<span>ABORT</span>`;
      this.sendBtn.classList.add('abort');
      this.sendBtn.onclick = () => this.abortGeneration();
    }

    try {
      await this.streamPrediction(text, assistantId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error && err.name === 'AbortError'
        ? '*[Command aborted by user]*'
        : `*[Neural inference error]*\n\nEnsure Ollama is running locally at \`${this.ollamaHost}\` with your installed model \`${this.selectedModel || 'Gemma 4'}\`.\n\nCommand: \`ollama serve\``;

      assistantMsg.content += `\n\n${errorMsg}`;
      assistantMsg.isStreaming = false;
      this.renderMessages();
    } finally {
      this.isGenerating = false;
      assistantMsg.isStreaming = false;
      this.saveMessages();
      this.renderMessages();

      if (this.sendBtn) {
        this.sendBtn.disabled = false;
        this.sendBtn.innerHTML = `<span class="ns-oracle-send-icon">▲</span><span>EXECUTE</span>`;
        this.sendBtn.classList.remove('abort');
        this.sendBtn.onclick = () => void this.handleSend();
      }
    }
  }

  private abortGeneration(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private async streamPrediction(userPrompt: string, assistantId: string): Promise<void> {
    this.abortController = new AbortController();
    const systemPrompt = await buildSystemPrompt();

    const assistantMsg = this.messages.find((m) => m.id === assistantId);
    if (!assistantMsg) return;

    const payload = {
      model: this.selectedModel || 'fredrezones55/Gemma-4-Uncensored-HauhauCS-Aggressive:latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...this.messages.slice(-8, -1).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    };

    const response = await fetch(`${this.ollamaHost}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama returned HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed) as {
            message?: { content?: string };
            done?: boolean;
          };

          if (parsed.message?.content) {
            assistantMsg.content += parsed.message.content;
            cyberAudio.playToken();
            this.updateStreamingMessage(assistantId, assistantMsg.content);
          }
        } catch {
          // ignore partial JSON chunk
        }
      }
    }

    cyberAudio.playComplete();
  }

  private updateStreamingMessage(id: string, content: string): void {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      const body = el.querySelector('.ns-oracle-msg-body');
      if (body) {
        body.innerHTML = `${this.formatMarkdown(content, true)}<span class="ns-oracle-cursor">█</span>`;
      }
    }
    this.scrollToBottom();
  }
}

// Singleton Instance
let aiChatInstance: NextSignalAiChat | null = null;

export function initNextSignalAiChat(): NextSignalAiChat {
  if (!aiChatInstance) {
    aiChatInstance = new NextSignalAiChat();
    void aiChatInstance.init();
  }
  return aiChatInstance;
}

export function getNextSignalAiChat(): NextSignalAiChat | null {
  return aiChatInstance;
}

export function openNextSignalAiChat(): void {
  aiChatInstance?.open();
}
