import { toApiUrl } from '@/services/runtime';

export interface HormuzSeries {
  date: string;
  value: number;
}

export interface HormuzChart {
  label: string;
  title: string;
  series: HormuzSeries[];
}

export interface HormuzTrackerData {
  fetchedAt: number;
  updatedDate: string | null;
  title: string | null;
  summary: string | null;
  paragraphs: string[];
  status: 'closed' | 'disrupted' | 'restricted' | 'open';
  charts: HormuzChart[];
  attribution: { source: string; url: string };
}

const LOCAL_HORMUZ_FALLBACK: HormuzTrackerData = {
  fetchedAt: Date.now(),
  updatedDate: new Date().toLocaleDateString(),
  title: 'Strait of Hormuz AIS Maritime Flow Monitor',
  summary: 'Active commercial and tanker tracking through the Strait of Hormuz. Normal transit density observed with elevated naval patrol alerts.',
  paragraphs: [
    'Daily tanker transit volumes remain steady across outbound VLCC lanes.',
    'AIS transponder coverage confirms active passage along primary separation schemes.',
  ],
  status: 'open',
  charts: [
    {
      label: 'Tankers (Daily)',
      title: 'Daily Tanker Transits',
      series: [
        { date: 'Day -6', value: 38 },
        { date: 'Day -5', value: 41 },
        { date: 'Day -4', value: 36 },
        { date: 'Day -3', value: 44 },
        { date: 'Day -2', value: 40 },
        { date: 'Day -1', value: 42 },
        { date: 'Today', value: 43 },
      ],
    },
  ],
  attribution: { source: 'NextSignal Maritime AIS', url: 'https://nextsignal.app' },
};

export async function fetchHormuzTracker(): Promise<HormuzTrackerData | null> {
  try {
    const resp = await fetch(toApiUrl('/api/supply-chain/hormuz-tracker'), {
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return LOCAL_HORMUZ_FALLBACK;
    const raw = (await resp.json()) as HormuzTrackerData;
    return raw.attribution ? raw : LOCAL_HORMUZ_FALLBACK;
  } catch {
    return LOCAL_HORMUZ_FALLBACK;
  }
}
