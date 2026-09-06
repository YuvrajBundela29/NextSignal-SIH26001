import L from 'leaflet';
import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry, SoilTelemetry, SeismicTelemetry, AppLanguage, CitizenProfile } from '../../services/landslide/types';
import { NER_DISTRICTS } from '../../services/landslide/ner-districts';
import { getLocalAreasForDistrict } from '../../services/landslide/local-areas';
import { NER_SAFE_SHELTERS } from '../../services/landslide/safe-shelters';
import { groundReportsService, type GroundReport } from '../../services/landslide/ground-reports';
import { GroundReportModal } from './GroundReportModal';

export class CitizenView {
  private container: HTMLElement;
  private currentDistrict: DistrictProfile;
  private citizenProfile: CitizenProfile;
  private lang: AppLanguage = 'en';
  private onSelectDistrictCallback?: (districtId: string) => void;
  private onExitToRoleSelection?: () => void;
  private localMap: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private reportMarkersLayer: L.LayerGroup | null = null;

  constructor(
    container: HTMLElement,
    currentDistrict: DistrictProfile,
    citizenProfile?: CitizenProfile,
    onSelectDistrict?: (districtId: string) => void,
    onExitToRoleSelection?: () => void
  ) {
    this.container = container;
    this.currentDistrict = currentDistrict;
    this.onSelectDistrictCallback = onSelectDistrict;
    this.onExitToRoleSelection = onExitToRoleSelection;

    // Load or initialize citizen profile
    if (citizenProfile) {
      this.citizenProfile = citizenProfile;
    } else {
      const cached = localStorage.getItem('nexsignal_citizen_profile');
      if (cached) {
        try {
          this.citizenProfile = JSON.parse(cached);
        } catch (e) {
          this.citizenProfile = this.createDefaultProfile(currentDistrict);
        }
      } else {
        this.citizenProfile = this.createDefaultProfile(currentDistrict);
      }
    }

    // Subscribe to ground reports for real-time reactivity
    groundReportsService.subscribe(() => {
      this.renderReportMarkers();
      this.renderCommunityFeed();
    });
  }

  private createDefaultProfile(district: DistrictProfile): CitizenProfile {
    const areas = getLocalAreasForDistrict(district.id);
    const primaryArea = areas[0]?.name || district.name;
    return {
      name: 'Yuvraj',
      state: district.state,
      districtId: district.id,
      districtName: district.name,
      localArea: primaryArea,
      lat: district.lat + (areas[0]?.latOffset || 0),
      lon: district.lon + (areas[0]?.lonOffset || 0),
    };
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
  }

  public setDistrict(district: DistrictProfile, risk: RiskScoreBreakdown, weather: WeatherTelemetry, soil?: SoilTelemetry, seismic?: SeismicTelemetry) {
    this.currentDistrict = district;
    if (this.citizenProfile.districtId !== district.id) {
      const areas = getLocalAreasForDistrict(district.id);
      this.citizenProfile.districtId = district.id;
      this.citizenProfile.districtName = district.name;
      this.citizenProfile.state = district.state;
      this.citizenProfile.localArea = areas[0]?.name || district.name;
      this.citizenProfile.lat = district.lat + (areas[0]?.latOffset || 0);
      this.citizenProfile.lon = district.lon + (areas[0]?.lonOffset || 0);
      localStorage.setItem('nexsignal_citizen_profile', JSON.stringify(this.citizenProfile));
    }
    this.render(this.currentDistrict, risk, weather, soil, seismic);
  }

