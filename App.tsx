
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Calculator as CalculatorIcon, Database as DatabaseIcon, LayoutDashboard, BrainCircuit, Download, Upload, Lock } from 'lucide-react';
import { ProjectData, EstimateResult, AiInsight, SelectedSystems, BrandClass, SystemUnits, ComparisonDelta } from './types';
import { INITIAL_PROJECTS, SAFETY_MARGIN } from './constants';
import Dashboard from './components/Dashboard';
import ProjectTable from './components/ProjectTable';
import EstimatorForm from './components/EstimatorForm';
import EstimateDisplay from './components/EstimateDisplay';
import { getAiAnalysis } from './services/geminiService';

const LOGISTICS_RATE_PER_KM = 800; // Յուրաքանչյուր կմ-ի հավելյալ ծախս (֏)

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('hvac_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'admin123';
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('hvac_auth', 'true');
    } else {
      alert('Սխալ գաղտնաբառ');
    }
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'estimate'>('dashboard');
  const [projects, setProjects] = useState<ProjectData[]>(() => {
    const saved = localStorage.getItem('hvac_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [lastEstimate, setLastEstimate] = useState<EstimateResult | null>(null);
  const [projectDescription, setProjectDescription] = useState('');
  const [aiInsight, setAiInsight] = useState<AiInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('hvac_projects', JSON.stringify(projects));
  }, [projects]);

  const BRAND_WEIGHTS: Record<BrandClass, number> = { high: 1.25, mid: 1.0, low: 0.8 };
  
  const getSystemComplexity = (s: SelectedSystems): number => {
    let weight = 0;
    if (s.split) weight += 0.05;
    if (s.multiSplit) weight += 0.1;
    if (s.vrv) weight += 0.25;
    if (s.chiller) weight += 0.3;
    if (s.boiler) weight += 0.15;
    if (s.ventilation) weight += 0.2;
    if (s.heating) weight += 0.15;
    if (s.sewerage) weight += 0.1;
    if (s.waterSupply) weight += 0.15;
    if (s.construction) weight += 0.3;
    return 1 + weight;
  };

  const calculateEstimate = useCallback((data: any) => {
    const area = data.area;
    const cooling = data.coolingLoad || 0;
    const heating = data.heatingLoad || 0;
    const distance = data.distanceKm || 0;
    const unitDetails = data.unitDetails;
    
    let totalUnitsCost = 0;
    Object.keys(data.systems).forEach((sysKey) => {
      const key = sysKey as keyof SelectedSystems;
      if (data.systems[key]) {
        const u = unitDetails[key] as SystemUnits;
        totalUnitsCost += (u.outdoorCount * u.outdoorPrice) + 
                         (u.indoorCount * u.indoorPrice) +
                         (u.controllerCount * u.controllerPrice) + 
                         (u.componentCount * u.componentPrice) + 
                         (u.materialCount * u.materialPrice) +
                         (u.miscCount * u.miscPrice);
      }
    });

    const manualEquip = parseFloat(data.equipmentCost) || 0;
    const manualLabor = parseFloat(data.laborCost) || 0;
    const manualMats = parseFloat(data.materialsCost) || 0;
    const finalEquipManual = totalUnitsCost + manualEquip;

    const logisticsCost = distance * LOGISTICS_RATE_PER_KM;

    let baseTotal: number, baseEquip: number, baseLabor: number, baseMats: number;
    let isMarketValueBased = false;
    let comparison: ComparisonDelta | undefined;

    if (finalEquipManual === 0) {
      const activeProjects = projects.filter(p => p.isActive);
      const similarProjects = activeProjects.filter(p => p.buildingType === data.buildingType);
      
      let baseReferencePricePerM2: number;

      if (similarProjects.length > 0) {
        // Ընտրում ենք այն նախագիծը, որի մակերեսը ամենամոտն է
        const bestMatch = similarProjects.reduce((prev, curr) => 
          Math.abs(curr.area - area) < Math.abs(prev.area - area) ? curr : prev
        );

        const normalizedCosts = similarProjects.map(p => {
          const pComplexity = getSystemComplexity(p.systems);
          const pBrandFactor = BRAND_WEIGHTS[p.brandClass];
          return (p.totalCost / p.area) / (pComplexity * pBrandFactor);
        });
        
        baseReferencePricePerM2 = normalizedCosts.reduce((a, b) => a + b, 0) / normalizedCosts.length;
        
        const currentComplexity = getSystemComplexity(data.systems);
        const currentBrandFactor = BRAND_WEIGHTS[data.brandClass as BrandClass];
        const currentPricePerM2 = baseReferencePricePerM2 * currentBrandFactor * currentComplexity;
        const refPricePerM2 = bestMatch.totalCost / (bestMatch.area || 1);

        comparison = {
          referenceProjectName: bestMatch.name,
          referenceProject: bestMatch,
          areaDelta: ((area - bestMatch.area) / (bestMatch.area || 1)) * 100,
          coolingDelta: bestMatch.coolingLoad > 0 ? ((cooling - bestMatch.coolingLoad) / bestMatch.coolingLoad) * 100 : 0,
          heatingDelta: bestMatch.heatingLoad > 0 ? ((heating - bestMatch.heatingLoad) / bestMatch.heatingLoad) * 100 : 0,
          pricePerM2Delta: ((currentPricePerM2 - refPricePerM2) / (refPricePerM2 || 1)) * 100
        };
      } else {
        baseReferencePricePerM2 = 38000; 
        isMarketValueBased = true;
      }

      const currentComplexity = getSystemComplexity(data.systems);
      const currentBrandFactor = BRAND_WEIGHTS[data.brandClass as BrandClass];
      const finalPricePerM2 = baseReferencePricePerM2 * currentBrandFactor * currentComplexity;

      baseTotal = (area * finalPricePerM2) + logisticsCost;
      
      const currentIntensity = cooling / (area || 1);
      if (currentIntensity > 0.15) {
        baseTotal *= (1 + (currentIntensity - 0.1) * 1.5);
      }

      baseEquip = baseTotal * 0.70;
      baseLabor = baseTotal * 0.18; 
      baseMats = baseTotal * 0.12;
    } else {
      baseEquip = finalEquipManual;
      baseLabor = (manualLabor > 0 ? manualLabor : baseEquip * 0.25) + logisticsCost;
      baseMats = manualMats > 0 ? manualMats : baseEquip * 0.15;
      baseTotal = baseEquip + baseLabor + baseMats;
    }

    const result: EstimateResult = {
      name: data.name,
      buildingType: data.buildingType,
      area: data.area,
      volume: data.area * data.height,
      coolingLoad: data.coolingLoad,
      heatingLoad: data.heatingLoad,
      distanceKm: distance,
      systems: data.systems,
      brandClass: data.brandClass,
      unitDetails: unitDetails,
      otherDevices: data.otherDevices || '',
      isMarketValueBased,
      comparison,
      realistic: {
        total: baseTotal,
        equipment: baseEquip,
        labor: baseLabor,
        materials: baseMats
      },
      conservative: {
        total: baseTotal * (1 + SAFETY_MARGIN),
        equipment: baseEquip * (1 + SAFETY_MARGIN),
        labor: baseLabor * (1 + SAFETY_MARGIN),
        materials: baseMats * (1 + SAFETY_MARGIN)
      },
      profitMargin: 20,
      complexityLevel: getSystemComplexity(data.systems) > 1.3 ? 4 : 2,
      warrantyYears: data.brandClass === 'high' ? 5 : 2,
      deliveryDays: 14
    };

    setLastEstimate(result);
    setProjectDescription(`Օբյեկտ՝ ${data.buildingType}, Մակերես՝ ${data.area}մ², Հեռավորություն՝ ${distance}կմ, Հովացում՝ ${data.coolingLoad}kW`);
    setAiInsight(null);
  }, [projects]);

  const saveToArchive = useCallback((est: EstimateResult) => {
    const newProject: ProjectData = {
      id: Math.random().toString(36).substr(2, 9),
      name: est.name || 'Նոր Հաշվարկ',
      buildingType: est.buildingType,
      area: est.area,
      height: est.volume / (est.area || 1),
      volume: est.volume,
      coolingLoad: est.coolingLoad,
      heatingLoad: est.heatingLoad,
      distanceKm: est.distanceKm,
      systems: est.systems,
      brandClass: est.brandClass,
      unitDetails: est.unitDetails,
      vrvOutdoor: '-', vrvIndoor: '-', controls: '-', automation: '-', ventilation: '-',
      otherDevices: est.otherDevices,
      equipmentCost: est.realistic.equipment,
      laborCost: est.realistic.labor,
      materialsCost: est.realistic.materials,
      totalCost: est.realistic.total,
      date: new Date().toISOString().split('T')[0],
      isActive: true,
      profitMargin: est.profitMargin ?? 20,
      complexityLevel: est.complexityLevel ?? 3,
      warrantyYears: est.warrantyYears ?? 2,
      deliveryDays: est.deliveryDays ?? 14
    };
    setProjects(prev => [...prev, newProject]);
    alert("Հաշվարկը պահպանվեց արխիվում:");
  }, []);

  const exportAllData = () => {
    const dataToSave = { projects, exportDate: new Date().toISOString() };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToSave, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `HVAC_Workspace_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const data = imported.projects || imported;
        if (Array.isArray(data)) {
          setProjects(data);
          alert("Տվյալները ներմուծվեցին:");
        }
      } catch (err) { alert("Սխալ ֆայլի ձևաչափ:"); }
    };
    reader.readAsText(file);
  };

  const handleGenerateAi = async () => {
    if (!lastEstimate) return;
    setIsAiLoading(true);
    try {
      const insights = await getAiAnalysis(lastEstimate, projects, projectDescription);
      setAiInsight(insights);
    } catch (error) { console.error("AI error:", error); }
    finally { setIsAiLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] font-sans text-slate-900 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
           <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
                <Lock className="text-white" size={32} />
              </div>
           </div>
           <h2 className="text-2xl font-black text-center text-slate-800 mb-2 uppercase tracking-tight">Suren HVAC Պրո</h2>
           <p className="text-center text-slate-500 text-sm mb-8 font-bold">Մուտքագրեք գաղտնաբառը համակարգ մուտք գործելու համար</p>
           
           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Գաղտնաբառ..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-center text-lg"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#0F172A] hover:bg-blue-600 text-white font-black py-4 px-4 rounded-xl transition-all shadow-xl uppercase tracking-widest text-sm"
              >
                 Մուտք Գործել
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] font-sans text-slate-900">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-[#0F172A] text-white flex-shrink-0 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.1)] no-print">
          <div className="p-8 mb-4">
            <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <CalculatorIcon className="text-white" size={20} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white">HVAC</span>
                <span className="text-blue-500 text-[10px] font-black tracking-[0.2em] mt-1">INTELLIGENCE</span>
              </div>
            </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <LayoutDashboard size={18} />
              <span>Կառավարման Վահանակ</span>
            </button>
            <button onClick={() => setActiveTab('estimate')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === 'estimate' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <CalculatorIcon size={18} />
              <span>Նոր Հաշվարկ</span>
            </button>
            <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <DatabaseIcon size={18} />
              <span>Նախագծերի Արխիվ</span>
            </button>
          </nav>

          <div className="p-6 mt-auto space-y-3">
            <button onClick={exportAllData} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              <Download size={14} /> Save Workspace As
            </button>
            <label className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
              <Upload size={14} /> Load Workspace
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Համակարգի Կարգավիճակ</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-300">Օպտիմալ</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-12">
            {activeTab === 'dashboard' && <Dashboard projects={projects} onAddProject={(p) => setProjects(prev => [...prev, p])} />}
            {activeTab === 'projects' && (
              <ProjectTable 
                projects={projects} 
                onAddProject={(p) => setProjects(prev => [...prev, p])} 
                onUpdateProject={(up) => setProjects(prev => prev.map(p => p.id === up.id ? up : p))}
                onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))}
              />
            )}
            {activeTab === 'estimate' && (
              <>
                <EstimatorForm onEstimate={calculateEstimate} />
                {lastEstimate && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <EstimateDisplay result={lastEstimate} onSaveToArchive={saveToArchive} />
                    
                    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-fit sticky top-8 no-print">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                           <BrainCircuit size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">AI Ռազմավարական Վերլուծություն</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Business Intelligence Analysis</p>
                        </div>
                      </div>
                      
                      {!aiInsight && !isAiLoading && (
                        <button onClick={handleGenerateAi} className="w-full bg-[#0F172A] hover:bg-blue-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest text-xs">
                          Գեներացնել Վերլուծություն
                        </button>
                      )}

                      {isAiLoading && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-6">
                          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Մշակվում են տվյալները...</p>
                        </div>
                      )}

                      {aiInsight && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed font-medium">
                            "{aiInsight.summary}"
                          </div>
                          <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Կրիտիկական Ռիսկեր
                               </h4>
                               {aiInsight.risks.map((r, i) => <div key={i} className="bg-red-50/50 text-red-800 p-4 rounded-xl text-xs font-bold border border-red-100/50">{r}</div>)}
                            </div>
                            <div className="space-y-3">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Օպտիմալացման Խորհուրդներ
                               </h4>
                               {aiInsight.efficiencyTips.map((t, i) => <div key={i} className="bg-emerald-50/50 text-emerald-800 p-4 rounded-xl text-xs font-bold border border-emerald-100/50">{t}</div>)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
