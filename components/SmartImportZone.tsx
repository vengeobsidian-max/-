import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, FileText, Settings, CheckCircle2, AlertCircle, ArrowRight, Download, X, GripVertical, Calculator } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProjectData, SystemUnits } from '../types';

interface ParsedItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  categoryId: number | null; // 1-6 or null for unknown
  originalRow: any;
}

const KEYWORD_DICTIONARY = {
  hvac: {
    1: ['boiler', 'chiller', 'vrv outdoor', 'կաթսա', 'ahu', 'պոմպ', 'արտաքին բլոկ'],
    2: ['collector', 'manifold', 'կոլեկտոր', 'refnet', 'plenum', 'բաշխիչ'],
    3: ['pipe', 'duct', 'խողովակ', 'օդատար', 'մայրուղի'],
    4: ['radiator', 'grill', 'ռադիատոր', 'diffuser', 'ծորակ', 'ներքին բլոկ', 'տաք հատակ', 'սանհանգույց', 'ճաղավանդակ'],
    5: ['fitting', 'valve', 'ֆիտինգ', 'փական', 'bracket', 'ամրակ', 'անկյուն', 'անցում', 'պտուտակ', 'հերմետիկ'],
    6: ['insulation', 'k-flex', 'մեկուսացում', 'filter', 'ֆիլտր', 'flex', 'կաուչուկ', 'բամբակ', 'թաղանթ']
  },
  construction: {
    1: ['բետոն', 'ամրան', 'арматура', 'հիմք', 'ավազ', 'խիճ', 'հիմքի բլոկ'],
    2: ['beam', 'պրոֆիլ', 'հեծան', 'балка', 'սյուն', 'կաղապարամած', 'опалубка'],
    3: ['brick', 'տուֆ', 'աղյուս', 'գիպսոկարտոն', 'պանել', 'բլոկ'],
    4: ['tile', 'paint', 'սալիկ', 'ներկ', 'լամինատ', 'պաստառ', 'լուսամուտ', 'դուռ', 'դռներ'],
    5: ['glue', 'screw', 'սոսինձ', 'ցեմենտ', 'ծեփամածիկ', 'шпатлевка', 'պտուտակ', 'անկյունակ', 'ինքնապտուտակ'],
    6: ['hydro', 'մեկուսացում', 'պենոպլաստ', 'բամբակ', 'հիդրոմեկուսացում', 'ձայնամեկուսացում', 'հակահրդեհային']
  }
};

const CATEGORY_NAMES = {
  hvac: {
    1: '1. Հիմնական հանգույց',
    2: '2. Բաշխիչ և Կոլեկտորային',
    3: '3. Մայրուղիներ',
    4: '4. Վերջնական սպառողական',
    5: '5. Կցամասեր և Մոնտաժային',
    6: '6. Մեկուսացում և Պաշտպանություն'
  },
  construction: {
    1: '1. Հիմք և Կրող կոնստրուկցիաներ',
    2: '2. Կմախք և Օժանդակ տարրեր',
    3: '3. Պատնեշներ և Լիցք',
    4: '4. Արտաքին և Ներքին հարդարում',
    5: '5. Կապակցող և Ամրացնող նյութեր',
    6: '6. Մեկուսացում և Պաշտպանություն'
  }
};

