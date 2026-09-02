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

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error('Element #' + containerId + ' not found');
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
    const levelColor =
      risk.level === 'CRITICAL' ? '#ef4444' :
      risk.level === 'HIGH' ? '#f97316' :
      risk.level === 'MODERATE' ? '#eab308' : '#22c55e';

    const levelBg =
      risk.level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' :
      risk.level === 'HIGH' ? 'rgba(249, 115, 22, 0.12)' :
      risk.level === 'MODERATE' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(34, 197, 94, 0.12)';

    const relevantGauges = NER_RIVER_GAUGES.filter(g => g.state === district.state || g.districtId === district.id);
    const ndrfOrder = generateNdrfOrder(district, risk, weather);

    const riskBar = (score: number, color: string) =>
      '<div style="width: 100%; height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden; margin-top: 3px;"><div style="width: ' + score + '%; height: 100%; background: ' + color + '; border-radius: 2px; transition: width 0.6s ease;"></div></div>';

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; font-size: 11px;">

        <!-- District Header & Overall Risk Score -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border: 1px solid ${levelColor}40; border-radius: 10px; padding: 12px; border-left: 3px solid ${levelColor};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 14px; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${this.isHindi ? district.nameHi || district.name : district.name}
              </div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                ${district.state} &bull; ${district.elevationM}m MSL &bull; Slope: ${district.averageSlopeDeg}&deg;
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <div style="font-size: 26px; font-weight: 900; color: ${levelColor}; line-height: 1; letter-spacing: -1px;">
                ${risk.compositeScore}<span style="font-size: 11px; color: #64748b;">/100</span>
              </div>
              <span style="display: inline-block; background: ${levelBg}; color: ${levelColor}; border: 1px solid ${levelColor}40; font-size: 8px; font-weight: 800; padding: 1px 7px; border-radius: 10px; margin-top: 3px; letter-spacing: 0.5px;">
                ${risk.level}
              </span>
            </div>
          </div>
          <div style="font-size: 10px; color: #cbd5e1; margin-top: 8px; padding-top: 7px; border-top: 1px solid #1e293b;">
            Primary Trigger: <strong style="color: ${levelColor};">${risk.dominantTrigger}</strong>
          </div>
        </div>

        <!-- 5-Factor Geotechnical Risk Sub-Scores -->
        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px;">
          <div style="font-weight: 700; font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
            GEOTECHNICAL RISK SUB-SCORES
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span style="color: #94a3b8;">Antecedent Rainfall <span style="color: #475569;">(30%)</span></span>
                <strong style="color: #38bdf8;">${risk.rainfallScore}/100</strong>
              </div>
              ${riskBar(risk.rainfallScore, '#38bdf8')}
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span style="color: #94a3b8;">Slope &amp; Topography <span style="color: #475569;">(25%)</span></span>
                <strong style="color: #fbbf24;">${risk.slopeScore}/100</strong>
              </div>
              ${riskBar(risk.slopeScore, '#fbbf24')}
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span style="color: #94a3b8;">Soil Moisture Saturation <span style="color: #475569;">(20%)</span></span>
                <strong style="color: #a78bfa;">${risk.soilScore}/100</strong>
              </div>
              ${riskBar(risk.soilScore, '#a78bfa')}
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span style="color: #94a3b8;">Seismic Shaking &amp; PGA <span style="color: #475569;">(15%)</span></span>
                <strong style="color: #f87171;">${risk.seismicScore}/100</strong>
              </div>
              ${riskBar(risk.seismicScore, '#f87171')}
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span style="color: #94a3b8;">NASA COOLR Historical <span style="color: #475569;">(10%)</span></span>
                <strong style="color: #34d399;">${risk.historicalScore}/100</strong>
              </div>
              ${riskBar(risk.historicalScore, '#34d399')}
            </div>
          </div>
        </div>

        <!-- Live Meteorological Telemetry -->
        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px;">
          <div style="font-weight: 700; font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
            LIVE WEATHER TELEMETRY
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div style="background: #0b1120; border-radius: 6px; padding: 7px 9px; border: 1px solid #1e293b;">
              <div style="font-size: 9px; color: #64748b; margin-bottom: 2px;">RAINFALL 24h</div>
              <div style="font-size: 15px; font-weight: 800; color: #38bdf8;">${weather.rainfall24hMm}<span style="font-size: 10px; font-weight: 400; color: #64748b;"> mm</span></div>
            </div>
            <div style="background: #0b1120; border-radius: 6px; padding: 7px 9px; border: 1px solid #1e293b;">
              <div style="font-size: 9px; color: #64748b; margin-bottom: 2px;">TEMPERATURE</div>
              <div style="font-size: 15px; font-weight: 800; color: #f97316;">${weather.temperatureC}<span style="font-size: 10px; font-weight: 400; color: #64748b;"> &deg;C</span></div>
            </div>
            <div style="background: #0b1120; border-radius: 6px; padding: 7px 9px; border: 1px solid #1e293b;">
              <div style="font-size: 9px; color: #64748b; margin-bottom: 2px;">HUMIDITY</div>
              <div style="font-size: 15px; font-weight: 800; color: #a78bfa;">${weather.humidityPct}<span style="font-size: 10px; font-weight: 400; color: #64748b;"> %</span></div>
            </div>
            <div style="background: #0b1120; border-radius: 6px; padding: 7px 9px; border: 1px solid #1e293b;">
              <div style="font-size: 9px; color: #64748b; margin-bottom: 2px;">SOIL MOISTURE</div>
              <div style="font-size: 15px; font-weight: 800; color: #34d399;">${soil.soilMoisturePct}<span style="font-size: 10px; font-weight: 400; color: #64748b;"> %</span></div>
            </div>
          </div>
        </div>

        <!-- NDRF / SDRF Mobilization Order -->
        <div style="background: linear-gradient(135deg, #1c1008 0%, #111827 100%); border: 1px solid #d9770640; border-radius: 10px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 800; font-size: 9px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">
              NDRF / SDRF DISPATCH DECISION SUPPORT
            </div>
            <button id="btn-copy-ndrf" style="background: #1f2937; color: #38bdf8; border: 1px solid #374151; padding: 2px 7px; border-radius: 4px; font-size: 9px; cursor: pointer; font-weight: 600;">
              Copy Draft
            </button>
          </div>
          <div style="font-size: 10px; color: #cbd5e1; line-height: 1.6; background: #0b1120; padding: 8px 10px; border-radius: 6px; border: 1px dashed #374151;">
            <div>Order ID: <strong style="color: #ffffff;">${ndrfOrder.orderId}</strong></div>
            <div>Battalion: <strong style="color: #38bdf8;">${ndrfOrder.commandingBattalion}</strong></div>
            <div>Staging Helipad: <strong style="color: #34d399;">${ndrfOrder.stagingLocation}</strong></div>
            <div>Personnel: <strong style="color: #f87171;">${ndrfOrder.personnelCount} NDRF Rescuers</strong></div>
          </div>
        </div>

        <!-- River Basin / GLOF Gauges -->
        ${relevantGauges.length > 0 ? `
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px;">
            <div style="font-weight: 700; font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
              RIVER BASIN &amp; GLOF GAUGES
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${relevantGauges.map(g => `
                <div style="background: #0b1120; padding: 7px 9px; border-radius: 6px; border-left: 2px solid ${g.glofRisk === 'HIGH' ? '#ef4444' : '#38bdf8'};">
                  <div style="display: flex; justify-content: space-between; font-size: 10px;">
                    <strong style="color: #ffffff;">${g.stationName}</strong>
                    <span style="color: ${g.trend === 'RISING' ? '#ef4444' : '#34d399'}; font-weight: 700;">
                      ${g.trend === 'RISING' ? '▲ Rising' : '▶ Steady'} (${g.currentLevelM}m)
                    </span>
                  </div>
                  <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
                    Danger: ${g.dangerLevelM}m &bull; GLOF Risk: <strong style="color: ${g.glofRisk === 'HIGH' ? '#ef4444' : '#38bdf8'};">${g.glofRisk}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    document.getElementById('btn-copy-ndrf')?.addEventListener('click', () => {
      const text = `DISPATCH RECOMMENDATION: ${ndrfOrder.orderId}\nBattalion: ${ndrfOrder.commandingBattalion}\nStaging: ${ndrfOrder.stagingLocation}\nPersonnel: ${ndrfOrder.personnelCount} Rescuers`;
      navigator.clipboard.writeText(text).catch(() => {});
    });
  }
}
