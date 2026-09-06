import type { DistrictProfile } from './types';

export type GroundHazardCategory =
  | 'slope_movement'
  | 'tension_crack'
  | 'road_damage'
  | 'rockfall_debris'
  | 'blocked_road'
  | 'culvert_overflow';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'ESCALATED' | 'RESOLVED' | 'REJECTED';

export type ReporterRole = 'CITIZEN' | 'FIELD_OFFICIAL';

export interface GroundReport {
  id: string;
  districtId: string;
  districtName: string;
  state: string;
  lat: number;
  lon: number;
  locationName: string;
  category: GroundHazardCategory;
  categoryLabel: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  reporterRole: ReporterRole;
  reporterName: string;
  status: ReportStatus;
  adminNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export const HAZARD_CATEGORIES: { id: GroundHazardCategory; label: string; icon: string; defaultDesc: string }[] = [
  {
    id: 'slope_movement',
    label: 'Slope Movement / Slump',
    icon: '⛰️',
    defaultDesc: 'Visible downward earth movement or hillside slump observed near structure or road.',
  },
  {
    id: 'tension_crack',
    label: 'Ground / Tension Crack',
    icon: '⚡',
    defaultDesc: 'Fresh open tension cracks on highway tarmac or natural slope crest.',
  },
  {
    id: 'road_damage',
    label: 'Road Damage / Subsidence',
    icon: '🛣️',
    defaultDesc: 'Severe pavement deformation, subsidence, or collapsed retaining wall.',
  },
  {
    id: 'rockfall_debris',
    label: 'Rockfall Debris',
    icon: '🪨',
    defaultDesc: 'Loose boulders and scree deposited on highway corridor or settlement boundary.',
  },
  {
    id: 'blocked_road',
    label: 'Blocked Highway / Inundation',
    icon: '🚫',
    defaultDesc: 'Highway completely impassable due to deep floodwater or landslide debris blockage.',
  },
  {
    id: 'culvert_overflow',
    label: 'Drainage / Mudflow Overflow',
    icon: '🌊',
    defaultDesc: 'Clogged hillside culvert overflowing with high-velocity silt and water runoff.',
  },
];

export const DEMO_IMG_SLOPE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjQwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTI5M2IiLz48L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJtb3VudGFpbiIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0NzU1NjkiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTI5M2IiLz48L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJtdWRzbGlkZSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNiNDUzMDkiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzc4MzUwZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzQ1MWEwMyIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InJvYWQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMzM0MTU1Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMWUyOTNiIi8+PC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjc2t5KSIvPgogIDxnIHN0cm9rZT0iIzM4YmRmOCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjMiIHN0cm9rZS1kYXNoYXJyYXk9IjQsOCI+CiAgICA8bGluZSB4MT0iMjAiIHkxPSIwIiB4Mj0iMTAiIHkyPSIxMjAiLz48bGluZSB4MT0iODAiIHkxPSIwIiB4Mj0iNzAiIHkyPSIxNDAiLz48bGluZSB4MT0iMTYwIiB5MT0iMCIgeDI9IjE1MCIgeTI9IjEwMCIvPjxsaW5lIHgxPSIyNDAiIHkxPSIwIiB4Mj0iMjMwIiB5Mj0iMTYwIi8+PGxpbmUgeDE9IjMyMCIgeTE9IjAiIHgyPSIzMTAiIHkyPSIxMzAiLz48bGluZSB4MT0iMzgwIiB5MT0iMCIgeDI9IjM3MCIgeTI9IjE1MCIvPgogIDwvZz4KICA8cG9seWdvbiBwb2ludHM9IjAsMTQwIDEyMCw2MCAyMjAsMTMwIDMxMCw1MCA0MDAsMTIwIDQwMCwyNDAgMCwyNDAiIGZpbGw9InVybCgjbW91bnRhaW4pIiBvcGFjaXR5PSIwLjciLz4KICA8cG9seWdvbiBwb2ludHM9IjAsMjAgMjgwLDE3MCA0MDAsMjAwIDQwMCwyNDAgMCwyNDAiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNIDExMCw5MCBRIDE1MCwxMzAgMTgwLDE1MCBRIDIyMCwxNzAgMjYwLDE4NSBRIDIzMCwyMjAgMTYwLDIxNSBRIDEyMCwyMDAgOTUsMTQwIFoiIGZpbGw9InVybCgjbXVkc2xpZGUpIi8+CiAgPHBhdGggZD0iTSAxMjAsMTA1IFEgMTYwLDE0NSAyMTAsMTc1IiBzdHJva2U9IiNkOTc3MDYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC44Ii8+CiAgPHBhdGggZD0iTSAxMzUsMTIwIFEgMTc1LDE2MCAyNDAsMTkwIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC42Ii8+CiAgPGNpcmNsZSBjeD0iMjEwIiBjeT0iMTgwIiByPSIxMiIgZmlsbD0iIzY0NzQ4YiIgc3Ryb2tlPSIjMWUyOTNiIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIyMzUiIGN5PSIxOTUiIHI9IjgiIGZpbGw9IiM0NzU1NjkiIHN0cm9rZT0iIzFlMjkzYiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8Y2lyY2xlIGN4PSIxNzUiIGN5PSIxOTAiIHI9IjE0IiBmaWxsPSIjNjQ3NDhiIiBzdHJva2U9IiMwZjE3MmEiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCwyMDUgNDAwLDE5MCA0MDAsMjQwIDAsMjQwIiBmaWxsPSJ1cmwoI3JvYWQpIi8+CiAgPGxpbmUgeDE9IjAiIHkxPSIyMjIiIHgyPSIxNDAiIHkyPSIyMTYiIHN0cm9rZT0iI2VhYjMwOCIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtZGFzaGFycmF5PSIxMiw4Ii8+CiAgPGxpbmUgeDE9IjI3MCIgeTE9IjIxMCIgeDI9IjQwMCIgeTI9IjIwNSIgc3Ryb2tlPSIjZWFiMzA4IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1kYXNoYXJyYXk9IjEyLDgiLz4KICA8cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxMzAiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjkiLz4KICA8dGV4dCB4PSIyMCIgeT0iMjgiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+SElHSCBSSVNLICZidWxsOyBTTFVNUDwvdGV4dD4KPC9zdmc+";
export const DEMO_IMG_CRACK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjQwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreTIiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDIwNjE3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMWUyOTNiIi8+PC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0idGFybWFjIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzMzNDE1NSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBmMTcyYSIvPjwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSJ1cmwoI3NreTIpIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIwLDkwIDgwLDQwIDE4MCw4MCAyOTAsMzAgNDAwLDg1IDQwMCwxNDAgMCwxNDAiIGZpbGw9IiMxZTI5M2IiLz4KICA8cG9seWdvbiBwb2ludHM9IjAsMTIwIDE0MCw3NSAyNjAsMTEwIDQwMCw3MCA0MDAsMTYwIDAsMTYwIiBmaWxsPSIjMzM0MTU1IiBvcGFjaXR5PSIwLjYiLz4KICA8cG9seWdvbiBwb2ludHM9IjAsMTQwIDQwMCwxMzAgNDAwLDE1MCAwLDE2MCIgZmlsbD0iIzY0NzQ4YiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCwxNTUgNDAwLDE0NSA0MDAsMjQwIDAsMjQwIiBmaWxsPSJ1cmwoI3Rhcm1hYykiLz4KICA8bGluZSB4MT0iMCIgeTE9IjE2NSIgeDI9IjQwMCIgeTI9IjE1NSIgc3Ryb2tlPSIjZjhmYWZjIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8bGluZSB4MT0iMCIgeTE9IjIzMCIgeDI9IjQwMCIgeTI9IjIyNSIgc3Ryb2tlPSIjZjhmYWZjIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNIDYwLDE2MCBMIDkwLDE4MCBMIDE0MCwxNzUgTCAxODAsMjA1IEwgMjIwLDE5NSBMIDI4MCwyMzUgTCAzMTAsMjQwIiBzdHJva2U9IiMwMjA2MTciIHN0cm9rZS13aWR0aD0iNyIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0gNjAsMTYwIEwgOTAsMTgwIEwgMTQwLDE3NSBMIDE4MCwyMDUgTCAyMjAsMTk1IEwgMjgwLDIzNSBMIDMxMCwyNDAiIHN0cm9rZT0iI2VmNDQ0NCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI4NSwyMTUgOTUsMjE1IDkyLDE5MCA4OCwxOTAiIGZpbGw9IiNmOTczMTYiLz4KICA8cmVjdCB4PSI4MyIgeT0iMjE1IiB3aWR0aD0iMTQiIGhlaWdodD0iMyIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMjY1LDIyNSAyNzUsMjI1IDI3MiwyMDAgMjY4LDIwMCIgZmlsbD0iI2Y5NzMxNiIvPgogIDxyZWN0IHg9IjI2MyIgeT0iMjI1IiB3aWR0aD0iMTQiIGhlaWdodD0iMyIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyNCIgcng9IjQiIGZpbGw9IiNmOTczMTYiIG9wYWNpdHk9IjAuOTUiLz4KICA8dGV4dCB4PSIyMCIgeT0iMjgiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+Uk9BRCBGUkFDVFVSRTwvdGV4dD4KPC9zdmc+";
export const DEMO_IMG_FLOOD = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjQwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreTMiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDgyZjQ5Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGM0YTZlIi8+PC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZmxvb2R3YXRlciIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMjg0YzciLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzAzNjlhMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA3NTk4NSIvPjwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSJ1cmwoI3NreTMpIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIwLDExMCAxMTAsNTAgMjQwLDk1IDM1MCw0MCA0MDAsODAgNDAwLDE2MCAwLDE2MCIgZmlsbD0iIzFlMjkzYiIgb3BhY2l0eT0iMC44Ii8+CiAgPHJlY3QgeD0iOTAiIHk9IjEyNSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNDc1NTY5Ii8+CiAgPHJlY3QgeD0iMjEwIiB5PSIxMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0NSIgZmlsbD0iIzQ3NTU2OSIvPgogIDxyZWN0IHg9IjYwIiB5PSIxMjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTIiIGZpbGw9IiM2NDc0OGIiLz4KICA8cGF0aCBkPSJNIDAsMTM1IFEgMTAwLDEyMCAyMDAsMTM4IFEgMzAwLDEyNSA0MDAsMTM1IEwgNDAwLDI0MCBMIDAsMjQwIFoiIGZpbGw9InVybCgjZmxvb2R3YXRlcikiLz4KICA8cGF0aCBkPSJNIDAsMTUwIFEgODAsMTQwIDE4MCwxNTUgUSAyOTAsMTQ1IDQwMCwxNTIiIHN0cm9rZT0iI2JhZTZmZCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjgiLz4KICA8cGF0aCBkPSJNIDAsMTc1IFEgMTIwLDE2MCAyMjAsMTgwIFEgMzIwLDE2OCA0MDAsMTc1IiBzdHJva2U9IiMzOGJkZjgiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjYiLz4KICA8cmVjdCB4PSI2MCIgeT0iMTMwIiB3aWR0aD0iNiIgaGVpZ2h0PSI0NSIgZmlsbD0iIzk0YTNiOCIvPgogIDxyZWN0IHg9IjQ1IiB5PSIxMTUiIHdpZHRoPSIzNiIgaGVpZ2h0PSIyNCIgcng9IjIiIGZpbGw9IiNlYWIzMDgiIHN0cm9rZT0iI2NhOGEwNCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8dGV4dCB4PSI1MCIgeT0iMTMxIiBmaWxsPSIjMDAwMDAwIiBmb250LXNpemU9IjkiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5OSC0xMDwvdGV4dD4KICA8cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNjAiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjMDI4NGM3IiBvcGFjaXR5PSIwLjk1Ii8+CiAgPHRleHQgeD0iMjAiIHk9IjI4IiBmaWxsPSIjZmZmZmZmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPlJPQURXQVkgRkxPT0RFRDwvdGV4dD4KPC9zdmc+";
export const DEMO_IMG_ROCKFALL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjQwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreTQiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUxYjRiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzEyZTgxIi8+PC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iY2xpZmYiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjQ3NDhiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzM0MTU1Ii8+PC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjc2t5NCkiLz4KICA8cG9seWdvbiBwb2ludHM9IjAsMCAyMDAsMCAxMjAsMTgwIDAsMjQwIiBmaWxsPSJ1cmwoI2NsaWZmKSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMTIwLDE4MCA0MDAsMTYwIDQwMCwyNDAgMCwyNDAiIGZpbGw9IiMxZTI5M2IiLz4KICA8bGluZSB4MT0iMTQwIiB5MT0iMjEwIiB4Mj0iNDAwIiB5Mj0iMTk1IiBzdHJva2U9IiNlYWIzMDgiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iMTIsOCIvPgogIDxwb2x5Z29uIHBvaW50cz0iMTgwLDE3MCAyMzAsMTYwIDI1MCwxOTUgMjEwLDIxNSAxNzAsMTk1IiBmaWxsPSIjNjQ3NDhiIiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxwb2x5Z29uIHBvaW50cz0iMjMwLDE5MCAyNzAsMTg1IDI4NSwyMTAgMjU1LDIyNSAyMjUsMjEwIiBmaWxsPSIjNDc1NTY5IiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMi41Ii8+CiAgPHBvbHlnb24gcG9pbnRzPSIxNTAsMTk1IDE4MCwxOTAgMTkwLDIxNSAxNjUsMjI1IDE0MCwyMTAiIGZpbGw9IiM5NGEzYjgiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI2RjMjYyNiIgb3BhY2l0eT0iMC45NSIvPgogIDx0ZXh0IHg9IjIwIiB5PSIyOCIgZmlsbD0iI2ZmZmZmZiIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5ST0NLRkFMTCBCTE9DS0FHRTwvdGV4dD4KPC9zdmc+";
export const DEMO_IMG_STABLE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjQwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreTUiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDI4NGM3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzhiZGY4Ii8+PC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjc2t5NSkiLz4KICA8Y2lyY2xlIGN4PSIzNDAiIGN5PSI1MCIgcj0iMjgiIGZpbGw9IiNmZWYwOGEiIG9wYWNpdHk9IjAuOSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCwxMjAgMTIwLDYwIDI2MCwxMTAgMzgwLDQ1IDQwMCw3MCA0MDAsMTgwIDAsMTgwIiBmaWxsPSIjMTU4MDNkIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIwLDE1MCAxNjAsOTUgMjkwLDE0MCA0MDAsMTA1IDQwMCwyMDAgMCwyMDAiIGZpbGw9IiMxNmEzNGEiLz4KICA8cG9seWdvbiBwb2ludHM9IjAsMTgwIDQwMCwxNzAgNDAwLDI0MCAwLDI0MCIgZmlsbD0iIzFlMjkzYiIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMjEwIiB4Mj0iNDAwIiB5Mj0iMjA1IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iMTQsMTAiLz4KICA8cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNTAiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjMTZhMzRhIiBvcGFjaXR5PSIwLjk1Ii8+CiAgPHRleHQgeD0iMjAiIHk9IjI4IiBmaWxsPSIjZmZmZmZmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkNMRUFSIC8gTE9XIFJJU0s8L3RleHQ+Cjwvc3ZnPg==";

export const SAMPLE_HAZARD_PRESETS = [
  {
    id: 'preset_slope_slip',
    name: 'Slope Slump & Mudflow (High Risk)',
    category: 'slope_movement' as GroundHazardCategory,
    description: 'Active 20-meter slope slump with loose shale debris sliding toward access road.',
    svgData: DEMO_IMG_SLOPE,
  },
  {
    id: 'preset_tension_crack',
    name: 'Highway Tension Crack',
    category: 'tension_crack' as GroundHazardCategory,
    description: '15cm tension cracks observed extending approximately 40m along road embankment.',
    svgData: DEMO_IMG_CRACK,
  },
  {
    id: 'preset_road_flood',
    name: 'Roadway Inundation & Flooding',
    category: 'blocked_road' as GroundHazardCategory,
    description: 'Mountain river basin overflow submerging 200m of arterial roadway under 0.8m water.',
    svgData: DEMO_IMG_FLOOD,
  },
  {
    id: 'preset_rockfall',
    name: 'Rockfall Boulder Blockage',
    category: 'rockfall_debris' as GroundHazardCategory,
    description: 'Multiple 1-to-2 meter limestone boulders fallen across both highway lanes.',
    svgData: DEMO_IMG_ROCKFALL,
  },
  {
    id: 'preset_stable_road',
    name: 'Clear Highway Corridor (Low Risk)',
    category: 'road_damage' as GroundHazardCategory,
    description: 'Reinforced hillside highway with functional drainage channels and clear lanes.',
    svgData: DEMO_IMG_STABLE,
  },
];

export const SEEDED_GROUND_REPORTS: GroundReport[] = [
  {
    id: 'NS-1042',
    districtId: 'mn_noney',
    districtName: 'Noney',
    state: 'Manipur',
    lat: 24.7833,
    lon: 93.6167,
    locationName: 'Tupul Railway Yard Escarpment (Noney)',
    category: 'tension_crack',
    categoryLabel: 'Ground / Tension Crack',
    description: '15cm tension cracks observed extending approximately 40m along upper railway cutting slope.',
    mediaUrl: DEMO_IMG_CRACK,
    mediaType: 'image',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    reporterRole: 'FIELD_OFFICIAL',
    reporterName: 'L. Singh (PWD Field Inspector)',
    status: 'ESCALATED',
    adminNotes: 'SDRF 2nd Bn notified. PWD rapid stabilization team deployed.',
  },
  {
    id: 'NS-1045',
    districtId: 'sk_mangan',
    districtName: 'Mangan (North Sikkim)',
    state: 'Sikkim',
    lat: 27.5670,
    lon: 88.5830,
    locationName: 'Chungthang Dam Approach (NH-10)',
    category: 'slope_movement',
    categoryLabel: 'Slope Movement / Slump',
    description: 'Substantial mass movement near Teesta river bank with water surging near bridge abutment.',
    mediaUrl: DEMO_IMG_SLOPE,
    mediaType: 'image',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    reporterRole: 'CITIZEN',
    reporterName: 'Tashi Lepcha (Local Resident)',
    status: 'VERIFIED',
    adminNotes: 'Verified via Chungthang DEOC surveillance.',
  },
  {
    id: 'NS-1048',
    districtId: 'ml_east_khasi',
    districtName: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.3200,
    lon: 91.7300,
    locationName: 'Cherrapunji-Sohra Hill Road Km 24',
    category: 'blocked_road',
    categoryLabel: 'Blocked Highway / Inundation',
    description: 'Excessive rainwater runoff and culvert inundation blocking light motor vehicle transit.',
    mediaUrl: DEMO_IMG_FLOOD,
    mediaType: 'image',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    reporterRole: 'CITIZEN',
    reporterName: 'Banrap Lyngdoh (Commuter)',
    status: 'UNDER_REVIEW',
  },
  {
    id: 'NS-1051',
    districtId: 'as_dima_hasao',
    districtName: 'Dima Hasao',
    state: 'Assam',
    lat: 25.1800,
    lon: 93.0200,
    locationName: 'Mahur Railway Cutting (Lumding-Badarpur Line)',
    category: 'rockfall_debris',
    categoryLabel: 'Rockfall Debris',
    description: 'Boulders fallen onto railway track bed and side drainage trench after early morning tremor.',
    mediaUrl: DEMO_IMG_ROCKFALL,
    mediaType: 'image',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    reporterRole: 'FIELD_OFFICIAL',
    reporterName: 'A. Barman (NFR Track Inspector)',
    status: 'VERIFIED',
    adminNotes: 'Track cleared by NFR engineering gang; slope net inspection pending.',
  },
];

class GroundReportsService {
  private storageKey = 'nexsignal_ground_reports';
  private reports: GroundReport[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadReports();
  }

