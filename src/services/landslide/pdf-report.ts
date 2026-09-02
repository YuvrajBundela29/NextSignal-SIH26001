import type { DistrictProfile, WeatherTelemetry, SoilTelemetry, SeismicTelemetry, RiskScoreBreakdown } from './types';
import type { AiAdvisoryResponse } from './ollama-advisory';

export function exportDistrictSituationReport(
 district: DistrictProfile,
 risk: RiskScoreBreakdown,
 weather: WeatherTelemetry,
 soil: SoilTelemetry,
 seismic: SeismicTelemetry,
 aiAdvisory: AiAdvisoryResponse
): void {
 const printWindow = window.open('', '_blank');
 if (!printWindow) {
 alert('Please allow popups to generate the District Situation Report.');
 return;
 }

 const riskColor =
 risk.level === 'CRITICAL'
 ? '#ef4444'
 : risk.level === 'HIGH'
 ? '#f97316'
 : risk.level === 'MODERATE'
 ? '#eab308'
 : '#22c55e';

 const html = `
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>Situation Report - ${district.name} Landslide Risk Assessment</title>
 <style>
 @page { size: A4; margin: 18mm; }
 body {
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
 color: #1e293b;
 line-height: 1.5;
 margin: 0;
 padding: 20px;
 }
 .header {
 border-bottom: 2px solid #0f172a;
 padding-bottom: 12px;
 margin-bottom: 20px;
 display: flex;
 justify-content: space-between;
 align-items: flex-start;
 }
 .header h1 {
 margin: 0 0 4px 0;
 font-size: 20px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 color: #0f172a;
 }
 .header h2 {
 margin: 0;
 font-size: 13px;
 font-weight: 500;
 color: #475569;
 }
 .badge {
 display: inline-block;
 padding: 6px 14px;
 border-radius: 4px;
 color: #fff;
 font-weight: bold;
 font-size: 14px;
 letter-spacing: 0.5px;
 background: ${riskColor};
 }
 .meta-grid {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 12px;
 margin-bottom: 20px;
 background: #f8fafc;
 padding: 12px;
 border-radius: 6px;
 border: 1px solid #e2e8f0;
 font-size: 12px;
 }
 .meta-item strong {
 display: block;
 color: #64748b;
 text-transform: uppercase;
 font-size: 10px;
 }
 table {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 20px;
 font-size: 12px;
 }
 th, td {
 border: 1px solid #cbd5e1;
 padding: 8px 10px;
 text-align: left;
 }
 th {
 background: #f1f5f9;
 font-weight: 600;
 color: #334155;
 }
 .section-title {
 font-size: 14px;
 font-weight: 700;
 color: #0f172a;
 border-bottom: 1px solid #cbd5e1;
 padding-bottom: 4px;
 margin: 20px 0 10px 0;
 text-transform: uppercase;
 }
 .ai-box {
 background: #f0fdf4;
 border-left: 4px solid #16a34a;
 padding: 12px;
 border-radius: 4px;
 margin-bottom: 15px;
 font-size: 12px;
 }
 .footer {
 margin-top: 30px;
 border-top: 1px dashed #cbd5e1;
 padding-top: 10px;
 font-size: 10px;
 color: #64748b;
 display: flex;
 justify-content: space-between;
 }
 @media print {
 body { padding: 0; }
 .no-print { display: none; }
 }
 </style>
</head>
<body>
 <div class="header">
 <div>
 <h1>Ministry of Development of North Eastern Region (MDoNER)</h1>
 <h2>National Landslide Early Warning & Decision Support System (SIH26001)</h2>
 <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Report Generated: ${new Date().toLocaleString('en-IN')} | Station: NER-EWS-01</p>
 </div>
 <div style="text-align: right;">
 <div class="badge">${risk.level} HAZARD LEVEL</div>
 <div style="font-size: 11px; margin-top: 4px; font-weight: bold; color: #334155;">Composite Risk: ${risk.compositeScore} / 100</div>
 </div>
 </div>

 <div class="meta-grid">
 <div class="meta-item">
 <strong>District & State</strong>
 ${district.name} (${district.state})
 </div>
 <div class="meta-item">
 <strong>Coordinates</strong>
 ${district.lat.toFixed(4)}N, ${district.lon.toFixed(4)}E
 </div>
 <div class="meta-item">
 <strong>Mean Slope & Elevation</strong>
 ${district.averageSlopeDeg} gradient | ${district.elevationM}m MSL
 </div>
 <div class="meta-item">
 <strong>Geological Substratum</strong>
 ${district.geologyType}
 </div>
 <div class="meta-item">
 <strong>Historical Event Density</strong>
 ${district.historicalEventCount} NASA/GSI Catalog Disasters
 </div>
 <div class="meta-item">
 <strong>DEOC Emergency Contact</strong>
 ${district.deocContact} (24/7 Line)
 </div>
 </div>

 <div class="section-title">1. Real-Time Telemetry & Multi-Source Sensor Ingestion</div>
 <table>
 <thead>
 <tr>
 <th>Sensor / Dataset Parameter</th>
 <th>Recorded Value</th>
 <th>Threshold / Baseline</th>
 <th>Status</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td>Current Rainfall Intensity</td>
 <td>${weather.currentRainfallMm} mm/hr</td>
 <td>15.0 mm/hr</td>
 <td>${weather.currentRainfallMm > 15 ? ' Elevated' : ' Normal'}</td>
 </tr>
 <tr>
 <td>24h Cumulative Precipitation (Open-Meteo)</td>
 <td>${weather.rainfall24hMm} mm</td>
 <td>64.5 mm (IMD Heavy Rain Threshold)</td>
 <td>${weather.rainfall24hMm >= 64.5 ? ' CRITICAL DELUGE' : ' Below Critical'}</td>
 </tr>
 <tr>
 <td>72h Antecedent Rainfall Accumulation</td>
 <td>${weather.rainfall72hMm} mm</td>
 <td>150.0 mm</td>
 <td>${weather.rainfall72hMm >= 150 ? ' High Saturation' : ' Normal'}</td>
 </tr>
 <tr>
 <td>Root-Zone Soil Moisture (NASA POWER)</td>
 <td>${soil.soilMoisturePct}% (${soil.soilSaturationStatus})</td>
 <td>75.0% (Plastic Limit)</td>
 <td>${soil.soilMoisturePct >= 75 ? ' Pore Pressure High' : ' Stable'}</td>
 </tr>
 <tr>
 <td>Seismic Shake Acceleration (USGS 72h)</td>
 <td>Max M${seismic.maxMagnitude72h} (${seismic.recentQuakes72hCount} events)</td>
 <td>M4.0 within 100km</td>
 <td>${seismic.recentQuakes72hCount > 0 ? ' Active Tectonic Stress' : ' Quiescent'}</td>
 </tr>
 </tbody>
 </table>

 <div class="section-title">2. Factor Contribution & Weight Analysis</div>
 <table>
 <thead>
 <tr>
 <th>Model Component</th>
 <th>Weight</th>
 <th>Raw Score</th>
 <th>Weighted Contribution</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td>Slope Angle & Terrain Ruggedness (Open-Elevation)</td>
 <td>25%</td>
 <td>${risk.slopeScore}/100</td>
 <td>${risk.weightedSlope} pts</td>
 </tr>
 <tr>
 <td>Cumulative & Real-time Precipitation (Open-Meteo)</td>
 <td>30%</td>
 <td>${risk.rainfallScore}/100</td>
 <td>${risk.weightedRainfall} pts</td>
 </tr>
 <tr>
 <td>Root-Zone Soil Moisture Saturation (NASA POWER)</td>
 <td>20%</td>
 <td>${risk.soilScore}/100</td>
 <td>${risk.weightedSoil} pts</td>
 </tr>
 <tr>
 <td>72h Regional Seismic Shake Factor (USGS)</td>
 <td>15%</td>
 <td>${risk.seismicScore}/100</td>
 <td>${risk.weightedSeismic} pts</td>
 </tr>
 <tr>
 <td>Historical Landslide Clustering (NASA COOLR)</td>
 <td>10%</td>
 <td>${risk.historicalScore}/100</td>
 <td>${risk.weightedHistorical} pts</td>
 </tr>
 </tbody>
 </table>

 <div class="section-title">3. AI Situation Assessment & Advisory Directives</div>
 <div class="ai-box">
 <strong>Executive Situation Summary:</strong>
 <p style="margin: 4px 0 8px 0;">${aiAdvisory.analysis}</p>
 <strong>Recommended Civil Defense Directives:</strong>
 <ul style="margin: 4px 0 0 0; padding-left: 18px;">
 ${aiAdvisory.mitigationSteps.map((step) => '<li>' + step + '</li>').join('')}
 </ul>
 </div>

 <div class="footer">
 <span>Authorized by MDoNER National Disaster Warning Portal</span>
 <span>Generated via NextSignal-SIH26001 AI Engine (Model: ${aiAdvisory.sourceModel})</span>
 </div>

 <script>
 window.onload = function() {
 setTimeout(function() { window.print(); }, 500);
 };
 </script>
</body>
</html>
 `;

 printWindow.document.open();
 printWindow.document.write(html);
 printWindow.document.close();
}
