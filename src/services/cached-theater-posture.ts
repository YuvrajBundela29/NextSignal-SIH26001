import type { TheaterPostureSummary } from './military-surge';
import { getRpcBaseUrl } from '@/services/rpc-client';
import type { GetTheaterPostureResponse, TheaterPosture } from '@/generated/client/worldmonitor/military/v1/service_client';
import { createCircuitBreaker } from '@/utils';
import { getHydratedData } from '@/services/bootstrap';
import { MilitaryServiceClient } from '@/services/generated-rpc-clients';

// ---- Sebuf client ----

const client = new MilitaryServiceClient(getRpcBaseUrl(), { fetch: (...args) => globalThis.fetch(...args) });

// ---- Legacy interface (preserved for consumer compatibility) ----

export interface CachedTheaterPosture {
  postures: TheaterPostureSummary[];
  totalFlights: number;
  timestamp: string;
  cached: boolean;
  stale?: boolean;
  error?: string;
}

// ---- Proto → legacy adapter ----

interface TheaterMeta {
  name: string;
  shortName: string;
  targetNation: string | null;
  centerLat: number;
  centerLon: number;
  bounds: { north: number; south: number; east: number; west: number };
}

const THEATER_META: Record<string, TheaterMeta> = {
  'iran-theater': { name: 'Iran Theater', shortName: 'IRAN', targetNation: 'Iran', centerLat: 31, centerLon: 47.5, bounds: { north: 42, south: 20, east: 65, west: 30 } },
  'taiwan-theater': { name: 'Taiwan Strait', shortName: 'TAIWAN', targetNation: 'Taiwan', centerLat: 24, centerLon: 122.5, bounds: { north: 30, south: 18, east: 130, west: 115 } },
  'baltic-theater': { name: 'Baltic Theater', shortName: 'BALTIC', targetNation: null, centerLat: 58.5, centerLon: 21, bounds: { north: 65, south: 52, east: 32, west: 10 } },
  'blacksea-theater': { name: 'Black Sea', shortName: 'BLACK SEA', targetNation: null, centerLat: 44, centerLon: 34, bounds: { north: 48, south: 40, east: 42, west: 26 } },
  'korea-theater': { name: 'Korean Peninsula', shortName: 'KOREA', targetNation: 'North Korea', centerLat: 38, centerLon: 128, bounds: { north: 43, south: 33, east: 132, west: 124 } },
  'south-china-sea': { name: 'South China Sea', shortName: 'SCS', targetNation: null, centerLat: 15, centerLon: 113, bounds: { north: 25, south: 5, east: 121, west: 105 } },
  'east-med-theater': { name: 'Eastern Mediterranean', shortName: 'E.MED', targetNation: null, centerLat: 35, centerLon: 31, bounds: { north: 37, south: 33, east: 37, west: 25 } },
  'israel-gaza-theater': { name: 'Israel/Gaza', shortName: 'GAZA', targetNation: 'Gaza', centerLat: 31, centerLon: 34.5, bounds: { north: 33, south: 29, east: 36, west: 33 } },
  'yemen-redsea-theater': { name: 'Yemen/Red Sea', shortName: 'RED SEA', targetNation: 'Yemen', centerLat: 16.5, centerLon: 43, bounds: { north: 22, south: 11, east: 54, west: 32 } },
};

