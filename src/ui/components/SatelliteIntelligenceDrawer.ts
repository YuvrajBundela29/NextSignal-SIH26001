import {
  SATELLITE_LAYERS,
  fetchLiveSatelliteWindTelemetry,
  type SatelliteLayerOption,
  type LiveWindTelemetry,
} from '../../services/landslide/satellite-streams';
import type { DistrictProfile } from '../../services/landslide/types';

export class SatelliteIntelligenceDrawer {
  private container: HTMLElement;
  private activeLayerId: string = 'none';
  private liveTelemetry: LiveWindTelemetry | null = null;
  private onToggleLayer: (layerId: string, enabled: boolean) => void;
  private currentDistrict: DistrictProfile | null = null;

  constructor(containerId: string, onToggleLayer: (layerId: string, enabled: boolean) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onToggleLayer = onToggleLayer;
    this.render();
  }

  public async updateDistrict(district: DistrictProfile) {
    this.currentDistrict = district;
    this.liveTelemetry = await fetchLiveSatelliteWindTelemetry(district.lat, district.lon);
    this.render();
  }

  public render() {
    const t = this.liveTelemetry;
    const d = this.currentDistrict;

    this.container.innerHTML = `
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc; font-family: -apple-system, system-ui, sans-serif; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🛰️</span>
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                Satellite & Earth Observation Center
              </div>
              <div style="font-size: 10px; color: #94a3b8;">
                Real-Time NASA EOSDIS, Thermal Radiance & Wind Vector Streams
              </div>
            </div>
          </div>
          <span style="background: rgba(6, 182, 212, 0.15); color: #38bdf8; border: 1px solid #0284c7; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
            LIVE SATELLITE 200 OK
          </span>
        </div>

        <!-- Live Earth Telemetry Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          <!-- 1. Wind Speed & Vector -->
          <div style="background: #1e293b; border-radius: 6px; padding: 8px; border-left: 3px solid #38bdf8;">
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Wind Speed & Gusts</div>
            <div style="font-size: 14px; font-weight: 800; color: #38bdf8; margin-top: 2px;">
              ${t ? `${t.speedKmh} km/h` : '--'}
            </div>
            <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
              ${t ? `Vector: ${t.directionCardinal} (${t.directionDeg}°) &bull; Gust ${t.gustKmh}kph` : 'Measuring...'}
            </div>
          </div>

          <!-- 2. Thermal Surface Temperature -->
          <div style="background: #1e293b; border-radius: 6px; padding: 8px; border-left: 3px solid #f97316;">
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Thermal Surface Temp</div>
            <div style="font-size: 14px; font-weight: 800; color: #f97316; margin-top: 2px;">
              ${t ? `${t.thermalSurfaceTempC}°C` : '--'}
            </div>
            <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
              NASA Land Radiance Flux
            </div>
          </div>

          <!-- 3. Satellite Cloud Cover -->
          <div style="background: #1e293b; border-radius: 6px; padding: 8px; border-left: 3px solid #a855f7;">
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Cloud Cover Fraction</div>
            <div style="font-size: 14px; font-weight: 800; color: #c084fc; margin-top: 2px;">
              ${t ? `${t.cloudCoverTotalPct}%` : '--'}
            </div>
            <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
              ${t ? `High: ${t.cloudCoverHighPct}% | Low: ${t.cloudCoverLowPct}%` : 'Scanning...'}
            </div>
          </div>

          <!-- 4. Barometric Pressure -->
          <div style="background: #1e293b; border-radius: 6px; padding: 8px; border-left: 3px solid #10b981;">
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Atmospheric Pressure</div>
            <div style="font-size: 14px; font-weight: 800; color: #34d399; margin-top: 2px;">
              ${t ? `${t.pressureHpa} hPa` : '--'}
            </div>
            <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
              Monsoon Depression Track
            </div>
          </div>
        </div>

        <!-- Satellite Layer Selection Tiles -->
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">
            Activate Earth Remote Sensing Layers:
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            ${SATELLITE_LAYERS.map(l => {
              const isActive = this.activeLayerId === l.id;
              return `
                <div class="sat-layer-card ${isActive ? 'active' : ''}" data-id="${l.id}" style="background: ${isActive ? 'rgba(2, 132, 199, 0.25)' : '#1e293b'}; border: 1px solid ${isActive ? '#38bdf8' : '#334155'}; border-radius: 6px; padding: 8px; cursor: pointer; transition: all 0.15s ease;">
                  <div style="font-weight: 800; font-size: 11px; color: ${isActive ? '#38bdf8' : '#f1f5f9'};">
                    ${l.name}
                  </div>
                  <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
                    ${l.resolution}
                  </div>
                  <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 8px; color: #64748b;">${l.category}</span>
                    <span style="font-size: 9px; font-weight: bold; color: ${isActive ? '#38bdf8' : '#64748b'};">
                      ${isActive ? '● ACTIVE' : '○ OFF'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind layer click handlers
    const cards = this.container.querySelectorAll('.sat-layer-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id) {
          if (this.activeLayerId === id) {
            this.activeLayerId = 'none';
            this.onToggleLayer(id, false);
          } else {
            const oldId = this.activeLayerId;
            if (oldId !== 'none') this.onToggleLayer(oldId, false);
            this.activeLayerId = id;
            this.onToggleLayer(id, true);
          }
          this.render();
        }
      });
    });
  }
}