const armsciiMap: Record<number, string> = {
  0xA1: '՝', 0xA2: '։', 0xA3: '՛', 0xA4: '՜', 0xA5: '՞', 0xA6: '՟', 0xA7: '․', 0xA8: '֊', 0xA9: '«', 0xAA: '»',
  0xB2: 'Ա', 0xB3: 'ա', 0xB4: 'Բ', 0xB5: 'բ', 0xB6: 'Գ', 0xB7: 'գ', 0xB8: 'Դ', 0xB9: 'դ', 0xBA: 'Ե', 0xBB: 'ե',
  0xBC: 'Զ', 0xBD: 'զ', 0xBE: 'Է', 0xBF: 'է', 0xC0: 'Ը', 0xC1: 'ը', 0xC2: 'Թ', 0xC3: 'թ', 0xC4: 'Ժ', 0xC5: 'ժ',
  0xC6: 'Ի', 0xC7: 'ի', 0xC8: 'Լ', 0xC9: 'լ', 0xCA: 'Խ', 0xCB: 'խ', 0xCC: 'Ծ', 0xCD: 'ծ', 0xCE: 'Կ', 0xCF: 'կ',
  0xD0: 'Հ', 0xD1: 'հ', 0xD2: 'Ձ', 0xD3: 'ձ', 0xD4: 'Ղ', 0xD5: 'ղ', 0xD6: 'Ճ', 0xD7: 'ճ', 0xD8: 'Մ', 0xD9: 'մ',
  0xDA: 'Յ', 0xDB: 'յ', 0xDC: 'Ն', 0xDD: 'ն', 0xDE: 'Շ', 0xDF: 'շ', 0xE0: 'Ո', 0xE1: 'ո', 0xE2: 'Չ', 0xE3: 'չ',
  0xE4: 'Պ', 0xE5: 'պ', 0xE6: 'Ջ', 0xE7: 'ջ', 0xE8: 'Ռ', 0xE9: 'ռ', 0xEA: 'Ս', 0xEB: 'ս', 0xEC: 'Վ', 0xED: 'վ',
  0xEE: 'Տ', 0xEF: 'տ', 0xF0: 'Ր', 0xF1: 'ր', 0xF2: 'Ց', 0xF3: 'ց', 0xF4: 'Ու', 0xF5: 'ու', 0xF6: 'Փ', 0xF7: 'փ',
  0xF8: 'Ք', 0xF9: 'ք', 0xFA: 'և', 0xFB: 'Օ', 0xFC: 'օ', 0xFD: 'Ֆ', 0xFE: 'ֆ'
};

const fixArmenianText = (text: any): any => {
  if (typeof text !== 'string') return text;
  
  const armsciiChars = text.match(/[\xB2-\xFE]/g) || [];
  if (armsciiChars.length === 0) return text;

  return text.split('').map((char, i, arr) => {
    const code = char.charCodeAt(0);
    
    // Preserve m², m³, M², M³, Ù² (մ²), Ù³ (մ³)
    if (code === 0xB2 && i > 0 && (arr[i-1] === 'm' || arr[i-1] === 'M' || arr[i-1] === '\xD9')) {
      return '²';
    }
    if (code === 0xB3 && i > 0 && (arr[i-1] === 'm' || arr[i-1] === 'M' || arr[i-1] === '\xD9')) {
      return '³';
    }
    
    return armsciiMap[code] || char;
  }).join('');
};