  private loadReports() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      try {
        this.reports = JSON.parse(data);
      } catch (e) {
        this.reports = [...SEEDED_GROUND_REPORTS];
      }
    } else {
      this.reports = [...SEEDED_GROUND_REPORTS];
      this.saveReports();
    }
  }

  private saveReports() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.reports));
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getReports(): GroundReport[] {
    return [...this.reports];
  }

  public getReportsForDistrict(districtId: string): GroundReport[] {
    return this.reports.filter((r) => r.districtId === districtId);
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
    mediaUrl: string;
    mediaType: 'image' | 'video';
    reporterRole: ReporterRole;
    reporterName: string;
  }): GroundReport {
    const cat = HAZARD_CATEGORIES.find((c) => c.id === params.category);
    const count = this.reports.length + 1040;
    const newReport: GroundReport = {
      id: `NS-${count + 1}`,
      districtId: params.district.id,
      districtName: params.district.name,
      state: params.district.state,
      lat: params.lat,
      lon: params.lon,
      locationName: params.locationName,
      category: params.category,
      categoryLabel: cat ? cat.label : 'Ground Hazard',
      description: params.description,
      mediaUrl: params.mediaUrl || DEMO_IMG_SLOPE,
      mediaType: params.mediaType,
      timestamp: new Date().toISOString(),
      reporterRole: params.reporterRole,
      reporterName: params.reporterName,
      status: 'PENDING',
    };

    this.reports.unshift(newReport);
    this.saveReports();
    return newReport;
  }

  public updateReportStatus(reportId: string, status: ReportStatus, adminNotes?: string, verifiedBy?: string) {
    const idx = this.reports.findIndex((r) => r.id === reportId);
    if (idx !== -1) {
      this.reports[idx].status = status;
      if (adminNotes) {
        this.reports[idx].adminNotes = adminNotes;
      }
      if (verifiedBy) {
        this.reports[idx].verifiedBy = verifiedBy;
        this.reports[idx].verifiedAt = new Date().toISOString();
      }
      this.saveReports();
    }
  }
}

export const groundReportsService = new GroundReportsService();
