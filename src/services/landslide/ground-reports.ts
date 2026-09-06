import type { DistrictProfile } from './types';

export type GroundHazardCategory =
  | 'road_damage'
  | 'slope_movement'
  | 'landslide_debris'
  | 'blocked_road'
  | 'ground_crack'
  | 'drainage_block'
  | 'infrastructure_damage'
  | 'other';

export type ReportStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'REJECTED';

export type ReporterRole = 'CITIZEN' | 'FIELD_OFFICIAL';

export interface GroundReport {
  id: string; // e.g. 'NS-1042'
  districtId: string;
  districtName: string;
  state: string;
  lat: number;
  lon: number;
  locationName: string;
  timestamp: string; // ISO string
  category: GroundHazardCategory;
  categoryLabel: string;
  description: string;
  mediaUrl: string; // image/photo URL or base64
  mediaType: 'image' | 'video';
  reporterRole: ReporterRole;
  reporterName?: string;
  status: ReportStatus;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export const HAZARD_CATEGORIES: { id: GroundHazardCategory; label: string; icon: string; description: string }[] = [
  { id: 'slope_movement', label: 'Slope Movement / Creep', icon: '⛰️', description: 'Active soil creep, bulging slope or leaning trees' },
  { id: 'ground_crack', label: 'Ground / Tension Crack', icon: '⚡', description: 'New or widening cracks on hillside ground or rock surface' },
  { id: 'road_damage', label: 'Road Shoulder Subsidence', icon: '🚧', description: 'Asphalt cracking, sinking road edge or retaining wall damage' },
  { id: 'landslide_debris', label: 'Landslide Debris / Rockfall', icon: '⚠️', description: 'Active debris deposit, rockfall on road or settlement' },
  { id: 'blocked_road', label: 'Blocked Highway / Corridor', icon: '🛑', description: 'Road completely impassable due to earth slip or boulders' },
  { id: 'drainage_block', label: 'Blocked Culvert / Waterlogging', icon: '🌊', description: 'Clogged hillside drain causing surface scouring' },
  { id: 'infrastructure_damage', label: 'Infrastructure Damage', icon: '🏗️', description: 'Damaged power poles, water lines, or bridges' },
  { id: 'other', label: 'Other Visible Geohazard', icon: '🔍', description: 'Other unclassified ground hazard indicators' },
];

export const SAMPLE_HAZARD_PRESETS = [
  {
    id: 'preset_slope_slip',
    name: 'Slope Slumping & Debris',
    category: 'slope_movement' as GroundHazardCategory,
    description: 'Active 20-meter slope slump with loose shale debris sliding toward access road.',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%231e293b"/><path d="M0,180 Q100,120 200,150 T400,110 L400,260 L0,260 Z" fill="%2378350f"/><path d="M80,140 Q160,190 260,170 T360,220 L400,260 L60,260 Z" fill="%23451a03"/><circle cx="140" cy="180" r="12" fill="%2392400e"/><circle cx="170" cy="195" r="8" fill="%23b45309"/><circle cx="220" cy="185" r="15" fill="%2378350f"/><line x1="110" y1="130" x2="130" y2="165" stroke="%23f59e0b" stroke-width="3" stroke-dasharray="4,2"/><line x1="150" y1="140" x2="185" y2="175" stroke="%23f59e0b" stroke-width="3" stroke-dasharray="4,2"/><rect x="20" y="20" width="150" height="28" rx="6" fill="%23ef4444" fill-opacity="0.9"/><text x="30" y="38" fill="white" font-size="12" font-family="sans-serif" font-weight="bold">SLOPE SLUMP 20M</text></svg>'
  },
  {
    id: 'preset_road_crack',
    name: 'Tension Crack on Highway',
    category: 'ground_crack' as GroundHazardCategory,
    description: '15cm wide continuous tension crack extending 35m across NH shoulder.',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%23334155"/><polygon points="0,160 400,140 400,260 0,260" fill="%230f172a"/><path d="M60,170 L110,195 L140,185 L190,220 L240,205 L310,245 L350,230" stroke="%23e2e8f0" stroke-width="4" fill="none"/><path d="M60,170 L110,195 L140,185 L190,220 L240,205 L310,245 L350,230" stroke="%23ef4444" stroke-width="2" stroke-dasharray="6,3" fill="none"/><rect x="20" y="20" width="170" height="28" rx="6" fill="%23f97316" fill-opacity="0.9"/><text x="30" y="38" fill="white" font-size="12" font-family="sans-serif" font-weight="bold">TENSION CRACK 15CM</text></svg>'
  },
  {
    id: 'preset_rockfall',
    name: 'Rockfall Debris on Road',
    category: 'landslide_debris' as GroundHazardCategory,
    description: 'Fresh granite boulder fall blocking right lane at mountain curve.',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%231e293b"/><path d="M0,0 L240,0 L180,260 L0,260 Z" fill="%23475569"/><polygon points="180,260 240,0 400,0 400,260" fill="%230f172a"/><polygon points="220,160 250,140 280,170 260,200 215,190" fill="%2394a3b8" stroke="%23475569" stroke-width="2"/><polygon points="270,180 310,165 330,195 300,215" fill="%23cbd5e1" stroke="%23475569" stroke-width="2"/><polygon points="190,210 220,200 230,230 195,235" fill="%2364748b" stroke="%23334155" stroke-width="2"/><rect x="20" y="20" width="150" height="28" rx="6" fill="%23eab308" fill-opacity="0.9"/><text x="30" y="38" fill="black" font-size="12" font-family="sans-serif" font-weight="bold">BOULDER DEBRIS</text></svg>'
  },
  {
    id: 'preset_drain_block',
    name: 'Culvert Overflow & Mudflow',
    category: 'drainage_block' as GroundHazardCategory,
    description: 'Hillside culvert overflow causing heavy water saturation and mud runout.',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%230f172a"/><path d="M50,40 Q180,120 200,260 L140,260 Q130,120 20,50 Z" fill="%230284c7"/><path d="M90,70 Q190,140 240,260 L190,260 Q150,140 60,80 Z" fill="%2378350f" fill-opacity="0.8"/><circle cx="160" cy="150" r="25" fill="none" stroke="%230284c7" stroke-width="3" stroke-dasharray="6,3"/><rect x="20" y="20" width="170" height="28" rx="6" fill="%230284c7" fill-opacity="0.9"/><text x="30" y="38" fill="white" font-size="12" font-family="sans-serif" font-weight="bold">CULVERT OVERFLOW</text></svg>'
  }
];

const SEED_GROUND_REPORTS: GroundReport[] = [
  {
    id: 'NS-1041',
    districtId: 'mangan',
    districtName: 'Mangan (North Sikkim)',
    state: 'Sikkim',
    lat: 27.5080,
    lon: 88.5320,
    locationName: 'Chungthang-Lachen Highway KM 14',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    category: 'slope_movement',
    categoryLabel: 'Slope Movement / Creep',
    description: 'Noticeable hillside slumping and retaining wall dislocation near bridge approach after intense rainfall.',
    mediaUrl: SAMPLE_HAZARD_PRESETS[0].svgData,
    mediaType: 'image',
    reporterRole: 'CITIZEN',
    reporterName: 'Dorjee Tshering (Resident)',
    status: 'VERIFIED',
    adminNotes: 'Verified via SDRF Mangan field unit. Traffic restricted to light vehicles.',
    verifiedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    verifiedBy: 'DEOC Mangan Control Room'
  },
  {
    id: 'NS-1042',
    districtId: 'noney',
    districtName: 'Noney',
    state: 'Manipur',
    lat: 24.7890,
    lon: 93.6120,
    locationName: 'Tupul Railway Yard Escarpment',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    category: 'ground_crack',
    categoryLabel: 'Ground / Tension Crack',
    description: '15cm tension cracks observed extending approximately 40m along upper railway cutting slope.',
    mediaUrl: SAMPLE_HAZARD_PRESETS[1].svgData,
    mediaType: 'image',
    reporterRole: 'FIELD_OFFICIAL',
    reporterName: 'L. Singh (PWD Field Inspector)',
    status: 'ESCALATED',
    adminNotes: 'Escalated to SDRF Manipur & NF Railway Geo-hazard Cell for immediate slope stabilization.',
    verifiedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    verifiedBy: 'SDMA Manipur Duty Officer'
  },
  {
    id: 'NS-1043',
    districtId: 'east_khasi_hills',
    districtName: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.3210,
    lon: 91.7340,
    locationName: 'Sohra-Mawkdok Bypass Ch. 8',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    category: 'landslide_debris',
    categoryLabel: 'Landslide Debris / Rockfall',
    description: 'Granite boulders and mud debris blocking right lane of the tourist highway corridor.',
    mediaUrl: SAMPLE_HAZARD_PRESETS[2].svgData,
    mediaType: 'image',
    reporterRole: 'CITIZEN',
    reporterName: 'Banrap Lyngdoh (Commuter)',
    status: 'PENDING',
    adminNotes: 'Awaiting local PWD highway verification.'
  },
  {
    id: 'NS-1044',
    districtId: 'dima_hasao',
    districtName: 'Dima Hasao',
    state: 'Assam',
    lat: 25.1760,
    lon: 93.0230,
    locationName: 'Haflong-Jatinga Hill Road',
    timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    category: 'drainage_block',
    categoryLabel: 'Blocked Culvert / Waterlogging',
    description: 'Blocked hill drain causing heavy water cascading across roadbed, causing shoulder erosion.',
    mediaUrl: SAMPLE_HAZARD_PRESETS[3].svgData,
    mediaType: 'image',
    reporterRole: 'FIELD_OFFICIAL',
    reporterName: 'K. Debbarma (Forest Guard)',
    status: 'VERIFIED',
    adminNotes: 'DEOC notified. PWD clearance team dispatched.',
    verifiedAt: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
    verifiedBy: 'DEOC Dima Hasao'
  }
];

const STORAGE_KEY = 'nextsignal_ground_reports_v1';
type Listener = (reports: GroundReport[]) => void;

class GroundReportsService {
  private reports: GroundReport[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.reports = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('[GroundReportsService] Failed to parse localStorage, using seed data:', e);
    }
    this.reports = [...SEED_GROUND_REPORTS];
    this.save();
  }

