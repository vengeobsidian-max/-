
export type BrandClass = 'high' | 'mid' | 'low';

export interface SystemUnits {
  outdoorCount: number;
  outdoorPrice: number;
  indoorCount: number;
  indoorPrice: number;
  controllerCount: number;
  controllerPrice: number;
  componentCount: number;
  componentPrice: number;
  materialCount: number;
  materialPrice: number;
  miscCount: number; // 6-րդ միավոր
  miscPrice: number; // 6-րդ միավոր
}

export interface SelectedSystems {
  split: boolean;
  multiSplit: boolean;
  vrv: boolean;
  chiller: boolean;
  boiler: boolean;
  ventilation: boolean;
  heating: boolean;
  sewerage: boolean;
  waterSupply: boolean;
  construction: boolean;
}

export interface ProjectData {
  id: string;
  name: string;
  buildingType: string;
  area: number;
  height: number;
  volume: number;
  coolingLoad: number;
  heatingLoad: number;
  distanceKm: number; // Հեռավորություն A-ից B
  systems: SelectedSystems;
  brandClass: BrandClass;
  unitDetails: {
    split: SystemUnits;
    multiSplit: SystemUnits;
    vrv: SystemUnits;
    chiller: SystemUnits;
    boiler: SystemUnits;
    ventilation: SystemUnits;
    heating: SystemUnits;
    sewerage: SystemUnits;
    waterSupply: SystemUnits;
    construction: SystemUnits;
  };
  vrvOutdoor: string;
  vrvIndoor: string;
  controls: string;
  automation: string;
  ventilation: string;
  chillerPower?: string;
  boilerPower?: string;
  ventilationCapacity?: string;
  otherDevices: string;
  totalCost: number;
  equipmentCost: number;
  laborCost: number;
  materialsCost: number;
  date: string;
  isActive: boolean;
  profitMargin: number;
  complexityLevel: number;
  warrantyYears: number;
  deliveryDays: number;
}

export interface ComparisonDelta {
  referenceProjectName: string;
  referenceProject: ProjectData;
  areaDelta: number;
  coolingDelta: number;
  heatingDelta: number;
  pricePerM2Delta: number;
}

export interface EstimateResult {
  name: string;
  buildingType: string;
  area: number;
  volume: number;
  coolingLoad: number;
  heatingLoad: number;
  distanceKm: number; // Հեռավորություն A-ից B
  systems: SelectedSystems;
  brandClass: BrandClass;
  unitDetails: {
    split: SystemUnits;
    multiSplit: SystemUnits;
    vrv: SystemUnits;
    chiller: SystemUnits;
    boiler: SystemUnits;
    ventilation: SystemUnits;
    heating: SystemUnits;
    sewerage: SystemUnits;
    waterSupply: SystemUnits;
    construction: SystemUnits;
  };
  otherDevices: string;
  isMarketValueBased?: boolean;
  comparison?: ComparisonDelta;
  realistic: {
    total: number;
    equipment: number;
    labor: number;
    materials: number;
  };
  conservative: {
    total: number;
    equipment: number;
    labor: number;
    materials: number;
  };
  profitMargin?: number;
  complexityLevel?: number;
  warrantyYears?: number;
  deliveryDays?: number;
}

export interface AiInsight {
  summary: string;
  risks: string[];
  recommendations: string[];
  efficiencyTips: string[];
}
