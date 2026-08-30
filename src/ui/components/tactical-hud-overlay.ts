import type { DistrictProfile, RiskScoreBreakdown } from '../../services/landslide/types';
import { sensorOpticsManager } from './sensor-optics';

export class TacticalHudOverlay {
  private container: HTMLElement;
  private isHudVisible = true;
  private isDetectionMeshVisible = true;
  private activeDistrict: DistrictProfile | null = null;
  private activeRisk: RiskScoreBreakdown | null = null;

  constructor(parentContainerId: string) {
    const parent = document.getElementById(parentContainerId);
    if (!parent) throw new Error(`Parent #${parentContainerId} not found`);

    this.container = document.createElement('div');
    this.container.id = 'tactical-hud-overlay-root';
    this.container.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 400;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px;
      box-sizing: border-box;
      font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace;
    `;
    parent.appendChild(this.container);

    this.render();
    this.bindKeyboardShortcuts();
  }

  public setVisible(show: boolean) {
    this.isHudVisible = show;
    this.updateVisibility();
  }

  public setDetectionMeshVisible(show: boolean) {
    this.isDetectionMeshVisible = show;
    this.updateVisibility();
  }

  public toggleHud() {
    this.isHudVisible = !this.isHudVisible;
    this.updateVisibility();
  }

  public toggleDetectionMesh() {
    this.isDetectionMeshVisible = !this.isDetectionMeshVisible;
    this.updateVisibility();
  }

  public updateTelemetry(district: DistrictProfile, risk: RiskScoreBreakdown) {
    this.activeDistrict = district;
    this.activeRisk = risk;

    const latEl = document.getElementById('hud-tel-lat');
    const lonEl = document.getElementById('hud-tel-lon');
    const altEl = document.getElementById('hud-tel-alt');
    const slopeEl = document.getElementById('hud-tel-slope');
    const targetEl = document.getElementById('hud-target-name');
    const riskBadgeEl = document.getElementById('hud-target-risk');
    const aiIntelEl = document.getElementById('hud-ai-intel-summary');

    if (latEl) latEl.textContent = `${district.lat.toFixed(4)}°N`;
    if (lonEl) lonEl.textContent = `${district.lon.toFixed(4)}°E`;
    if (altEl) altEl.textContent = `${district.elevationM}m MSL`;
    if (slopeEl) slopeEl.textContent = `${district.averageSlopeDeg}°`;
    if (targetEl) targetEl.textContent = `${district.name.toUpperCase()} [${district.state.toUpperCase()}]`;

    if (riskBadgeEl) {
      riskBadgeEl.textContent = `${risk.compositeScore}/100 [${risk.level}]`;
      riskBadgeEl.style.color = risk.level === 'CRITICAL' ? '#ef4444' : risk.level === 'HIGH' ? '#f97316' : '#22c55e';
    }

    if (aiIntelEl) {
      aiIntelEl.textContent = risk.level === 'CRITICAL'
        ? `CRITICAL STABILITY FAILURE IMMINENT // TRIGGER: ${risk.dominantTrigger.toUpperCase()}`
        : risk.level === 'HIGH'
        ? `HIGH SUSCEPTIBILITY DETECTED // MONITOR ANTECEDENT DELUGE`
        : `NOMINAL SLOPE EQUILIBRIUM // MONITORING TELEMETRY`;
    }
  }

  private updateVisibility() {
    const hudGroup = document.getElementById('hud-elements-group');
    const meshGroup = document.getElementById('detection-mesh-group');

    if (hudGroup) hudGroup.style.display = this.isHudVisible ? 'block' : 'none';
    if (meshGroup) meshGroup.style.display = this.isDetectionMeshVisible ? 'block' : 'none';

    // Update buttons
    const btnHud = document.getElementById('btn-toggle-hud');
    const btnDet = document.getElementById('btn-toggle-detection');
    if (btnHud) btnHud.style.background = this.isHudVisible ? '#0284c7' : '#0f172a';
    if (btnDet) btnDet.style.background = this.isDetectionMeshVisible ? '#0284c7' : '#0f172a';
  }

  private render() {
    this.container.innerHTML = `
      <!-- Top Tactical HUD Bar -->
      <div id="hud-elements-group" style="display: ${this.isHudVisible ? 'block' : 'none'}; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          
          <!-- Top Left: Targeting Lock & Reticle Status -->
          <div style="background: rgba(3, 7, 18, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 6px 12px; font-size: 10px; color: #f8fafc; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
              <span style="color: #ef4444; animation: pulse-red 1s infinite;">⦿ TARGET LOCK:</span>
              <strong id="hud-target-name" style="color: #38bdf8;">DIMA HASAO [ASSAM]</strong>
              <span id="hud-target-risk" style="background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 0 4px; border-radius: 3px; font-weight: bold;">
                54/100 [MODERATE]
              </span>
            </div>
            <div style="display: flex; gap: 12px; color: #94a3b8; font-size: 9px;">
              <span>LAT: <strong id="hud-tel-lat" style="color: #e2e8f0;">25.1812°N</strong></span>
              <span>LON: <strong id="hud-tel-lon" style="color: #e2e8f0;">93.0210°E</strong></span>
              <span>ALT: <strong id="hud-tel-alt" style="color: #e2e8f0;">950m MSL</strong></span>
              <span>SLOPE: <strong id="hud-tel-slope" style="color: #e2e8f0;">34°</strong></span>
            </div>
          </div>

          <!-- Top Right: Optics Mode & Heading Compass -->
          <div style="background: rgba(3, 7, 18, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 6px 12px; font-size: 10px; color: #f8fafc; text-align: right;">
            <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
              <span style="color: #94a3b8;">SENSOR OPTIC:</span>
              <span id="hud-optic-mode-badge" style="background: #0284c7; color: white; padding: 1px 6px; border-radius: 3px; font-weight: bold;">
                🛰️ VIS
              </span>
            </div>
            <div style="font-size: 9px; color: #38bdf8; margin-top: 2px;">
              COMPASS: <strong>038° NNE</strong> &bull; FOV: <strong>60°</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Screen: Tactical Crosshairs & Targeting Brackets -->
      <div id="detection-mesh-group" style="position: absolute; inset: 0; pointer-events: none; display: ${this.isDetectionMeshVisible ? 'block' : 'none'};">
        
        <!-- Center Targeting Reticle -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; pointer-events: none; opacity: 0.6;">
          <div style="position: absolute; top: 0; left: 0; width: 14px; height: 14px; border-top: 2px solid #38bdf8; border-left: 2px solid #38bdf8;"></div>
          <div style="position: absolute; top: 0; right: 0; width: 14px; height: 14px; border-top: 2px solid #38bdf8; border-right: 2px solid #38bdf8;"></div>
          <div style="position: absolute; bottom: 0; left: 0; width: 14px; height: 14px; border-bottom: 2px solid #38bdf8; border-left: 2px solid #38bdf8;"></div>
          <div style="position: absolute; bottom: 0; right: 0; width: 14px; height: 14px; border-bottom: 2px solid #38bdf8; border-right: 2px solid #38bdf8;"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background: #38bdf8; border-radius: 50%; transform: translate(-50%, -50%);"></div>
        </div>

        <!-- Corner Viewport Brackets -->
        <div style="position: absolute; top: 20px; left: 20px; width: 30px; height: 30px; border-top: 2px solid rgba(56,189,248,0.4); border-left: 2px solid rgba(56,189,248,0.4);"></div>
        <div style="position: absolute; top: 20px; right: 20px; width: 30px; height: 30px; border-top: 2px solid rgba(56,189,248,0.4); border-right: 2px solid rgba(56,189,248,0.4);"></div>
        <div style="position: absolute; bottom: 40px; left: 20px; width: 30px; height: 30px; border-bottom: 2px solid rgba(56,189,248,0.4); border-left: 2px solid rgba(56,189,248,0.4);"></div>
        <div style="position: absolute; bottom: 40px; right: 20px; width: 30px; height: 30px; border-bottom: 2px solid rgba(56,189,248,0.4); border-right: 2px solid rgba(56,189,248,0.4);"></div>
      </div>

      <!-- Bottom Tactical AI Intel Summary -->
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="background: rgba(3, 7, 18, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 4px 10px; font-size: 9px; color: #f8fafc; display: flex; align-items: center; gap: 8px;">
          <span style="color: #38bdf8; font-weight: bold;">🛰️ GEOINT AI:</span>
          <span id="hud-ai-intel-summary" style="color: #cbd5e1;">MONITORING 28 MOUNTAIN CORRIDORS &bull; SATELLITE TELEMETRY SYNCHRONIZED</span>
        </div>

        <div style="background: rgba(3, 7, 18, 0.88); backdrop-filter: blur(8px); border: 1px solid #334155; border-radius: 6px; padding: 3px 8px; font-size: 8px; color: #94a3b8;">
          HOTKEYS: <strong>[1-6]</strong> Optics &bull; <strong>[H]</strong> HUD &bull; <strong>[D]</strong> Detection
        </div>
      </div>
    `;
  }

  private bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        this.toggleHud();
      } else if (e.key === 'd' || e.key === 'D') {
        this.toggleDetectionMesh();
      }
    });
  }
}
