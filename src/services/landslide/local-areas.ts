export interface LocalAreaInfo {
  name: string;
  latOffset: number;
  lonOffset: number;
  criticalInfrastructure?: string;
}

export const NER_LOCAL_AREAS: Record<string, LocalAreaInfo[]> = {
  sk_mangan: [
    { name: 'Chungthang (Teesta / NH-10)', latOffset: 0.08, lonOffset: 0.09, criticalInfrastructure: 'Teesta Hydro Dam & Chungthang Bridge' },
    { name: 'Mangan Bazaar', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Hospital & Administrative Complex' },
    { name: 'Lachen Valley', latOffset: 0.22, lonOffset: -0.05, criticalInfrastructure: 'Border Road Org Base Camp' },
    { name: 'Lachung Valley', latOffset: 0.18, lonOffset: 0.16, criticalInfrastructure: 'Lachung River Causeway' },
    { name: 'Dikchu Slopes', latOffset: -0.12, lonOffset: -0.02, criticalInfrastructure: 'Hydro Powerhouse Penstock Slopes' },
    { name: 'Singtam Road Junction', latOffset: -0.18, lonOffset: 0.01, criticalInfrastructure: 'NH-10 Critical Transit Hub' }
  ],
  sk_gangtok: [
    { name: 'Gangtok Town (MG Marg)', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Capital Emergency Operations Center' },
    { name: 'Deorali Slopes', latOffset: -0.02, lonOffset: 0.01, criticalInfrastructure: 'Ropeway Terminal & NH-10 Lifeline' },
    { name: 'Tadong Corridor', latOffset: -0.04, lonOffset: 0.02, criticalInfrastructure: 'Sikkim University & Civil Hospital' },
    { name: 'Burtuk Landslide Zone', latOffset: 0.03, lonOffset: 0.01, criticalInfrastructure: 'Helipad Staging Point' },
    { name: 'Ranipool Crossing', latOffset: -0.06, lonOffset: -0.01, criticalInfrastructure: 'NH-10 Multi-Span Bridge' }
  ],
  sk_gyalshing: [
    { name: 'Gyalshing Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Secretariat' },
    { name: 'Pelling Slopes', latOffset: 0.03, lonOffset: -0.02, criticalInfrastructure: 'Helipad & Tourist Corridor' },
    { name: 'Yuksom Ridge', latOffset: 0.12, lonOffset: 0.03, criticalInfrastructure: 'Historical Settlement Base' },
    { name: 'Dentam Valley', latOffset: -0.08, lonOffset: -0.04, criticalInfrastructure: 'Sub-Divisional Hospital' }
  ],
  sk_namchi: [
    { name: 'Namchi Bazaar', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Emergency Center' },
    { name: 'Jorethang Road', latOffset: -0.06, lonOffset: -0.05, criticalInfrastructure: 'Teesta-Rangeet Confluence Bridge' },
    { name: 'Ravangla Pass', latOffset: 0.08, lonOffset: 0.03, criticalInfrastructure: 'High Altitude Transit Route' },
    { name: 'Damthang Slopes', latOffset: 0.04, lonOffset: 0.02, criticalInfrastructure: 'Forest Department Wireless Post' }
  ],
  ml_east_khasi: [
    { name: 'Cherrapunji (Sohra)', latOffset: -0.15, lonOffset: 0.08, criticalInfrastructure: 'High-Precipitation Meteorological Post' },
    { name: 'Mawsynram Slopes', latOffset: -0.17, lonOffset: -0.05, criticalInfrastructure: 'Limestone Caves & Hill Road' },
    { name: 'Shillong Peak Corridor', latOffset: 0.02, lonOffset: -0.01, criticalInfrastructure: 'Air Force Station & Radar Facility' },
    { name: 'Pynursla Escarpment', latOffset: -0.18, lonOffset: 0.19, criticalInfrastructure: 'NH-206 Indo-Bangla Lifeline' },
    { name: 'Laitkor Ridge', latOffset: 0.01, lonOffset: 0.05, criticalInfrastructure: 'State Disaster Response Force HQ' }
  ],
  ml_west_khasi: [
    { name: 'Nongstoin Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Civil Hospital' },
    { name: 'Mairang Corridor', latOffset: 0.09, lonOffset: 0.14, criticalInfrastructure: 'NH-106 Lifeline' },
    { name: 'Kynshi River Valley', latOffset: -0.07, lonOffset: 0.06, criticalInfrastructure: 'Kynshi Hydro Project Staging' }
  ],
  ml_ri_bhoi: [
    { name: 'Nongpoh (NH-6)', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Guwahati-Shillong Heavy Cargo Route' },
    { name: 'Umiam Lake Basin', latOffset: -0.09, lonOffset: 0.02, criticalInfrastructure: 'Umiam Hydro Dam' },
    { name: 'Byrnihat Industrial Belt', latOffset: 0.14, lonOffset: -0.02, criticalInfrastructure: 'Border Logistics Depot' }
  ],
  ml_west_garo: [
    { name: 'Tura Peak Foothills', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Tura Civil Hospital & DEOC' },
    { name: 'Rongram Corridor', latOffset: 0.08, lonOffset: 0.04, criticalInfrastructure: 'Rongram Bridge Lifeline' },
    { name: 'Garobadha Slopes', latOffset: -0.07, lonOffset: -0.11, criticalInfrastructure: 'Plain-Hill Transition Hub' }
  ],
  mn_noney: [
    { name: 'Tupul Railway Corridor (NH-37)', latOffset: 0.05, lonOffset: 0.06, criticalInfrastructure: 'Jiribam-Imphal Railway Project & 107th TA Camp' },
    { name: 'Noney Bazaar', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Sub-Divisional Hospital & Bridge' },
    { name: 'Longmai Valley', latOffset: -0.04, lonOffset: -0.02, criticalInfrastructure: 'Ijai River Basin Settlement' },
    { name: 'Awangkhul Slopes', latOffset: 0.11, lonOffset: -0.08, criticalInfrastructure: 'NH-37 Critical Rock-Cutting Corridor' }
  ],
  mn_tamenglong: [
    { name: 'Tamenglong Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District HQ Complex' },
    { name: 'Khongsang Station', latOffset: -0.09, lonOffset: 0.11, criticalInfrastructure: 'New Railway Station Hub' },
    { name: 'Irang River Valley', latOffset: -0.12, lonOffset: 0.03, criticalInfrastructure: 'Bailey Bridge Lifeline' }
  ],
  mn_churachandpur: [
    { name: 'Churachandpur Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Hospital & Control Room' },
    { name: 'Tuibong', latOffset: 0.02, lonOffset: 0.01, criticalInfrastructure: 'Administrative Office Complex' },
    { name: 'Singngat Slopes', latOffset: -0.14, lonOffset: -0.03, criticalInfrastructure: 'Tiddim Road Border Route' }
  ],
  mn_kangpokpi: [
    { name: 'Kangpokpi Town (NH-2)', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Imphal-Dimapur Highway Lifeline' },
    { name: 'Motbung Escarpment', latOffset: -0.08, lonOffset: 0.02, criticalInfrastructure: 'High-Tension Power Corridor' },
    { name: 'Koubru Foothills', latOffset: 0.06, lonOffset: -0.05, criticalInfrastructure: 'Mountain Ridge Catchment' }
  ],
  as_dima_hasao: [
    { name: 'Haflong Hill Station', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Secretariat & Civil Hospital' },
    { name: 'Mahur Pass (Lumding-Badarpur)', latOffset: 0.09, lonOffset: 0.08, criticalInfrastructure: 'NFR Hill Section Railway Tunnel' },
    { name: 'Jatinga Valley', latOffset: -0.05, lonOffset: 0.02, criticalInfrastructure: 'National Highway 54E' },
    { name: 'Harangajao Ridge', latOffset: -0.12, lonOffset: -0.04, criticalInfrastructure: 'Jatinga River Embankment' }
  ],
  as_karbi_anglong: [
    { name: 'Diphu Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Karbi Anglong Autonomous Council HQ' },
    { name: 'Bokajan Ridge', latOffset: 0.14, lonOffset: 0.22, criticalInfrastructure: 'Cement Corporation Plant & Railway' },
    { name: 'Dokmoka Slopes', latOffset: 0.08, lonOffset: -0.15, criticalInfrastructure: 'NH-36 Transit Corridor' }
  ],
  as_cachar: [
    { name: 'Silchar Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Barak Valley Regional Medical College' },
    { name: 'Lakhipur Corridor', latOffset: 0.08, lonOffset: 0.16, criticalInfrastructure: 'NH-37 Lifeline to Manipur' },
    { name: 'Dholai Slopes', latOffset: -0.15, lonOffset: 0.02, criticalInfrastructure: 'Indo-Bangla Border Road' }
  ],
  as_kamrup_metro: [
    { name: 'Guwahati Hills (Khanapara)', latOffset: -0.03, lonOffset: 0.04, criticalInfrastructure: 'State Emergency Operations Centre (SEOC)' },
    { name: 'Kamakhya Hill Slopes', latOffset: 0.02, lonOffset: -0.04, criticalInfrastructure: 'Pilgrimage Infrastructure & Railway' },
    { name: 'Narakasur Hills', latOffset: -0.02, lonOffset: 0.01, criticalInfrastructure: 'Gauhati Medical College Slopes' }
  ],
  ar_tawang: [
    { name: 'Tawang Town (Monastery Ridge)', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Hospital & Army Garrison Base' },
    { name: 'Jang (Sela Pass Route)', latOffset: -0.12, lonOffset: 0.18, criticalInfrastructure: 'Sela Tunnel Approach Highway' },
    { name: 'Lumla Escarpment', latOffset: -0.08, lonOffset: -0.22, criticalInfrastructure: 'Indo-Bhutan Border Connection' }
  ],
  ar_west_kameng: [
    { name: 'Bomdila Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District HQ Complex' },
    { name: 'Bhalukpong Corridor', latOffset: -0.21, lonOffset: 0.12, criticalInfrastructure: 'Entry Checkpost & River Valley' },
    { name: 'Dirang Slopes', latOffset: 0.11, lonOffset: -0.14, criticalInfrastructure: 'National Research Centre on Yak' }
  ],
  ar_papum_pare: [
    { name: 'Itanagar Capital Complex', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Raj Bhavan & State Secretariat' },
    { name: 'Naharlagun Corridor', latOffset: 0.05, lonOffset: 0.12, criticalInfrastructure: 'Tomo Riba Institute of Health Sciences' },
    { name: 'Doimukh Basin', latOffset: 0.08, lonOffset: 0.15, criticalInfrastructure: 'Rajiv Gandhi University Slopes' }
  ],
  ar_upper_siang: [
    { name: 'Yingkiong Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Civil Hospital' },
    { name: 'Tuting Gorge', latOffset: 0.38, lonOffset: 0.09, criticalInfrastructure: 'Siang River Suspension Bridge' },
    { name: 'Gelling Border Slopes', latOffset: 0.52, lonOffset: 0.15, criticalInfrastructure: 'Indo-Tibet Line of Actual Control Post' }
  ],
  mz_aizawl: [
    { name: 'Aizawl (Ramhlun / Hunthar Slope)', latOffset: 0.02, lonOffset: 0.01, criticalInfrastructure: 'NH-54 Critical Sinking Zone' },
    { name: 'Bawngkawn Junction', latOffset: 0.04, lonOffset: 0.02, criticalInfrastructure: 'North Aizawl Arterial Chokepoint' },
    { name: 'Laipuitlang Ridge', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'High-Density Residential Escarpment' }
  ],
  mz_lunglei: [
    { name: 'Lunglei (Chanmari / Rahsi Slope)', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Civil Hospital & Helipad Staging' },
    { name: 'Hnahthial Corridor', latOffset: 0.14, lonOffset: 0.11, criticalInfrastructure: 'South Mizoram Highway' }
  ],
  mz_champhai: [
    { name: 'Champhai Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Control Center' },
    { name: 'Zokhawthar Border Gate', latOffset: -0.06, lonOffset: 0.18, criticalInfrastructure: 'Tiau River International Crossing' }
  ],
  nl_kohima: [
    { name: 'Kohima Town (NH-29 / Phesama)', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'State Secretariat & Disaster Control' },
    { name: 'Dzükou Valley Base', latOffset: -0.08, lonOffset: -0.06, criticalInfrastructure: 'Ecotourism Hill Slope' },
    { name: 'Jotsoma Slopes', latOffset: -0.02, lonOffset: -0.04, criticalInfrastructure: 'Doordarshan Transmission Tower' }
  ],
  nl_phek: [
    { name: 'Phek Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District Hospital' },
    { name: 'Pfutsero Hilltop', latOffset: -0.11, lonOffset: -0.15, criticalInfrastructure: 'Highest Altitude Settlement in Nagaland' }
  ],
  nl_mokokchung: [
    { name: 'Mokokchung Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Imkongliba Memorial District Hospital' },
    { name: 'Ungma Village', latOffset: -0.03, lonOffset: -0.02, criticalInfrastructure: 'Heritage Hilltop Settlement' }
  ],
  nl_wokha: [
    { name: 'Wokha Town (Mount Tiyi Base)', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Civil Administration HQ' },
    { name: 'Doyang Hydro Reservoir', latOffset: 0.09, lonOffset: 0.12, criticalInfrastructure: 'Doyang Hydro Dam Slopes' }
  ],
  tr_dhalai: [
    { name: 'Ambassa Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'District HQ & NH-8 Corridor' },
    { name: 'Manu River Basin', latOffset: 0.07, lonOffset: 0.04, criticalInfrastructure: 'Bridge & Rail Line' }
  ],
  tr_north_tripura: [
    { name: 'Dharmanagar', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'North Tripura Rail Terminal' },
    { name: 'Kanchanpur / Jampui Hills', latOffset: -0.19, lonOffset: 0.21, criticalInfrastructure: 'Jampui Hill Range Orange Ridge' }
  ]
};

export function getLocalAreasForDistrict(districtId: string): LocalAreaInfo[] {
  return NER_LOCAL_AREAS[districtId] || [
    { name: 'District Central Town', latOffset: 0.0, lonOffset: 0.0, criticalInfrastructure: 'Civil Administration & Hospital' },
    { name: 'North Hill Road Corridor', latOffset: 0.04, lonOffset: 0.02, criticalInfrastructure: 'High Altitude Highway Lifeline' },
    { name: 'River Basin Settlement', latOffset: -0.04, lonOffset: -0.02, criticalInfrastructure: 'Low-Lying Drainage Area' }
  ];
}
