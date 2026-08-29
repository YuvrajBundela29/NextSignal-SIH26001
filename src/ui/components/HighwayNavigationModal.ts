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
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 2500; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: system-ui, sans-serif;">
        <div style="background: #0f172a; border: 1px solid #0284c7; border-radius: 12px; max-width: 680px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 16px 40px rgba(2,132,199,0.4); color: #f8fafc;">
          
          <!-- Top Google Maps Header -->
          <div style="background: #090d16; padding: 14px 18px; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background: #0284c7; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                🧭
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #ffffff;">
                  National Highway Route Navigator & Choke-Point Inspector
                </div>
                <div style="font-size: 11px; color: #94a3b8;">
                  Google Maps Style Waypoint Guide for Critical Northeast Passes
                </div>
              </div>
            </div>
            <button id="btn-close-nav-modal" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: bold; cursor: pointer;">✕ Close</button>
          </div>

          <!-- Highway Route Selector Tabs -->
          <div style="display: flex; background: #0f172a; border-bottom: 1px solid #1e293b; padding: 6px 12px; gap: 6px; overflow-x: auto;">
            ${NER_HIGHWAY_ROUTES.map(route => `
              <button class="nav-route-tab ${route.id === r.id ? 'active' : ''}" data-id="${route.id}" style="background: ${route.id === r.id ? '#0284c7' : '#1e293b'}; color: ${route.id === r.id ? '#ffffff' : '#94a3b8'}; border: 1px solid ${route.id === r.id ? '#38bdf8' : '#334155'}; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap;">
                ${route.code} (${route.origin.split(' ')[0]} ➔ ${route.destination.split(' ')[0]})
              </button>
            `).join('')}
          </div>

          <!-- Route Summary Overview Card -->
          <div style="padding: 14px 18px; background: #131d31; border-bottom: 1px solid #1e293b; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #38bdf8;">${r.name}</div>
              <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">📍 ${r.origin} ➔ 🏁 ${r.destination}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Authority: ${r.managingAuthority}</div>
            </div>
            <div style="text-align: center; border-left: 1px solid #1e293b; padding-left: 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Distance & Time</div>
              <div style="font-size: 13px; font-weight: 800; color: #ffffff; margin-top: 2px;">${r.totalDistanceKm} km</div>
              <div style="font-size: 10px; color: #38bdf8;">${r.typicalDuration}</div>
            </div>
            <div style="text-align: center; border-left: 1px solid #1e293b; padding-left: 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Pass Status</div>
              <span style="display: inline-block; margin-top: 2px; background: ${badgeColor}; color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
                ${r.currentPassStatus}
              </span>
            </div>
          </div>

          <!-- Turn-by-Turn Waypoints Navigation List -->
          <div style="flex: 1; overflow-y: auto; padding: 14px 18px; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
              Turn-by-Turn Choke-Point Waypoints (${r.steps.length} Steps):
            </div>

            ${r.steps.map(step => {
              const stepColor =
                step.status === 'RESTRICTED' ? '#ef4444' : step.status === 'CAUTION' ? '#f97316' : '#10b981';
              return `
                <div class="nav-step-card" data-lat="${step.lat}" data-lon="${step.lon}" style="background: #1e293b; border-radius: 8px; padding: 10px 14px; border-left: 4px solid ${stepColor}; cursor: pointer; transition: background 0.15s ease; display: flex; justify-content: space-between; align-items: center;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="background: ${stepColor}; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;">
                        ${step.stepNumber}
                      </span>
                      <strong style="color: #ffffff; font-size: 12px;">${step.locationName}</strong>
                      <span style="font-size: 10px; color: #94a3b8;">&bull; Km ${step.chainageKm} &bull; ${step.elevationM}m MSL</span>
                    </div>
                    <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">
                      ${step.instruction}
                    </div>
                    ${step.hazardType !== 'None' ? `
                      <div style="font-size: 10px; color: ${stepColor}; margin-top: 3px; font-weight: bold;">
                        ⚠️ Hazard: ${step.hazardType} (Rainfall: ${step.rainfallMm}mm)
                      </div>
                    ` : ''}
                  </div>
                  <button class="btn-step-fly" data-lat="${step.lat}" data-lon="${step.lon}" style="background: #0284c7; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; margin-left: 10px; white-space: nowrap;">
                    🎯 View on Map
                  </button>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Emergency Dispatch Bar -->
          <div style="background: #090d16; padding: 10px 18px; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
            <div>
              <span style="color: #94a3b8;">24x7 National Highway Helpline:</span>
              <strong style="color: #38bdf8; margin-left: 4px;">${r.emergencyControlRoom}</strong>
            </div>
            <button id="btn-fly-full-route" style="background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 800; cursor: pointer;">
              🚀 Trace Entire Route on Map
            </button>
          </div>

        </div>
      </div>
    `;

    // Bind Close
    document.getElementById('btn-close-nav-modal')?.addEventListener('click', () => this.close());

    // Bind Route Tabs
    this.container.querySelectorAll('.nav-route-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-id');
        if (id) {
          const found = NER_HIGHWAY_ROUTES.find(route => route.id === id);
          if (found) {
            this.selectedRoute = found;
            this.render();
          }
        }
      });
    });

    // Bind Step clicks
    this.container.querySelectorAll('.btn-step-fly, .nav-step-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const lat = parseFloat(card.getAttribute('data-lat') || '0');
        const lon = parseFloat(card.getAttribute('data-lon') || '0');
        if (lat && lon) {
          this.close();
          this.onFlyToWaypoint(lat, lon, 11);
        }
      });
    });

    // Bind Full Route Trace
    document.getElementById('btn-fly-full-route')?.addEventListener('click', () => {
      const coords = this.selectedRoute.coordinates;
      const midLat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      const midLon = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
      this.close();
      this.onFlyToWaypoint(midLat, midLon, 8);
    });
  }
}
