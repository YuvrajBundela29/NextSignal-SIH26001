export interface TourWaypoint {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  zoom: number;
  elevationM: number;
  hazardType: string;
  briefing: string;
  threatMatrix: string;
}

export const CORRIDOR_TOUR_WAYPOINTS: TourWaypoint[] = [
  {
    id: 'sikkim-chungthang',
    name: 'North Sikkim (Chungthang & Mangan)',
    state: 'Sikkim',
    lat: 27.6042,
    lon: 88.6472,
    zoom: 12,
    elevationM: 1790,
    hazardType: 'GLOF Moraine Breach & Debris Avalanche',
    threatMatrix: 'ELEVATED // ANTECEDENT PRECIPITATION: 284mm',
    briefing: 'Active moraine dam monitoring along Teesta Basin Stage-III following glacial lake outburst surges.',
  },
  {
    id: 'assam-dima-hasao',
    name: 'Haflong Mountain Pass (Dima Hasao)',
    state: 'Assam',
    lat: 25.1812,
    lon: 93.021,
    zoom: 11,
    elevationM: 950,
    hazardType: 'Arterial Railway Embankment Slump',
    threatMatrix: 'CRITICAL // SOIL SATURATION: 88%',
    briefing: 'Key rail link connecting Assam, Tripura, and Mizoram through fractured tertiary sedimentary formations.',
  },
  {
    id: 'manipur-tupul',
    name: 'Tupul Mountain Railway Corridor (Noney)',
    state: 'Manipur',
    lat: 24.8167,
    lon: 93.6333,
    zoom: 12,
    elevationM: 810,
    hazardType: 'Deep Rotational Slope Failure',
    threatMatrix: 'HIGH // DISHONORED FACTOR OF SAFETY: 0.94',
    briefing: 'Ijei river confluence valley with high geotechnical shear failure risk during high-intensity monsoons.',
  },
  {
    id: 'meghalaya-khasi',
    name: 'East Khasi Hills (Sohra / Cherrapunji)',
    state: 'Meghalaya',
    lat: 25.2986,
    lon: 91.7306,
    zoom: 11,
    elevationM: 1484,
    hazardType: 'Extreme Monsoonal Surface Saturation & Runoff',
    threatMatrix: 'CRITICAL // 24H DELUGE: 340mm',
    briefing: 'Global rainfall epicenter; steep limestone & sandstone escarpment subject to rapid planar slide detachment.',
  },
  {
    id: 'arunachal-papum',
    name: 'Papum Pare Foothill Passes (Itanagar)',
    state: 'Arunachal Pradesh',
    lat: 27.1022,
    lon: 93.692,
    zoom: 11,
    elevationM: 750,
    hazardType: 'Trans-Himalayan Highway Slumping',
    threatMatrix: 'MODERATE // NH-415 CORRIDOR MONITORED',
    briefing: 'Primary national highway lifeline through fragile outer Siwalik sandstone strata.',
  },
];

export class CinematicDirector {
  private isRunning = false;
  private currentWaypointIndex = 0;
  private timer: number | null = null;
  private onWaypointChangeCallback: ((wp: TourWaypoint) => void) | null = null;

  public startTour(onWaypointChange: (wp: TourWaypoint) => void) {
    this.isRunning = true;
    this.currentWaypointIndex = 0;
    this.onWaypointChangeCallback = onWaypointChange;
    this.advanceToWaypoint(0);
  }

  public stopTour() {
    this.isRunning = false;
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public isTourActive(): boolean {
    return this.isRunning;
  }

  public getCurrentWaypoint(): TourWaypoint {
    return CORRIDOR_TOUR_WAYPOINTS[this.currentWaypointIndex];
  }

  public next() {
    if (!this.isRunning) return;
    this.currentWaypointIndex = (this.currentWaypointIndex + 1) % CORRIDOR_TOUR_WAYPOINTS.length;
    this.advanceToWaypoint(this.currentWaypointIndex);
  }

  public prev() {
    if (!this.isRunning) return;
    this.currentWaypointIndex =
      (this.currentWaypointIndex - 1 + CORRIDOR_TOUR_WAYPOINTS.length) %
      CORRIDOR_TOUR_WAYPOINTS.length;
    this.advanceToWaypoint(this.currentWaypointIndex);
  }

  private advanceToWaypoint(index: number) {
    if (!this.isRunning) return;
    if (this.timer) {
      window.clearTimeout(this.timer);
    }

    const wp = CORRIDOR_TOUR_WAYPOINTS[index];
    if (this.onWaypointChangeCallback) {
      this.onWaypointChangeCallback(wp);
    }

    // Dwell for 10 seconds at each tactical waypoint, then transition smoothly
    this.timer = window.setTimeout(() => {
      if (this.isRunning) {
        this.next();
      }
    }, 10000);
  }
}

export const cinematicDirector = new CinematicDirector();
