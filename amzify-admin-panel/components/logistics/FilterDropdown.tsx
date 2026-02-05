import React, { useState } from 'react';

interface FilterDropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all"
      >
        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{label}</span>
        <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 border-b border-slate-100 font-medium"
          >
            {placeholder}
          </button>
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                value === option.value
                  ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