export default function SmartImportZone({ onClose, onAddProject }: { onClose: () => void, onAddProject?: (project: ProjectData) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [templateType, setTemplateType] = useState<'hvac' | 'construction'>('hvac');
  const [fileData, setFileData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ name: '', quantity: '', price: '', categoryId: '' });
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Calculator state
  const [sNew, setSNew] = useState<number>(100);
  const [sArchive, setSArchive] = useState<number>(100);
  const [kInflation, setKInflation] = useState<number>(1.1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const ab = evt.target?.result;
      const wb = XLSX.read(ab, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws);
      
      const data = rawData.map((row: any) => {
        const fixedRow: any = {};
        for (const key in row) {
          const fixedKey = fixArmenianText(key);
          fixedRow[fixedKey] = fixArmenianText(row[key]);
        }
        return fixedRow;
      });
      
      if (data.length > 0) {
        setFileData(data);
        const cols = Object.keys(data[0] as object);
        setColumns(cols);
        
        // Auto-guess mapping
        const guessMapping = { name: '', quantity: '', price: '', categoryId: '' };
        cols.forEach(c => {
          const lower = c.toLowerCase();
          if (lower.includes('անվանում') || lower.includes('name') || lower.includes('ապրանք')) guessMapping.name = c;
          if (lower.includes('քանակ') || lower.includes('qty') || lower.includes('quantity')) guessMapping.quantity = c;
          if (lower.includes('գին') || lower.includes('արժեք') || lower.includes('price')) guessMapping.price = c;
          if (lower.includes('category') || lower.includes('կատեգորիա') || lower.includes('id')) guessMapping.categoryId = c;
        });
        setMapping(guessMapping);
        setStep(2);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const categorizeItem = (name: string, type: 'hvac' | 'construction'): number | null => {
    const lowerName = name.toLowerCase();
    const dict = KEYWORD_DICTIONARY[type];
    
    for (const [catId, keywords] of Object.entries(dict)) {
      if (keywords.some(kw => lowerName.includes(kw.toLowerCase()))) {
        return parseInt(catId);
      }
    }
    return null;
  };

  const processMapping = () => {
    const parsed: ParsedItem[] = fileData.map((row, index) => {
      const name = row[mapping.name] || `Անհայտ ապրանք ${index + 1}`;
      const quantity = parseFloat(row[mapping.quantity]) || 1;
      const price = parseFloat(row[mapping.price]) || 0;
      
      let categoryId = null;
      if (mapping.categoryId && row[mapping.categoryId]) {
        const parsedId = parseInt(row[mapping.categoryId]);
        if (parsedId >= 1 && parsedId <= 6) categoryId = parsedId;
      }
      
      if (!categoryId) {
        categoryId = categorizeItem(name, templateType);
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        quantity,
        price,
        total: quantity * price,
        categoryId,
        originalRow: row
      };
    });

    setItems(parsed);
    setStep(3);
  };

  const updateItemCategory = (id: string, newCategoryId: number) => {
    setItems(items.map(item => item.id === id ? { ...item, categoryId: newCategoryId } : item));
  };

  const updateSelectedCategories = (newCategoryId: number) => {
    setItems(items.map(item => selectedIds.has(item.id) ? { ...item, categoryId: newCategoryId } : item));
    setSelectedIds(new Set()); // Clear selection after bulk update
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Category ID': 1, 'Անվանում': 'Օրինակ՝ Կաթսա 24կՎտ', 'Քանակ': 1, 'Գին': 350000 },
      { 'Category ID': 3, 'Անվանում': 'Օրինակ՝ Խողովակ 20մմ', 'Քանակ': 50, 'Գին': 450 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Smart_Import_Template.xlsx");
  };

  const calculateCategoryTotals = () => {
    const totals: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    items.forEach(item => {
      if (item.categoryId) {
        totals[item.categoryId] += item.total;
      }
    });
    return totals;
  };

  const categoryTotals = calculateCategoryTotals();
  const archiveTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const newTotal = (sNew * (archiveTotal / (sArchive || 1))) * kInflation;

  const handleSaveProject = () => {
    if (!onAddProject) {
      onClose();
      return;
    }

    const defaultSystemUnits = (): SystemUnits => ({
      outdoorCount: 0, outdoorPrice: 0,
      indoorCount: 0, indoorPrice: 0,
      controllerCount: 0, controllerPrice: 0,
      componentCount: 0, componentPrice: 0,
      materialCount: 0, materialPrice: 0,
      miscCount: 0, miscPrice: 0,
    });

    const newUnitDetails = {
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
    };

    const targetSystem = templateType === 'hvac' ? 'heating' : 'construction';
    
    const getNewCost = (catId: number) => {
      const archCost = categoryTotals[catId] || 0;
      return (sNew * (archCost / (sArchive || 1))) * kInflation;
    };

    newUnitDetails[targetSystem] = {
      outdoorCount: 1, outdoorPrice: getNewCost(1),
      indoorCount: 1, indoorPrice: getNewCost(4),
      controllerCount: 1, controllerPrice: getNewCost(2),
      componentCount: 1, componentPrice: getNewCost(5),
      materialCount: 1, materialPrice: getNewCost(3),
      miscCount: 1, miscPrice: getNewCost(6),
    };

    const projectPayload: ProjectData = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Ներմուծված Նախագիծ (${new Date().toLocaleDateString()})`,
      buildingType: 'Այլ',
      area: sNew,
      height: 3,
      volume: sNew * 3,
      coolingLoad: 0,
      heatingLoad: 0,
      distanceKm: 0,
      systems: {
        split: false, multiSplit: false, vrv: false, chiller: false, boiler: false, ventilation: false, heating: templateType === 'hvac', sewerage: false, waterSupply: false, construction: templateType === 'construction'
      },
      brandClass: 'mid',
      unitDetails: newUnitDetails,
      vrvOutdoor: '',
      vrvIndoor: '',
      controls: '',
      automation: '',
      ventilation: '',
      otherDevices: '',
      equipmentCost: newTotal,
      laborCost: 0,
      materialsCost: 0,
      totalCost: newTotal,
      date: new Date().toISOString().split('T')[0],
      isActive: true,
      profitMargin: 20,
      complexityLevel: 3,
      warrantyYears: 2,
      deliveryDays: 7
    };

    onAddProject(projectPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Խելացի Ինտեգրման Տիրույթ</h2>
              <p className="text-xs text-slate-500 font-medium">Smart Import Zone - Excel/CSV to 6-Part Structure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            {[1, 2, 3, 4].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {s}
                </div>
                {i < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl">
                <button 
                  onClick={() => setTemplateType('hvac')}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${templateType === 'hvac' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  HVAC Համակարգեր
                </button>
                <button 
                  onClick={() => setTemplateType('construction')}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${templateType === 'construction' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Շինարարական Նյութեր
                </button>
              </div>

              <div 
                className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={48} className="text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">Քաշեք և գցեք ֆայլը այստեղ</h3>
                <p className="text-sm text-slate-500 mb-6">Աջակցվում են .xlsx, .xls, .csv ֆայլեր</p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                  Ընտրել Ֆայլ
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="flex justify-center">
                <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800">
                  <Download size={16} /> Ներբեռնել Կաղապարը (Template)
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl flex gap-3 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>Խնդրում ենք համապատասխանեցնել ձեր ֆայլի սյունակները ծրագրի պահանջվող դաշտերին:</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Անվանում (Name)*', required: true },
                  { key: 'quantity', label: 'Քանակ (Quantity)*', required: true },
                  { key: 'price', label: 'Միավորի Գին (Price)*', required: true },
                  { key: 'categoryId', label: 'Category ID (1-6) (Ընտրովի)', required: false },
                ].map(field => (
                  <div key={field.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-sm text-slate-700">{field.label}</span>
                    <select 
                      className="p-2 rounded-xl border border-slate-200 bg-white min-w-[200px] text-sm"
                      value={(mapping as any)[field.key]}
                      onChange={(e) => setMapping({...mapping, [field.key]: e.target.value})}
                    >
                      <option value="">-- Ընտրել սյունակը --</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Հետ</button>
                <button 
                  onClick={processMapping}
                  disabled={!mapping.name || !mapping.quantity || !mapping.price}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  Շարունակել <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Դասակարգման Արդյունքներ</h3>
                  <p className="text-sm text-slate-500">Ստուգեք և ուղղեք «Անհայտ» մնացած ապրանքները: Կարող եք նշել մի քանի տող և միանգամից փոխել դրանց բաժինը:</p>
                </div>
                <button 
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2"
                >
                  Հաստատել և Հաշվարկել <Calculator size={16} />
                </button>
              </div>

              {selectedIds.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">{selectedIds.size}</span>
                    <span className="text-sm font-bold text-blue-800">տող նշված է</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-600">Փոխել բոլոր նշվածների բաժինը՝</span>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          updateSelectedCategories(parseInt(e.target.value));
                        }
                      }}
                      className="p-2 rounded-lg border border-blue-300 bg-white text-blue-900 text-sm font-bold min-w-[200px]"
                      value=""
                    >
                      <option value="">-- Ընտրել Բաժին --</option>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {(CATEGORY_NAMES[templateType] as any)[num]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-4 w-10">
                        <input 
                          type="checkbox" 
                          checked={items.length > 0 && selectedIds.size === items.length}
                          onChange={toggleAllSelection}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Անվանում</th>
                      <th className="p-4">Քանակ</th>
                      <th className="p-4">Գին</th>
                      <th className="p-4">Ընդհանուր</th>
                      <th className="p-4">Բաժին (1-6)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(item => (
                      <tr key={item.id} className={`${selectedIds.has(item.id) ? 'bg-blue-50/50' : !item.categoryId ? 'bg-red-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelection(item.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 font-medium text-slate-800">{item.name}</td>
                        <td className="p-4 text-slate-600">{item.quantity}</td>
                        <td className="p-4 text-slate-600">{item.price.toLocaleString()} ֏</td>
                        <td className="p-4 font-bold text-slate-800">{item.total.toLocaleString()} ֏</td>
                        <td className="p-4">
                          <select 
                            value={item.categoryId || ''} 
                            onChange={(e) => updateItemCategory(item.id, parseInt(e.target.value))}
                            className={`p-2 rounded-lg border text-xs font-bold w-full max-w-[250px] ${!item.categoryId ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700'}`}
                          >
                            <option value="">-- ԱՆՀԱՅՏ (Ընտրել) --</option>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>
                                {(CATEGORY_NAMES[templateType] as any)[num]}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Նոր Նախագծի Հաշվարկ</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(3)}
                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Հետ Գնալ
                  </button>
                  <button 
                    onClick={handleSaveProject}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Պահպանել
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Արխիվային Տվյալներ</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Արխիվի Մակերես (S_Archive) մ²</label>
                      <input type="number" value={sArchive} onChange={e => setSArchive(Number(e.target.value))} className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Արխիվի Ընդհանուր Արժեք</label>
                      <div className="w-full p-3 rounded-xl bg-slate-200 text-slate-700 font-black">{archiveTotal.toLocaleString()} ֏</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Նոր Նախագիծ</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-blue-800 block mb-1">Նոր Մակերես (S_New) մ²</label>
                      <input type="number" value={sNew} onChange={e => setSNew(Number(e.target.value))} className="w-full p-3 rounded-xl border border-blue-200 bg-white font-bold text-blue-900" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-blue-800 block mb-1">Գնաճի Գործակից (K_Inflation)</label>
                      <input type="number" step="0.01" value={kInflation} onChange={e => setKInflation(Number(e.target.value))} className="w-full p-3 rounded-xl border border-blue-200 bg-white font-bold text-blue-900" />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500 p-6 rounded-3xl text-white flex flex-col justify-center items-center text-center shadow-lg">
                  <h4 className="text-xs font-black text-emerald-200 uppercase tracking-widest mb-2">Նոր Գործի Մոտավոր Արժեք</h4>
                  <div className="text-3xl font-black mb-1">{newTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} ֏</div>
                  <p className="text-xs text-emerald-100 font-medium">Հաշվարկված ըստ 6 բաժինների</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <h4 className="font-black text-sm text-slate-700 uppercase tracking-wider">Բաժինների Վերլուծություն</h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5, 6].map(catId => {
                    const archCost = categoryTotals[catId] || 0;
                    const newCost = (sNew * (archCost / (sArchive || 1))) * kInflation;
                    const name = (CATEGORY_NAMES[templateType] as any)[catId];
                    
                    return (
                      <div key={catId} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">{catId}</div>
                          <span className="font-bold text-sm text-slate-700">{name}</span>
                        </div>
                        <div className="text-right flex gap-8">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Արխիվ</div>
                            <div className="font-bold text-slate-600 text-sm">{archCost.toLocaleString()} ֏</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase">Նոր Հաշվարկ</div>
                            <div className="font-black text-emerald-700 text-sm">{newCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} ֏</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
