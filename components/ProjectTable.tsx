
import React, { useState, useEffect } from 'react';
import { ProjectData, BrandClass, SelectedSystems, SystemUnits } from '../types';
import { 
  Plus, Edit2, Trash2, X, Snowflake, Flame, MapPin, FileSpreadsheet,
  CheckCircle2, Circle, Crown, Star, Shield, Box, Download, FileJson, CheckSquare, Square,
  BarChart3, Settings, Volume2, ShieldCheck, Clock, Percent, Cpu, HardDrive, Layers, Package, Hammer
} from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import FlexibleNumberInput from './FlexibleNumberInput';
import SmartImportZone from './SmartImportZone';

interface ProjectTableProps {
  projects: ProjectData[];
  onAddProject: (project: ProjectData) => void;
  onUpdateProject: (project: ProjectData) => void;
  onDeleteProject: (id: string) => void;
}

export const BUILDING_TYPES = [
  'Բնակելի տուն (Առանձնատուն)',
  'Բնակարան',
  'Գրասենյակ',
  'Ռեստորան / Սրճարան',
  'Հյուրանոց',
  'Խանութ / Առևտրի կենտրոն',
  'Արտադրական տարածք',
  'Հիվանդանոց / Կլինիկա',
  'Դպրոց / Մանկապարտեզ',
  'Սերվերային',
  'Մարզասրահ',
  'Այլ'
];

const colorClasses: Record<string, { bg: string, border: string, text: string, icon: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', icon: 'text-blue-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-indigo-800', icon: 'text-indigo-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-800', icon: 'text-purple-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-800', icon: 'text-cyan-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-800', icon: 'text-orange-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', icon: 'text-emerald-500' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-800', icon: 'text-slate-500' },
};

const defaultSystemUnits = (): SystemUnits => ({
  outdoorCount: 0, outdoorPrice: 0,
  indoorCount: 0, indoorPrice: 0,
  controllerCount: 0, controllerPrice: 0,
  componentCount: 0, componentPrice: 0,
  materialCount: 0, materialPrice: 0,
  miscCount: 0, miscPrice: 0,
});

interface UnitInputsSectionProps {
  sys: keyof SelectedSystems;
  label: string;
  detail: SystemUnits;
  onValueChange: (sys: keyof SelectedSystems, field: keyof SystemUnits, val: number) => void;
}

