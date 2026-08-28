import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry, SoilTelemetry, SeismicTelemetry, AppLanguage } from '../../services/landslide/types';
import {
  generateDistrictAiAdvisory,
  getStoredAiConfig,
  saveAiConfig,
  type AiAdvisoryResponse,
  type CloudAiProvider,
} from '../../services/landslide/ollama-advisory';

export class AiTerminal {
  private container: HTMLElement;
  private lang: AppLanguage = 'en';
  private currentDistrict: DistrictProfile | null = null;
  private currentRisk: RiskScoreBreakdown | null = null;
  private currentWeather: WeatherTelemetry | null = null;
  private currentSoil: SoilTelemetry | null = null;
  private currentSeismic: SeismicTelemetry | null = null;
  private lastAdvisory: AiAdvisoryResponse | null = null;
  private isGenerating = false;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.render();
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
    this.render();
  }

  public updateContext(
    district: DistrictProfile,
    risk: RiskScoreBreakdown,
    weather: WeatherTelemetry,
    soil: SoilTelemetry,
    seismic: SeismicTelemetry
  ) {
    this.currentDistrict = district;
    this.currentRisk = risk;
    this.currentWeather = weather;
    this.currentSoil = soil;
    this.currentSeismic = seismic;
    void this.executeAdvisoryGeneration();
  }

  private async executeAdvisoryGeneration(customQuery?: string) {
    if (!this.currentDistrict || !this.currentRisk || !this.currentWeather || !this.currentSoil || !this.currentSeismic) return;

    this.isGenerating = true;
    this.render();

    this.lastAdvisory = await generateDistrictAiAdvisory(
      this.currentDistrict,
      this.currentRisk,
      this.currentWeather,
      this.currentSoil,
      this.currentSeismic
    );

    this.isGenerating = false;
    this.render();
  }

  public render() {
    const cfg = getStoredAiConfig();
    const d = this.currentDistrict;
    const r = this.currentRisk;
    const adv = this.lastAdvisory;

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; background: #0b0f19; color: #f8fafc; font-family: -apple-system, system-ui, sans-serif; overflow-y: auto;">
        
        <!-- Tactical Header Bar -->
        <div style="background: #0f172a; border-bottom: 1px solid #1e293b; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
              🛡️ NDMA / MDoNER Emergency Operations Console
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              ${d ? `${d.name} (${d.state})` : 'Awaiting District'} &bull; Incident Command
            </div>
          </div>
          <button id="btn-open-ai-settings" style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">
            ⚙️ Engine Config
          </button>
        </div>

        <!-- Engine Status Banner -->
        <div style="background: #111827; border-bottom: 1px solid #1e293b; padding: 6px 14px; display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${this.isGenerating ? '#eab308' : '#22c55e'};"></span>
            <span style="color: #cbd5e1;">Engine: <strong>${adv ? adv.sourceModel : 'Ready'}</strong></span>
          </div>
          <span style="color: #64748b;">${adv ? `${adv.latencyMs}ms latency` : ''}</span>
        </div>

        <!-- Settings Modal (Collapsible) -->
        <div id="ai-settings-drawer" style="display: none; background: #0f172a; border-bottom: 1px solid #0284c7; padding: 12px; font-size: 11px; flex-direction: column; gap: 8px;">
          <div style="font-weight: bold; color: #38bdf8;">Decision Intelligence Engine Configuration:</div>
          
          <div>
            <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Inference Provider:</label>
            <select id="sel-ai-provider" style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 4px; font-size: 11px;">
              <option value="builtin_expert" ${cfg.provider === 'builtin_expert' ? 'selected' : ''}>⚡ Built-in Geological Expert System (Offline / <5ms)</option>
              <option value="local_ollama" ${cfg.provider === 'local_ollama' ? 'selected' : ''}>💻 Local Ultra-Light LLM (Ollama - Qwen2.5 / Gemma2)</option>
              <option value="gemini" ${cfg.provider === 'gemini' ? 'selected' : ''}>☁️ Server AI - Google Gemini 1.5 Flash (API Key)</option>
              <option value="groq" ${cfg.provider === 'groq' ? 'selected' : ''}>⚡ Server AI - Groq Cloud LLaMA 3.3 70B (API Key)</option>
            </select>
          </div>

          <div id="wrap-cloud-key" style="display: ${cfg.provider === 'gemini' || cfg.provider === 'groq' ? 'block' : 'none'};">
            <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Cloud API Key:</label>
            <input id="input-cloud-key" type="password" placeholder="Enter API Key..." value="${cfg.apiKey || ''}" style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px; font-size: 11px; box-sizing: border-box;" />
          </div>

          <div id="wrap-local-model" style="display: ${cfg.provider === 'local_ollama' ? 'block' : 'none'};">
            <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Local Model Name:</label>
            <select id="sel-local-model" style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 4px; font-size: 11px;">
              <option value="qwen2.5:0.5b" ${cfg.localModelName === 'qwen2.5:0.5b' ? 'selected' : ''}>qwen2.5:0.5b (Ultra-Light, 390MB RAM)</option>
              <option value="llama3.2:1b" ${cfg.localModelName === 'llama3.2:1b' ? 'selected' : ''}>llama3.2:1b (Fast, 800MB RAM)</option>
              <option value="gemma2:2b" ${cfg.localModelName === 'gemma2:2b' ? 'selected' : ''}>gemma2:2b (Accurate, 1.4GB RAM)</option>
              <option value="phi3:mini" ${cfg.localModelName === 'phi3:mini' ? 'selected' : ''}>phi3:mini (Microsoft, 2.2GB RAM)</option>
            </select>
          </div>

          <button id="btn-save-ai-settings" style="background: #0284c7; color: white; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 4px;">
            Save & Re-Evaluate
          </button>
        </div>

        <!-- Main Incident Directives Output -->
        <div style="flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 12px;">
          ${this.isGenerating ? `
            <div style="display: flex; align-items: center; justify-content: center; height: 160px; color: #38bdf8; font-size: 12px; gap: 8px;">
              <span class="pulse-dot" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8;"></span>
              Evaluating telemetry and generating tactical dispatch briefing...
            </div>
          ` : adv ? `
            <!-- 1. Situation Briefing -->
            <div style="background: #1e293b; border-radius: 8px; padding: 10px; border-left: 4px solid #38bdf8;">
              <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
                1. Tactical Situation Briefing
              </div>
              <div style="font-size: 11px; line-height: 1.45; color: #e2e8f0;">
                ${adv.analysis}
              </div>
            </div>

            <!-- 2. Road Corridor Movement Status -->
            <div style="background: #1e293b; border-radius: 8px; padding: 10px; border-left: 4px solid ${r?.level === 'CRITICAL' ? '#ef4444' : '#f59e0b'};">
              <div style="font-size: 10px; font-weight: 800; color: ${r?.level === 'CRITICAL' ? '#f87171' : '#fbbf24'}; text-transform: uppercase; margin-bottom: 4px;">
                2. Arterial Road Corridor Status
              </div>
              <div style="font-size: 11px; line-height: 1.4; color: #f1f5f9;">
                ${adv.roadCorridorStatus || 'Normal arterial transit. Watch high-slope curves.'}
              </div>
            </div>

            <!-- 3. SDRF / NDRF Action Directives -->
            <div style="background: #1e293b; border-radius: 8px; padding: 10px; border-left: 4px solid #10b981;">
              <div style="font-size: 10px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 6px;">
                3. Incident Action Directives (NDRF / SDRF)
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.45; color: #cbd5e1;">
                ${adv.mitigationSteps.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
              </ul>
            </div>

            <!-- 4. Civil Defense Command -->
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px;">
              <div style="font-size: 10px; font-weight: 800; color: #a855f7; text-transform: uppercase; margin-bottom: 4px;">
                4. Civil Defense Directive
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #f8fafc;">
                ${adv.civilDefenseAction}
              </div>
            </div>
          ` : `
            <div style="text-align: center; padding: 40px 20px; color: #64748b; font-size: 11px;">
              Select a district to generate real-time disaster decision directives.
            </div>
          `}
        </div>

        <!-- Re-evaluate Button -->
        <div style="padding: 10px 12px; background: #0f172a; border-top: 1px solid #1e293b;">
          <button id="btn-re-evaluate" style="width: 100%; background: #0284c7; border: none; color: white; padding: 8px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;">
            🔄 Re-Evaluate Current Telemetry
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const btnSettings = document.getElementById('btn-open-ai-settings');
    const drawer = document.getElementById('ai-settings-drawer');
    btnSettings?.addEventListener('click', () => {
      if (drawer) {
        drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
      }
    });

    const selProvider = document.getElementById('sel-ai-provider') as HTMLSelectElement;
    const wrapCloud = document.getElementById('wrap-cloud-key');
    const wrapLocal = document.getElementById('wrap-local-model');

    selProvider?.addEventListener('change', () => {
      const val = selProvider.value as CloudAiProvider;
      if (wrapCloud) wrapCloud.style.display = (val === 'gemini' || val === 'groq') ? 'block' : 'none';
      if (wrapLocal) wrapLocal.style.display = val === 'local_ollama' ? 'block' : 'none';
    });

    const btnSave = document.getElementById('btn-save-ai-settings');
    btnSave?.addEventListener('click', () => {
      const provider = (selProvider?.value as CloudAiProvider) || 'builtin_expert';
      const apiKey = (document.getElementById('input-cloud-key') as HTMLInputElement)?.value || '';
      const localModelName = (document.getElementById('sel-local-model') as HTMLSelectElement)?.value || 'qwen2.5:0.5b';

      saveAiConfig({
        provider,
        apiKey,
        localModelName,
        cloudModelName: provider === 'gemini' ? 'gemini-1.5-flash' : 'llama-3.3-70b-versatile',
      });

      if (drawer) drawer.style.display = 'none';
      void this.executeAdvisoryGeneration();
    });

    document.getElementById('btn-re-evaluate')?.addEventListener('click', () => {
      void this.executeAdvisoryGeneration();
    });
  }
}