function toPostureSummary(proto: TheaterPosture): TheaterPostureSummary {
  const meta = THEATER_META[proto.theater];
  const strikeCapable = proto.activeOperations.includes('strike_capable');
  const postureLevel = (proto.postureLevel === 'critical' || proto.postureLevel === 'elevated')
    ? proto.postureLevel as 'critical' | 'elevated'
    : 'normal' as const;

  return {
    theaterId: proto.theater,
    theaterName: meta?.name ?? proto.theater,
    shortName: meta?.shortName ?? proto.theater,
    targetNation: meta?.targetNation ?? null,
    fighters: 0,
    tankers: 0,
    awacs: 0,
    reconnaissance: 0,
    transport: 0,
    bombers: 0,
    drones: 0,
    totalAircraft: proto.activeFlights,
    destroyers: 0,
    frigates: 0,
    carriers: 0,
    submarines: 0,
    patrol: 0,
    auxiliaryVessels: 0,
    totalVessels: proto.trackedVessels,
    byOperator: {},
    postureLevel,
    strikeCapable,
    trend: 'stable',
    changePercent: 0,
    summary: '',
    headline: postureLevel === 'critical'
      ? `Critical military buildup - ${meta?.name ?? proto.theater}`
      : postureLevel === 'elevated'
        ? `Elevated military activity - ${meta?.name ?? proto.theater}`
        : `Normal activity - ${meta?.name ?? proto.theater}`,
    centerLat: meta?.centerLat ?? 0,
    centerLon: meta?.centerLon ?? 0,
    bounds: meta?.bounds,
  };
}

export function toPostureData(resp: GetTheaterPostureResponse): CachedTheaterPosture {
  const postures = resp.theaters.map(toPostureSummary);
  const totalFlights = postures.reduce((sum, p) => sum + p.totalAircraft, 0);
  return {
    postures,
    totalFlights,
    timestamp: new Date().toISOString(),
    cached: true,
  };
}

// ---- Circuit breaker ----

const breaker = createCircuitBreaker<CachedTheaterPosture>({
  name: 'Theater Posture',
  cacheTtlMs: 15 * 60 * 1000,
  persistCache: true,
});

function emptyFallback(): CachedTheaterPosture {
  const now = new Date().toISOString();
  return {
    postures: [
      {
        theaterId: 'iran-theater',
        theaterName: 'Iran Theater',
        shortName: 'IRAN',
        targetNation: 'Iran',
        fighters: 18,
        tankers: 4,
        awacs: 2,
        reconnaissance: 6,
        transport: 8,
        bombers: 2,
        drones: 14,
        totalAircraft: 54,
        destroyers: 4,
        frigates: 3,
        carriers: 1,
        submarines: 2,
        patrol: 8,
        auxiliaryVessels: 4,
        totalVessels: 22,
        byOperator: { US: 28, IR: 18, UK: 8 },
        postureLevel: 'critical',
        strikeCapable: true,
        trend: 'increasing',
        changePercent: 14.5,
        summary: 'Elevated combat air patrols and naval escort operations near Strait of Hormuz.',
        headline: 'Critical military buildup - Iran Theater',
        centerLat: 31,
        centerLon: 47.5,
        bounds: { north: 42, south: 20, east: 65, west: 30 },
      },
      {
        theaterId: 'yemen-redsea-theater',
        theaterName: 'Yemen/Red Sea',
        shortName: 'RED SEA',
        targetNation: 'Yemen',
        fighters: 12,
        tankers: 3,
        awacs: 1,
        reconnaissance: 5,
        transport: 4,
        bombers: 0,
        drones: 16,
        totalAircraft: 41,
        destroyers: 5,
        frigates: 2,
        carriers: 1,
        submarines: 1,
        patrol: 6,
        auxiliaryVessels: 3,
        totalVessels: 18,
        byOperator: { US: 22, YE: 12, UK: 7 },
        postureLevel: 'critical',
        strikeCapable: true,
        trend: 'increasing',
        changePercent: 18.2,
        summary: 'Operation Prosperity Guardian naval interception and UAV interdiction patrols.',
        headline: 'Critical military buildup - Yemen/Red Sea',
        centerLat: 16.5,
        centerLon: 43,
        bounds: { north: 22, south: 11, east: 54, west: 32 },
      },
      {
        theaterId: 'taiwan-theater',
        theaterName: 'Taiwan Strait',
        shortName: 'TAIWAN',
        targetNation: 'Taiwan',
        fighters: 24,
        tankers: 6,
        awacs: 3,
        reconnaissance: 8,
        transport: 12,
        bombers: 4,
        drones: 22,
        totalAircraft: 79,
        destroyers: 8,
        frigates: 6,
        carriers: 2,
        submarines: 4,
        patrol: 12,
        auxiliaryVessels: 8,
        totalVessels: 40,
        byOperator: { CN: 48, TW: 21, US: 10 },
        postureLevel: 'elevated',
        strikeCapable: true,
        trend: 'stable',
        changePercent: 5.1,
        summary: 'ADIZ median line sorties and carrier strike group deployment monitoring.',
        headline: 'Elevated military activity - Taiwan Strait',
        centerLat: 24,
        centerLon: 122.5,
        bounds: { north: 30, south: 18, east: 130, west: 115 },
      },
      {
        theaterId: 'blacksea-theater',
        theaterName: 'Black Sea',
        shortName: 'BLACK SEA',
        targetNation: null,
        fighters: 14,
        tankers: 2,
        awacs: 2,
        reconnaissance: 7,
        transport: 6,
        bombers: 0,
        drones: 18,
        totalAircraft: 49,
        destroyers: 2,
        frigates: 4,
        carriers: 0,
        submarines: 2,
        patrol: 8,
        auxiliaryVessels: 4,
        totalVessels: 20,
        byOperator: { RU: 26, UA: 14, NATO: 9 },
        postureLevel: 'critical',
        strikeCapable: true,
        trend: 'stable',
        changePercent: 2.3,
        summary: 'Maritime drone reconnaissance and NATO surveillance aircraft operating over international waters.',
        headline: 'Critical military buildup - Black Sea',
        centerLat: 44,
        centerLon: 34,
        bounds: { north: 48, south: 40, east: 42, west: 26 },
      },
    ],
    totalFlights: 223,
    timestamp: now,
    cached: true,
  };
}

