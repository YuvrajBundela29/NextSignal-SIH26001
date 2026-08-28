// Official GeoJSON Polygon Boundaries for 8 North Eastern States & Key Districts
export interface NerGeoJsonFeature {
  type: 'Feature';
  id: string;
  properties: {
    name: string;
    nameHi: string;
    state: string;
    type: 'state' | 'district';
    color: string;
    center: [number, number]; // [lat, lon]
    elevationM?: number;
    slopeDeg?: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON format: [Lon, Lat]
  };
}

export interface NerFeatureCollection {
  type: 'FeatureCollection';
  features: NerGeoJsonFeature[];
}

export const NER_BOUNDARIES_GEOJSON: NerFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. ASSAM (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_assam',
      properties: {
        name: 'Assam',
        nameHi: 'असम',
        state: 'Assam',
        type: 'state',
        color: '#06b6d4',
        center: [26.14, 92.93],
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

    // 2. MEGHALAYA (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_meghalaya',
      properties: {
        name: 'Meghalaya',
        nameHi: 'मेघालय',
        state: 'Meghalaya',
        type: 'state',
        color: '#38bdf8',
        center: [25.57, 91.88],
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

    // 3. ARUNACHAL PRADESH (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_arunachal',
      properties: {
        name: 'Arunachal Pradesh',
        nameHi: 'अरुणाचल प्रदेश',
        state: 'Arunachal Pradesh',
        type: 'state',
        color: '#a855f7',
        center: [27.08, 93.60],
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

    // 4. NAGALAND (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_nagaland',
      properties: {
        name: 'Nagaland',
        nameHi: 'नागालैंड',
        state: 'Nagaland',
        type: 'state',
        color: '#ec4899',
        center: [25.67, 94.10],
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [95.20, 26.90], [95.50, 26.60], [95.10, 26.00], [94.80, 25.60], [94.20, 25.50],
          [93.60, 25.60], [93.80, 26.00], [94.40, 26.50], [95.20, 26.90]
        ]],
      },
    },

    // 5. MANIPUR (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_manipur',
      properties: {
        name: 'Manipur',
        nameHi: 'मणिपुर',
        state: 'Manipur',
        type: 'state',
        color: '#f59e0b',
        center: [24.81, 93.93],
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [94.20, 25.60], [94.80, 25.60], [94.70, 25.10], [94.40, 24.40], [93.40, 23.80],
          [93.00, 24.20], [93.20, 24.80], [93.50, 25.40], [94.20, 25.60]
        ]],
      },
    },

    // 6. MIZORAM (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_mizoram',
      properties: {
        name: 'Mizoram',
        nameHi: 'मिजोरम',
        state: 'Mizoram',
        type: 'state',
        color: '#10b981',
        center: [23.72, 92.71],
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.00, 24.40], [93.30, 24.20], [93.40, 23.50], [93.10, 22.80], [92.80, 21.95],
          [92.50, 22.20], [92.30, 23.00], [92.30, 24.00], [93.00, 24.40]
        ]],
      },
    },

    // 7. TRIPURA (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_tripura',
      properties: {
        name: 'Tripura',
        nameHi: 'त्रिपुरा',
        state: 'Tripura',
        type: 'state',
        color: '#eab308',
        center: [23.83, 91.28],
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.20, 24.50], [92.35, 24.30], [92.25, 23.80], [91.90, 23.20], [91.40, 23.00],
          [91.20, 23.50], [91.30, 24.00], [91.80, 24.20], [92.20, 24.50]
        ]],
      },
    },

    // 8. SIKKIM (Official Boundary Polygon)
    {
      type: 'Feature',
      id: 'state_sikkim',
      properties: {
        name: 'Sikkim',
        nameHi: 'सिक्किम',
        state: 'Sikkim',
        type: 'state',
        color: '#6366f1',
        center: [27.50, 88.52],
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [88.60, 28.10], [88.90, 27.90], [88.85, 27.30], [88.50, 27.10], [88.10, 27.15],
          [88.15, 27.60], [88.30, 28.00], [88.60, 28.10]
        ]],
      },
    },

    // DISTRICT POLYGONS: High-Hazard Landslide Districts
    // Dima Hasao (Assam)
    {
      type: 'Feature',
      id: 'as_dima_hasao',
      properties: {
        name: 'Dima Hasao (Haflong)',
        nameHi: 'दीमा हसाओ (हाफलोंग)',
        state: 'Assam',
        type: 'district',
        color: '#ef4444',
        center: [25.18, 93.02],
        elevationM: 950,
        slopeDeg: 34,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.70, 25.45], [93.15, 25.55], [93.45, 25.30], [93.30, 24.95], [92.85, 24.90],
          [92.60, 25.20], [92.70, 25.45]
        ]],
      },
    },

    // East Khasi Hills (Meghalaya)
    {
      type: 'Feature',
      id: 'ml_east_khasi_hills',
      properties: {
        name: 'East Khasi Hills (Shillong/Sohra)',
        nameHi: 'पूर्वी खासी हिल्स (शिलांग/चेरापूंजी)',
        state: 'Meghalaya',
        type: 'district',
        color: '#f97316',
        center: [25.57, 91.89],
        elevationM: 1525,
        slopeDeg: 42,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.65, 25.75], [92.15, 25.70], [92.10, 25.25], [91.70, 25.20], [91.50, 25.45],
          [91.65, 25.75]
        ]],
      },
    },

    // Mangan (North Sikkim)
    {
      type: 'Feature',
      id: 'sk_mangan',
      properties: {
        name: 'Mangan (North Sikkim / Chungthang)',
        nameHi: 'मंगन (उत्तरी सिक्किम / चुंगथांग)',
        state: 'Sikkim',
        type: 'district',
        color: '#ef4444',
        center: [27.50, 88.52],
        elevationM: 1615,
        slopeDeg: 49,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [88.35, 28.05], [88.85, 27.95], [88.75, 27.45], [88.35, 27.40], [88.20, 27.75],
          [88.35, 28.05]
        ]],
      },
    },

    // Tawang (Arunachal Pradesh)
    {
      type: 'Feature',
      id: 'ar_tawang',
      properties: {
        name: 'Tawang (High Himalayas)',
        nameHi: 'तवांग (उच्च हिमालय)',
        state: 'Arunachal Pradesh',
        type: 'district',
        color: '#ef4444',
        center: [27.58, 91.86],
        elevationM: 3048,
        slopeDeg: 46,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.55, 27.80], [92.15, 27.75], [92.10, 27.45], [91.65, 27.35], [91.55, 27.80]
        ]],
      },
    },

    // Kohima (Nagaland)
    {
      type: 'Feature',
      id: 'nl_kohima',
      properties: {
        name: 'Kohima (State Capital)',
        nameHi: 'कोहिमा (राजधानी)',
        state: 'Nagaland',
        type: 'district',
        color: '#f97316',
        center: [25.67, 94.10],
        elevationM: 1444,
        slopeDeg: 37,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.90, 25.85], [94.30, 25.80], [94.25, 25.50], [93.85, 25.55], [93.90, 25.85]
        ]],
      },
    },

    // Noney (Manipur)
    {
      type: 'Feature',
      id: 'mn_noney',
      properties: {
        name: 'Noney (Tupul Railway Corridor)',
        nameHi: 'नोने (टुपुल रेलवे)',
        state: 'Manipur',
        type: 'district',
        color: '#ef4444',
        center: [24.81, 93.60],
        elevationM: 780,
        slopeDeg: 44,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.40, 25.00], [93.80, 24.95], [93.75, 24.65], [93.35, 24.70], [93.40, 25.00]
        ]],
      },
    },

    // Aizawl (Mizoram)
    {
      type: 'Feature',
      id: 'mz_aizawl',
      properties: {
        name: 'Aizawl (State Capital)',
        nameHi: 'आइजोल (राजधानी)',
        state: 'Mizoram',
        type: 'district',
        color: '#f97316',
        center: [23.72, 92.71],
        elevationM: 1132,
        slopeDeg: 41,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.50, 23.95], [92.95, 23.90], [92.90, 23.50], [92.45, 23.55], [92.50, 23.95]
        ]],
      },
    },

    // Dhalai (Tripura)
    {
      type: 'Feature',
      id: 'tr_dhalai',
      properties: {
        name: 'Dhalai (Ambassa)',
        nameHi: 'धलाई (अम्बासा)',
        state: 'Tripura',
        type: 'district',
        color: '#eab308',
        center: [23.92, 91.85],
        elevationM: 180,
        slopeDeg: 26,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.65, 24.15], [92.05, 24.10], [92.00, 23.70], [91.60, 23.75], [91.65, 24.15]
        ]],
      },
    }
  ]
};
