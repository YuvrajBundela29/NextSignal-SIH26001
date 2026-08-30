export type LegendType =
  | 'dark'
  | 'satellite'
  | 'thermal'
  | 'clouds'
  | 'radar'
  | 'topo'
  | 'opentopo'
  | 'flir'
  | 'nvg'
  | 'crt'
  | 'noir'
  | 'arctic';

export interface LegendDefinition {
  title: string;
  badge: string;
  gradientCss: string;
  minLabel: string;
  midLabel: string;
  maxLabel: string;
  unit: string;
  interpretation: string;
}

export const LEGEND_DEFINITIONS: Record<LegendType, LegendDefinition> = {
  dark: {
    title: 'Mohr-Coulomb Geotechnical Slope Susceptibility',
    badge: '⚠️ RISK INDEX',
    gradientCss: 'linear-gradient(90deg, #22c55e 0%, #eab308 35%, #f97316 65%, #ef4444 100%)',
    minLabel: 'Low (<35)',
    midLabel: 'Moderate (35-59)',
    maxLabel: 'Critical (>75 FoS<1.0)',
    unit: 'Score / 100',
    interpretation: 'Dynamic shear failure risk based on rainfall, soil saturation, slope angle, and PGA.',
  },
  satellite: {
    title: '4K Ultra-Clarity Visible Optical Imagery',
    badge: '🛰️ OPTICAL',
    gradientCss: 'linear-gradient(90deg, #1e3a8a 0%, #15803d 40%, #854d0e 70%, #f8fafc 100%)',
    minLabel: 'Water / Forest',
    midLabel: 'Vegetation / Terraces',
    maxLabel: 'Rock / Snowpack',
    unit: 'Reflectance',
    interpretation: 'High-resolution true color optical earth observation from Sentinel-2 & Landsat-9.',
  },
  thermal: {
    title: 'Live Land Surface Thermal Temperature (°C)',
    badge: '🌡️ THERMAL LST',
    gradientCss: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 25%, #22c55e 50%, #eab308 75%, #ef4444 100%)',
    minLabel: '5°C (Alpine)',
    midLabel: '22°C (Temperate)',
    maxLabel: '42°C+ (Tropical/Basin)',
    unit: '°C Surface Temp',
    interpretation: 'Satellite thermal infrared radiance mapping soil temperature and moisture heat flux.',
  },
  clouds: {
    title: 'Satellite Infrared Convective Cloud Tops (%)',
    badge: '☁️ CLOUD RADAR',
    gradientCss: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, #0284c7 30%, #38bdf8 60%, #e0e7ff 85%, #a855f7 100%)',
    minLabel: '0% Clear Sky',
    midLabel: '50% Cumulus',
    maxLabel: '>90% Deep Convective Storm',
    unit: '% Cloud Cover',
    interpretation: 'Infrared cloud top brightness temperature identifying severe monsoonal cloudburst cells.',
  },
  radar: {
    title: 'Live Doppler Weather Radar & Deluge Rate',
    badge: '📡 DOPPLER PRECIP',
    gradientCss: 'linear-gradient(90deg, #0284c7 0%, #22c55e 25%, #eab308 50%, #f97316 75%, #ef4444 100%)',
    minLabel: '0.1 mm/h (Drizzle)',
    midLabel: '10 mm/h (Heavy Rain)',
    maxLabel: '>50 mm/h (Cloudburst Deluge)',
    unit: 'mm/h Intensity',
    interpretation: 'Real-time meteorological Doppler radar tracking incoming high-intensity precipitation raincells.',
  },
  topo: {
    title: 'Topographic Elevation & Mountain Relief (m MSL)',
    badge: '⛰️ TOPOGRAPHY',
    gradientCss: 'linear-gradient(90deg, #15803d 0%, #84cc16 20%, #eab308 45%, #b45309 70%, #f8fafc 100%)',
    minLabel: '0m (Brahmaputra Valley)',
    midLabel: '1,500m (Khasi Plateau)',
    maxLabel: '6,000m+ (Himalayan Peaks)',
    unit: 'm Elevation MSL',
    interpretation: 'Digital Elevation Model (DEM) showing terrain contours, slope angles, and valley cuts.',
  },
  opentopo: {
    title: 'OpenTopo High-Density Mountain Contours',
    badge: '🗺️ CONTOURS',
    gradientCss: 'linear-gradient(90deg, #166534 0%, #ca8a04 40%, #7c2d12 75%, #ffffff 100%)',
    minLabel: 'Valleys',
    midLabel: 'Escarpment Ridges',
    maxLabel: 'Glacial Horns',
    unit: '20m Contour Intervals',
    interpretation: 'Detailed topographic contour lines and hillshading for tactical route inspection.',
  },
  flir: {
    title: 'Ironbow FLIR Thermal Sensor Radiance',
    badge: '🔥 FLIR OPTIC',
    gradientCss: 'linear-gradient(90deg, #000033 0%, #4a0e4e 30%, #c2185b 60%, #ffb300 85%, #ffffff 100%)',
    minLabel: 'Cold (Saturated Soil)',
    midLabel: 'Ambient Slopes',
    maxLabel: 'Hot (Exposed Rock/Heated Ground)',
    unit: 'IR Radiance Flux',
    interpretation: 'Military thermal imaging highlighting water-saturated cold slide zones and solar-heated scarps.',
  },
  nvg: {
    title: 'Night Vision (NVG) Luminous Amplification',
    badge: '🟢 NVG OPTIC',
    gradientCss: 'linear-gradient(90deg, #022c12 0%, #15803d 40%, #22c55e 75%, #a7f3d0 100%)',
    minLabel: 'Shadow Cut',
    midLabel: 'Ambient Starlight',
    maxLabel: 'Phosphor Peak',
    unit: 'Luminous Gain (lux)',
    interpretation: 'High-gain tactical night vision sensor enhancing low-light terrain visibility.',
  },
  crt: {
    title: 'CRT Tactical Scanline Terminal Mode',
    badge: '📟 CRT OPTIC',
    gradientCss: 'linear-gradient(90deg, #052e16 0%, #16a34a 50%, #4ade80 100%)',
    minLabel: 'Blank Beam',
    midLabel: 'Active Trace',
    maxLabel: 'Phosphor Flash',
    unit: 'Scanline Rate',
    interpretation: 'Cathode-ray tactical terminal look with green phosphor scanline grids.',
  },
  noir: {
    title: 'Recon Noir High-Contrast Shadow Mapping',
    badge: '🌑 NOIR OPTIC',
    gradientCss: 'linear-gradient(90deg, #000000 0%, #475569 50%, #f8fafc 100%)',
    minLabel: 'Deep Shadows (Fissures)',
    midLabel: 'Midtone Slopes',
    maxLabel: 'Direct Sunlight Highlights',
    unit: 'Grayscale Contrast',
    interpretation: 'High-contrast monochrome filter highlighting tectonic fault lines, fractures, and escarpments.',
  },
  arctic: {
    title: 'Arctic / High-Albedo Landslide Scar Detection',
    badge: '❄️ ALBEDO OPTIC',
    gradientCss: 'linear-gradient(90deg, #0f172a 0%, #0284c7 40%, #7dd3fc 75%, #ffffff 100%)',
    minLabel: 'Vegetated Slope',
    midLabel: 'Glacial Silt / Moraine',
    maxLabel: 'Fresh Rock Detachment Scar',
    unit: 'Albedo Index',
    interpretation: 'Spectral albedo enhancement highlighting exposed, non-vegetated landslide detachments.',
  },
};

