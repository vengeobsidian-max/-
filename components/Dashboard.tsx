
import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { ProjectData } from '../types';
import { Plus, X, ArrowUpRight, Target, Activity, Filter, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import { BUILDING_TYPES } from './ProjectTable';

interface DashboardProps {
  projects: ProjectData[];
  onAddProject: (p: ProjectData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onAddProject }) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Բոլորը');
  const [formData, setFormData] = useState({
    name: '', area: '', totalCost: '', buildingType: BUILDING_TYPES[0], distanceKm: '0'
  });

  const activeOnly = useMemo(() => projects.filter(p => p.isActive), [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedType === 'Բոլորը') return activeOnly;
    return activeOnly.filter(p => p.buildingType === selectedType);
  }, [activeOnly, selectedType]);

  const sortedProjects = useMemo(() => 
    [...filteredProjects].sort((a, b) => Number(a.area) - Number(b.area)),
    [filteredProjects]
  );
  
  const stats = useMemo(() => {
    const count = filteredProjects.length;
    const totalArea = filteredProjects.reduce((acc, p) => acc + Number(p.area), 0);
    const totalRevenue = filteredProjects.reduce((acc, p) => acc + Number(p.totalCost), 0);
    
    const avgCostM2 = count > 0 
      ? (filteredProjects.reduce((acc, p) => acc + (Number(p.totalCost) / Number(p.area)), 0) / count)
      : 0;

    return { count, totalArea, avgCostM2, totalRevenue };
  }, [filteredProjects]);

  const costBreakdownData = useMemo(() => [
    { name: 'Սարքավորումներ', value: filteredProjects.reduce((acc, p) => acc + Number(p.equipmentCost), 0) },
    { name: 'Աշխատուժ', value: filteredProjects.reduce((acc, p) => acc + Number(p.laborCost), 0) },
    { name: 'Նյութեր', value: filteredProjects.reduce((acc, p) => acc + Number(p.materialsCost), 0) }
  ], [filteredProjects]);

  const COLORS = ['#1E293B', '#3B82F6', '#64748B'];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(formData.totalCost);
    const area = parseFloat(formData.area);
    const dist = parseFloat(formData.distanceKm);
    const newProject: ProjectData = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      buildingType: formData.buildingType,
      area: area,
      height: 3,
      volume: area * 3,
      coolingLoad: 0,
      heatingLoad: 0,
      distanceKm: dist,
      systems: { split: false, multiSplit: false, vrv: false, chiller: false, boiler: false, ventilation: false },
      brandClass: 'mid',
      unitDetails: {
        split: { outdoorCount: 0, outdoorPrice: 0, indoorCount: 0, indoorPrice: 0, controllerCount: 0, controllerPrice: 0, componentCount: 0, componentPrice: 0, materialCount: 0, materialPrice: 0, miscCount: 0, miscPrice: 0 },
        multiSplit: { outdoorCount: 0, outdoorPrice: 0, indoorCount: 0, indoorPrice: 0, controllerCount: 0, controllerPrice: 0, componentCount: 0, componentPrice: 0, materialCount: 0, materialPrice: 0, miscCount: 0, miscPrice: 0 },
        vrv: { outdoorCount: 0, outdoorPrice: 0, indoorCount: 0, indoorPrice: 0, controllerCount: 0, controllerPrice: 0, componentCount: 0, componentPrice: 0, materialCount: 0, materialPrice: 0, miscCount: 0, miscPrice: 0 },
        chiller: { outdoorCount: 0, outdoorPrice: 0, indoorCount: 0, indoorPrice: 0, controllerCount: 0, controllerPrice: 0, componentCount: 0, componentPrice: 0, materialCount: 0, materialPrice: 0, miscCount: 0, miscPrice: 0 },
        boiler: { outdoorCount: 0, outdoorPrice: 0, indoorCount: 0, indoorPrice: 0, controllerCount: 0, controllerPrice: 0, componentCount: 0, componentPrice: 0, materialCount: 0, materialPrice: 0, miscCount: 0, miscPrice: 0 },
        ventilation: { outdoorCount: 0, outdoorPrice: 0, indoorCount: 0, indoorPrice: 0, controllerCount: 0, controllerPrice: 0, componentCount: 0, componentPrice: 0, materialCount: 0, materialPrice: 0, miscCount: 0, miscPrice: 0 }
      },
      vrvOutdoor: '-', vrvIndoor: '-', controls: '-', automation: '-', ventilation: '-', otherDevices: '-',
      totalCost: total,
      equipmentCost: total * 0.7,
      laborCost: total * 0.15,
      materialsCost: total * 0.15,
      date: new Date().toISOString().split('T')[0],
      isActive: true,
      profitMargin: 20,
      complexityLevel: 3,
      warrantyYears: 2,
      deliveryDays: 14
    };
    onAddProject(newProject);
    setFormData({ name: '', area: '', totalCost: '', buildingType: BUILDING_TYPES[0], distanceKm: '0' });
    setShowQuickAdd(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #fef3c7; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #92400e; border-radius: 10px; }
      `}</style>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Գործառնական Ցուցանիշներ</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Professional HVAC Business Intelligence</p>
        </div>
        <button 
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl transform active:scale-95 ${showQuickAdd ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-[#0F172A] text-white hover:bg-blue-600'}`}
        >
          {showQuickAdd ? <X size={16} /> : <Plus size={16} />}
          {showQuickAdd ? 'Չեղարկել' : 'Ավելացնել Տվյալ'}
        </button>
      </header>

      {/* Building Type Filter */}
      <div className="bg-[#FFEDD5] p-1 rounded-3xl border border-orange-100 shadow-lg relative">
        <div className="flex items-center custom-scrollbar overflow-x-auto whitespace-nowrap py-1 px-2 gap-2">
          <div className="flex items-center gap-3 px-6 py-3 border-r border-orange-200 text-orange-900 shrink-0">
            <Filter size={16} />
            <span className="text-[11px] font-black uppercase tracking-widest">Դասակարգում</span>
          </div>
          <div className="flex gap-2">
            {['Բոլորը', ...BUILDING_TYPES].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${selectedType === type ? 'bg-[#2563EB] text-white shadow-xl scale-105' : 'text-orange-900/60 hover:text-orange-900 hover:bg-orange-50'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showQuickAdd && (
        <form onSubmit={handleQuickSubmit} className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl animate-in slide-in-from-top duration-500 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Անվանում</label>
              <input required type="text" placeholder="Hilton Lobby" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus:border-blue-500 outline-none font-bold shadow-inner" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Մակերես (Մ²)</label>
              <input required type="number" placeholder="0" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus:border-blue-500 outline-none font-black text-lg" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Հեռավորություն (կմ)</label>
              <input required type="number" placeholder="0" value={formData.distanceKm} onChange={e => setFormData({...formData, distanceKm: e.target.value})} className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus:border-orange-500 outline-none font-black text-lg text-orange-600" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Տիպ</label>
              <select value={formData.buildingType} onChange={e => setFormData({...formData, buildingType: e.target.value})} className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus:border-blue-500 outline-none font-bold">
                {BUILDING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Ընդհանուր Արժեք (֏)</label>
              <input required type="number" placeholder="0" value={formData.totalCost} onChange={e => setFormData({...formData, totalCost: e.target.value})} className="w-full bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus:border-blue-500 outline-none font-black text-lg text-blue-600" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-700 transition shadow-2xl shadow-blue-500/30">Հաստատել և Պահպանել</button>
        </form>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Իրականացված Նախագծեր', value: stats.count, icon: Target, color: '#2563EB' },
          { label: 'Ընդհանուր Մակերես', value: `${stats.totalArea.toLocaleString()} մ²`, icon: Activity, color: '#1E293B' },
          { label: 'Միջին Ինդեքս (1մ²)', value: `${stats.avgCostM2.toLocaleString(undefined, { maximumFractionDigits: 0 })} ֏`, icon: ArrowUpRight, color: '#2563EB' },
          { label: 'Համախառն Շրջանառություն', value: `${(stats.totalRevenue / 1000000).toFixed(1)}M ֏`, icon: Target, color: '#1E293B' },
        ].map((item, i) => (
          <div key={i} className="bg-[#FFEDD5] p-10 rounded-[3rem] border border-orange-100 shadow-[0_20px_40px_rgba(251,191,36,0.1)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <p className="text-[11px] font-black text-orange-900/60 uppercase tracking-widest">{item.label}</p>
              <div className="p-2 bg-white/50 rounded-xl group-hover:scale-110 transition-transform">
                <item.icon style={{ color: item.color }} size={24} />
              </div>
            </div>
            <p className="text-5xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{item.value}</p>
            <div className="mt-6 h-1 w-12 rounded-full" style={{ backgroundColor: item.color, opacity: 0.3 }}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-blue-600 pl-5">Գնագոյացման Կորելացիա</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest ml-5">Cost vs Area Analysis</p>
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">{selectedType}</span>
          </div>
          <div className="h-96">
            {sortedProjects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedProjects}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="area" stroke="#94A3B8" fontSize={11} fontWeight="800" label={{ value: 'Մակերես', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: '900' }} />
                  <YAxis stroke="#94A3B8" fontSize={11} fontWeight="800" tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: '900', padding: '20px' }}
                    formatter={(value: any) => [`${value.toLocaleString()} ֏`, 'Արժեք']}
                  />
                  <Line type="monotone" dataKey="totalCost" stroke="#2563EB" strokeWidth={6} dot={{ r: 8, fill: '#2563EB', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 12, fill: '#0F172A' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-5">
                <Activity size={64} />
                <p className="text-[12px] font-black uppercase tracking-[0.3em]">Տվյալներ չկան</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-slate-900 pl-5">Ծախսերի Դիֆերենցում</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest ml-5">Expense Category Breakdown</p>
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">{selectedType}</span>
          </div>
          <div className="h-96">
            {filteredProjects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costBreakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} fontWeight="800" tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} fontWeight="800" width={110} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(val: any) => [`${val.toLocaleString()} ֏`, 'Ծախս']}
                  />
                  <Bar dataKey="value" radius={[0, 15, 15, 0]} barSize={50}>
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-5">
                <Target size={64} />
                <p className="text-[12px] font-black uppercase tracking-[0.3em]">Տվյալներ չկան</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
