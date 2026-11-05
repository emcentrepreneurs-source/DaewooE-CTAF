/**
 * Mozambique Geographic & Operational Directory
 * Covers all 11 Provinces of Mozambique, their regional grouping, capital cities,
 * major industrial/mining/LNG sites (e.g. OPBL1, Afungi, Palma, Pemba, Beluluane),
 * and airport hubs with IATA codes.
 */

export interface MozambiqueDistrictOrCity {
  name: string;
  isCity?: boolean;
  isAirportHub?: boolean;
  iataCode?: string;
  isOperationalSite?: boolean;
  siteDescription?: string;
}

export interface MozambiqueProvince {
  id: string;
  name: string;
  region: 'Sul' | 'Centro' | 'Norte';
  capital: string;
  description: string;
  keyLocations: MozambiqueDistrictOrCity[];
}

export const MOZAMBIQUE_PROVINCES: MozambiqueProvince[] = [
  {
    id: 'maputo_cidade',
    name: 'Maputo Cidade',
    region: 'Sul',
    capital: 'Maputo',
    description: 'Capital City & Principal Political/Corporate Headquarters',
    keyLocations: [
      { name: 'MAPUTO', isCity: true, isAirportHub: true, iataCode: 'MPM' },
      { name: 'KaMpfumo', isCity: true },
      { name: 'Polana', isCity: true },
      { name: 'Costa do Sol', isCity: true },
      { name: 'Porto de Maputo', isOperationalSite: true, siteDescription: 'Maputo Port Terminal' },
      { name: 'Maputo HQ Base', isOperationalSite: true, siteDescription: 'Corporate Office' }
    ]
  },
  {
    id: 'maputo_provincia',
    name: 'Maputo Província',
    region: 'Sul',
    capital: 'Matola',
    description: 'Southern Industrial and Manufacturing Belt',
    keyLocations: [
      { name: 'MATOLA', isCity: true },
      { name: 'Beluluane', isOperationalSite: true, siteDescription: 'Beluluane Industrial Park' },
      { name: 'Boane', isCity: true },
      { name: 'Marracuene', isCity: true },
      { name: 'Manhiça', isCity: true },
      { name: 'Namaacha', isCity: true },
      { name: 'Ressano Garcia', isOperationalSite: true, siteDescription: 'Border Post / Rail Corridor' },
      { name: 'Moamba', isCity: true }
    ]
  },
  {
    id: 'gaza',
    name: 'Gaza',
    region: 'Sul',
    capital: 'Xai-Xai',
    description: 'Southern Coastal & Agricultural Basin (Limpopo)',
    keyLocations: [
      { name: 'XAI-XAI', isCity: true, isAirportHub: true, iataCode: 'VJB' },
      { name: 'Chókwè', isCity: true },
      { name: 'Praia do Bilene', isCity: true },
      { name: 'Macia', isCity: true },
      { name: 'Chibuto', isCity: true, isOperationalSite: true, siteDescription: 'Heavy Sands Mine' },
      { name: 'Massingir', isCity: true },
      { name: 'Chicualacuala', isCity: true }
    ]
  },
  {
    id: 'inhambane',
    name: 'Inhambane',
    region: 'Sul',
    capital: 'Inhambane',
    description: 'Terra de Boa Gente - Coastal & Gas Production Fields',
    keyLocations: [
      { name: 'INHAMBANE', isCity: true, isAirportHub: true, iataCode: 'INH' },
      { name: 'VILANKULO', isCity: true, isAirportHub: true, iataCode: 'VNX' },
      { name: 'Temane Gas Plant', isOperationalSite: true, siteDescription: 'Sasol Gas Central Processing' },
      { name: 'Pande Gas Field', isOperationalSite: true, siteDescription: 'Gas Extraction Field' },
      { name: 'Maxixe', isCity: true },
      { name: 'Massinga', isCity: true },
      { name: 'Morrumbene', isCity: true },
      { name: 'Zavala', isCity: true }
    ]
  },
  {
    id: 'sofala',
    name: 'Sofala',
    region: 'Centro',
    capital: 'Beira',
    description: 'Central Commercial Gateway & Major Sea Port',
    keyLocations: [
      { name: 'BEIRA', isCity: true, isAirportHub: true, iataCode: 'BEW' },
      { name: 'Beira Port Logistics Base', isOperationalSite: true, siteDescription: 'Cargo & Fuel Terminal' },
      { name: 'Dondo', isCity: true },
      { name: 'Nhamatanda', isCity: true },
      { name: 'Gorongosa', isCity: true },
      { name: 'Búzi', isCity: true },
      { name: 'Caia', isCity: true },
      { name: 'Marromeu', isCity: true }
    ]
  },
  {
    id: 'manica',
    name: 'Manica',
    region: 'Centro',
    capital: 'Chimoio',
    description: 'Central Highlands & Agro-Industrial Hub (Beira Corridor)',
    keyLocations: [
      { name: 'CHIMOIO', isCity: true, isAirportHub: true, iataCode: 'VPY' },
      { name: 'Gondola', isCity: true },
      { name: 'Manica', isCity: true },
      { name: 'Sussundenga', isCity: true },
      { name: 'Catandica', isCity: true },
      { name: 'Machaze', isCity: true }
    ]
  },
  {
    id: 'tete',
    name: 'Tete',
    region: 'Centro',
    capital: 'Tete',
    description: 'Mineral Resources Basin (Coal, Energy & Cahora Bassa Dam)',
    keyLocations: [
      { name: 'TETE', isCity: true, isAirportHub: true, iataCode: 'TET' },
      { name: 'Moatize Coal Basin', isOperationalSite: true, siteDescription: 'Mining & Coal Operations' },
      { name: 'Cahora Bassa / Songo', isOperationalSite: true, siteDescription: 'Hydroelectric Power Station' },
      { name: 'Changara', isCity: true },
      { name: 'Ulongué', isCity: true },
      { name: 'Mutarara', isCity: true }
    ]
  },
  {
    id: 'zambezia',
    name: 'Zambézia',
    region: 'Centro',
    capital: 'Quelimane',
    description: 'Agricultural & Coastal River Delta Region',
    keyLocations: [
      { name: 'QUELIMANE', isCity: true, isAirportHub: true, iataCode: 'UEL' },
      { name: 'Mocuba', isCity: true },
      { name: 'Gurué', isCity: true },
      { name: 'Alto Molócuè', isCity: true },
      { name: 'Milange', isCity: true },
      { name: 'Morrumbala', isCity: true },
      { name: 'Pebane', isCity: true }
    ]
  },
  {
    id: 'nampula',
    name: 'Nampula',
    region: 'Norte',
    capital: 'Nampula',
    description: 'Northern Economic Capital & Deep Water Port at Nacala',
    keyLocations: [
      { name: 'NAMPULA', isCity: true, isAirportHub: true, iataCode: 'APL' },
      { name: 'NACALA', isCity: true, isAirportHub: true, iataCode: 'MNC' },
      { name: 'Nacala Deep Water Port', isOperationalSite: true, siteDescription: 'Export Rail & Shipping Terminal' },
      { name: 'Angoche', isCity: true },
      { name: 'Ilha de Moçambique', isCity: true },
      { name: 'Monapo', isCity: true },
      { name: 'Ribauè', isCity: true },
      { name: 'Meconta', isCity: true }
    ]
  },
  {
    id: 'cabo_delgado',
    name: 'Cabo Delgado',
    region: 'Norte',
    capital: 'Pemba',
    description: 'Northern Province - Moz LNG, CCS JV, Afungi & Palma Sites',
    keyLocations: [
      { name: 'PEMBA', isCity: true, isAirportHub: true, iataCode: 'POL' },
      { name: 'Pemba Logistics Base', isOperationalSite: true, siteDescription: 'Offshore Supply Hub' },
      { name: 'AFUNGI', isOperationalSite: true, isAirportHub: true, iataCode: 'AFG', siteDescription: 'Mozambique LNG Project Complex' },
      { name: 'OPBL1', isOperationalSite: true, siteDescription: 'Onshore Processing / Plant Base Leg 1' },
      { name: 'Camp 9500 (Afungi)', isOperationalSite: true, siteDescription: 'CCS JV Main Accommodation Camp' },
      { name: 'Pioneer Camp', isOperationalSite: true, siteDescription: 'Afungi Work Camp' },
      { name: 'West Village Camp', isOperationalSite: true, siteDescription: 'Afungi Residential Camp' },
      { name: 'PALMA', isCity: true, isOperationalSite: true, siteDescription: 'Palma District & Project Town' },
      { name: 'MOCÍMBOA DA PRAIA', isCity: true, isAirportHub: true, iataCode: 'MZB' },
      { name: 'Mueda', isCity: true },
      { name: 'Montepuez', isCity: true, isOperationalSite: true, siteDescription: 'Ruby Mining Concession' },
      { name: 'Chiúre', isCity: true },
      { name: 'Ancuabe', isCity: true, isOperationalSite: true, siteDescription: 'Graphite Processing' },
      { name: 'Ibo Island', isCity: true }
    ]
  },
  {
    id: 'niassa',
    name: 'Niassa',
    region: 'Norte',
    capital: 'Lichinga',
    description: 'Far Northern Plateau & Lake Niassa Forest Reserves',
    keyLocations: [
      { name: 'LICHINGA', isCity: true, isAirportHub: true, iataCode: 'VXC' },
      { name: 'Cuamba', isCity: true },
      { name: 'Mandimba', isCity: true },
      { name: 'Marrupa', isCity: true },
      { name: 'Lago (Metangula)', isCity: true },
      { name: 'Mecanhelas', isCity: true }
    ]
  }
];

