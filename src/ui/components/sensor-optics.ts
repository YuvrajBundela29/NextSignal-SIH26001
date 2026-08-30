export type SensorOpticMode = 'natural' | 'flir' | 'nvg' | 'crt' | 'noir' | 'arctic';

export interface SensorOpticDefinition {
  id: SensorOpticMode;
  name: string;
  badge: string;
  description: string;
  filterCss: string;
  overlayClass: string;
}

export const SENSOR_OPTICS: Record<SensorOpticMode, SensorOpticDefinition> = {
  natural: {
    id: 'natural',
    name: 'Natural RGB',
    badge: 'OPTICAL VIS',
    description: 'High-definition natural optical spectrum',
    filterCss: 'none',
    overlayClass: '',
  },
  flir: {
    id: 'flir',
    name: 'FLIR Thermal',
    badge: 'THERMAL FLIR',
    description: 'Thermal infrared heat gradient for slope saturation and surface temperature',
    filterCss: 'contrast(180%) brightness(110%) hue-rotate(280deg) saturate(250%)',
    overlayClass: 'optic-flir-active',
  },
  nvg: {
    id: 'nvg',
    name: 'Night Vision (NVG)',
    badge: 'NIGHT VISION',
    description: 'High-gain tactical night vision with luminous emerald amplification',
    filterCss: 'brightness(130%) contrast(170%) saturate(150%) hue-rotate(85deg) sepia(100%)',
    overlayClass: 'optic-nvg-active',
  },
  crt: {
    id: 'crt',
    name: 'CRT Tactical Scanline',
    badge: 'CRT TERMINAL',
    description: 'Cathode-ray tactical terminal with green phosphor scanlines',
    filterCss: 'brightness(120%) contrast(190%) hue-rotate(75deg) sepia(90%)',
    overlayClass: 'optic-crt-active',
  },
  noir: {
    id: 'noir',
    name: 'Recon Noir (High-Contrast)',
    badge: 'NOIR SHADOW',
    description: 'Monochrome shadow mapping for rock fracture and fault line detection',
    filterCss: 'grayscale(100%) contrast(220%) brightness(90%)',
    overlayClass: 'optic-noir-active',
  },
  arctic: {
    id: 'arctic',
    name: 'Rock Scar / Albedo',
    badge: 'ALBEDO SCAR',
    description: 'High-albedo spectral filter for fresh landslide debris and scar identification',
    filterCss: 'contrast(160%) brightness(140%) hue-rotate(180deg) saturate(120%)',
    overlayClass: 'optic-arctic-active',
  },
};

export class SensorOpticsManager {
  private currentMode: SensorOpticMode = 'natural';
  private targetElements: HTMLElement[] = [];
  private onModeChangeCallbacks: ((mode: SensorOpticMode) => void)[] = [];

  constructor() {
    this.injectOpticsStyles();
    this.bindKeyboardShortcuts();
  }

  public registerTarget(element: HTMLElement) {
    if (!this.targetElements.includes(element)) {
      this.targetElements.push(element);
      this.applyCurrentFilter();
    }
  }

  public setMode(mode: SensorOpticMode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.applyCurrentFilter();
    this.onModeChangeCallbacks.forEach(cb => cb(mode));
  }

  public getMode(): SensorOpticMode {
    return this.currentMode;
  }

  public getDefinition(): SensorOpticDefinition {
    return SENSOR_OPTICS[this.currentMode];
  }

  public onModeChange(callback: (mode: SensorOpticMode) => void) {
    this.onModeChangeCallbacks.push(callback);
  }

  private applyCurrentFilter() {
    const def = SENSOR_OPTICS[this.currentMode];
    this.targetElements.forEach(el => {
      el.style.filter = def.filterCss;
      el.setAttribute('data-sensor-optic', this.currentMode);
    });

    const badgeEl = document.getElementById('hud-optic-mode-badge');
    if (badgeEl) {
      badgeEl.textContent = def.badge;
      badgeEl.title = `${def.name}: ${def.description}`;
    }
  }

  private bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case '1': this.setMode('natural'); break;
        case '2': this.setMode('flir'); break;
        case '3': this.setMode('nvg'); break;
        case '4': this.setMode('crt'); break;
        case '5': this.setMode('noir'); break;
        case '6': this.setMode('arctic'); break;
      }
    });
  }

  private injectOpticsStyles() {
    if (document.getElementById('sensor-optics-style')) return;
    const style = document.createElement('style');
    style.id = 'sensor-optics-style';
    style.textContent = `
      [data-sensor-optic="crt"]::after {
        content: " ";
        position: absolute;
        inset: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        background-size: 100% 3px, 6px 100%;
        pointer-events: none;
        z-index: 100;
      }

      [data-sensor-optic="nvg"]::after {
        content: " ";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, transparent 40%, rgba(2, 44, 18, 0.4) 100%);
        pointer-events: none;
        z-index: 100;
      }

      [data-sensor-optic="flir"]::after {
        content: " ";
        position: absolute;
        inset: 0;
        box-shadow: inset 0 0 80px rgba(180, 20, 120, 0.25);
        pointer-events: none;
        z-index: 100;
      }
    `;
    document.head.appendChild(style);
  }
}

export const sensorOpticsManager = new SensorOpticsManager();