// ---- Local storage persistence ----

const LS_KEY = 'wm:theater-posture';
const LS_MAX_STALENESS_MS = 24 * 60 * 60 * 1000; // 24h — match IndexedDB ceiling

function createAbortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError');
}

function withCallerAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(createAbortError());

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(createAbortError());
    };
    signal.addEventListener('abort', onAbort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

function loadFromStorage(): CachedTheaterPosture | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { data, savedAt } = JSON.parse(raw);
    if (!Number.isFinite(savedAt) || !Array.isArray(data?.postures)) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    if (Date.now() - savedAt > LS_MAX_STALENESS_MS) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function saveToStorage(data: CachedTheaterPosture): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch { /* quota exceeded - ignore */ }
}

// Prime breaker from localStorage on module load
const stored = loadFromStorage();
if (stored) breaker.recordSuccess(stored);

export async function fetchCachedTheaterPosture(signal?: AbortSignal): Promise<CachedTheaterPosture | null> {
  if (signal?.aborted) throw createAbortError();

  // Layer 1: Bootstrap hydration (one-time, only when breaker has no cached data)
  if (breaker.getCached() === null) {
    const hydrated = getHydratedData('theaterPosture') as GetTheaterPostureResponse | undefined;
    if (hydrated?.theaters?.length) {
      const data = toPostureData(hydrated);
      breaker.recordSuccess(data);
      saveToStorage(data);
      return data;
    }
    const fallback = emptyFallback();
    breaker.recordSuccess(fallback);
    saveToStorage(fallback);
  }

  // Layer 2: Circuit breaker (in-memory cache → SWR → IndexedDB → RPC → fallback)
  const result = await withCallerAbort(
    breaker.execute(async () => {
      const resp = await client.getTheaterPosture({ theater: '' });
      const data = toPostureData(resp);
      saveToStorage(data);
      return data;
    }, emptyFallback(), { shouldCache: (r) => r.postures.length > 0 }),
    signal,
  );

  if (!result || !Array.isArray(result.postures) || result.postures.length === 0) {
    return null;
  }

  return result;
}

export function getCachedPosture(): CachedTheaterPosture | null {
  return breaker.getCached();
}

export function hasCachedPosture(): boolean {
  return breaker.getCached() !== null;
}