export class MapLegendBar {
  private container: HTMLElement;
  private currentLegend: LegendType = 'dark';

  constructor(parentContainerId: string) {
    const parent = document.getElementById(parentContainerId);
    if (!parent) throw new Error(`Parent #${parentContainerId} not found`);

    this.container = document.createElement('div');
    this.container.id = 'map-data-scale-bar-root';
    this.container.style.cssText = `
      position: absolute;
      bottom: 24px;
      left: 14px;
      z-index: 450;
      pointer-events: all;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: opacity 0.2s ease, transform 0.2s ease;
    `;
    parent.appendChild(this.container);

    this.render();
  }

  public setLegend(type: LegendType) {
    this.currentLegend = type;
    this.render();
  }

  private render() {
    const def = LEGEND_DEFINITIONS[this.currentLegend] || LEGEND_DEFINITIONS.dark;

    this.container.innerHTML = `
      <div style="background: rgba(5, 8, 17, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 8px; padding: 7px 12px; color: #f8fafc; font-size: 10px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.85); min-width: 260px; max-width: 320px;">
        
        <!-- Legend Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="background: #0284c7; color: #ffffff; font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 3px; letter-spacing: 0.5px;">
              ${def.badge}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #f8fafc;">
              ${def.title}
            </span>
          </div>
          <span style="font-size: 9px; color: #38bdf8; font-family: monospace; font-weight: bold;">
            ${def.unit}
          </span>
        </div>

        <!-- Color Gradient Bar -->
        <div style="width: 100%; height: 8px; border-radius: 4px; background: ${def.gradientCss}; margin-bottom: 4px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);"></div>

        <!-- Scale Ticks -->
        <div style="display: flex; justify-content: space-between; font-size: 8px; color: #cbd5e1; font-weight: 600; font-family: monospace;">
          <span>${def.minLabel}</span>
          <span>${def.midLabel}</span>
          <span>${def.maxLabel}</span>
        </div>

        <!-- Interpretation Caption -->
        <div style="font-size: 8px; color: #94a3b8; margin-top: 3px; line-height: 1.2; border-top: 1px solid rgba(51, 65, 85, 0.5); padding-top: 3px;">
          ${def.interpretation}
        </div>
      </div>
    `;
  }
}
