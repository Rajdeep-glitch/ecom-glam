'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { SlidersHorizontal, X, ShieldAlert, Box } from 'lucide-react';

interface FilterProps {
  packaging: string | null;
  setPackaging: (v: string | null) => void;
  weight: string | null;
  setWeight: (v: string | null) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  onReset: () => void;
}

export default function ProductFilterBar({
  packaging,
  setPackaging,
  weight,
  setWeight,
  inStockOnly,
  setInStockOnly,
  onReset,
}: FilterProps) {
  const { t } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCount =
    (packaging !== null ? 1 : 0) + (weight !== null ? 1 : 0) + (inStockOnly ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Compact Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
          activeCount > 0 || isOpen
            ? 'bg-amber-600 text-white border-amber-500 shadow-amber-600/25'
            : 'glass-card text-amber-950 border-white/80 hover:border-amber-300'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{t('filter.button', 'Filter')}</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-white text-amber-900 text-[10px] font-black leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown Filter Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 z-40 rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-200/80 p-5 shadow-2xl shadow-amber-950/15 space-y-5">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('filter.title', 'Filter & Refine')}</span>
            </h4>

            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 transition-colors"
                >
                  <span>{t('filter.clear_all', 'Reset')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-amber-100/80 text-stone-500 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Packaging Type Filter (Glass vs PET) */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-amber-900/80 uppercase tracking-wider">
              {t('filter.packaging', 'Packaging Type')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs p-1 rounded-2xl bg-amber-100/40 border border-amber-200/50">
              <button
                type="button"
                onClick={() => setPackaging(null)}
                className={`py-2 px-1.5 rounded-xl text-center text-[11px] font-semibold transition-all ${
                  packaging === null
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-stone-600 hover:text-amber-950'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPackaging('GLASS_JAR')}
                className={`py-2 px-1.5 rounded-xl text-center text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  packaging === 'GLASS_JAR'
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-stone-600 hover:text-amber-950'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-amber-300" />
                <span>Glass</span>
              </button>
              <button
                type="button"
                onClick={() => setPackaging('PET_JAR')}
                className={`py-2 px-1.5 rounded-xl text-center text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  packaging === 'PET_JAR'
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-stone-600 hover:text-amber-950'
                }`}
              >
                <Box className="w-3 h-3 text-stone-400" />
                <span>PET</span>
              </button>
            </div>
          </div>

          {/* Weight Net Capacity Filter (500g vs 1kg) */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-amber-900/80 uppercase tracking-wider">
              {t('filter.weight', 'Net Weight')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs p-1 rounded-2xl bg-amber-100/40 border border-amber-200/50">
              <button
                type="button"
                onClick={() => setWeight(null)}
                className={`py-2 px-1.5 rounded-xl text-center text-[11px] font-semibold transition-all ${
                  weight === null
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-stone-600 hover:text-amber-950'
                }`}
              >
                All Sizes
              </button>
              <button
                type="button"
                onClick={() => setWeight('500')}
                className={`py-2 px-1.5 rounded-xl text-center text-[11px] font-semibold transition-all ${
                  weight === '500'
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-stone-600 hover:text-amber-950'
                }`}
              >
                500g
              </button>
              <button
                type="button"
                onClick={() => setWeight('1000')}
                className={`py-2 px-1.5 rounded-xl text-center text-[11px] font-semibold transition-all ${
                  weight === '1000'
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-stone-600 hover:text-amber-950'
                }`}
              >
                1kg
              </button>
            </div>
          </div>

          {/* In-Stock Filter Toggle */}
          <div className="pt-3 border-t border-amber-100">
            <label className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 cursor-pointer transition-all">
              <span className="text-xs font-bold text-amber-950">
                {t('filter.in_stock_only', 'In Stock Only')}
              </span>
              <div
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`w-10 h-6 rounded-full transition-colors p-1 flex items-center ${
                  inStockOnly ? 'bg-amber-600 justify-end' : 'bg-stone-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
