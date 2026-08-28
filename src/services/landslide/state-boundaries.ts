import type { FeatureCollection, Polygon, GeoJsonProperties } from 'geojson';

export interface StateGeoMetadata {
  state: string;
  nameHi: string;
  nameAs: string;
  capital: string;
  districtsCount: number;
  elevationRange: string;
  primaryHighway: string;
  color: string;
}

// Official state boundary coordinates for the 8 North Eastern Region (NER) States
export const NER_STATES_GEOJSON: FeatureCollection<Polygon, StateGeoMetadata> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        state: 'Assam',
        nameHi: 'असम',
        nameAs: 'অসম',
        capital: 'Dispur (Guwahati)',
        districtsCount: 4,
        elevationRange: '50m - 1,960m',
        primaryHighway: 'NH-27 / NH-6',
        color: '#06b6d4',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [95.35, 27.95], [96.00, 27.70], [95.90, 27.15], [95.10, 26.85], [94.60, 26.40],
          [93.80, 25.80], [93.30, 25.40], [93.10, 24.70], [92.60, 24.40], [92.40, 24.80],
          [92.80, 25.00], [92.50, 25.50], [91.80, 25.80], [90.60, 25.90], [89.80, 25.80],
          [89.90, 26.10], [89.80, 26.45], [90.10, 26.80], [91.50, 26.90], [92.80, 26.85],
          [93.60, 27.10], [94.50, 27.50], [95.35, 27.95]
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        state: 'Meghalaya',
        nameHi: 'मेघालय',
        nameAs: 'মেঘালয়',
        capital: 'Shillong',
        districtsCount: 4,
        elevationRange: '150m - 1,961m',
        primaryHighway: 'NH-6 (Jowai-Ratacherra)',
        color: '#38bdf8',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [90.00, 25.95], [91.20, 26.05], [92.10, 26.00], [92.80, 25.80], [92.80, 25.20],
          [92.20, 25.10], [91.30, 25.15], [90.40, 25.10], [89.85, 25.30], [89.90, 25.75],
          [90.00, 25.95]
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        state: 'Arunachal Pradesh',
        nameHi: 'अरुणाचल प्रदेश',
        nameAs: 'অৰুণাচল প্ৰদেশ',
        capital: 'Itanagar',
        districtsCount: 4,
        elevationRange: '300m - 7,090m',
        primaryHighway: 'NH-13 (Trans-Arunachal)',
        color: '#a855f7',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.60, 27.40], [92.00, 28.00], [93.20, 28.40], [94.00, 28.80], [95.00, 29.30],
          [96.30, 28.90], [97.40, 28.30], [97.10, 27.80], [96.50, 27.20], [95.50, 26.90],
          [94.00, 27.10], [92.80, 27.00], [92.00, 26.90], [91.60, 27.40]
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        state: 'Nagaland',
        nameHi: 'नागालैंड',
        nameAs: 'নাগালেণ্ড',
        capital: 'Kohima',
        districtsCount: 3,
        elevationRange: '194m - 3,840m',
        primaryHighway: 'NH-29 (Dimapur-Kohima-Imphal)',
        color: '#ec4899',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [95.20, 26.90], [95.50, 26.60], [95.10, 26.00], [94.80, 25.60], [94.20, 25.50],
          [93.60, 25.60], [93.80, 26.00], [94.40, 26.50], [95.20, 26.90]
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        state: 'Manipur',
        nameHi: 'मणिपुर',
        nameAs: 'মণিপুৰ',
        capital: 'Imphal',
        districtsCount: 3,
        elevationRange: '40m - 2,994m',
        primaryHighway: 'NH-37 / NH-2',
        color: '#f59e0b',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [94.20, 25.60], [94.80, 25.60], [94.70, 25.10], [94.40, 24.40], [93.40, 23.80],
          [93.00, 24.20], [93.20, 24.80], [93.50, 25.40], [94.20, 25.60]
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        state: 'Mizoram',
        nameHi: 'मिजोरम',
        nameAs: 'মিজোৰাম',
        capital: 'Aizawl',
        districtsCount: 3,
        elevationRange: '21m - 2,157m',
        primaryHighway: 'NH-54 / NH-306',
        color: '#10b981',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.00, 24.40], [93.30, 24.20], [93.40, 23.50], [93.10, 22.80], [92.80, 21.95],
          [92.50, 22.20], [92.30, 23.00], [92.30, 24.00], [93.00, 24.40]
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        state: 'Tripura',
        nameHi: 'त्रिपुरा',
        nameAs: 'ত্ৰিপুৰা',
        capital: 'Agartala',
        districtsCount: 3,
        elevationRange: '15m - 939m',
        primaryHighway: 'NH-8 (Assam-Agartala)',
        color: '#eab308',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.20, 24.50], [92.35, 24.30], [92.25, 23.80], [91.90, 23.20], [91.40, 23.00],
          [91.20, 23.50], [91.30, 24.00], [91.80, 24.20], [92.20, 24.50]
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        state: 'Sikkim',
        nameHi: 'सिक्किम',
        nameAs: 'ছিকিম',
        capital: 'Gangtok',
        districtsCount: 4,
        elevationRange: '280m - 8,586m',
        primaryHighway: 'NH-10 (Siliguri-Gangtok)',
        color: '#6366f1',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [88.60, 28.10], [88.90, 27.90], [88.85, 27.30], [88.50, 27.10], [88.10, 27.15],
          [88.15, 27.60], [88.30, 28.00], [88.60, 28.10]
        ]],
      },
    },
  ],
};