  public render(
    district: DistrictProfile,
    risk: RiskScoreBreakdown,
    weather: WeatherTelemetry,
    soil?: SoilTelemetry,
    seismic?: SeismicTelemetry
  ) {
    this.currentDistrict = district;

    const riskColor = risk.level === 'CRITICAL' ? '#ef4444' : risk.level === 'HIGH' ? '#f97316' : risk.level === 'MODERATE' ? '#eab308' : '#22c55e';
    const riskBg = risk.level === 'CRITICAL' ? '#ef444415' : risk.level === 'HIGH' ? '#f9731615' : risk.level === 'MODERATE' ? '#eab30815' : '#22c55e15';

    // Nearest shelter
    const shelters = NER_SAFE_SHELTERS.filter((s) => s.districtId === district.id);
    const nearestShelter = shelters[0] || {
      id: 'default_shelter',
      districtId: district.id,
      name: `${district.name} Higher Secondary School`,
      type: 'Government Higher Secondary School' as const,
      capacityPersons: 350,
      lat: district.lat,
      lon: district.lon,
      elevationM: district.elevationM,
      contactNumber: district.deocContact,
      hasMedicalPost: true,
      hasGeneratorPower: true,
      hasHelipadAccess: false,
    };

    const soilPct = soil ? soil.soilMoisturePct : 68;
    const soilStatus = soil ? soil.soilSaturationStatus : 'Moderate';
    const quakesCount = seismic ? seismic.recentQuakes72hCount : 1;

    this.container.innerHTML = `
      <div id="citizen-scroll-container" style="background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; height: 100vh; max-height: 100vh; overflow-y: auto; overflow-x: hidden; padding: 20px 24px 80px 24px; box-sizing: border-box; animation: fadeIn 0.3s ease; scroll-behavior: smooth;">
        
        <!-- Citizen Header -->
        <header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 18px; border-bottom: 1px solid #1e293b; margin-bottom: 22px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 0 20px rgba(22, 163, 74, 0.4);">
              📱
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 19px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px;">
                  NEXSIGNAL CITIZEN
                </span>
                <span style="background: #22c55e20; border: 1px solid #22c55e; color: #22c55e; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 12px; letter-spacing: 0.5px;">
                  LOCAL SAFETY PORTAL
                </span>
              </div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">
                Hello, <strong style="color: #f1f5f9;">${this.citizenProfile.name}</strong> &bull; 📍 <span style="color: #38bdf8; font-weight: 700;">${this.citizenProfile.localArea}</span> (${district.name}, ${district.state})
              </div>
            </div>
          </div>

          <!-- Header Right Controls -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            
            <!-- Change Location Button -->
            <button id="btn-citizen-change-location" style="background: #0b1120; border: 1px solid #334155; color: #38bdf8; font-size: 12px; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
              <span>📍</span> Change Location
            </button>

            <!-- Language Selector -->
            <select id="sel-citizen-lang" style="background: #0b1120; border: 1px solid #334155; color: #cbd5e1; font-size: 12px; font-weight: 600; padding: 8px 12px; border-radius: 8px; outline: none; cursor: pointer;">
              <option value="en" ${this.lang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
              <option value="hi" ${this.lang === 'hi' ? 'selected' : ''}>🇮🇳 हिन्दी</option>
              <option value="as" ${this.lang === 'as' ? 'selected' : ''}>🇮🇳 অসমীয়া</option>
              <option value="bn" ${this.lang === 'bn' ? 'selected' : ''}>🇮🇳 বাংলা</option>
              <option value="mni" ${this.lang === 'mni' ? 'selected' : ''}>🇮🇳 মৈতৈলোন্</option>
              <option value="lus" ${this.lang === 'lus' ? 'selected' : ''}>🇮🇳 Mizo ṭawng</option>
              <option value="kha" ${this.lang === 'kha' ? 'selected' : ''}>🇮🇳 Ka Ktien Khasi</option>
              <option value="ne" ${this.lang === 'ne' ? 'selected' : ''}>🇮🇳 नेपाली</option>
            </select>

            <!-- Exit to Gateway -->
            <button id="btn-exit-to-gateway" style="background: transparent; border: 1px solid #ef444460; color: #f87171; font-size: 12px; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <span>🚪</span> Exit Portal
            </button>
          </div>
        </header>

        <!-- Hero Question & Local Risk Banner -->
        <div style="background: linear-gradient(180deg, #0b1120 0%, #050811 100%); border: 1px solid ${riskColor}50; border-radius: 16px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${riskColor};"></div>
          
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px;">
            <div>
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">
                YOUR LOCAL AREA SAFETY STATUS
              </div>
              <h1 style="font-size: 26px; font-weight: 900; color: #ffffff; margin: 0 0 8px;">
                Is my area safe right now?
              </h1>
              <p style="font-size: 14px; color: #cbd5e1; max-width: 600px; margin: 0; line-height: 1.55;">
                Your selected location <strong style="color: #38bdf8;">${this.citizenProfile.localArea}</strong> is currently under <strong style="color: ${riskColor};">${risk.level}</strong> landslide risk.
                <span style="display: block; font-size: 11px; color: #64748b; margin-top: 4px;">
                  District-level AI multi-factor risk model calibrated for ${district.name} &amp; surrounding slopes.
                </span>
              </p>
            </div>

            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: ${riskBg}; border: 2px solid ${riskColor}; border-radius: 14px; padding: 14px 22px; text-align: center;">
                <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">RISK LEVEL</div>
                <div style="font-size: 26px; font-weight: 900; color: ${riskColor}; letter-spacing: 0.5px;">${risk.level}</div>
                <div style="font-size: 11px; color: #cbd5e1; font-weight: 700; margin-top: 2px;">Score: ${risk.compositeScore}/100</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Primary Action: Report a Hazard Hero Button -->
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border: 1px solid #6366f160; border-radius: 14px; padding: 18px 24px; margin-bottom: 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 8px;">
              <span>🚨</span> Observed slope cracks, road damage or rockfall nearby?
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              Send geo-tagged photo/video ground evidence directly to District Emergency Control for validation.
            </div>
          </div>

          <button id="btn-citizen-report-hazard" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 1px solid #f87171; color: #ffffff; font-size: 13px; font-weight: 800; padding: 12px 24px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 18px rgba(239, 68, 68, 0.4); white-space: nowrap; transition: transform 0.15s ease;">
            <span>📸</span> REPORT A HAZARD (PHOTO / VIDEO)
          </button>
        </div>

        <!-- 2-Column Responsive Layout -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px; margin-bottom: 28px;">
          
          <!-- Left Column: Metrics, Weather, Alerts, Helpline -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Local Risk Factors 5-Decomposition -->
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 14px; padding: 20px;">
              <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
                LOCAL RISK FACTORS BREAKDOWN
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div style="background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;">
                  <div style="font-size: 11px; color: #94a3b8;">🌧 Rainfall (24h)</div>
                  <div style="font-size: 16px; font-weight: 800; color: #38bdf8; margin-top: 4px;">
                    ${weather.rainfall24hMm.toFixed(1)} mm
                  </div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                    72h Acc: ${weather.rainfall72hMm.toFixed(1)} mm
                  </div>
                </div>

                <div style="background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;">
                  <div style="font-size: 11px; color: #94a3b8;">💧 Soil Moisture</div>
                  <div style="font-size: 16px; font-weight: 800; color: #22c55e; margin-top: 4px;">
                    ${soilPct.toFixed(0)}%
                  </div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                    Status: ${soilStatus}
                  </div>
                </div>

                <div style="background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;">
                  <div style="font-size: 11px; color: #94a3b8;">⛰ Terrain Slope</div>
                  <div style="font-size: 16px; font-weight: 800; color: #f59e0b; margin-top: 4px;">
                    ${district.averageSlopeDeg}&deg; Steep
                  </div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                    Elev: ${district.elevationM}m
                  </div>
                </div>

                <div style="background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;">
                  <div style="font-size: 11px; color: #94a3b8;">🌐 Seismic Activity</div>
                  <div style="font-size: 16px; font-weight: 800; color: #a855f7; margin-top: 4px;">
                    ${quakesCount > 0 ? `${quakesCount} Quakes (72h)` : 'Quiet'}
                  </div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                    USGS Real-Time Feed
                  </div>
                </div>
              </div>
            </div>

            <!-- Local Weather & Forecast -->
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 14px; padding: 20px;">
              <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                LOCAL WEATHER &amp; PRECIPITATION
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 14px;">
                <div>
                  <div style="font-size: 22px; font-weight: 800; color: #ffffff;">${weather.temperatureC.toFixed(1)}&deg;C</div>
                  <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${weather.weatherCondition} &bull; Wind: ${weather.windSpeedKmh.toFixed(0)} km/h</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11px; color: #94a3b8;">Forecast 24h</div>
                  <div style="font-size: 15px; font-weight: 800; color: #38bdf8;">${weather.rainfallForecast24hMm.toFixed(1)} mm</div>
                </div>
              </div>
            </div>

            <!-- Active Safety Advice -->
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 14px; padding: 20px;">
              <div style="font-size: 12px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span>⚠️</span> ACTIVE SAFETY ADVISORY
              </div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                ${risk.level === 'CRITICAL' || risk.level === 'HIGH' ? `
                  <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px;">
                    <li>Avoid non-essential travel along cut-slope road sections and high-gradient passes.</li>
                    <li>Inspect retaining structures and surface runoff drains near your dwelling.</li>
                    <li>Identify your family evacuation path to the designated shelter.</li>
                  </ul>
                ` : `
                  <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px;">
                    <li>Terrain stability is currently within normal thresholds.</li>
                    <li>Continue monitoring weather advisories during evening showers.</li>
                  </ul>
                `}
              </div>
            </div>

            <!-- Nearest Safe Shelter -->
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 14px; padding: 20px;">
              <div style="font-size: 12px; font-weight: 800; color: #22c55e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                NEAREST DESIGNATED SAFE SHELTER
              </div>
              <div style="background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 14px;">
                <div style="font-size: 14px; font-weight: 800; color: #ffffff;">${nearestShelter.name}</div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">${nearestShelter.type} &bull; Capacity: ~${nearestShelter.capacityPersons} persons</div>
                <div style="font-size: 12px; color: #38bdf8; margin-top: 6px; font-weight: 700;">📞 Emergency Staging: ${nearestShelter.contactNumber}</div>
              </div>
            </div>

            <!-- Emergency Helpline Directory -->
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 14px; padding: 20px;">
              <div style="font-size: 12px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                EMERGENCY HELPLINE DIRECTORY
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px;">
                <div style="background: #050811; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
                  <span style="color: #94a3b8;">DEOC Direct:</span>
                  <div style="font-weight: 800; color: #38bdf8; margin-top: 2px;">${district.deocContact}</div>
                </div>
                <div style="background: #050811; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
                  <span style="color: #94a3b8;">Police / Emergency:</span>
                  <div style="font-weight: 800; color: #22c55e; margin-top: 2px;">112 (Toll Free)</div>
                </div>
                <div style="background: #050811; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
                  <span style="color: #94a3b8;">Disaster Control:</span>
                  <div style="font-weight: 800; color: #f59e0b; margin-top: 2px;">1070 / 1077</div>
                </div>
                <div style="background: #050811; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
                  <span style="color: #94a3b8;">NDRF Control:</span>
                  <div style="font-weight: 800; color: #ef4444; margin-top: 2px;">011-24363260</div>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Local Map & Community Reports Feed -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Local Interactive Map -->
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
                  LOCAL TACTICAL HAZARD MAP &bull; ${this.citizenProfile.localArea}
                </div>
                <span style="font-size: 11px; color: #94a3b8;">Zoom to inspect terrain</span>
              </div>

              <div id="citizen-local-map" style="height: 380px; width: 100%; border-radius: 10px; overflow: hidden; background: #050811; border: 1px solid #1e293b;"></div>
            </div>

            <!-- Nearby Community Ground Reports Feed -->
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
                  NEARBY COMMUNITY GROUND REPORTS
                </div>
                <span id="citizen-reports-count-badge" style="background: #38bdf820; border: 1px solid #38bdf8; color: #38bdf8; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px;">
                  Active Feed
                </span>
              </div>

              <div id="citizen-community-feed-container">
                <!-- Injected by renderCommunityFeed -->
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>
        #citizen-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        #citizen-scroll-container::-webkit-scrollbar-track {
          background: #020617;
        }
        #citizen-scroll-container::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
        #citizen-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      </style>
    `;

    this.bindEvents(risk, weather);
    this.initLocalMap();
    this.renderCommunityFeed();
  }

