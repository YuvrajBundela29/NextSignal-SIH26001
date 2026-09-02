import type { DistrictProfile, RiskScoreBreakdown } from '../../services/landslide/types';
import { sensorOpticsManager } from './sensor-optics';

export class TacticalHudOverlay {
 private container: HTMLElement;
 private isHudVisible = true;
 private isDetectionMeshVisible = false;
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
 padding: 10px;
 box-sizing: border-box;
 font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
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

 if (latEl) latEl.textContent = `${district.lat.toFixed(4)}N`;
 if (lonEl) lonEl.textContent = `${district.lon.toFixed(4)}E`;
 if (altEl) altEl.textContent = `${district.elevationM}m MSL`;
 if (slopeEl) slopeEl.textContent = `${district.averageSlopeDeg}`;
 if (targetEl) targetEl.textContent = `${district.name.toUpperCase()} [${district.state.toUpperCase()}]`;

 if (riskBadgeEl) {
 riskBadgeEl.textContent = `${risk.compositeScore}/100 [${risk.level}]`;
 riskBadgeEl.style.color = risk.level === 'CRITICAL' ? '#ef4444' : risk.level === 'HIGH' ? '#f97316' : '#22c55e';
 }
 }

 private updateVisibility() {
 const hudGroup = document.getElementById('hud-elements-group');
 const meshGroup = document.getElementById('detection-mesh-group');

 if (hudGroup) hudGroup.style.display = this.isHudVisible ? 'block' : 'none';
 if (meshGroup) meshGroup.style.display = this.isDetectionMeshVisible ? 'block' : 'none';

 const btnHud = document.getElementById('btn-toggle-hud');
 const btnDet = document.getElementById('btn-toggle-detection');
 if (btnHud) btnHud.style.background = this.isHudVisible ? '#0284c7' : '#0f172a';
 if (btnDet) btnDet.style.background = this.isDetectionMeshVisible ? '#0284c7' : '#0f172a';
 }

 private render() {
 this.container.innerHTML = `
 <div id="hud-elements-group" style="display: ${this.isHudVisible ? 'block' : 'none'}; width: 100%;">
 <div style="display: flex; justify-content: space-between; align-items: flex-start;">
 
 <!-- Top Left: District Target Card -->
 <div style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 6px 12px; font-size: 10px; color: #f8fafc; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
 <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
 <span style="font-weight: 700; color: #38bdf8; font-size: 9px; text-transform: uppercase;">MONITORED TARGET:</span>
 <strong id="hud-target-name" style="color: #ffffff;">DIMA HASAO [ASSAM]</strong>
 <span id="hud-target-risk" style="background: rgba(234, 179, 8, 0.15); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); padding: 1px 6px; border-radius: 4px; font-weight: bold; font-size: 9px;">
 52/100 [MODERATE]
 </span>
 </div>
 <div style="display: flex; gap: 12px; color: #94a3b8; font-size: 9px;">
 <span>LAT: <strong id="hud-tel-lat" style="color: #e2e8f0;">25.1812N</strong></span>
 <span>LON: <strong id="hud-tel-lon" style="color: #e2e8f0;">93.0210E</strong></span>
 <span>ALT: <strong id="hud-tel-alt" style="color: #e2e8f0;">950m MSL</strong></span>
 <span>SLOPE: <strong id="hud-tel-slope" style="color: #e2e8f0;">34</strong></span>
 </div>
 </div>

 <!-- Top Right: Sensor Optic Badge -->
 <div style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 6px 12px; font-size: 10px; color: #f8fafc; text-align: right;">
 <div style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;">
 <span style="color: #94a3b8; font-size: 9px;">SENSOR:</span>
 <span id="hud-optic-mode-badge" style="background: #0284c7; color: white; padding: 1px 6px; border-radius: 4px; font-weight: bold; font-size: 9px;">
 OPTICAL VIS
 </span>
 </div>
 <div style="font-size: 9px; color: #38bdf8; margin-top: 2px;">
 BEARING: <strong>038 NNE</strong> &bull; FOV: <strong>60</strong>
 </div>
 </div>
 </div>
 </div>

 <!-- Center Screen: Targeting Mesh (Off by default, toggleable via Target button) -->
 <div id="detection-mesh-group" style="position: absolute; inset: 0; pointer-events: none; display: ${this.isDetectionMeshVisible ? 'block' : 'none'};">
 <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; border: 1px dashed rgba(56, 189, 248, 0.35); border-radius: 50%;"></div>
 </div>
 `;
 }

 private bindKeyboardShortcuts() {
 window.addEventListener('keydown', (e) => {
 if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
 if (e.key === 'h' || e.key === 'H') this.toggleHud();
 if (e.key === 'd' || e.key === 'D') this.toggleDetectionMesh();
 });
 }
}
