
import React, { useState, useEffect } from 'react';
import { Snowflake, Flame, CheckCircle2, Circle, Crown, Star, Shield, LayoutGrid, Ruler, Square, Zap, ClipboardList, MapPin, Hammer } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import { BUILDING_TYPES } from './ProjectTable';
import { SelectedSystems, BrandClass, SystemUnits } from '../types';
import FlexibleNumberInput from './FlexibleNumberInput';

interface EstimatorFormProps {
  onEstimate: (data: any) => void;
}

const colorClasses: Record<string, { bg: string, border: string, text: string, icon: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: 'text-indigo-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', icon: 'text-cyan-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: 'text-emerald-600' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', icon: 'text-slate-600' },
};

const defaultSystemUnits = (): SystemUnits => ({
  outdoorCount: 0,
  outdoorPrice: 0,
  indoorCount: 0,
  indoorPrice: 0,
  controllerCount: 0,
  controllerPrice: 0,
  componentCount: 0,
  componentPrice: 0,
  materialCount: 0,
  materialPrice: 0,
  miscCount: 0,
  miscPrice: 0,
});

const EstimatorForm: React.FC<EstimatorFormProps> = ({ onEstimate }) => {
  const [systems, setSystems] = useState<SelectedSystems>({
    split: false, multiSplit: false, vrv: true, chiller: false, boiler: false, ventilation: false, heating: false, sewerage: false, waterSupply: false, construction: false
  });

  const [brandClass, setBrandClass] = useState<BrandClass>('mid');
  
  const [formData, setFormData] = useState({
    name: '',
    buildingType: BUILDING_TYPES[0],
    area: '',
    height: '3',
    coolingLoad: 0,
    heatingLoad: 0,
    distanceKm: 0
  });

  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const a = parseFloat(formData.area) || 0;
    const h = parseFloat(formData.height) || 0;
    setVolume(a * h);
  }, [formData.area, formData.height]);

  const toggleSystem = (key: keyof SelectedSystems) => {
    setSystems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.area) return;

    onEstimate({
      ...formData,
      systems,
      brandClass,
      equipmentCost: 0,
      laborCost: 0,
      materialsCost: 0,
      unitDetails: {
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
      }
    });
  };

  const labelStyle = "flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5";
  const inputStyle = "w-full bg-slate-50 text-slate-900 px-5 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm";

  const SystemToggle = ({ label, systemKey, color }: { label: string, systemKey: keyof SelectedSystems, color: string }) => {
    const classes = colorClasses[color];
    const isActive = systems[systemKey];
    
    return (
      <button
        type="button"
        onClick={() => toggleSystem(systemKey)}
        className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 border ${isActive ? `${classes.bg} ${classes.border} ${classes.text} shadow-sm ring-1 ring-inset ${classes.border}` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
      >
        <div className={`p-1 rounded ${isActive ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
          {isActive ? <CheckCircle2 className={classes.icon} size={14} /> : <Circle className="text-slate-200" size={14} />}
        </div>
        <span className="font-bold text-[11px] uppercase tracking-tight">{label}</span>
      </button>
    );
  };

  const BrandOption = ({ type, label, icon: Icon, color }: { type: BrandClass, label: string, icon: any, color: string }) => (
    <button
      type="button"
      onClick={() => setBrandClass(type)}
      className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${brandClass === type ? `bg-white border-blue-500 shadow-xl shadow-blue-500/10` : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'}`}
    >
      <Icon className={brandClass === type ? `text-blue-600` : 'text-slate-400'} size={24} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${brandClass === type ? `text-slate-900` : 'text-slate-500'}`}>{label}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden animate-in fade-in duration-700">
      <div className="bg-[#0F172A] p-8 flex items-center justify-between">
        <div>
          <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3">
            <ClipboardList size={18} className="text-blue-400" />
            Պրոֆեսիոնալ Հաշվարկման Մոդուլ
          </h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Dynamic Estimator Engine v2.5</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <div className="text-right">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Տվյալների Աղբյուր</p>
             <p className="text-white text-xs font-bold uppercase">Archive & Market Data</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-10">
        
        {/* Project Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className={labelStyle}>Օբյեկտի Անվանում</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} placeholder="Նախագծի իդենտիֆիկատոր..." />
            </div>
            <div>
              <label className={labelStyle}>Շինության Դասակարգում</label>
              <select value={formData.buildingType} onChange={e => setFormData({...formData, buildingType: e.target.value})} className={inputStyle}>
                {BUILDING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <label className={labelStyle}>Սարքավորումների Որակական Դաս</label>
            <div className="flex gap-4">
              <BrandOption type="high" label="Premium" icon={Crown} color="blue" />
              <BrandOption type="mid" label="Standard" icon={Star} color="blue" />
              <BrandOption type="low" label="Budget" icon={Shield} color="blue" />
            </div>
          </div>
        </div>

        {/* Systems Selection */}
        <div className="space-y-4 pt-4 border-t border-slate-50">
          <label className={labelStyle}>Ինժեներական Համակարգեր</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SystemToggle label="Split Systems" systemKey="split" color="blue" />
            <SystemToggle label="Multi-Split" systemKey="multiSplit" color="indigo" />
            <SystemToggle label="VRV / VRF Technology" systemKey="vrv" color="purple" />
            <SystemToggle label="Chiller Systems" systemKey="chiller" color="cyan" />
            <SystemToggle label="Heating / Boiler" systemKey="boiler" color="orange" />
            <SystemToggle label="Air Ventilation" systemKey="ventilation" color="emerald" />
            <SystemToggle label="Ջեռուցում (Heating)" systemKey="heating" color="orange" />
            <SystemToggle label="Կոյուղի (Sewerage)" systemKey="sewerage" color="slate" />
            <SystemToggle label="Ջրամատակարարում (Water)" systemKey="waterSupply" color="blue" />
            <SystemToggle label="Շինարարական նյութեր" systemKey="construction" color="slate" />
          </div>
        </div>

        {/* Technical Specification Block */}
        <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 shadow-inner">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  <Square size={12} className="text-blue-600" /> ՄԱԿԵՐԵՍ (Մ²)
                </label>
                <input required type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-lg" placeholder="0" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  <Ruler size={12} className="text-slate-400" /> ԲԱՐՁՐՈՒԹՅՈՒՆ (Մ)
                </label>
                <input required type="number" step="0.1" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-lg" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  <Snowflake size={12} className="text-cyan-500" /> ՀՈՎԱՑՈՒՄ (kW)
                </label>
                <input type="number" value={formData.coolingLoad} onChange={e => setFormData({...formData, coolingLoad: parseFloat(e.target.value) || 0})} className="w-full bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none font-black text-lg" placeholder="0" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  <Flame size={12} className="text-orange-500" /> ՋԵՌՈՒՑՈՒՄ (kW)
                </label>
                <input type="number" value={formData.heatingLoad} onChange={e => setFormData({...formData, heatingLoad: parseFloat(e.target.value) || 0})} className="w-full bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-black text-lg" placeholder="0" />
              </div>
              <div className="lg:col-span-1">
                <FlexibleNumberInput 
                  label="ՀԵՌԱՎՈՐՈՒԹՅՈՒՆ (կմ)" 
                  value={formData.distanceKm} 
                  onChange={v => setFormData({...formData, distanceKm: v})} 
                  suffix="կմ" 
                  max={500} 
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                />
              </div>
           </div>
           
           <div className="mt-8 flex justify-between items-center bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-slate-900 rounded-lg text-white">
                 <Zap size={16} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Հաշվարկային Ծավալ</p>
                 <p className="text-xs font-bold text-slate-600">Calculated Volume</p>
               </div>
             </div>
             <span className="text-2xl font-black text-slate-900">{volume.toLocaleString()} <span className="text-xs text-slate-400">մ³</span></span>
           </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/20 uppercase tracking-[0.3em] text-xs">
          Գեներացնել Նախնական Գնային Առաջարկ
        </button>
      </form>
    </div>
  );
};

export default EstimatorForm;