export const MOZAMBIQUE_PROJECT_SITES = [
  { id: 'OPBL1', name: 'OPBL1', province: 'Cabo Delgado', full: 'OPBL1 (Afungi Plant Base)' },
  { id: 'AFUNGI', name: 'Afungi LNG Site', province: 'Cabo Delgado', full: 'Afungi Project Complex' },
  { id: 'PEMBA', name: 'Pemba Logistics Hub', province: 'Cabo Delgado', full: 'Pemba Support Base' },
  { id: 'PALMA', name: 'Palma Base', province: 'Cabo Delgado', full: 'Palma Project Camp' },
  { id: 'CAMP_9500', name: 'Camp 9500', province: 'Cabo Delgado', full: 'Camp 9500 (CCS JV)' },
  { id: 'MAPUTO_HQ', name: 'Maputo HQ', province: 'Maputo Cidade', full: 'Maputo Corporate Office' },
  { id: 'BELULUANE', name: 'Beluluane Site', province: 'Maputo Província', full: 'Beluluane Industrial' },
  { id: 'BEIRA_PORT', name: 'Beira Port Base', province: 'Sofala', full: 'Beira Corridor Logistics' },
  { id: 'NACALA_BASE', name: 'Nacala Base', province: 'Nampula', full: 'Nacala Port Facility' },
  { id: 'MOATIZE_CAMP', name: 'Moatize Site', province: 'Tete', full: 'Moatize Mining Base' }
];

