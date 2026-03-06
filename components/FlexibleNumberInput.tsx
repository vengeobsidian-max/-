
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

interface FlexibleNumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}

const FlexibleNumberInput: React.FC<FlexibleNumberInputProps> = ({
  label,
  value,
  onChange,
  tooltip,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const isInternalUpdate = useRef(false);

  // Սինքրոնիզացնում ենք միայն եթե արժեքը փոխվել է դրսից (ոչ թե typing-ի ժամանակ)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setInputValue(value.toString());
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      isInternalUpdate.current = true;
      onChange(parsed);
    } else if (val === '') {
      isInternalUpdate.current = true;
      onChange(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setInputValue(val.toString());
    isInternalUpdate.current = true;
    onChange(val);
  };

  const adjustValue = (delta: number) => {
    const newVal = Math.max(min, value + delta);
    setInputValue(newVal.toString());
    isInternalUpdate.current = true;
    onChange(newVal);
  };

  return (
    <div className={`space-y-2 group ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </label>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {value.toLocaleString()} {suffix}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          tabIndex={-1} // Որպեսզի Tab-ով սեղմելիս չկանգնի կոճակների վրա
          onClick={() => adjustValue(-step)}
          className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-500 rounded-xl transition-all shrink-0 active:scale-90"
        >
          <Minus size={16} />
        </button>
        
        <div className="relative flex-1">
          <input
            type="number"
            value={inputValue}
            onChange={handleTextChange}
            className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-black text-sm transition-all shadow-inner appearance-none"
            placeholder="0"
          />
        </div>

        <button
          type="button"
          tabIndex={-1}
          onClick={() => adjustValue(step)}
          className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-500 rounded-xl transition-all shrink-0 active:scale-90"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="px-1 pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
        />
      </div>
    </div>
  );
};

export default FlexibleNumberInput;
