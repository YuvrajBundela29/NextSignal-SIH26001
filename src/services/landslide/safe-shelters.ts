export interface SafeShelter {
  id: string;
  districtId: string;
  name: string;
  type: 'Community Disaster Shelter' | 'Government Higher Secondary School' | 'District Sports Complex' | 'Helipad / Emergency Air-Drop Zone' | 'District Civil Hospital';
  capacityPersons: number;
  lat: number;
  lon: number;
  elevationM: number;
  contactNumber: string;
  hasMedicalPost: boolean;
  hasGeneratorPower: boolean;
  hasSatelliteComms: boolean;
}

export const NER_SAFE_SHELTERS: SafeShelter[] = [
  // Dima Hasao
  {
    id: 'sh_dh_1',
    districtId: 'as_dima_hasao',
    name: 'Haflong District Multipurpose Community Hall',
    type: 'Community Disaster Shelter',
    capacityPersons: 1200,
    lat: 25.1812,
    lon: 93.0210,
    elevationM: 965,
    contactNumber: '03673-236100',
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasSatelliteComms: true,
  },
  {
    id: 'sh_dh_2',
    districtId: 'as_dima_hasao',
    name: 'Haflong High Ground Helipad & Staging Point',
    type: 'Helipad / Emergency Air-Drop Zone',
    capacityPersons: 400,
    lat: 25.1920,
    lon: 93.0315,
    elevationM: 1020,
    contactNumber: '03673-236200',
    hasMedicalPost: false,
    hasGeneratorPower: true,
    hasSatelliteComms: true,
  },
  // East Khasi Hills (Shillong)
  {
    id: 'sh_ekh_1',
    districtId: 'ml_east_khasi_hills',
    name: 'Shillong JN Stadium Indoor Emergency Relief Center',
    type: 'District Sports Complex',
    capacityPersons: 3500,
    lat: 25.5820,
    lon: 91.8980,
    elevationM: 1530,
    contactNumber: '0364-2223400',
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasSatelliteComms: true,
  },
  {
    id: 'sh_ekh_2',
    districtId: 'ml_east_khasi_hills',
    name: 'Cherrapunji (Sohra) Civil Defense Safe Shelter',
    type: 'Community Disaster Shelter',
    capacityPersons: 850,
    lat: 25.2750,
    lon: 91.7320,
    elevationM: 1440,
    contactNumber: '0364-2225289',
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasSatelliteComms: false,
  },
  // Mangan (North Sikkim)
  {
    id: 'sh_mgn_1',
    districtId: 'sk_mangan',
    name: 'Mangan Senior Secondary School High-Ridge Relief Center',
    type: 'Government Higher Secondary School',
    capacityPersons: 900,
    lat: 27.5080,
    lon: 98.5310,
    elevationM: 1640,
    contactNumber: '03592-234200',
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasSatelliteComms: true,
  },
  {
    id: 'sh_mgn_2',
    districtId: 'sk_mangan',
    name: 'Chungthang ITBP Emergency Staging Camp & Helipad',
    type: 'Helipad / Emergency Air-Drop Zone',
    capacityPersons: 600,
    lat: 27.6040,
    lon: 88.6470,
    elevationM: 1790,
    contactNumber: '03592-234238',
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasSatelliteComms: true,
  },
  // Kohima
  {
    id: 'sh_khm_1',
    districtId: 'nl_kohima',
    name: 'Kohima Regional Indoor Stadium Disaster Camp',
    type: 'District Sports Complex',
    capacityPersons: 2200,
    lat: 25.6790,
    lon: 94.1120,
    elevationM: 1460,
    contactNumber: '0370-2290028',
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasSatelliteComms: true,
  },
  // Aizawl
  {
    id: 'sh_azl_1',
    districtId: 'mz_aizawl',
    name: 'Aizawl Vanapa Hall Emergency Evacuation Shelter',
    type: 'Community Disaster Shelter',
    capacityPersons: 2000,
    lat: 23.7310,
    lon: 92.7190,
    elevationM: 1140,
    contactNumber: '0389-2325350',
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasSatelliteComms: true,
  },
];