export const COMMON_MOBILIZATION_ROUTES = [
  { origin: 'MAPUTO', destination: 'PEMBA', desc: 'Maputo ➔ Pemba (Direct / LAM)' },
  { origin: 'MAPUTO', destination: 'AFUNGI', desc: 'Maputo ➔ Afungi (Via Pemba Charter)' },
  { origin: 'PEMBA', destination: 'AFUNGI', desc: 'Pemba ➔ Afungi (Solenta / Airlink Shuttle)' },
  { origin: 'BEIRA', destination: 'PEMBA', desc: 'Beira ➔ Pemba (Central Mobilization)' },
  { origin: 'NAMPULA', destination: 'PEMBA', desc: 'Nampula ➔ Pemba (Regional Northern)' },
  { origin: 'TETE', destination: 'PEMBA', desc: 'Tete ➔ Pemba (Mining to LNG Transfer)' },
  { origin: 'PEMBA', destination: 'MAPUTO', desc: 'Pemba ➔ Maputo (Demobilization / Leave)' },
  { origin: 'AFUNGI', destination: 'PEMBA', desc: 'Afungi ➔ Pemba (Site Transfer)' }
];

export interface MozambiqueAirportSite {
  code: string;
  name: string;
  fullName: string;
  city: string;
  province: string;
  region: 'Sul' | 'Centro' | 'Norte';
  type: 'Project Base / LNG' | 'International Hub' | 'Domestic Airport' | 'Regional Airstrip';
  description: string;
  isProjectSite?: boolean;
}