  private save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reports));
      }
    } catch (e) {
      console.error('[GroundReportsService] Failed to save to localStorage:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getReports());
      } catch (e) {
        console.error('[GroundReportsService] Error in listener callback:', e);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getReports());
    return () => this.listeners.delete(listener);
  }

  public getReports(): GroundReport[] {
    return [...this.reports].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getReportsForDistrict(districtId: string): GroundReport[] {
    return this.getReports().filter((r) => r.districtId === districtId);
  }

  public getReportById(id: string): GroundReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  public addReport(params: {
    district: DistrictProfile;
    lat: number;
    lon: number;
    locationName: string;
    category: GroundHazardCategory;
    description: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    reporterRole?: ReporterRole;
    reporterName?: string;
  }): GroundReport {
    const categoryInfo = HAZARD_CATEGORIES.find((c) => c.id === params.category);
    const id = 'NS-' + Math.floor(1000 + Math.random() * 9000);

    const newReport: GroundReport = {
      id,
      districtId: params.district.id,
      districtName: params.district.name,
      state: params.district.state,
      lat: Number(params.lat.toFixed(5)),
      lon: Number(params.lon.toFixed(5)),
      locationName: params.locationName || (params.district.name + ' Vicinity'),
      timestamp: new Date().toISOString(),
      category: params.category,
      categoryLabel: categoryInfo ? categoryInfo.label : 'Hazard Report',
      description: params.description,
      mediaUrl: params.mediaUrl || SAMPLE_HAZARD_PRESETS[0].svgData,
      mediaType: params.mediaType || 'image',
      reporterRole: params.reporterRole || 'CITIZEN',
      reporterName: params.reporterName || 'Citizen Report',
      status: 'PENDING',
    };

    this.reports.unshift(newReport);
    this.save();
    return newReport;
  }

  public updateReportStatus(
    id: string,
    status: ReportStatus,
    adminNotes?: string,
    verifiedBy: string = 'District EOC Admin'
  ): GroundReport | null {
    const report = this.reports.find((r) => r.id === id);
    if (!report) return null;

    report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (status === 'VERIFIED' || status === 'ESCALATED') {
      report.verifiedAt = new Date().toISOString();
      report.verifiedBy = verifiedBy;
    }
    this.save();
    return report;
  }

  public deleteReport(id: string): boolean {
    const initialLen = this.reports.length;
    this.reports = this.reports.filter((r) => r.id !== id);
    if (this.reports.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public resetToSeeds() {
    this.reports = [...SEED_GROUND_REPORTS];
    this.save();
  }
}

export const groundReportsService = new GroundReportsService();
