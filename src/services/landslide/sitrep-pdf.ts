import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry, SoilTelemetry, SeismicTelemetry } from './types';
import { NER_DISTRICTS } from './ner-districts';
import { NER_HIGHWAY_ROUTES } from './highway-navigation';
import { NER_SAFE_SHELTERS } from './safe-shelters';
import { NER_RIVER_GAUGES } from './river-gauges';

export function openPrintableSitRepPdf(
 riskMap: Map<string, RiskScoreBreakdown>,
 weatherMap: Map<string, WeatherTelemetry>,
 soilMap: Map<string, SoilTelemetry>,
 seismicMap: Map<string, SeismicTelemetry>,
 selectedDistrictId: string
) {
 const now = new Date();
 const dateStr = now.toUTCString();
 const docId = `SITREP-NER-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

 const activeCritical = NER_DISTRICTS.filter(d => riskMap.get(d.id)?.level === 'CRITICAL');
 const activeHigh = NER_DISTRICTS.filter(d => riskMap.get(d.id)?.level === 'HIGH');
 const activeMod = NER_DISTRICTS.filter(d => riskMap.get(d.id)?.level === 'MODERATE');

 const selectedDistrict = NER_DISTRICTS.find(d => d.id === selectedDistrictId) || NER_DISTRICTS[0];
 const selectedRisk = riskMap.get(selectedDistrict.id);
 const selectedWeather = weatherMap.get(selectedDistrict.id);
 const selectedSoil = soilMap.get(selectedDistrict.id);

 const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8" />
 <title>NextSignal Situation Intelligence Report ${docId}</title>
 <style>
 @page {
 size: A4 portrait;
 margin: 15mm 15mm 15mm 15mm;
 }
 body {
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
 color: #0f172a;
 background: #ffffff;
 margin: 0;
 padding: 24px;
 font-size: 12px;
 line-height: 1.5;
 }
 .header-bar {
 display: flex;
 justify-content: space-between;
 align-items: center;
 border-bottom: 2px solid #0284c7;
 padding-bottom: 12px;
 margin-bottom: 16px;
 }
 .header-title {
 font-size: 20px;
 font-weight: 900;
 color: #0369a1;
 letter-spacing: 0.5px;
 }
 .header-sub {
 font-size: 11px;
 color: #64748b;
 font-weight: 600;
 }
 .badge-classified {
 background: #fee2e2;
 color: #b91c1c;
 border: 1px solid #f87171;
 font-size: 10px;
 font-weight: bold;
 padding: 4px 10px;
 border-radius: 4px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 }
 .meta-grid {
 display: grid;
 grid-template-columns: repeat(4, 1fr);
 gap: 10px;
 background: #f8fafc;
 border: 1px solid #e2e8f0;
 border-radius: 6px;
 padding: 10px 14px;
 margin-bottom: 18px;
 }
 .meta-item strong {
 display: block;
 font-size: 10px;
 color: #64748b;
 text-transform: uppercase;
 }
 .meta-item span {
 font-size: 13px;
 font-weight: 700;
 color: #0f172a;
 }
 h2 {
 font-size: 13px;
 color: #0284c7;
 border-bottom: 1px solid #cbd5e1;
 padding-bottom: 4px;
 margin-top: 18px;
 margin-bottom: 8px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 }
 table {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 14px;
 font-size: 11px;
 }
 th {
 background: #f1f5f9;
 color: #334155;
 text-align: left;
 padding: 6px 8px;
 border: 1px solid #cbd5e1;
 font-weight: 700;
 font-size: 10px;
 text-transform: uppercase;
 }
 td {
 padding: 6px 8px;
 border: 1px solid #e2e8f0;
 }
 .badge-crit { background: #ef4444; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
 .badge-high { background: #f97316; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
 .badge-mod { background: #eab308; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
 .badge-low { background: #10b981; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
 
 .card-box {
 background: #f8fafc;
 border-left: 3px solid #0284c7;
 padding: 10px 14px;
 border-radius: 0 6px 6px 0;
 margin-bottom: 12px;
 }
 .print-actions {
 margin-bottom: 20px;
 display: flex;
 gap: 10px;
 }
 .btn-print {
 background: #0284c7;
 color: white;
 border: none;
 padding: 8px 18px;
 border-radius: 6px;
 font-weight: bold;
 cursor: pointer;
 font-size: 12px;
 }
 .btn-close {
 background: #64748b;
 color: white;
 border: none;
 padding: 8px 18px;
 border-radius: 6px;
 font-weight: bold;
 cursor: pointer;
 font-size: 12px;
 }
 @media print {
 .print-actions { display: none; }
 body { padding: 0; }
 }
 </style>
</head>
<body>

 <div class="print-actions">
 <button class="btn-print" onclick="window.print()"> Print / Save as PDF</button>
 <button class="btn-close" onclick="window.close()"> Close</button>
 </div>

 <div class="header-bar">
 <div>
 <div class="header-title">NEXTSIGNAL SITUATION INTELLIGENCE REPORT</div>
 <div class="header-sub">Ministry of Development of North Eastern Region (MDoNER) &bull; Disaster Operations Center</div>
 </div>
 <div class="badge-classified">OFFICIAL INCIDENT SITREP</div>
 </div>

 <div class="meta-grid">
 <div class="meta-item">
 <strong>Document ID</strong>
 <span>${docId}</span>
 </div>
 <div class="meta-item">
 <strong>Generated (UTC)</strong>
 <span>${dateStr.slice(0, 22)}</span>
 </div>
 <div class="meta-item">
 <strong>Active Critical Threats</strong>
 <span style="color: #ef4444;">${activeCritical.length} Districts</span>
 </div>
 <div class="meta-item">
 <strong>Focus Target</strong>
 <span>${selectedDistrict.name}</span>
 </div>
 </div>

 <h2>1. Executive Theater Overview</h2>
 <p>
 Real-time multi-hazard telemetry analysis across 28 vulnerable mountain districts in the North Eastern Region of India (Assam, Meghalaya, Sikkim, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura). 
 A total of <strong>${activeCritical.length} Critical</strong>, <strong>${activeHigh.length} High</strong>, and <strong>${activeMod.length} Moderate</strong> geohazard alerts are actively monitored.
 </p>

 <h2>2. Critical & High-Risk District Geohazard Matrix</h2>
 <table>
 <thead>
 <tr>
 <th>District / State</th>
 <th>Risk Level</th>
 <th>Score</th>
 <th>Dominant Trigger</th>
 <th>24h Rainfall</th>
 <th>Soil Saturation</th>
 <th>DEOC Contact</th>
 </tr>
 </thead>
 <tbody>
 ${[...activeCritical, ...activeHigh].map(d => {
 const r = riskMap.get(d.id);
 const w = weatherMap.get(d.id);
 const s = soilMap.get(d.id);
 const isCrit = r?.level === 'CRITICAL';
 return `
 <tr>
 <td><strong>${d.name}</strong> (${d.state})</td>
 <td><span class="${isCrit ? 'badge-crit' : 'badge-high'}">${r?.level}</span></td>
 <td><strong>${r?.compositeScore}/100</strong></td>
 <td>${r?.dominantTrigger}</td>
 <td>${w?.rainfall24hMm || 0} mm</td>
 <td>${s?.soilMoisturePct || 0}% (${s?.soilSaturationStatus})</td>
 <td><strong>${d.deocContact}</strong></td>
 </tr>
 `;
 }).join('') || '<tr><td colspan="7">No districts currently in Critical or High risk state.</td></tr>'}
 </tbody>
 </table>

 <h2>3. Focus Target Geotechnical Analysis (${selectedDistrict.name}, ${selectedDistrict.state})</h2>
 <div class="card-box">
 <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
 <strong style="font-size: 13px; color: #0284c7;">Mohr-Coulomb Factor of Safety (FoS) Stability Assessment</strong>
 <span style="font-weight: bold; color: ${selectedRisk?.level === 'CRITICAL' ? '#ef4444' : selectedRisk?.level === 'HIGH' ? '#f97316' : '#10b981'};">
 Risk: ${selectedRisk?.compositeScore}/100 [${selectedRisk?.level}]
 </span>
 </div>
 <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
 Mathematical Equilibrium: <em>FoS = [c' + (_n - u) tan(')] / </em> (Cohesion c'=15 kPa, Friction angle '=32, Mean Slope: ${selectedDistrict.averageSlopeDeg})
 </div>
 <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px;">
 <div><strong>Elevation:</strong> ${selectedDistrict.elevationM}m MSL</div>
 <div><strong>24h Precipitation:</strong> ${selectedWeather?.rainfall24hMm || 0} mm</div>
 <div><strong>Root-Zone Moisture:</strong> ${selectedSoil?.soilMoisturePct || 0}%</div>
 <div><strong>DEOC Control Helpline:</strong> ${selectedDistrict.deocContact}</div>
 </div>
 </div>

 <h2>4. Arterial Highway Corridors & Choke Points</h2>
 <table>
 <thead>
 <tr>
 <th>Corridor</th>
 <th>Route</th>
 <th>Pass Status</th>
 <th>Vulnerability</th>
 <th>Managing Authority</th>
 <th>Emergency Helpline</th>
 </tr>
 </thead>
 <tbody>
 ${NER_HIGHWAY_ROUTES.map(h => `
 <tr>
 <td><strong>${h.name}</strong></td>
 <td>${h.origin} ${h.destination}</td>
 <td><span class="${h.currentPassStatus === 'BLOCKED' ? 'badge-crit' : h.currentPassStatus === 'ADVISORY' ? 'badge-high' : 'badge-low'}">${h.currentPassStatus}</span></td>
 <td>${h.overallVulnerability}</td>
 <td>${h.managingAuthority}</td>
 <td><strong>${h.emergencyControlRoom}</strong></td>
 </tr>
 `).join('')}
 </tbody>
 </table>

 <h2>5. Hydrological GLOF & Flash Flood River Gauges</h2>
 <table>
 <thead>
 <tr>
 <th>Station Name</th>
 <th>River Basin</th>
 <th>Current Water Level</th>
 <th>Warning Level</th>
 <th>Danger Mark</th>
 <th>GLOF / Flash Flood Risk</th>
 </tr>
 </thead>
 <tbody>
 ${NER_RIVER_GAUGES.map(g => `
 <tr>
 <td><strong>${g.stationName}</strong></td>
 <td>${g.riverName}</td>
 <td><strong>${g.currentLevelM} m</strong> (${g.trend})</td>
 <td>${g.warningLevelM} m</td>
 <td>${g.dangerLevelM} m</td>
 <td><span class="${g.glofRisk === 'HIGH' ? 'badge-crit' : 'badge-low'}">${g.glofRisk}</span></td>
 </tr>
 `).join('')}
 </tbody>
 </table>

 <h2>6. Designated Safe Shelters & Evacuation Centers</h2>
 <table>
 <thead>
 <tr>
 <th>Shelter Name</th>
 <th>Facility Type</th>
 <th>Capacity</th>
 <th>Elevation</th>
 <th>Emergency Contact</th>
 </tr>
 </thead>
 <tbody>
 ${NER_SAFE_SHELTERS.slice(0, 6).map(s => `
 <tr>
 <td><strong>${s.name}</strong></td>
 <td>${s.type}</td>
 <td><strong>${s.capacityPersons.toLocaleString()} Persons</strong></td>
 <td>${s.elevationM}m MSL</td>
 <td>${s.contactNumber}</td>
 </tr>
 `).join('')}
 </tbody>
 </table>

 <div style="margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
 <div>Official Intelligence Report &bull; Ministry of Development of North Eastern Region (MDoNER)</div>
 <div>Page 1 of 1 &bull; Automated System Verification</div>
 </div>

 <script>
 // Automatically open print dialog for instant PDF download
 window.onload = function() {
 setTimeout(function() {
 window.print();
 }, 500);
 };
 </script>
</body>
</html>
 `;

 const printWindow = window.open('', '_blank');
 if (printWindow) {
 printWindow.document.open();
 printWindow.document.write(htmlContent);
 printWindow.document.close();
 }
}