export const MOZAMBIQUE_AIRPORT_SITES: MozambiqueAirportSite[] = [
  {
    code: 'AFG',
    name: 'AFUNGI',
    fullName: 'Afungi Project Airstrip (Mozambique LNG / TotalEnergies / CCS JV)',
    city: 'Afungi / Palma',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Project Base / LNG',
    description: 'Primary LNG site airstrip serving OPBL1 plant, Camp 9500 & Daewoo E&C',
    isProjectSite: true
  },
  {
    code: 'POL',
    name: 'PEMBA',
    fullName: 'Pemba Airport & Offshore Logistics Staging Hub (POL)',
    city: 'Pemba',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Domestic Airport',
    description: 'Main charter transfer gateway between Maputo and Afungi site',
    isProjectSite: true
  },
  {
    code: 'MPM',
    name: 'MAPUTO',
    fullName: 'Maputo International Airport (Mavalane MPM)',
    city: 'Maputo',
    province: 'Maputo Cidade',
    region: 'Sul',
    type: 'International Hub',
    description: 'Capital corporate headquarters and national international gateway'
  },
  {
    code: 'AFG',
    name: 'OPBL1',
    fullName: 'OPBL1 - Onshore Plant Base Leg 1 (Afungi Airstrip)',
    city: 'Afungi Site',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Project Base / LNG',
    description: 'Daewoo E&C Onshore Processing Plant Base Leg 1',
    isProjectSite: true
  },
  {
    code: 'PLM',
    name: 'PALMA',
    fullName: 'Palma District Airstrip & Project Operational Camp',
    city: 'Palma',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Project Base / LNG',
    description: 'Palma district center and local project support aerodrome',
    isProjectSite: true
  },
  {
    code: 'AFG',
    name: 'CAMP 9500',
    fullName: 'Camp 9500 (CCS JV Main Site Accommodation & Airstrip Transfer)',
    city: 'Afungi Peninsula',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Project Base / LNG',
    description: 'Main workforce camp for Mozambique LNG project',
    isProjectSite: true
  },
  {
    code: 'BEW',
    name: 'BEIRA',
    fullName: 'Beira International Airport (BEW)',
    city: 'Beira',
    province: 'Sofala',
    region: 'Centro',
    type: 'International Hub',
    description: 'Central port city & Beira Economic Corridor air hub'
  },
  {
    code: 'APL',
    name: 'NAMPULA',
    fullName: 'Nampula Airport (APL)',
    city: 'Nampula',
    province: 'Nampula',
    region: 'Norte',
    type: 'Domestic Airport',
    description: 'Northern commercial capital and regional connection hub'
  },
  {
    code: 'MNC',
    name: 'NACALA',
    fullName: 'Nacala International Airport & Deep Water Port (MNC)',
    city: 'Nacala',
    province: 'Nampula',
    region: 'Norte',
    type: 'International Hub',
    description: 'Deep sea port terminal and Special Economic Zone air hub',
    isProjectSite: true
  },
  {
    code: 'TET',
    name: 'TETE',
    fullName: 'Chingozi Airport (TET) - Tete / Moatize',
    city: 'Tete',
    province: 'Tete',
    region: 'Centro',
    type: 'Domestic Airport',
    description: 'Coal basin, mining logistics and central Zambezi hub'
  },
  {
    code: 'VGS',
    name: 'SONGO',
    fullName: 'Songo Aerodrome (Cahora Bassa Dam)',
    city: 'Songo',
    province: 'Tete',
    region: 'Centro',
    type: 'Regional Airstrip',
    description: 'Hydroelectric power generation complex airstrip',
    isProjectSite: true
  },
  {
    code: 'VNX',
    name: 'VILANKULO',
    fullName: 'Vilankulo Airport (VNX)',
    city: 'Vilankulo',
    province: 'Inhambane',
    region: 'Sul',
    type: 'Domestic Airport',
    description: 'Coastal logistics base and gateway to Bazaruto archipelago & Sasol fields'
  },
  {
    code: 'INH',
    name: 'INHAMBANE',
    fullName: 'Inhambane Airport (INH)',
    city: 'Inhambane',
    province: 'Inhambane',
    region: 'Sul',
    type: 'Domestic Airport',
    description: 'Provincial coastal airport and southern logistics'
  },
  {
    code: 'TMN',
    name: 'TEMANE',
    fullName: 'Temane Gas Processing Central Facility Airstrip',
    city: 'Inhassoro / Temane',
    province: 'Inhambane',
    region: 'Sul',
    type: 'Project Base / LNG',
    description: 'Sasol Natural Gas Central Processing Facility airfield',
    isProjectSite: true
  },
  {
    code: 'MZB',
    name: 'MOCÍMBOA DA PRAIA',
    fullName: 'Mocímboa da Praia Airport (MZB)',
    city: 'Mocímboa da Praia',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Domestic Airport',
    description: 'Cabo Delgado coastal transit corridor airport'
  },
  {
    code: 'VPY',
    name: 'CHIMOIO',
    fullName: 'Chimoio Airport (VPY)',
    city: 'Chimoio',
    province: 'Manica',
    region: 'Centro',
    type: 'Domestic Airport',
    description: 'Manica agricultural hub on the Beira-Zimbabwe transport corridor'
  },
  {
    code: 'UEL',
    name: 'QUELIMANE',
    fullName: 'Quelimane Airport (UEL)',
    city: 'Quelimane',
    province: 'Zambézia',
    region: 'Centro',
    type: 'Domestic Airport',
    description: 'Zambézia provincial capital and river delta port'
  },
  {
    code: 'VXC',
    name: 'LICHINGA',
    fullName: 'Lichinga Airport (VXC)',
    city: 'Lichinga',
    province: 'Niassa',
    region: 'Norte',
    type: 'Domestic Airport',
    description: 'Far northern plateau airport and forestry logistics hub'
  },
  {
    code: 'VJB',
    name: 'XAI-XAI',
    fullName: 'Aeroporto Filipe Jacinto Nyusi (VJB / Chongoene)',
    city: 'Xai-Xai / Chongoene',
    province: 'Gaza',
    region: 'Sul',
    type: 'Domestic Airport',
    description: 'Modern Gaza provincial airport serving the Limpopo agricultural corridor'
  },
  {
    code: 'MUD',
    name: 'MUEDA',
    fullName: 'Mueda Plateau Aerodrome',
    city: 'Mueda',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Regional Airstrip',
    description: 'Interior plateau airfield for Cabo Delgado operations'
  },
  {
    code: 'MTZ',
    name: 'MONTEPUEZ',
    fullName: 'Montepuez Mining Airfield',
    city: 'Montepuez',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Regional Airstrip',
    description: 'Interior mining concession aerodrome'
  },
  {
    code: 'CBA',
    name: 'CUAMBA',
    fullName: 'Cuamba Airstrip',
    city: 'Cuamba',
    province: 'Niassa',
    region: 'Norte',
    type: 'Regional Airstrip',
    description: 'Nacala railway corridor junction airstrip'
  },
  {
    code: 'MCB',
    name: 'MOCUBA',
    fullName: 'Mocuba Aerodrome',
    city: 'Mocuba',
    province: 'Zambézia',
    region: 'Centro',
    type: 'Regional Airstrip',
    description: 'Zambézia central transit aerodrome'
  },
  {
    code: 'LFB',
    name: 'LUMBO',
    fullName: 'Lumbo Aerodrome (Ilha de Moçambique)',
    city: 'Lumbo',
    province: 'Nampula',
    region: 'Norte',
    type: 'Regional Airstrip',
    description: 'Historic coastal airfield opposite Island of Mozambique'
  },
  {
    code: 'BZB',
    name: 'BAZARUTO',
    fullName: 'Bazaruto Island Airstrip (BZB)',
    city: 'Bazaruto Archipelago',
    province: 'Inhambane',
    region: 'Sul',
    type: 'Regional Airstrip',
    description: 'Offshore island logistics and emergency evacuation strip'
  },
  {
    code: 'BGR',
    name: 'BENGUERRA',
    fullName: 'Benguerra Island Airstrip',
    city: 'Benguerra',
    province: 'Inhambane',
    region: 'Sul',
    type: 'Regional Airstrip',
    description: 'Offshore archipelago airstrip'
  },
  {
    code: 'IBO',
    name: 'IBO ISLAND',
    fullName: 'Ibo Island Airstrip',
    city: 'Ibo',
    province: 'Cabo Delgado',
    region: 'Norte',
    type: 'Regional Airstrip',
    description: 'Quirimbas archipelago coastal airstrip'
  },
  {
    code: 'BLN',
    name: 'BILENE',
    fullName: 'Praia do Bilene Aerodrome',
    city: 'Bilene',
    province: 'Gaza',
    region: 'Sul',
    type: 'Regional Airstrip',
    description: 'Southern coastal airstrip'
  },
  {
    code: 'MRP',
    name: 'MARRUPA',
    fullName: 'Marrupa Aerodrome',
    city: 'Marrupa',
    province: 'Niassa',
    region: 'Norte',
    type: 'Regional Airstrip',
    description: 'Central Niassa reserve aerodrome'
  },
  {
    code: 'MPM',
    name: 'BELULUANE',
    fullName: 'Beluluane Industrial Park Site (Maputo MPM Corridor)',
    city: 'Matola / Beluluane',
    province: 'Maputo Província',
    region: 'Sul',
    type: 'Project Base / LNG',
    description: 'Southern manufacturing base connected to Maputo Airport',
    isProjectSite: true
  }
];

