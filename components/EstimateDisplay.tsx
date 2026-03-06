
import React from 'react';
import { EstimateResult, BrandClass, ComparisonDelta, SelectedSystems } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Snowflake, Flame, Ruler, CheckCircle2, Crown, Star, Shield, Box, FileText, TrendingUp, Info, Download, Save, FileJson, ArrowUp, ArrowDown, AlertTriangle, MapPin, History, LayoutGrid, Globe } from 'lucide-react';

interface EstimateDisplayProps {
  result: EstimateResult | null;
  onSaveToArchive?: (est: EstimateResult) => void;
}

const EstimateDisplay: React.FC<EstimateDisplayProps> = ({ result, onSaveToArchive }) => {
  if (!result) return null;

  const COLORS = ['#1E293B', '#3B82F6', '#94A3B8'];
  const breakdownData = [
    { name: 'Սարքավորումներ', value: result.realistic.equipment },
    { name: 'Տեղադրում', value: result.realistic.labor },
    { name: 'Նյութեր', value: result.realistic.materials }
  ];

  const handlePrint = () => window.print();

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${result.name || 'hvac_estimate'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getDiscrepancyHints = () => {
    if (!result.comparison) return [];
    const hints: string[] = [];
    const comp = result.comparison;
    const ref = comp.referenceProject;

    if (Math.abs(comp.areaDelta) > 5) {
      hints.push(`📐 Մակերեսը ${Math.abs(comp.areaDelta).toFixed(1)}% ${comp.areaDelta > 0 ? 'մեծ' : 'փոքր'} է հղման նախագծից (${ref.area} մ²)։`);
    }

    if (Math.abs(result.volume / (result.area || 1) - ref.height) > 0.1) {
      hints.push(`📏 Առաստաղի բարձրությունը տարբերվում է (Reference: ${ref.height}մ, Current: ${(result.volume / (result.area || 1)).toFixed(1)}մ)։`);
    }

    if (Math.abs(comp.coolingDelta) > 10) {
      hints.push(`❄️ Հովացման պահանջը ${Math.abs(comp.coolingDelta).toFixed(1)}% ${comp.coolingDelta > 0 ? 'ավելի' : 'պակաս'} է (Ref: ${ref.coolingLoad}kW)։`);
    }

    if (Math.abs(result.distanceKm - ref.distanceKm) > 10) {
      hints.push(`🚗 Հեռավորությունը փոխվել է (Ref: ${ref.distanceKm}կմ, Current: ${result.distanceKm}կմ)։ Սա ազդել է տեղադրման և լոգիստիկ ծախսերի վրա։`);
    }

    const powerDensity = result.coolingLoad / (result.area || 1);
    if (powerDensity > 0.18) {
      hints.push(`🚨 ԶԳՈՒՇԱՑՈՒՄ. Հզորության խտությունը (${(powerDensity * 1000).toFixed(0)}W/m²) շատ բարձր է։`);
    }

    return hints;
  };

  const hints = getDiscrepancyHints();

  const DeltaBadge = ({ label, value }: { label: string, value: number }) => {
    if (Math.abs(value) < 1) return null;
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isPositive ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
        <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
        <div className="flex items-center font-bold text-xs">
          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(value).toFixed(1)}%
        </div>
      </div>
    );
  };

  const ComparisonRow = ({ label, current, reference, unit }: { label: string, current: string | number, reference: string | number, unit: string }) => (
    <div className="grid grid-cols-3 py-3 border-b border-white/5 last:border-0 items-center">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      <div className="text-center font-bold text-sm text-blue-400">{current} {unit}</div>
      <div className="text-right font-bold text-sm text-slate-500">{reference} {unit}</div>
    </div>
  );

  const BrandBadge = ({ type }: { type: BrandClass }) => {
    const config = {
      high: { label: 'Premium Class', icon: Crown, color: 'text-amber-600 bg-amber-50 border-amber-100' },
      mid: { label: 'Standard Class', icon: Star, color: 'text-blue-600 bg-blue-50 border-blue-100' },
      low: { label: 'Economic Class', icon: Shield, color: 'text-slate-600 bg-slate-50 border-slate-100' },
    };
    const { label, icon: Icon, color } = config[type];
    return (
      <span className={`${color} text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5 border`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 space-y-10 animate-in fade-in duration-700 print-shadow-none">
      
      <div className="no-print flex flex-wrap gap-3 border-b border-slate-50 pb-8">
        <button onClick={() => onSaveToArchive?.(result)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
          <Save size={16} /> Պահպանել Արխիվում
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-slate-900/20">
          <Download size={16} /> Արտահանել PDF
        </button>
        <button onClick={handleExportJson} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
          <FileJson size={16} /> Save JSON
        </button>
      </div>

      {/* Եթե նախադեպ կա */}
      {result.comparison && (
        <div className="bg-[#0F172A] text-white p-8 rounded-[2.5rem] relative overflow-hidden space-y-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <History size={150} />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-2 flex items-center gap-2">
                  <History size={16} /> Հաշվարկային Նախադեպ (Precedent)
                </h4>
                <p className="text-lg font-black text-white">
                  {result.comparison.referenceProjectName}
                </p>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ընտրվել է որպես ամենամոտ համանման նախագիծ</span>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Գնի Շեղում (1մ²)</p>
                <div className={`text-xl font-black ${result.comparison.pricePerM2Delta > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {result.comparison.pricePerM2Delta > 0 ? '+' : ''}{result.comparison.pricePerM2Delta.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-2">
               <div className="grid grid-cols-3 mb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                 <div>Պարամետր</div>
                 <div className="text-center">Ընթացիկ</div>
                 <div className="text-right">Նախադեպ</div>
               </div>
               <ComparisonRow label="Մակերես" current={result.area} reference={result.comparison.referenceProject.area} unit="մ²" />
               <ComparisonRow label="Հովացում" current={result.coolingLoad} reference={result.comparison.referenceProject.coolingLoad} unit="kW" />
               <ComparisonRow label="Հեռավորություն" current={result.distanceKm} reference={result.comparison.referenceProject.distanceKm} unit="կմ" />
               <ComparisonRow label="1մ² Գին" current={Math.round(result.realistic.total / (result.area || 1)).toLocaleString()} reference={Math.round(result.comparison.referenceProject.totalCost / (result.comparison.referenceProject.area || 1)).toLocaleString()} unit="֏" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              <DeltaBadge label="Area Δ" value={result.comparison.areaDelta} />
              <DeltaBadge label="Cooling Δ" value={result.comparison.coolingDelta} />
              <DeltaBadge label="Heating Δ" value={result.comparison.heatingDelta} />
            </div>

            {hints.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                   <AlertTriangle size={12} /> Շեղումների Պատճառահետևանքային Կապ
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {hints.map((hint, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl text-[11px] text-slate-300 font-medium leading-relaxed flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                      {hint}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Եթե նախադեպ ՉԿԱ (Շուկայական հաշվարկ) */}
      {!result.comparison && (
        <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2.5rem] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Globe size={120} className="text-amber-900" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
             <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600">
                <AlertTriangle size={24} />
             </div>
             <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-900 mb-1">Շուկայական Միջինացված Հաշվարկ</h4>
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed max-w-md mx-auto">
                  Արխիվում համապատասխան նախադեպ չի գտնվել: Հաշվարկը կատարվել է առանց նախադեպի՝ հիմնվելով շուկայական միջինացված ցուցանիշների (Benchmarks) վրա:
                </p>
             </div>
             <div className="flex gap-2">
                <span className="bg-white px-4 py-1.5 rounded-full border border-amber-200 text-[9px] font-black text-amber-900 uppercase tracking-widest">No Database Match</span>
                <span className="bg-white px-4 py-1.5 rounded-full border border-amber-200 text-[9px] font-black text-amber-900 uppercase tracking-widest">Market Data Based</span>
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FileText size={20} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{result.name || 'Project Draft'}</h3>
          </div>
          <div className="flex items-center gap-2 ml-1">
            <BrandBadge type={result.brandClass} />
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md border border-slate-100">{result.buildingType}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Հեռավորություն</p>
          <div className="flex items-center justify-end gap-2 text-2xl font-black text-slate-900">
            <MapPin size={22} className="text-orange-500" />
            {result.distanceKm} <span className="text-xs text-slate-400 font-bold">կմ</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <TrendingUp className="absolute top-4 right-4 text-white/10 group-hover:scale-110 transition-transform" size={100} />
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Օպտիմալ Ինվեստիցիա (Realistic)</p>
          <p className="text-5xl font-black tracking-tighter">{result.realistic.total.toLocaleString()} <span className="text-xl font-bold opacity-40">֏</span></p>
          <div className="mt-8 flex gap-4 text-[10px] font-black uppercase opacity-60">
            <div>1մ²: {Math.round(result.realistic.total / (result.area || 1)).toLocaleString()} ֏</div>
          </div>
        </div>
        <div className="bg-white border-2 border-slate-100 p-10 rounded-[2.5rem] relative overflow-hidden group">
          <AlertTriangle className="absolute top-4 right-4 text-slate-50 group-hover:scale-110 transition-transform" size={100} />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Ռիսկային Սահման (Conservative)</p>
          <p className="text-5xl font-black tracking-tighter text-slate-900">{result.conservative.total.toLocaleString()} <span className="text-xl font-bold opacity-30">֏</span></p>
          <div className="mt-8 flex gap-4 text-[10px] font-black uppercase opacity-40">
            <div>Safety Margin: +15%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
        <div className="text-center">
          <div className="p-2 bg-white rounded-xl w-fit mx-auto mb-3 shadow-sm text-slate-400">
             <LayoutGrid size={16} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ծավալ</p>
          <p className="font-black text-slate-800 text-lg">{result.volume} մ³</p>
        </div>
        <div className="text-center border-x border-slate-200">
           <div className="p-2 bg-white rounded-xl w-fit mx-auto mb-3 shadow-sm text-cyan-500">
             <Snowflake size={16} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Հովացում</p>
          <p className="font-black text-slate-800 text-lg">{result.coolingLoad} kW</p>
        </div>
        <div className="text-center border-r border-slate-200">
          <div className="p-2 bg-white rounded-xl w-fit mx-auto mb-3 shadow-sm text-orange-500">
             <Flame size={16} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ջեռուցում</p>
          <p className="font-black text-slate-800 text-lg">{result.heatingLoad} kW</p>
        </div>
        <div className="text-center">
          <div className="p-2 bg-white rounded-xl w-fit mx-auto mb-3 shadow-sm text-blue-600">
             <Ruler size={16} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Մակերես</p>
          <p className="font-black text-slate-800 text-lg">{result.area} մ²</p>
        </div>
      </div>

      <div className="space-y-6 pt-6">
        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] text-center flex items-center justify-center gap-6">
          <div className="h-[1.5px] bg-slate-100 flex-1"></div> Բյուջետային Դիֆերենցում <div className="h-[1.5px] bg-slate-100 flex-1"></div>
        </h4>
        <div className="h-72 no-print relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdownData} innerRadius={90} outerRadius={115} paddingAngle={8} dataKey="value" animationDuration={1500} stroke="none">
                {breakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '12px' }}
                formatter={(v: any) => `${v.toLocaleString()} ֏`} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ընդհանուր</p>
             <p className="text-lg font-black text-slate-900">100%</p>
          </div>
        </div>
      </div>
      
      <div className="hidden print:block pt-20">
        <div className="flex justify-between items-end border-t-2 border-slate-900 pt-10">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Լիազորված Անձի Ստորագրություն՝</p>
            <div className="w-64 border-b-2 border-slate-900"></div>
            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Սուրեն HVAC Պրո Համակարգ</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Վավերացման Ամսաթիվ՝</p>
            <p className="font-black text-lg mt-4 text-slate-900">{new Date().toLocaleDateString('hy-AM')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateDisplay;
