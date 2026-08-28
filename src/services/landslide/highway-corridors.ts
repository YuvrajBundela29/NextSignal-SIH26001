export interface HighwayCorridor {
  id: string;
  name: string;
  code: string;
  route: string;
  states: string[];
  vulnerabilityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  currentStatus: 'OPEN' | 'ADVISORY' | 'RESTRICTED' | 'BLOCKED';
  vulnerableChokePoints: string[];
  activePitsCount: number;
  nearestPwdDepot: string;
  pwdEmergencyContact: string;
  coordinates: [number, number][]; // Polyline coords for map
}

export const NER_HIGHWAY_CORRIDORS: HighwayCorridor[] = [
  {
    id: 'nh_6',
    name: 'NH-6 (Meghalaya - Barak Valley Lifeline)',
    code: 'NH-6',
    route: 'Jorabat → Shillong → Jowai → Khliehriat → Ratacherra → Silchar',
    states: ['Meghalaya', 'Assam', 'Tripura', 'Mizoram'],
    vulnerabilityLevel: 'CRITICAL',
    currentStatus: 'RESTRICTED',
    vulnerableChokePoints: ['Sonapur Tunnel Cut', 'Ratacherra Escarpment', 'Umsning Bypass', 'Lumshnong Mudslide Point'],
    activePitsCount: 6,
    nearestPwdDepot: 'NHAI / PWD Mechanical Division, Jowai',
    pwdEmergencyContact: '03655-230224',
    coordinates: [
      [26.10, 91.85], [25.57, 91.89], [25.44, 92.20], [25.35, 92.37], [25.10, 92.48], [24.83, 92.78]
    ],
  },
  {
    id: 'nh_29',
    name: 'NH-29 (Nagaland - Manipur Mountain Arterial)',
    code: 'NH-29',
    route: 'Dimapur → Chumukedima → Medziphema → Kohima → Mao → Senapati → Imphal',
    states: ['Nagaland', 'Manipur'],
    vulnerabilityLevel: 'CRITICAL',
    currentStatus: 'ADVISORY',
    vulnerableChokePoints: ['Chumukedima Rockfall Zone', 'Phesama Subsidence Area', 'Mao Gate Crest', 'Tupul Valley Cut'],
    activePitsCount: 5,
    nearestPwdDepot: 'Border Roads Organisation (BRO / Project Sewak), Kohima',
    pwdEmergencyContact: '0370-2241258',
    coordinates: [
      [25.90, 93.72], [25.75, 93.85], [25.67, 94.10], [25.50, 94.12], [25.26, 94.02], [24.81, 93.93]
    ],
  },
  {
    id: 'nh_10',
    name: 'NH-10 (Sikkim Himalaya River Valley Lifeline)',
    code: 'NH-10',
    route: 'Sevoke → Coronation Bridge → Teesta Bazaar → Singtam → Ranipool → Gangtok',
    states: ['Sikkim', 'West Bengal'],
    vulnerabilityLevel: 'HIGH',
    currentStatus: 'RESTRICTED',
    vulnerableChokePoints: ['29th Mile Teesta Sinking Zone', 'Likuvir Rockfall Face', 'Sethijhora Washout Choke', 'Baluwakhani Slope'],
    activePitsCount: 8,
    nearestPwdDepot: 'BRO Project Swastik / Sikkim PWD Heavy Depot, Singtam',
    pwdEmergencyContact: '03592-234120',
    coordinates: [
      [26.88, 88.47], [27.05, 88.43], [27.15, 88.50], [27.23, 88.50], [27.33, 88.61]
    ],
  },
  {
    id: 'nh_13',
    name: 'NH-13 (Trans-Arunachal Highway)',
    code: 'NH-13',
    route: 'Bhalukpong → Bomdila → Nechiphu → Seppa → Sagalee → Ziro → Pasighat',
    states: ['Arunachal Pradesh'],
    vulnerabilityLevel: 'HIGH',
    currentStatus: 'OPEN',
    vulnerableChokePoints: ['Nechiphu Zero Point', 'Sessa Orchid Sinking Zone', 'Bhalukpong Slopes', 'Panyor River Gorge'],
    activePitsCount: 4,
    nearestPwdDepot: 'BRO Project Vartak, Bomdila',
    pwdEmergencyContact: '03782-222401',
    coordinates: [
      [27.01, 92.63], [27.26, 92.42], [27.15, 93.10], [27.53, 93.83], [28.06, 95.33]
    ],
  },
  {
    id: 'nh_27_dima',
    name: 'NH-27 / NH-54 (Dima Hasao Hill Highway)',
    code: 'NH-27',
    route: 'Doboka → Lumding → Langting → Maibang → Haflong → Jatinga → Silchar',
    states: ['Assam'],
    vulnerabilityLevel: 'CRITICAL',
    currentStatus: 'RESTRICTED',
    vulnerableChokePoints: ['Jatinga Mudslide Gully', 'New Haflong Hill Cut', 'Migrendisa Sinking Section', 'Mahur River Bank'],
    activePitsCount: 7,
    nearestPwdDepot: 'Assam PWD (Roads) Heavy Equipment Depot, Haflong',
    pwdEmergencyContact: '03673-236202',
    coordinates: [
      [25.98, 92.88], [25.50, 93.15], [25.30, 93.16], [25.18, 93.02], [24.83, 92.78]
    ],
  },
];
