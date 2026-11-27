'use client';

import { useStore } from '@/context/StoreContext';
import { Sparkles } from 'lucide-react';

export default function CategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}) {
  const { t } = useStore();

  return (
    <div className="py-4 px-2 sm:px-4 max-w-7xl mx-auto">
      <div className="rounded-2xl glass-card border border-white/80 p-4 shadow-xl shadow-amber-950/5">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-serif font-bold text-xs sm:text-sm text-amber-950 flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-800">🍯</span>
            <span>{t('filter.all_categories', 'All Honey Varieties')}</span>
          </h3>
          <span className="text-[11px] text-amber-800/80 font-mono font-medium">
            {categories.length} Monofloral & Wild Terroirs
          </span>
        </div>

        {/* Floating Glass Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-amber-300">
          <button
            onClick={() => onSelectCategory(null)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-600/30 font-bold scale-102'
                : 'glass-pill text-stone-700 hover:text-amber-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Varieties</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-600/30 font-bold scale-102'
                    : 'glass-pill text-stone-700 hover:text-amber-950'
                }`}
              >
                {cat.imageUrl && (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-amber-300"
                  />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
