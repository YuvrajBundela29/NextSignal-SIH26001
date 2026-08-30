import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry } from '../../services/landslide/types';

export class CitizenView {
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

  public render(district: DistrictProfile, risk: RiskScoreBreakdown, weather: WeatherTelemetry) {
    const isDanger = risk.level === 'CRITICAL' || risk.level === 'HIGH';
    const isCaution = risk.level === 'MODERATE';

    const statusTitle = isDanger
      ? (this.isHi ? 'उच्च भूस्खलन खतरा - सतर्क रहें' : 'HIGH LANDSLIDE DANGER - STAY ALERT')
      : isCaution
      ? (this.isHi ? 'मध्यम जोखिम - सावधानी बरतें' : 'MODERATE RISK - EXERCISE CAUTION')
      : (this.isHi ? 'क्षेत्र सुरक्षित एवं सामान्य' : 'AREA SAFE & NORMAL');

    const statusBg = isDanger ? '#ef4444' : isCaution ? '#eab308' : '#22c55e';
    const districtName = this.isHi ? (district.nameHi || district.name) : district.name;

    const citizenAdvisories = isDanger
      ? (this.isHi
          ? [
              'खड़ी ढलानों, नदी किनारों और जलभराव वाले तटबंधों से दूर रहें।',
              'पहाड़ी रास्तों और घाट सेक्शन पर गैर-जरूरी यात्रा से बचें।',
              'यदि जमीन में दरारें या झुके हुए पेड़ दिखाई दें, तो तुरंत सुरक्षित स्थान पर जाएं।',
              'आपातकालीन बैग (टॉर्च, दवाएं, पीने का पानी, जरूरी दस्तावेज) तैयार रखें।',
            ]
          : [
              'Stay away from steep slopes, river banks, and waterlogged embankments.',
              'Avoid all non-essential road travel along hill passes and ghat sections.',
              'If you observe tension cracks in ground or tilting trees, evacuate immediately.',
              'Keep an emergency grab-bag ready (Torch, medicines, drinking water, ID cards).',
            ])
      : (this.isHi
          ? [
              'स्थानीय मौसम पूर्वानुमान और आधिकारिक दिशा-निर्देशों पर नजर रखें।',
              'घर के आसपास पानी की निकासी नालियों को साफ रखें।',
              'बारिश के दौरान पहाड़ी सड़कों पर सावधानी से वाहन चलाएं।',
            ]
          : [
              'Keep track of local weather forecasts and official administrative advisories.',
              'Ensure household drainage channels are clear of debris and silt.',
              'Drive cautiously on hill roads during rainfall showers.',
            ]);

    this.container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
        <!-- Status Hero Card -->
        <div style="background: ${statusBg}18; border: 2px solid ${statusBg}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 1px;">
            ${this.isHi ? 'नागरिक सुरक्षा पोर्टल (पूर्वोत्तर भारत)' : 'CITIZEN SAFETY PORTAL (NER INDIA)'}
          </div>
          <div style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 8px 0;">
            ${districtName}, ${district.state}
          </div>
          <div style="display: inline-block; padding: 6px 18px; border-radius: 20px; background: ${statusBg}; color: #ffffff; font-weight: 800; font-size: 14px; margin-bottom: 12px;">
            ${statusTitle}
          </div>
          <div style="font-size: 13px; color: #e2e8f0; max-width: 600px; margin: 0 auto; line-height: 1.5;">
            ${this.isHi ? (risk.advisoryHi || risk.advisoryEn) : risk.advisoryEn}
          </div>
        </div>

        <!-- 3-Column Local Status -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">
              ${this.isHi ? '24 घंटे की वर्षा' : '24h Rainfall'}
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #38bdf8; margin-top: 4px;">
              ${weather.rainfall24hMm} mm
            </div>
          </div>
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">
              ${this.isHi ? 'जोखिम स्तर' : 'Composite Risk'}
            </div>
            <div style="font-size: 22px; font-weight: 800; color: ${statusBg}; margin-top: 4px;">
              ${risk.compositeScore}/100
            </div>
          </div>
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">
              ${this.isHi ? 'ढलान कोण' : 'Average Slope'}
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #f59e0b; margin-top: 4px;">
              ${district.averageSlopeDeg}°
            </div>
          </div>
        </div>

        <!-- Safety Guidelines List -->
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">
            ${this.isHi ? 'सुरक्षा दिशा-निर्देश एवं सावधानियां' : 'Safety Action Guidelines'}
          </div>
          <ul style="list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
            ${citizenAdvisories.map((a) => `
              <li style="display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                <span style="color: ${statusBg}; font-size: 14px; font-weight: bold;">●</span>
                <span>${a}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Emergency Helplines -->
        <div style="background: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 20px;">
          <div style="font-size: 14px; font-weight: 800; color: #38bdf8; margin-bottom: 12px;">
            ${this.isHi ? 'आपातकालीन हेल्पलाइन नंबर' : 'Emergency Assistance Helplines'}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
              <div style="font-size: 11px; color: #94a3b8;">${this.isHi ? 'राज्य आपदा प्रबंधन (SDMA)' : 'State Disaster Helpline (SDMA)'}</div>
              <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 2px;">1070 / 1077</div>
            </div>
            <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
              <div style="font-size: 11px; color: #94a3b8;">${this.isHi ? 'राष्ट्रीय आपदा मोचन बल (NDRF)' : 'NDRF Control Room'}</div>
              <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 2px;">011-24363260 / 112</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