  private initLocalMap() {
    const mapEl = document.getElementById('citizen-local-map');
    if (!mapEl) return;

    if (this.localMap) {
      this.localMap.remove();
      this.localMap = null;
    }

    this.localMap = L.map('citizen-local-map', {
      zoomControl: true,
      attributionControl: false,
    }).setView([this.citizenProfile.lat, this.citizenProfile.lon], 12);

    // Free ESRI Dark Canvas Base Layer (Zero watermark / No API Key required)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
    }).addTo(this.localMap);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
    }).addTo(this.localMap);

    // User Location Pulsing Marker
    const userIcon = L.divIcon({
      className: 'citizen-loc-icon',
      html: `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="position: absolute; top: 0; left: 0; width: 22px; height: 22px; border-radius: 50%; background: #22c55e; border: 2px solid #ffffff; box-shadow: 0 0 14px #22c55e;"></div>
          <div style="position: absolute; top: -6px; left: -6px; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #22c55e; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    this.userMarker = L.marker([this.citizenProfile.lat, this.citizenProfile.lon], { icon: userIcon })
      .addTo(this.localMap)
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #22c55e;">📍 YOU ARE HERE</strong><br/>
          <span style="font-size: 11px; color: #334155;">${this.citizenProfile.localArea}, ${this.currentDistrict.name}</span>
        </div>
      `);

    this.reportMarkersLayer = L.layerGroup().addTo(this.localMap);
    this.renderReportMarkers();
  }

  private renderReportMarkers() {
    if (!this.localMap || !this.reportMarkersLayer) return;
    this.reportMarkersLayer.clearLayers();

    const reports = groundReportsService.getReportsForDistrict(this.currentDistrict.id);

    reports.forEach((r) => {
      const isVerified = r.status === 'VERIFIED';
      const isEscalated = r.status === 'ESCALATED';
      const color = isEscalated ? '#ef4444' : isVerified ? '#22c55e' : '#eab308';

      const icon = L.divIcon({
        className: 'cit-rep-marker',
        html: `
          <div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color};"></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([r.lat, r.lon], { icon })
        .addTo(this.reportMarkersLayer!)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; width: 200px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 11px; color: #0284c7;">${r.categoryLabel}</strong>
              <span style="font-size: 8px; font-weight: 800; color: ${color}; background: ${color}20; border: 1px solid ${color}; padding: 1px 4px; border-radius: 3px;">${r.status}</span>
            </div>
            <div style="font-size: 10px; color: #475569; margin-bottom: 6px;">${r.locationName}</div>
            <img src="${r.mediaUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; margin-bottom: 4px; border: 1px solid #cbd5e1; background: #0f172a;" alt="Evidence" />
            <div style="font-size: 9px; color: #64748b;">${new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; ${r.reporterName}</div>
          </div>
        `);
    });
  }

  private renderCommunityFeed() {
    const feedContainer = document.getElementById('citizen-community-feed-container');
    if (!feedContainer) return;

    const reports = groundReportsService.getReportsForDistrict(this.currentDistrict.id);
    const badge = document.getElementById('citizen-reports-count-badge');
    if (badge) badge.textContent = `${reports.length} Reports`;

    if (reports.length === 0) {
      feedContainer.innerHTML = `
        <div style="text-align: center; padding: 24px 12px; color: #64748b; font-size: 12px; background: #050811; border-radius: 8px; border: 1px dashed #1e293b;">
          No ground reports in this locality yet. Use &ldquo;Report a Hazard&rdquo; above if you observe slope cracks or debris.
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 4px;">
        ${reports.map((r) => {
          const isVerified = r.status === 'VERIFIED';
          const isEscalated = r.status === 'ESCALATED';
          const pillColor = isEscalated ? '#ef4444' : isVerified ? '#22c55e' : '#eab308';

          return `
            <div class="citizen-feed-card" data-id="${r.id}" style="background: #050811; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; display: flex; gap: 10px; cursor: pointer; transition: border-color 0.15s ease;">
              <div style="width: 52px; height: 52px; border-radius: 6px; overflow: hidden; background: #020617; border: 1px solid #1e293b; flex-shrink: 0;">
                <img src="${r.mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail" />
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                  <span style="font-size: 11px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${r.categoryLabel}
                  </span>
                  <span style="font-size: 8px; font-weight: 800; background: ${pillColor}20; color: ${pillColor}; border: 1px solid ${pillColor}; padding: 1px 5px; border-radius: 4px;">
                    ${r.status}
                  </span>
                </div>
                <div style="font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${r.locationName}
                </div>
                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
                  ${new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; ${r.reporterName} (${r.reporterRole})
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind click on cards
    feedContainer.querySelectorAll('.citizen-feed-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id) {
          const rep = groundReportsService.getReportById(id);
          if (rep) {
            alert(`REPORT #${rep.id}\n\nCategory: ${rep.categoryLabel}\nLocation: ${rep.locationName}\nReporter: ${rep.reporterName} (${rep.reporterRole})\nStatus: ${rep.status}\n\nObservation: ${rep.description}`);
          }
        }
      });
    });
  }

  private bindEvents(risk: RiskScoreBreakdown, weather: WeatherTelemetry) {
    // Open Ground Report Modal
    this.container.querySelector('#btn-citizen-report-hazard')?.addEventListener('click', () => {
      const modal = new GroundReportModal(this.currentDistrict, (newReport) => {
        this.renderCommunityFeed();
        this.renderReportMarkers();
      });
      modal.open();
    });

    // Exit to Gateway
    this.container.querySelector('#btn-exit-to-gateway')?.addEventListener('click', () => {
      if (this.onExitToRoleSelection) {
        this.onExitToRoleSelection();
      }
    });

    // Change Location Modal trigger
    this.container.querySelector('#btn-citizen-change-location')?.addEventListener('click', () => {
      if (this.onExitToRoleSelection) {
        this.onExitToRoleSelection();
      }
    });

    // Language Selector
    const selLang = this.container.querySelector('#sel-citizen-lang') as HTMLSelectElement;
    selLang?.addEventListener('change', () => {
      this.lang = selLang.value as AppLanguage;
      this.render(this.currentDistrict, risk, weather);
    });
  }
}
