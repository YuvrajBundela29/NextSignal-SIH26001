import type {
  DistrictProfile,
  RiskScoreBreakdown,
  WeatherTelemetry,
  SoilTelemetry,
  SeismicTelemetry,
  HistoricalLandslideEvent,
} from '../../services/landslide/types';
import type { AiAdvisoryResponse } from '../../services/landslide/ollama-advisory';
import { NER_RIVER_GAUGES } from '../../services/landslide/river-gauges';
import { generateNdrfOrder, type NdrfMobilizationOrder } from '../../services/landslide/ndrf-dispatch';

export class DistrictHud {
  private container: HTMLElement;
  private isHindi = false;
  private currentDistrict: DistrictProfile | null = null;
  private currentRisk: RiskScoreBreakdown | null = null;
  private currentWeather: WeatherTelemetry | null = null;

  // Mohr-Coulomb Dynamic Calculator State
  private customRainfallMm = 85;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
  }

  public setLanguage(isHindi: boolean) {
    this.isHindi = isHindi;
  }

  public render(
    district: DistrictProfile,
    risk: RiskScoreBreakdown,
    weather: WeatherTelemetry,
    soil: SoilTelemetry,
    seismic: SeismicTelemetry,
    aiAdvisory: AiAdvisoryResponse,
    nearbyHistorical: HistoricalLandslideEvent[]
  ) {
    this.currentDistrict = district;
    this.currentRisk = risk;
    this.currentWeather = weather;

    const levelColor =
      risk.level === 'CRITICAL'
        ? '#ef4444'
        : risk.level === 'HIGH'
        ? '#f97316'
        : risk.level === 'MODERATE'
        ? '#eab308'
        : '#22c55e';

    const levelBg =
      risk.level === 'CRITICAL'
        ? 'rgba(239, 68, 68, 0.15)'
        : risk.level === 'HIGH'
        ? 'rgba(249, 115, 22, 0.15)'
        : risk.level === 'MODERATE'
        ? 'rgba(234, 179, 8, 0.15)'
        : 'rgba(34, 197, 94, 0.15)';

    // Compute Mohr-Coulomb Factor of Safety (FoS) dynamically based on slope and rainfall
    const slopeDeg = district.averageSlopeDeg || 28;
    const slopeRad = (slopeDeg * Math.PI) / 180;
    const cohesion = 15; // kPa (clayey/silt regolith)
    const frictionAngleRad = (32 * Math.PI) / 180;
    const gamma = 18; // kN/m3
    const depthZ = 3.5; // m
    const porePressure = (this.customRainfallMm / 100) * 12; // kPa water pressure
    const normalStress = gamma * depthZ * Math.cos(slopeRad) * Math.cos(slopeRad);
    const shearStress = gamma * depthZ * Math.sin(slopeRad) * Math.cos(slopeRad);
    const effectiveNormalStress = Math.max(0.1, normalStress - porePressure);
    const shearStrength = cohesion + effectiveNormalStress * Math.tan(frictionAngleRad);
    const factorOfSafety = Math.max(0.4, Number((shearStrength / Math.max(1, shearStress)).toFixed(2)));
    const fosStatus =
      factorOfSafety > 1.3
        ? { text: 'STABLE (FoS > 1.3)', color: '#22c55e' }
        : factorOfSafety >= 1.0
        ? { text: 'MARGINALLY STABLE (1.0 ≤ FoS ≤ 1.3)', color: '#f97316' }
        : { text: 'IMMINENT SLOPE FAILURE (FoS < 1.0)', color: '#ef4444' };

    // River Gauges in this state/basin
    const relevantGauges = NER_RIVER_GAUGES.filter(g => g.state === district.state || g.districtId === district.id);

    // NDRF Mobilization Order
    const ndrfOrder = generateNdrfOrder(district, risk, weather);

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; font-size: 11px;">
        
        <!-- District Header & Overall Risk Score -->
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 12px; border-left: 4px solid ${levelColor};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #ffffff;">
                ${this.isHindi ? district.nameHi || district.name : district.name}
              </div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                ${district.state} &bull; ${district.elevationM}m MSL &bull; Mean Slope: <strong>${district.averageSlopeDeg}°</strong>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 22px; font-weight: 900; color: ${levelColor}; line-height: 1;">
                ${risk.compositeScore}<span style="font-size: 12px; color: #94a3b8;">/100</span>
              </div>
              <span style="display: inline-block; background: ${levelBg}; color: ${levelColor}; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 3px; margin-top: 4px;">
                ${risk.level}
              </span>
            </div>
          </div>

          <div style="font-size: 10px; color: #cbd5e1; margin-top: 8px; border-top: 1px solid #1f2937; padding-top: 6px;">
            Primary Trigger: <strong style="color: ${levelColor};">${risk.dominantTrigger}</strong>
          </div>
        </div>

        <!-- 5-Factor Risk Decomposition Bars -->
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 700; font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">
            Geotechnical Risk Sub-Scores:
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                <span>🌧️ Antecedent Rainfall (30%)</span>
                <strong>${risk.rainfallScore}/100</strong>
              </div>
              <div style="width: 100%; height: 5px; background: #1f2937; border-radius: 3px; overflow: hidden;">
                <div style="width: ${risk.rainfallScore}%; height: 100%; background: #38bdf8;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                <span>⛰️ Slope & Topography (25%)</span>
                <strong>${risk.slopeScore}/100</strong>
              </div>
              <div style="width: 100%; height: 5px; background: #1f2937; border-radius: 3px; overflow: hidden;">
                <div style="width: ${risk.slopeScore}%; height: 100%; background: #fbbf24;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                <span>💧 Soil Moisture Saturation (20%)</span>
                <strong>${risk.soilScore}/100</strong>
              </div>
              <div style="width: 100%; height: 5px; background: #1f2937; border-radius: 3px; overflow: hidden;">
                <div style="width: ${risk.soilScore}%; height: 100%; background: #a78bfa;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                <span>⚡ Seismic Shaking & PGA (15%)</span>
                <strong>${risk.seismicScore}/100</strong>
              </div>
              <div style="width: 100%; height: 5px; background: #1f2937; border-radius: 3px; overflow: hidden;">
                <div style="width: ${risk.seismicScore}%; height: 100%; background: #f87171;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                <span>📜 Historical NASA COOLR Susceptibility (10%)</span>
                <strong>${risk.historicalScore}/100</strong>
              </div>
              <div style="width: 100%; height: 5px; background: #1f2937; border-radius: 3px; overflow: hidden;">
                <div style="width: ${risk.historicalScore}%; height: 100%; background: #34d399;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- NEW WINNING FEATURE 1: Interactive Mohr-Coulomb Factor of Safety (FoS) Slope Calculator -->
        <div style="background: #0d1527; border: 1px solid #0284c7; border-radius: 8px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-weight: 800; font-size: 10px; color: #38bdf8; text-transform: uppercase;">
              🎛️ Mohr-Coulomb Slope Stability (FoS) Simulator
            </div>
            <span style="font-weight: 900; font-size: 12px; color: ${fosStatus.color};">
              FoS: ${factorOfSafety}
            </span>
          </div>

          <div style="font-size: 9px; color: #94a3b8; margin-bottom: 8px;">
            Dynamic Factor of Safety: <strong style="color: ${fosStatus.color};">${fosStatus.text}</strong>
          </div>

          <!-- Interactive Rainfall Slider -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px;">
              <span>Simulated 24h Rainfall:</span>
              <strong id="label-fos-rain" style="color: #38bdf8;">${this.customRainfallMm} mm</strong>
            </div>
            <input id="slider-fos-rain" type="range" min="0" max="300" step="5" value="${this.customRainfallMm}" style="width: 100%; cursor: pointer;" />
          </div>

          <div style="font-size: 9px; color: #94a3b8; margin-top: 6px; font-family: monospace;">
            Mohr-Coulomb: τ_f = c' + (σ_n - u)·tan(φ') [c'=15kPa, φ'=32°, Slope=${district.averageSlopeDeg}°]
          </div>
        </div>

        <!-- NEW WINNING FEATURE 2: Automated NDRF / SDRF Search & Rescue Mobilization Order Dispatch -->
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-weight: 800; font-size: 10px; color: #f59e0b; text-transform: uppercase;">
              🚨 NDRF / SDRF Mobilization Order
            </div>
            <button id="btn-copy-ndrf" style="background: #1f2937; color: #38bdf8; border: 1px solid #374151; padding: 2px 6px; border-radius: 4px; font-size: 9px; cursor: pointer;">
              📋 Copy Dispatch Order
            </button>
          </div>

          <div style="font-size: 10px; color: #cbd5e1; line-height: 1.4; background: #0b1120; padding: 8px; border-radius: 6px; border: 1px dashed #374151;">
            <div>Order ID: <strong style="color: #ffffff;">${ndrfOrder.orderId}</strong></div>
            <div>Battalion: <strong style="color: #38bdf8;">${ndrfOrder.commandingBattalion}</strong></div>
            <div>Staging Helipad: <strong style="color: #34d399;">${ndrfOrder.stagingLocation}</strong></div>
            <div>Personnel: <strong style="color: #f87171;">${ndrfOrder.personnelCount} NDRF Rescuers</strong></div>
          </div>
        </div>

        <!-- NEW WINNING FEATURE 3: River Basin Hydrological GLOF & Flash Flood Gauges -->
        ${relevantGauges.length > 0 ? `
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 800; font-size: 10px; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">
              🌊 River Basin Hydrological & GLOF Gauges
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${relevantGauges.map(g => `
                <div style="background: #0b1120; padding: 6px 8px; border-radius: 6px; border-left: 3px solid ${g.glofRisk === 'HIGH' ? '#ef4444' : '#38bdf8'};">
                  <div style="display: flex; justify-content: space-between; font-size: 10px;">
                    <strong style="color: #ffffff;">${g.stationName}</strong>
                    <span style="color: ${g.trend === 'RISING' ? '#ef4444' : '#34d399'}; font-weight: bold;">
                      ${g.trend === 'RISING' ? '▲ Rising' : '▬ Steady'} (${g.currentLevelM}m)
                    </span>
                  </div>
                  <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
                    Danger Mark: ${g.dangerLevelM}m | GLOF Risk: <strong style="color: ${g.glofRisk === 'HIGH' ? '#ef4444' : '#38bdf8'};">${g.glofRisk}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- AI Geology Operational Advisory -->
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 800; font-size: 10px; color: #a78bfa; text-transform: uppercase; margin-bottom: 6px;">
            🤖 AI Geological Advisory & Action Protocol
          </div>
          <div style="font-size: 10px; color: #e2e8f0; line-height: 1.4; background: #0b1120; padding: 8px; border-radius: 6px;">
            ${aiAdvisory.analysis}
          </div>
        </div>

      </div>
    `;

    // Bind Mohr-Coulomb Slider
    const slider = document.getElementById('slider-fos-rain') as HTMLInputElement;
    slider?.addEventListener('input', () => {
      this.customRainfallMm = parseInt(slider.value, 10);
      const label = document.getElementById('label-fos-rain');
      if (label) label.textContent = `${this.customRainfallMm} mm`;
      if (this.currentDistrict && this.currentRisk && this.currentWeather) {
        this.render(this.currentDistrict, this.currentRisk, this.currentWeather, soil, seismic, aiAdvisory, nearbyHistorical);
      }
    });

    // Bind Copy NDRF Button
    document.getElementById('btn-copy-ndrf')?.addEventListener('click', () => {
      const btn = document.getElementById('btn-copy-ndrf');
      if (btn) {
        void navigator.clipboard.writeText(ndrfOrder.capAlertMessage);
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy Dispatch Order'; }, 2000);
      }
    });
  }
}