export function findProvinceForLocation(locName: string): MozambiqueProvince | undefined {
  if (!locName) return undefined;
  const upper = locName.trim().toUpperCase();

  for (const prov of MOZAMBIQUE_PROVINCES) {
    if (prov.name.toUpperCase().includes(upper) || upper.includes(prov.name.toUpperCase())) {
      return prov;
    }
    if (prov.capital.toUpperCase().includes(upper) || upper.includes(prov.capital.toUpperCase())) {
      return prov;
    }
    for (const loc of prov.keyLocations) {
      if (loc.name.toUpperCase() === upper || upper.includes(loc.name.toUpperCase())) {
        return prov;
      }
    }
  }

  if (upper.includes('AFUNGI') || upper.includes('PALMA') || upper.includes('OPBL') || upper.includes('9500')) {
    return MOZAMBIQUE_PROVINCES.find(p => p.id === 'cabo_delgado');
  }
  if (upper.includes('MATOLA') || upper.includes('BELULUANE')) {
    return MOZAMBIQUE_PROVINCES.find(p => p.id === 'maputo_provincia');
  }

  return undefined;
}

export function findAirportSite(locOrCode: string): MozambiqueAirportSite | undefined {
  if (!locOrCode) return undefined;
  const upper = locOrCode.trim().toUpperCase();

  return MOZAMBIQUE_AIRPORT_SITES.find(
    a =>
      a.name.toUpperCase() === upper ||
      a.code.toUpperCase() === upper ||
      a.fullName.toUpperCase().includes(upper) ||
      upper.includes(a.name.toUpperCase())
  );
}