const UnitInputsSection: React.FC<UnitInputsSectionProps> = ({ sys, label, detail, onValueChange }) => {
  const isConstruction = sys === 'construction';

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6 animate-in fade-in duration-300">
      <h5 className="font-black text-[11px] text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
         <Box size={14} className="text-blue-500" />
         {label} Մոդուլ (1-6)
      </h5>
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Միավոր 1 */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest">
              {isConstruction ? '1. Հիմք և Կրող կոնստրուկցիաներ (Core / Foundation)' : '1. Հիմնական հանգույց (Core Unit)'}
            </label>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isConstruction ? (
                <>
                  Սա շենքի «կմախքն» է, առանց որի ոչինչ չի կանգնի։<br/>
                  <span className="font-semibold">Նյութեր:</span> Բետոն, ամրան (арматура), հիմքի բլոկներ, ավազ, խիճ։<br/>
                  <span className="font-semibold">Ինժեներական համեմատություն:</span> Ինչպես կաթսան ջեռուցման համար, սա շենքի հիմնական «մարմինն» է։
                </>
              ) : (
                <>
                  Սա համակարգի «սկիզբն» է կամ էներգիայի/նյութի աղբյուրը։<br/>
                  <span className="font-semibold">Ջեռուցում:</span> Կաթսա, ջերմային պոմպ։ <span className="font-semibold">VRV:</span> Արտաքին բլոկ։ <span className="font-semibold">Օդափոխություն:</span> Օդափոխանակության մեքենա (AHU), օդափոխիչ։ <span className="font-semibold">Ջուր/Կոյուղի:</span> Մուտքային հանգույց, պոմպակայան, սեպտիկ։
                </>
              )}
            </p>
          </div>
          <FlexibleNumberInput label="Քանակ" value={detail.outdoorCount} onChange={(val) => onValueChange(sys, 'outdoorCount', val)} max={100} />
          <FlexibleNumberInput label="Գին" value={detail.outdoorPrice} onChange={(val) => onValueChange(sys, 'outdoorPrice', val)} max={10000000} step={10000} suffix="֏" />
        </div>

        {/* Միավոր 2 */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-black text-indigo-600 uppercase tracking-widest">
              {isConstruction ? '2. Կմախք և Օժանդակ տարրեր (Framing / Structure)' : '2. Բաշխիչ և Կոլեկտորային համակարգ'}
            </label>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isConstruction ? (
                <>
                  Այն տարրերը, որոնք ձևավորում են տարածությունը և պահում են բեռը։<br/>
                  <span className="font-semibold">Նյութեր:</span> Մետաղական պրոֆիլներ, հեծաններ (балка), սյուներ, փայտյա կոնստրուկցիաներ, կաղապարամած (опалубка)։<br/>
                  <span className="font-semibold">Ինժեներական համեմատություն:</span> Սա համակարգի բաշխիչ հանգույցն է, որը պահում է ամբողջ ծանրությունը։
                </>
              ) : (
                <>
                  Այն կետը, որտեղից հիմնական հոսքը բաժանվում է ըստ ուղղությունների։<br/>
                  <span className="font-semibold">Ջեռուցում/Ջուր:</span> Կոլեկտորներ, հիդրավլիկ բաժանիչներ։ <span className="font-semibold">VRV:</span> Ռեֆնետներ (Refnets), բաշխիչ տուփեր (BS boxes)։ <span className="font-semibold">Օդափոխություն:</span> Բաշխիչ տուփեր (Plenum boxes), դրոսել-փականներ։
                </>
              )}
            </p>
          </div>
          <FlexibleNumberInput label="Քանակ" value={detail.controllerCount} onChange={(val) => onValueChange(sys, 'controllerCount', val)} max={500} />
          <FlexibleNumberInput label="Գին" value={detail.controllerPrice} onChange={(val) => onValueChange(sys, 'controllerPrice', val)} max={5000000} step={5000} suffix="֏" />
        </div>

        {/* Միավոր 3 */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-black text-purple-600 uppercase tracking-widest">
              {isConstruction ? '3. Պատնեշներ և Լիցք (Walls & Enclosure)' : '3. Մայրուղիներ և Տեղափոխման համակարգ'}
            </label>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isConstruction ? (
                <>
                  Շենքի «ծավալը» լրացնող նյութերը, որոնք բաժանում են ներսը դրսից և սենյակները միմյանցից։<br/>
                  <span className="font-semibold">Նյութեր:</span> Տուֆ, բլոկներ, աղյուս, գիպսոկարտոն, պանելներ։<br/>
                  <span className="font-semibold">Ինժեներական համեմատություն:</span> Ինչպես խողովակները կամ օդատարները, սրանք զբաղեցնում են ամբողջ տարածքը (մակերեսով կամ ծավալով)։
                </>
              ) : (
                <>
                  Հիմնական «ճանապարհները», որոնցով հոսում է ջուրը, օդը կամ գազը։<br/>
                  <span className="font-semibold">Ջեռուցում/Ջուր:</span> Խողովակներ (մետրաժով)։ <span className="font-semibold">VRV:</span> Պղնձե խողովակներ։ <span className="font-semibold">Օդափոխություն:</span> Օդատարներ (ցինկապատ, ճկուն)։ <span className="font-semibold">Կոյուղի:</span> Կոյուղատար խողովակներ։
                </>
              )}
            </p>
          </div>
          <FlexibleNumberInput label="Քանակ (մ)" value={detail.materialCount} onChange={(val) => onValueChange(sys, 'materialCount', val)} max={5000} />
          <FlexibleNumberInput label="Գին" value={detail.materialPrice} onChange={(val) => onValueChange(sys, 'materialPrice', val)} max={1000000} step={1000} suffix="֏" />
        </div>

        {/* Միավոր 4 */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-black text-cyan-600 uppercase tracking-widest">
              {isConstruction ? '4. Արտաքին և Ներքին հարդարում (Finishes)' : '4. Վերջնական սպառողական սարքեր'}
            </label>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isConstruction ? (
                <>
                  Այն, ինչը տեսնում և շոշափում է մարդը։ «Վերջնական սպառողի» մասը։<br/>
                  <span className="font-semibold">Նյութեր:</span> Սալիկներ, լամինատ, ներկեր, պաստառներ, լուսամուտներ, դռներ։<br/>
                  <span className="font-semibold">Ինժեներական համեմատություն:</span> Սա ռադիատորն է կամ ծորակը՝ շենքի «դեմքը»։
                </>
              ) : (
                <>
                  Այն ամենը, ինչը տեսնում և օգտագործում է վերջնական հաճախորդը սենյակում։<br/>
                  <span className="font-semibold">Ջեռուցում:</span> Ռադիատոր, տաք հատակ։ <span className="font-semibold">VRV:</span> Ներքին բլոկներ (կասետային, պատի և այլն)։ <span className="font-semibold">Օդափոխություն:</span> Ճաղավանդակներ (Grilles), դիֆուզորներ։ <span className="font-semibold">Ջուր/Կոյուղի:</span> Ծորակներ, սանհանգույցի սարքավորումներ։
                </>
              )}
            </p>
          </div>
          <FlexibleNumberInput label="Քանակ" value={detail.indoorCount} onChange={(val) => onValueChange(sys, 'indoorCount', val)} max={500} />
          <FlexibleNumberInput label="Գին" value={detail.indoorPrice} onChange={(val) => onValueChange(sys, 'indoorPrice', val)} max={5000000} step={5000} suffix="֏" />
        </div>

        {/* Միավոր 5 */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-black text-emerald-600 uppercase tracking-widest">
              {isConstruction ? '5. Կապակցող և Ամրացնող նյութեր (Binders)' : '5. Կցամասեր և Մոնտաժային նյութեր'}
            </label>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isConstruction ? (
                <>
                  Այն «սոսինձը», որը միացնում է մնացած բոլոր մասերը։<br/>
                  <span className="font-semibold">Նյութեր:</span> Ցեմենտ, ծեփամածիկ (шпатлевка), սոսինձներ, պտուտակներ (ինքնապտուտակ), անկյունակներ։<br/>
                  <span className="font-semibold">Ինժեներական համեմատություն:</span> Սրանք ֆիտինգներն են և միացման տարրերը։
                </>
              ) : (
                <>
                  Այն «մանրուքները», որոնցով միանում են խողովակները կամ ամրացվում են սարքերը։<br/>
                  <span className="font-semibold">Ընդհանուր:</span> Ֆիտինգներ, անկյուններ, ամրակներ (brackets), անցումներ, պտուտակներ, հերմետիկ նյութեր։
                </>
              )}
            </p>
          </div>
          <FlexibleNumberInput label="Քանակ" value={detail.componentCount} onChange={(val) => onValueChange(sys, 'componentCount', val)} max={5000} />
          <FlexibleNumberInput label="Գին" value={detail.componentPrice} onChange={(val) => onValueChange(sys, 'componentPrice', val)} max={1000000} step={500} suffix="֏" />
        </div>

        {/* Միավոր 6 */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-black text-orange-600 uppercase tracking-widest">
              {isConstruction ? '6. Մեկուսացում և Պաշտպանություն (Insulation)' : '6. Մեկուսացում և Պաշտպանություն'}
            </label>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isConstruction ? (
                <>
                  Շենքի երկարակեցության և հարմարավետության երաշխիքը։<br/>
                  <span className="font-semibold">Նյութեր:</span> Ջերմամեկուսացում (պենոպլաստ, բամբակ), հիդրոմեկուսացում, ձայնամեկուսացում, հակահրդեհային ծածկեր։<br/>
                  <span className="font-semibold">Ինժեներական համեմատություն:</span> Նույնն է, ինչ խողովակի մեկուսացումը կամ ֆիլտրերը։
                </>
              ) : (
                <>
                  Այն նյութերը, որոնք ապահովում են համակարգի անվտանգությունը և էներգախնայողությունը։<br/>
                  <span className="font-semibold">Ջեռուցում/VRV/Ջուր:</span> Խողովակների ջերմամեկուսացում (flex)։ <span className="font-semibold">Օդափոխություն:</span> Օդատարների մեկուսացում (կաուչուկ կամ բամբակ)։ <span className="font-semibold">Պաշտպանություն:</span> Ֆիլտրեր, հակահրդեհային փականներ, մեկուսիչ թաղանթներ։
                </>
              )}
            </p>
          </div>
          <FlexibleNumberInput label="Քանակ" value={detail.miscCount} onChange={(val) => onValueChange(sys, 'miscCount', val)} max={5000} />
          <FlexibleNumberInput label="Գին" value={detail.miscPrice} onChange={(val) => onValueChange(sys, 'miscPrice', val)} max={5000000} step={1000} suffix="֏" />
        </div>

      </div>
    </div>
  );
};

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', buildingType: BUILDING_TYPES[0], area: '', height: '3', volume: '0',
    coolingLoad: 0, heatingLoad: 0, distanceKm: 0,
    vrvOutdoor: '', vrvIndoor: '', controls: '', automation: '', ventilation: '',
    chillerPower: '', boilerPower: '', ventilationCapacity: '',
    equipmentCost: 0, laborCost: 0, materialsCost: 0,
    otherDevices: '',
    profitMargin: 20,
    complexityLevel: 3,
    warrantyYears: 2,
    deliveryDays: 7
  });

  const [systems, setSystems] = useState<SelectedSystems>({
    split: false, multiSplit: false, vrv: true, chiller: false, boiler: false, ventilation: false, heating: false, sewerage: false, waterSupply: false, construction: false
  });
  const [brandClass, setBrandClass] = useState<BrandClass>('mid');
  
  const [unitDetails, setUnitDetails] = useState<Record<keyof SelectedSystems, SystemUnits>>({
    split: defaultSystemUnits(),
    multiSplit: defaultSystemUnits(),
    vrv: defaultSystemUnits(),
    chiller: defaultSystemUnits(),
    boiler: defaultSystemUnits(),
    ventilation: defaultSystemUnits(),
    heating: defaultSystemUnits(),
    sewerage: defaultSystemUnits(),
    waterSupply: defaultSystemUnits(),
    construction: defaultSystemUnits(),
  });

  useEffect(() => {
    const areaNum = parseFloat(formData.area) || 0;
    const heightNum = parseFloat(formData.height) || 0;
    setFormData(prev => ({ ...prev, volume: (areaNum * heightNum).toString() }));
  }, [formData.area, formData.height]);

  const toggleSystem = (systemKey: keyof SelectedSystems) => {
    setSystems(prev => ({ ...prev, [systemKey]: !prev[systemKey] }));
  };

  const handleUnitValueChange = (sys: keyof SelectedSystems, field: keyof SystemUnits, val: number) => {
    setUnitDetails(prev => ({
      ...prev,
      [sys]: {
        ...prev[sys],
        [field]: val
      }
    }));
  };

  const calculateTotalUnitsCost = (sysDetails: Record<keyof SelectedSystems, SystemUnits>, selectedSys: SelectedSystems) => {
    let total = 0;
    Object.keys(selectedSys).forEach((sysKey) => {
      const key = sysKey as keyof SelectedSystems;
      if (selectedSys[key]) {
        const u = sysDetails[key];
        total += (u.outdoorCount * u.outdoorPrice) + 
                 (u.indoorCount * u.indoorPrice) + 
                 (u.controllerCount * u.controllerPrice) + 
                 (u.componentCount * u.componentPrice) + 
                 (u.materialCount * u.materialPrice) +
                 (u.miscCount * u.miscPrice);
      }
    });
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalUnitsCost = calculateTotalUnitsCost(unitDetails, systems);
    const manualEquip = formData.equipmentCost;
    const labor = formData.laborCost;
    const mats = formData.materialsCost;

    const finalEquipmentCost = totalUnitsCost + manualEquip;

    const projectPayload: ProjectData = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      buildingType: formData.buildingType,
      area: parseFloat(formData.area) || 0,
      height: parseFloat(formData.height) || 0,
      volume: parseFloat(formData.volume) || 0,
      coolingLoad: formData.coolingLoad,
      heatingLoad: formData.heatingLoad,
      distanceKm: formData.distanceKm,
      systems: { ...systems },
      brandClass: brandClass,
      unitDetails: { ...unitDetails },
      vrvOutdoor: formData.vrvOutdoor,
      vrvIndoor: formData.vrvIndoor,
      controls: formData.controls,
      automation: formData.automation,
      ventilation: formData.ventilation,
      chillerPower: formData.chillerPower,
      boilerPower: formData.boilerPower,
      ventilationCapacity: formData.ventilationCapacity,
      otherDevices: formData.otherDevices,
      equipmentCost: finalEquipmentCost,
      laborCost: labor,
      materialsCost: mats,
      totalCost: finalEquipmentCost + labor + mats,
      date: editingId ? projects.find(p => p.id === editingId)?.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      isActive: editingId ? projects.find(p => p.id === editingId)?.isActive ?? true : true,
      profitMargin: formData.profitMargin,
      complexityLevel: formData.complexityLevel,
      warrantyYears: formData.warrantyYears,
      deliveryDays: formData.deliveryDays
    };

    if (editingId) {
      onUpdateProject(projectPayload);
    } else {
      onAddProject(projectPayload);
    }

    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', buildingType: BUILDING_TYPES[0], area: '', height: '3', volume: '0',
      coolingLoad: 0, heatingLoad: 0, distanceKm: 0,
      vrvOutdoor: '', vrvIndoor: '', controls: '', automation: '', ventilation: '',
      chillerPower: '', boilerPower: '', ventilationCapacity: '',
      equipmentCost: 0, laborCost: 0, materialsCost: 0,
      otherDevices: '',
      profitMargin: 20,
      complexityLevel: 3,
      warrantyYears: 2,
      deliveryDays: 7
    });
    setSystems({ split: false, multiSplit: false, vrv: true, chiller: false, boiler: false, ventilation: false, heating: false, sewerage: false, waterSupply: false, construction: false });
    setUnitDetails({
      split: defaultSystemUnits(),
      multiSplit: defaultSystemUnits(),
      vrv: defaultSystemUnits(),
      chiller: defaultSystemUnits(),
      boiler: defaultSystemUnits(),
      ventilation: defaultSystemUnits(),
      heating: defaultSystemUnits(),
      sewerage: defaultSystemUnits(),
      waterSupply: defaultSystemUnits(),
      construction: defaultSystemUnits(),
    });
    setBrandClass('mid');
  };

  const startEditing = (project: ProjectData) => {
    setEditingId(project.id);
    const currentUnitsSum = calculateTotalUnitsCost(project.unitDetails, project.systems);

    setFormData({
      name: project.name,
      buildingType: project.buildingType,
      area: project.area.toString(),
      height: project.height.toString(),
      volume: project.volume.toString(),
      coolingLoad: project.coolingLoad,
      heatingLoad: project.heatingLoad,
      distanceKm: project.distanceKm || 0,
      vrvOutdoor: project.vrvOutdoor,
      vrvIndoor: project.vrvIndoor,
      controls: project.controls,
      automation: project.automation,
      ventilation: project.ventilation,
      chillerPower: project.chillerPower || '',
      boilerPower: project.boilerPower || '',
      ventilationCapacity: project.ventilationCapacity || '',
      equipmentCost: Math.max(0, project.equipmentCost - currentUnitsSum),
      laborCost: project.laborCost,
      materialsCost: project.materialsCost,
      otherDevices: project.otherDevices,
      profitMargin: project.profitMargin ?? 20,
      complexityLevel: project.complexityLevel ?? 3,
      warrantyYears: project.warrantyYears ?? 2,
      deliveryDays: project.deliveryDays ?? 7
    });
    setSystems({ ...project.systems });
    setBrandClass(project.brandClass);
    setUnitDetails({ ...project.unitDetails });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleProjectActivity = (project: ProjectData) => {
    onUpdateProject({ ...project, isActive: !project.isActive });
  };

  const handleBackupExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `HVAC_Backup_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const labelStyle = "flex items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2";
  const inputStyle = "w-full bg-[#333333] text-white px-5 py-3 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-500/30 transition-all font-bold text-sm shadow-inner";

  const BrandOption = ({ type, label, icon: Icon, color }: { type: BrandClass, label: string, icon: any, color: string }) => (
    <button
      type="button"
      onClick={() => setBrandClass(type)}
      className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-[2rem] border-2 transition-all duration-500 ${brandClass === type ? `bg-${color}-50 border-${color}-400 shadow-xl scale-105` : 'bg-white border-slate-50 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}`}
    >
      <Icon className={brandClass === type ? `text-${color}-600` : 'text-slate-400'} size={28} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${brandClass === type ? `text-${color}-900` : 'text-slate-500'}`}>{label}</span>
    </button>
  );

  const BrandBadge = ({ type }: { type: BrandClass }) => {
    const config = {
      high: { label: 'Բարձր', icon: Crown, color: 'bg-amber-100 text-amber-700 border-amber-200' },
      mid: { label: 'Միջին', icon: Star, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      low: { label: 'Ցածր', icon: Shield, color: 'bg-slate-100 text-slate-700 border-slate-200' },
    };
    const { label, icon: Icon, color } = config[type];
    return (
      <span className={`${color} text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tight flex items-center gap-1 border h-fit`}>
        <Icon size={10} />
        {label}
      </span>
    );
  };

  const SystemToggle = ({ label, systemKey, color }: { label: string, systemKey: keyof SelectedSystems, color: string }) => {
    const classes = colorClasses[color];
    const isActive = systems[systemKey];
    return (
      <button
        type="button"
        onClick={() => toggleSystem(systemKey)}
        className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 border-2 ${isActive ? `${classes.bg} ${classes.border} ${classes.text} shadow-md` : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}
      >
        {isActive ? <CheckCircle2 className={classes.icon} size={16} /> : <Circle size={16} />}
        <span className="font-black text-[10px] uppercase tracking-wider">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Նախագծերի Արխիվ</h2>
          <p className="text-slate-500 text-sm font-medium">Կառավարեք ձեր հին աշխատանքները և պահուստավորեք տվյալները:</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsSmartImportOpen(true)}
            className="px-6 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl flex items-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-blue-100"
          >
            <FileSpreadsheet size={14} /> Խելացի Ինտեգրում
          </button>
          <button
            onClick={handleBackupExport}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl flex items-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-50"
          >
            <Download size={14} /> Save Archive
          </button>
          <button
            onClick={() => isFormOpen ? closeForm() : setIsFormOpen(true)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg ${isFormOpen ? 'bg-slate-200 text-slate-700' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
          >
            {isFormOpen ? <X size={14} /> : <Plus size={14} />}
            {isFormOpen ? 'Փակել' : 'Ավելացնել նորը'}
          </button>
        </div>
      </header>

      {isSmartImportOpen && <SmartImportZone onClose={() => setIsSmartImportOpen(false)} onAddProject={onAddProject} />}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in slide-in-from-top duration-500 space-y-10">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-6">
            {editingId ? 'Խմբագրել Նախագիծը' : 'Ավելացնել Նոր Նախագիծ'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <label className={labelStyle}>Գործի անունը</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputStyle} placeholder="Մուտքագրեք անվանումը..." />
            </div>
            <div>
              <label className={labelStyle}>Շինության տիպ</label>
              <select value={formData.buildingType} onChange={e => setFormData({ ...formData, buildingType: e.target.value })} className={inputStyle}>
                {BUILDING_TYPES.map(type => <option key={type} value={type} className="bg-white text-slate-900">{type}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className={labelStyle}>ԲՐԵՆԴԻ ԿԼԱՍ</label>
            <div className="flex gap-4">
              <BrandOption type="high" label="Բարձր (High)" icon={Crown} color="amber" />
              <BrandOption type="mid" label="Միջին (Mid)" icon={Star} color="blue" />
              <BrandOption type="low" label="Ցածր (Budget)" icon={Shield} color="slate" />
            </div>
          </div>

          <div className="space-y-4">
             <label className={labelStyle}>Համակարգեր</label>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <SystemToggle label="Սպլիտ" systemKey="split" color="blue" />
                <SystemToggle label="Մուլտի Սպլիտ" systemKey="multiSplit" color="indigo" />
                <SystemToggle label="VRV / VRF" systemKey="vrv" color="purple" />
                <SystemToggle label="Չիլլեր" systemKey="chiller" color="cyan" />
                <SystemToggle label="Կաթսայատուն" systemKey="boiler" color="orange" />
                <SystemToggle label="Օդափոխություն" systemKey="ventilation" color="emerald" />
                <SystemToggle label="Ջեռուցում" systemKey="heating" color="orange" />
                <SystemToggle label="Կոյուղի" systemKey="sewerage" color="slate" />
                <SystemToggle label="Ջրամատակարարում" systemKey="waterSupply" color="blue" />
                <SystemToggle label="Շինարարական նյութեր" systemKey="construction" color="slate" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-slate-50/50 p-8 rounded-[2.5rem]">
            {(Object.keys(systems) as Array<keyof SelectedSystems>).map(key => (
              systems[key] && <UnitInputsSection key={key} sys={key} label={key.toUpperCase()} detail={unitDetails[key]} onValueChange={handleUnitValueChange} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
            <div>
              <label className={labelStyle}>Մակերես (մ²)</label>
              <input required type="number" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Բարձրություն (մ)</label>
              <input required type="number" step="0.1" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className={inputStyle} />
            </div>
            <div className="flex flex-col justify-center text-center">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ԾԱՎԱԼ</label>
              <span className="font-black text-slate-800 text-lg">{formData.volume} մ³</span>
            </div>
            <div className="lg:col-span-1">
              <FlexibleNumberInput 
                label="ՀՈՎԱՑՈՒՄ (KW)" 
                value={formData.coolingLoad} 
                onChange={v => setFormData({...formData, coolingLoad: v})} 
                suffix="kW" 
                max={500} 
                className="bg-white p-4 rounded-[2rem] shadow-sm"
              />
            </div>
            <div className="lg:col-span-1">
              <FlexibleNumberInput 
                label="ՋԵՌՈՒՑՈՒՄ (KW)" 
                value={formData.heatingLoad} 
                onChange={v => setFormData({...formData, heatingLoad: v})} 
                suffix="kW" 
                max={500} 
                className="bg-white p-4 rounded-[2rem] shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-100">
             <div className="lg:col-span-1">
                <FlexibleNumberInput 
                  label="ՀԵՌԱՎՈՐՈՒԹՅՈՒՆ (կմ)" 
                  value={formData.distanceKm} 
                  onChange={v => setFormData({...formData, distanceKm: v})} 
                  suffix="կմ" 
                  max={500} 
                  className="bg-white p-4 rounded-[2rem] shadow-sm"
                />
              </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-4">
              <BarChart3 size={18} className="text-blue-600" />
              Լրացուցիչ Ցուցանիշներ (KPIs)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-100">
              <FlexibleNumberInput 
                label="Շահույթի Մարժա (%)" 
                value={formData.profitMargin} 
                onChange={v => setFormData({...formData, profitMargin: v})} 
                suffix="%" max={100} step={1}
                className="bg-white p-6 rounded-3xl shadow-sm"
              />
              <FlexibleNumberInput 
                label="Բարդություն (1-5)" 
                value={formData.complexityLevel} 
                onChange={v => setFormData({...formData, complexityLevel: v})} 
                suffix="Lvl" max={5} min={1} step={1}
                className="bg-white p-6 rounded-3xl shadow-sm"
              />
              <FlexibleNumberInput 
                label="Երաշխիք (տարի)" 
                value={formData.warrantyYears} 
                onChange={v => setFormData({...formData, warrantyYears: v})} 
                suffix="տարի" max={10} min={1} step={1}
                className="bg-white p-6 rounded-3xl shadow-sm"
              />
              <FlexibleNumberInput 
                label="Մատակարարում (օր)" 
                value={formData.deliveryDays} 
                onChange={v => setFormData({...formData, deliveryDays: v})} 
                suffix="օր" max={90} min={1} step={1}
                className="bg-white p-6 rounded-3xl shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100">
            <FlexibleNumberInput label="Այլ Սարքեր (֏)" value={formData.equipmentCost} onChange={v => setFormData({...formData, equipmentCost: v})} suffix="֏" max={50000000} step={50000} />
            <FlexibleNumberInput label="Աշխատուժ (֏)" value={formData.laborCost} onChange={v => setFormData({...formData, laborCost: v})} suffix="֏" max={10000000} step={20000} />
            <FlexibleNumberInput label="Նյութեր (֏)" value={formData.materialsCost} onChange={v => setFormData({...formData, materialsCost: v})} suffix="֏" max={10000000} step={20000} />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl uppercase tracking-[0.3em] text-sm transform hover:-translate-y-1 transition-all">
              {editingId ? 'Պահպանել Փոփոխությունները' : 'Ավելացնել Շտեմարանում'}
            </button>
            {editingId && (
              <button type="button" onClick={closeForm} className="px-10 bg-slate-100 text-slate-600 font-black py-6 rounded-[2rem] transition-all uppercase tracking-widest text-xs">Չեղարկել</button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-5 w-12 text-center">Ակտիվ</th>
                <th className="px-8 py-5">Նախագիծ / Բրենդ</th>
                <th className="px-6 py-5 text-center">Տարածք / Ծավալ</th>
                <th className="px-6 py-5 text-center">Հեռավորություն</th>
                <th className="px-6 py-5 text-center">Համակարգեր</th>
                <th className="px-6 py-5 text-center">Բեռներ</th>
                <th className="px-8 py-5 text-right">Ընդհանուր Գին</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors group ${!p.isActive ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => toggleProjectActivity(p)}
                      className={`transition-all ${p.isActive ? 'text-blue-600' : 'text-slate-300'} hover:scale-110 active:scale-95`}
                    >
                      {p.isActive ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-black text-slate-800 uppercase text-sm tracking-tight">{p.name}</div>
                      <BrandBadge type={p.brandClass} />
                    </div>
                    <div className="flex gap-2">
                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.buildingType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="font-black text-slate-800 text-sm">{p.area} մ²</div>
                    <div className="text-[10px] text-slate-400 font-bold">{p.volume} մ³</div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex items-center justify-center gap-1 font-black text-slate-700 text-xs">
                       <MapPin size={12} className="text-orange-500" />
                       {p.distanceKm || 0} կմ
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {Object.entries(p.systems).filter(([_, a]) => a).map(([n]) => (
                        <span key={n} className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded uppercase border border-slate-200">{n}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1 text-[10px] font-black">
                      <div className="text-blue-500 flex items-center gap-1"><Snowflake size={10}/> {p.coolingLoad} kW</div>
                      <div className="text-orange-500 flex items-center gap-1"><Flame size={10}/> {p.heatingLoad} kW</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="font-black text-blue-600 text-lg tracking-tighter">{p.totalCost.toLocaleString()} ֏</div>
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                       <button onClick={() => onDeleteProject(p.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                       <button onClick={() => startEditing(p)} className="text-slate-300 hover:text-blue-500 transition-colors"><Edit2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;
