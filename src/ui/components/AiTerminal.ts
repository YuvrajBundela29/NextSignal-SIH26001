import type {
  DistrictProfile,
  RiskScoreBreakdown,
  WeatherTelemetry,
  SoilTelemetry,
  SeismicTelemetry,
} from '../../services/landslide/types';
import { generateDistrictAiAdvisory } from '../../services/landslide/ollama-advisory';

export class AiTerminal {
  private container: HTMLElement;
  private currentDistrict: DistrictProfile | null = null;
  private currentRisk: RiskScoreBreakdown | null = null;
  private currentWeather: WeatherTelemetry | null = null;
  private currentSoil: SoilTelemetry | null = null;
  private currentSeismic: SeismicTelemetry | null = null;
  private isHi = false;
  private messages: Array<{ sender: 'user' | 'ai'; text: string; time: string; model?: string }> = [];

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.render();
  }

  public setLanguage(isHi: boolean) {
    this.isHi = isHi;
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
  }

  public render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; font-family: system-ui, sans-serif;">
        <!-- Terminal Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #0f172a; border-bottom: 1px solid #1e293b;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
            <span style="font-size: 12px; font-weight: 700; color: #f8fafc; text-transform: uppercase;">
              ${this.isHi ? 'स्थानीय एआई सलाहकार टर्मिनल (Ollama)' : 'Local AI Disaster Advisory (Ollama)'}
            </span>
          </div>
          <select id="sel-ollama-model" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; font-size: 11px;">
            <option value="gemma:2b">Gemma 2B (Local)</option>
            <option value="llama3.2:3b">Llama 3.2 3B</option>
            <option value="phi3:mini">Phi-3 Mini</option>
            <option value="builtin">Expert Geological Rule-Engine</option>
          </select>
        </div>

        <!-- Quick Query Suggestion Chips -->
        <div style="display: flex; gap: 6px; padding: 8px 12px; background: #0b0f19; overflow-x: auto; border-bottom: 1px solid #1e293b;">
          <button class="chip-btn" data-query="Explain current risk triggers in detail" style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 12px; padding: 3px 10px; font-size: 10px; white-space: nowrap; cursor: pointer;">
            ⚡ ${this.isHi ? 'जोखिम ट्रिगर समझाएं' : 'Explain Risk Triggers'}
          </button>
          <button class="chip-btn" data-query="Generate SDRF & Highway Advisory" style="background: #1e293b; color: #f59e0b; border: 1px solid #334155; border-radius: 12px; padding: 3px 10px; font-size: 10px; white-space: nowrap; cursor: pointer;">
            🚧 ${this.isHi ? 'राजमार्ग और एसडीआरएफ परामर्श' : 'Highway & SDRF Directives'}
          </button>
          <button class="chip-btn" data-query="Evaluate multi-day rainfall threshold" style="background: #1e293b; color: #10b981; border: 1px solid #334155; border-radius: 12px; padding: 3px 10px; font-size: 10px; white-space: nowrap; cursor: pointer;">
            🌧️ ${this.isHi ? 'बारिश सीमा विश्लेषण' : 'Rainfall Threshold Analysis'}
          </button>
        </div>

        <!-- Chat History Window -->
        <div id="ai-chat-history" style="flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: #030712; font-size: 12px; line-height: 1.4;">
          ${this.messages.length === 0 ? `
            <div style="color: #64748b; text-align: center; margin-top: 30px; font-size: 11px;">
              <div style="font-size: 24px; margin-bottom: 6px;">🤖</div>
              ${this.isHi ? 'जिला चुनें या एआई स्थिति विश्लेषण के लिए ऊपर दिए गए चिप्स पर क्लिक करें।' : 'Select a district or click quick query chips above to generate real-time AI disaster advisories.'}
            </div>
          ` : this.messages.map(m => `
            <div style="display: flex; flex-direction: column; align-items: ${m.sender === 'user' ? 'flex-end' : 'flex-start'};">
              <div style="max-width: 85%; padding: 8px 12px; border-radius: 8px; background: ${m.sender === 'user' ? '#0284c7' : '#1e293b'}; color: #f8fafc; border: 1px solid ${m.sender === 'user' ? '#0369a1' : '#334155'};">
                ${m.sender === 'ai' ? `<div style="font-size: 9px; color: #10b981; font-weight: bold; margin-bottom: 4px;">${m.model || 'AI System'}</div>` : ''}
                <div>${m.text}</div>
              </div>
              <span style="font-size: 9px; color: #475569; margin-top: 2px;">${m.time}</span>
            </div>
          `).join('')}
        </div>

        <!-- Input Box -->
        <form id="ai-input-form" style="display: flex; padding: 10px; background: #0f172a; border-top: 1px solid #1e293b; gap: 8px;">
          <input id="ai-query-text" type="text" placeholder="${this.isHi ? 'एआई सलाहकार से पूछें (उदा. इस जिले में जोखिम क्यों है?)...' : 'Ask AI Analyst (e.g. Why is this district High risk?)...'}" style="flex: 1; background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px; font-size: 12px; outline: none;" />
          <button type="submit" style="background: #0284c7; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-weight: bold; cursor: pointer;">
            ${this.isHi ? 'भेजें' : 'Query'}
          </button>
        </form>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const form = this.container.querySelector('#ai-input-form') as HTMLFormElement;
    const input = this.container.querySelector('#ai-query-text') as HTMLInputElement;

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      await this.handleUserQuery(text);
    });

    const chips = this.container.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', async () => {
        const q = chip.getAttribute('data-query');
        if (q) await this.handleUserQuery(q);
      });
    });
  }

  private async handleUserQuery(query: string) {
    if (!this.currentDistrict || !this.currentRisk || !this.currentWeather || !this.currentSoil || !this.currentSeismic) {
      alert('Please select a district on the map first.');
      return;
    }

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    this.messages.push({ sender: 'user', text: query, time });
    this.render();

    const chatHistory = this.container.querySelector('#ai-chat-history');
    if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;

    const modelSelect = this.container.querySelector('#sel-ollama-model') as HTMLSelectElement;
    const model = modelSelect ? modelSelect.value : 'gemma:2b';

    const advisory = await generateDistrictAiAdvisory(
      this.currentDistrict,
      this.currentRisk,
      this.currentWeather,
      this.currentSoil,
      this.currentSeismic,
      model
    );

    const responseText = `${advisory.analysis}\n\n**Key Directives:**\n${advisory.mitigationSteps.map(s => `• ${s}`).join('\n')}\n\n**Action:** ${advisory.civilDefenseAction}`;

    this.messages.push({
      sender: 'ai',
      text: responseText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      model: advisory.sourceModel,
    });

    this.render();
    const chatHistory2 = this.container.querySelector('#ai-chat-history');
    if (chatHistory2) chatHistory2.scrollTop = chatHistory2.scrollHeight;
  }
}
