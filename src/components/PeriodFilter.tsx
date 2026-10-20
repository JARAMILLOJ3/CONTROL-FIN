import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const PeriodFilter: React.FC = () => {
  const { periodFilter, setPeriodFilter } = useFinance();
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState(periodFilter.startDate || '');
  const [customEnd, setCustomEnd] = useState(periodFilter.endDate || '');

  const handleSelectType = (type: 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom') => {
    if (type === 'custom') {
      setShowCustomRange(true);
      setPeriodFilter({
        type: 'custom',
        startDate: customStart,
        endDate: customEnd
      });
    } else {
      setShowCustomRange(false);
      setPeriodFilter({ type });
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setPeriodFilter({
      type: 'custom',
      startDate: customStart,
      endDate: customEnd
    });
  };

  const options = [
    { id: 'all' as const, label: 'Todo' },
    { id: 'this_month' as const, label: 'Este Mes' },
    { id: 'last_month' as const, label: 'Mes Anterior' },
    { id: 'this_year' as const, label: 'Este Año' },
    { id: 'custom' as const, label: 'Personalizado' },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-neutral-500 font-medium shrink-0">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span>Período:</span>
        </div>

        {/* Segmented filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-md overflow-x-auto">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelectType(opt.id)}
              className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                periodFilter.type === opt.id
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showCustomRange && (
        <form onSubmit={handleApplyCustom} className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-neutral-600">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 text-xs border border-neutral-200 rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 text-xs border border-neutral-200 rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors"
          >
            Filtrar
          </button>
        </form>
      )}
    </div>
  );
};
