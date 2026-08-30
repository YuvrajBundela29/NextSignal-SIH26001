import { NER_HIGHWAY_ROUTES, type HighwayNavigationRoute, type HighwayStep } from '../../services/landslide/highway-navigation';

export class HighwayNavigationModal {
  private container: HTMLElement;
  private selectedRoute: HighwayNavigationRoute = NER_HIGHWAY_ROUTES[0];
  private selectedStep: HighwayStep | null = null;
  private onFlyToWaypoint: (lat: number, lon: number, zoom: number) => void;

  constructor(onFlyToWaypoint: (lat: number, lon: number, zoom: number) => void) {
    this.onFlyToWaypoint = onFlyToWaypoint;
    let el = document.getElementById('highway-nav-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'highway-nav-modal';
      el.style.display = 'none';
      document.body.appendChild(el);
    }
    this.container = el;
  }

  public open(routeId?: string) {
    if (routeId) {
      const found = NER_HIGHWAY_ROUTES.find(r => r.id === routeId);
      if (found) this.selectedRoute = found;
    }
    this.container.style.display = 'flex';
    this.render();
  }

  public close() {
    this.container.style.display = 'none';
  }

  public render() {
    const r = this.selectedRoute;
    const badgeColor =
      r.currentPassStatus === 'RESTRICTED' ? '#ef4444' : r.currentPassStatus === 'ADVISORY' ? '#f97316' : '#22c55e';

    this.container.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 2500; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Inter', system-ui, sans-serif;">
        <div style="background: #0f172a; border: 1px solid #0284c7; border-radius: 12px; max-width: 680px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 16px 40px rgba(2,132,199,0.4); color: #f8fafc;">
          
          <!-- Top Header -->
          <div style="background: #090d16; padding: 14px 18px; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background: #0284c7; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800;">
                NH
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #ffffff;">
                  National Highway Corridor & Choke-Point Inspector
                </div>
                <div style="font-size: 11px; color: #94a3b8;">
                  Northeast Strategic Arterial Road Pass Advisory
                </div>
              </div>
            </div>
            <button id="btn-close-nav-modal" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: bold; cursor: pointer;">✕ Close</button>
          </div>

          <!-- Highway Route Selector Tabs -->
          <div style="display: flex; background: #0f172a; border-bottom: 1px solid #1e293b; padding: 6px 12px; gap: 6px; overflow-x: auto;">
            ${NER_HIGHWAY_ROUTES.map(route => `
              <button class="nav-route-tab ${route.id === r.id ? 'active' : ''}" data-id="${route.id}" style="background: ${route.id === r.id ? '#0284c7' : '#1e293b'}; color: ${route.id === r.id ? '#ffffff' : '#94a3b8'}; border: 1px solid ${route.id === r.id ? '#38bdf8' : '#334155'}; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap;">
                ${route.code} (${route.origin.split(' ')[0]} → ${route.destination.split(' ')[0]})
              </button>
            `).join('')}
          </div>

          <!-- Route Summary Overview Card -->
          <div style="padding: 14px 18px; background: #0b1120; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #ffffff;">
                ${r.name}
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                ${r.origin} → ${r.destination} &bull; ${r.totalDistanceKm} km &bull; Typical Duration: ${r.typicalDuration}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="background: ${badgeColor}; color: white; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 4px;">
                ${r.currentPassStatus}
              </span>
              <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                Vulnerability: <strong style="color: ${badgeColor};">${r.overallVulnerability}</strong>
              </div>
            </div>
          </div>

          <!-- Turn-by-Turn Waypoint List -->
          <div style="flex: 1; overflow-y: auto; padding: 12px 18px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
              Route Waypoints & Landslide Choke-Points
            </div>
            ${r.steps.map((step, idx) => `
              <div class="nav-step-item" data-idx="${idx}" style="background: #111827; border: 1px solid #1f2937; border-left: 3px solid ${step.status === 'BLOCKED' || step.status === 'RESTRICTED' ? '#ef4444' : step.status === 'CAUTION' ? '#f97316' : '#22c55e'}; border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: background 0.15s ease;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <strong style="color: #ffffff; font-size: 12px;">${idx + 1}. ${step.instruction}</strong>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                      Chainage: ${step.chainageKm} km &bull; Elevation: ${step.elevationM}m MSL &bull; Rain: ${step.rainfallMm}mm
                    </div>
                  </div>
                  <button class="btn-step-flyto" data-lat="${step.lat}" data-lon="${step.lon}" style="background: #0284c7; color: white; border: none; border-radius: 4px; padding: 3px 8px; font-size: 10px; font-weight: bold; cursor: pointer;">
                    Inspect Map
                  </button>
                </div>
                ${step.hazardType ? `<div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; padding: 4px 8px; margin-top: 6px; font-size: 10px; color: #fca5a5;">⚠️ Active Hazard: <strong>${step.hazardType}</strong> &bull; Status: ${step.status}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind Close
    document.getElementById('btn-close-nav-modal')?.addEventListener('click', () => this.close());

    // Bind Tabs
    this.container.querySelectorAll('.nav-route-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const found = NER_HIGHWAY_ROUTES.find(r => r.id === id);
        if (found) {
          this.selectedRoute = found;
          this.render();
        }
      });
    });

    // Bind Fly To
    this.container.querySelectorAll('.btn-step-flyto').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lat = parseFloat((e.currentTarget as HTMLElement).dataset.lat || '0');
        const lon = parseFloat((e.currentTarget as HTMLElement).dataset.lon || '0');
        if (lat && lon) {
          this.onFlyToWaypoint(lat, lon, 12);
          this.close();
        }
      });
    });
  }
}
