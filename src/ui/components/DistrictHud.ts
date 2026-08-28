import type {
  DistrictProfile,
  WeatherTelemetry,
  SoilTelemetry,
  SeismicTelemetry,
  RiskScoreBreakdown,
  HistoricalLandslideEvent,
} from '../../services/landslide/types';
import type { AiAdvisoryResponse } from '../../services/landslide/ollama-advisory';
import { exportDistrictSituationReport } from '../../services/landslide/pdf-report';

export class DistrictHud {
  private container: HTMLElement;
  private isHi = false;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
  }

  public setLanguage(isHi: boolean) {
    this.isHi = isHi;
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
    const riskColor =
      risk.level === 'CRITICAL'
        ? '#ef4444'
        : risk.level === 'HIGH'
        ? '#f97316'
        : risk.level === 'MODERATE'
        ? '#eab308'
        : '#22c55e';

    const districtName = this.isHi ? district.nameHi : district.name;
    const levelLabel =
      risk.level === 'CRITICAL'
        ? (this.isHi ? 'गंभीर जोखिम' : 'CRITICAL HAZARD')
        : risk.level === 'HIGH'
        ? (this.isHi ? 'उच्च चेतावनी' : 'HIGH WARNING')
        : risk.level === 'MODERATE'
        ? (this.isHi ? 'मध्यम निगरानी' : 'MODERATE WATCH')
        : (this.isHi ? 'सामान्य / सुरक्षित' : 'NORMAL / SAFE');

    const advisoryText = this.isHi ? risk.advisoryHi : risk.advisoryEn;

    this.container.innerHTML = `
      <div class="hud-card">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">
              ${district.state} &bull; ${district.elevationM}m MSL
            </div>
            <div style="font-size: 18px; font-weight: 700; color: #f8fafc; margin-top: 2px;">
              ${districtName}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ${district.geologyType}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 800; color: ${riskColor}; line-height: 1;">
              ${risk.compositeScore}<span style="font-size: 13px; color: #64748b;">/100</span>
            </div>
            <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${riskColor}22; color: ${riskColor}; border: 1px solid ${riskColor}44; margin-top: 4px;">
              ${levelLabel}
            </div>
          </div>
        </div>

        <!-- Main Risk Alert Banner -->
        <div style="background: ${riskColor}15; border-left: 3px solid ${riskColor}; padding: 8px 12px; border-radius: 4px; margin-bottom: 16px; font-size: 12px; line-height: 1.4; color: #f1f5f9;">
          <strong>${this.isHi ? 'प्राथमिक ट्रिगर:' : 'Dominant Trigger:'}</strong> ${risk.dominantTrigger}<br/>
          <span style="color: #cbd5e1; font-size: 11px;">${advisoryText}</span>
        </div>

        <!-- Factor Contributions Breakdown (Explainable Rules) -->
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            <span>${this.isHi ? 'जोखिम कारक विश्लेषण' : 'Factor Weight Breakdown'}</span>
            <span style="color: #38bdf8;">ML Conf: ${risk.mlConfidencePct}%</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;">
            <!-- Rainfall 30% -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #cbd5e1;">🌧️ ${this.isHi ? 'वर्षा तीव्रता (30%)' : 'Rainfall Intensity (30%)'}</span>
                <span style="color: #38bdf8; font-weight: bold;">${risk.rainfallScore}% (${risk.weightedRainfall} pts)</span>
              </div>
              <div style="background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #38bdf8; width: ${risk.rainfallScore}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>

            <!-- Slope 25% -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #cbd5e1;">⛰️ ${this.isHi ? 'ढलान प्रवणता (25%)' : 'Slope Gradient (25%)'} [${district.averageSlopeDeg}°]</span>
                <span style="color: #f59e0b; font-weight: bold;">${risk.slopeScore}% (${risk.weightedSlope} pts)</span>
              </div>
              <div style="background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #f59e0b; width: ${risk.slopeScore}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>

            <!-- Soil Moisture 20% -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #cbd5e1;">💧 ${this.isHi ? 'मृदा संतृप्ति (20%)' : 'Soil Moisture (20%)'} [${soil.soilSaturationStatus}]</span>
                <span style="color: #06b6d4; font-weight: bold;">${risk.soilScore}% (${risk.weightedSoil} pts)</span>
              </div>
              <div style="background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #06b6d4; width: ${risk.soilScore}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>

            <!-- Seismic 15% -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #cbd5e1;">⚡ ${this.isHi ? 'भूकंपीय प्रभाव (15%)' : 'Seismic Shake Factor (15%)'}</span>
                <span style="color: #a855f7; font-weight: bold;">${risk.seismicScore}% (${risk.weightedSeismic} pts)</span>
              </div>
              <div style="background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #a855f7; width: ${risk.seismicScore}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>

            <!-- Historical 10% -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #cbd5e1;">📜 ${this.isHi ? 'ऐतिहासिक घनत्व (10%)' : 'Historical Density (10%)'}</span>
                <span style="color: #ec4899; font-weight: bold;">${risk.historicalScore}% (${risk.weightedHistorical} pts)</span>
              </div>
              <div style="background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #ec4899; width: ${risk.historicalScore}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Sensor Telemetry Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px;">
          <div style="background: #0f172a88; border: 1px solid #334155; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">24h Rainfall</div>
            <div style="font-size: 15px; font-weight: 700; color: #38bdf8;">${weather.rainfall24hMm} <span style="font-size: 11px;">mm</span></div>
            <div style="font-size: 10px; color: #64748b;">72h: ${weather.rainfall72hMm}mm</div>
          </div>
          <div style="background: #0f172a88; border: 1px solid #334155; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Soil Saturation</div>
            <div style="font-size: 15px; font-weight: 700; color: #06b6d4;">${soil.soilMoisturePct}%</div>
            <div style="font-size: 10px; color: #64748b;">Runoff: ${soil.surfaceWaterRunoffMm}mm</div>
          </div>
          <div style="background: #0f172a88; border: 1px solid #334155; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Recent Quakes (72h)</div>
            <div style="font-size: 15px; font-weight: 700; color: #a855f7;">${seismic.recentQuakes72hCount} <span style="font-size: 11px;">events</span></div>
            <div style="font-size: 10px; color: #64748b;">Max M${seismic.maxMagnitude72h} (${seismic.nearestEpicenterKm}km)</div>
          </div>
          <div style="background: #0f172a88; border: 1px solid #334155; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">DEOC Emergency</div>
            <div style="font-size: 13px; font-weight: 700; color: #22c55e;">${district.deocContact}</div>
            <div style="font-size: 10px; color: #64748b;">Pop: ${district.population.toLocaleString()}</div>
          </div>
        </div>

        <!-- AI Situation Directives (Ollama/Geological Model) -->
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 6px; padding: 10px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">🤖 AI Advisory Directive</span>
            <span style="font-size: 9px; color: #64748b;">${aiAdvisory.sourceModel}</span>
          </div>
          <p style="font-size: 11px; line-height: 1.4; color: #cbd5e1; margin: 0 0 6px 0;">
            ${aiAdvisory.analysis}
          </p>
          <div style="border-top: 1px solid #1f2937; padding-top: 6px;">
            <div style="font-size: 10px; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">KEY CIVIL DIRECTIVES:</div>
            <ul style="margin: 0; padding-left: 14px; font-size: 10px; color: #94a3b8; line-height: 1.3;">
              ${aiAdvisory.mitigationSteps.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Export PDF Report Button -->
        <button id="btn-export-pdf" class="btn-primary" style="width: 100%; padding: 10px; font-size: 12px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; border-radius: 6px; background: #0284c7; color: white; border: none;">
          <span>📄</span>
          <span>${this.isHi ? 'आधिकारिक स्थिति रिपोर्ट (PDF) डाउनलोड करें' : 'Export District Situation Report (PDF)'}</span>
        </button>
      </div>
    `;

    const exportBtn = this.container.querySelector('#btn-export-pdf');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportDistrictSituationReport(district, risk, weather, soil, seismic, aiAdvisory);
      });
    }
  }
}
