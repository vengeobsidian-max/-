
import { ProjectData, SystemUnits } from './types';

const emptyUnits = (): SystemUnits => ({ 
  outdoorCount: 0, outdoorPrice: 0, 
  indoorCount: 0, indoorPrice: 0,
  controllerCount: 0, controllerPrice: 0,
  componentCount: 0, componentPrice: 0,
  materialCount: 0, materialPrice: 0,
  miscCount: 0, miscPrice: 0
});

export const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: '1',
    name: 'Գրասենյակ (Open Space)',
    buildingType: 'Գրասենյակ',
    area: 250,
    height: 3,
    volume: 750,
    coolingLoad: 35,
    heatingLoad: 28,
    distanceKm: 15,
    systems: {
      split: false,
      multiSplit: false,
      vrv: true,
      chiller: false,
      boiler: false,
      ventilation: true,
      heating: false,
      sewerage: false,
      waterSupply: false,
      construction: false
    },
    brandClass: 'high',
    unitDetails: {
      split: emptyUnits(),
      multiSplit: emptyUnits(),
      vrv: { 
        outdoorCount: 1, outdoorPrice: 4500000, 
        indoorCount: 12, indoorPrice: 120000,
        controllerCount: 12, controllerPrice: 25000,
        componentCount: 10, componentPrice: 15000,
        materialCount: 150, materialPrice: 3500,
        miscCount: 0, miscPrice: 0
      },
      chiller: emptyUnits(),
      boiler: emptyUnits(),
      ventilation: { 
        outdoorCount: 1, outdoorPrice: 1500000, 
        indoorCount: 0, indoorPrice: 0,
        controllerCount: 1, controllerPrice: 45000,
        componentCount: 5, componentPrice: 12000,
        materialCount: 80, materialPrice: 2500,
        miscCount: 0, miscPrice: 0
      },
      heating: emptyUnits(),
      sewerage: emptyUnits(),
      waterSupply: emptyUnits(),
      construction: emptyUnits()
    },
    vrvOutdoor: '1 հատ (22 HP / 61.5 kW)',
    vrvIndoor: '12 հատ (Կասետային)',
    controls: '12 անհատական, 1 կենտրոնական',
    automation: 'BACnet Gateway + Wi-Fi',
    ventilation: '2500 m3/h (HRV ներառված)',
    otherDevices: 'Խոնավեցուցիչ (2 հատ)',
    totalCost: 11080000, 
    equipmentCost: 7400000,
    laborCost: 2000000,
    materialsCost: 1680000,
    date: '2024-02-10',
    isActive: true,
    profitMargin: 25,
    complexityLevel: 3,
    warrantyYears: 3,
    deliveryDays: 14
  }
];

export const SAFETY_MARGIN = 0.15;
