'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Languages,
  Search,
  Save,
  Check,
} from 'lucide-react';

export default function AdminTranslationsPage() {
  const [translationsList, setTranslationsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);

  const fetchTranslations = () => {
    setLoading(true);
    fetch('/api/translations?all=true')
      .then((res) => res.json())
      .then((data) => {
        setTranslationsList(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleValueChange = (key: string, langCode: string, newValue: string) => {
    setTranslationsList((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          return {
            ...item,
            translations: {
              ...item.translations,
              [langCode]: newValue,
            },
          };
        }
        return item;
      })
    );
  };

  const handleSaveRow = async (item: any) => {
    setSavingKey(item.key);
    try {
      const res = await fetch('/api/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: item.key,
          group: item.group,
          translations: item.translations,
        }),
      });

      if (res.ok) {
        setSavedSuccessKey(item.key);
        setTimeout(() => setSavedSuccessKey(null), 2500);
      } else {
        alert('Failed to update translation');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating translation');
    } finally {
      setSavingKey(null);
    }
  };

  const groups = ['ALL', 'nav', 'hero', 'usp', 'filter', 'product', 'cart', 'checkout', 'invoice', 'label', 'common'];

  const filteredList = translationsList.filter((item) => {
    const matchesGroup = groupFilter === 'ALL' || item.group === groupFilter;
    const matchesSearch =
      item.key.toLowerCase().includes(search.toLowerCase()) ||
      Object.values(item.translations || {}).some((v: any) =>
        v?.toLowerCase().includes(search.toLowerCase())
      );
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="flex-1 pb-16">
      <AdminHeader title="Storefront UI Localization CMS (Dynamic Dictionary)" />

      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Info Glass Banner */}
        <div className="rounded-3xl glass-card-amber border border-amber-300 p-5 text-xs text-amber-950 flex items-start gap-3 shadow-md">
          <Languages className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>100% Database-Driven Frontend Text:</strong> Zero UI strings are hardcoded in the customer storefront.
            Edit button labels, filter text, headers, and checkout prompts across <strong>English [EN]</strong>, <strong>हिन्दी [HI]</strong>, <strong>বাংলা [BN]</strong>, and <strong>العربية [AR]</strong> directly from this table. Updates take effect immediately.
          </div>
        </div>

        {/* Filters & Search Glass Bar */}
        <div className="rounded-3xl glass-card border border-white/90 p-4 shadow-xl shadow-amber-950/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  groupFilter === g
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-600/30'
                    : 'glass-pill text-stone-600 hover:text-amber-950'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search translation key or copy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
            />
          </div>
        </div>

        {/* Side-by-Side Translation Table Glass Card */}
        <div className="rounded-3xl glass-card border border-white/90 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-amber-950 text-amber-100 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 w-48 border-r border-amber-900/40">Dictionary Key</th>
                  <th className="p-3.5 border-r border-amber-900/40">English [EN]</th>
                  <th className="p-3.5 border-r border-amber-900/40">हिन्दी [HI]</th>
                  <th className="p-3.5 border-r border-amber-900/40">বাংলা [BN]</th>
                  <th className="p-3.5 border-r border-amber-900/40">العربية [AR - RTL]</th>
                  <th className="p-3.5 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-stone-500">
                      Loading UI translation dictionary...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-stone-500">
                      No translations matching the search query.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr
                      key={item.key}
                      className={idx % 2 === 0 ? 'bg-white/60 hover:bg-amber-50/50' : 'bg-stone-50/40 hover:bg-amber-50/50'}
                    >
                      <td className="p-3 font-mono font-black text-amber-950 border-r border-stone-200/80 align-top">
                        <div>{item.key}</div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 font-sans font-black uppercase border border-amber-400/30">
                          {item.group}
                        </span>
                      </td>

                      <td className="p-2 border-r border-stone-200/80 align-top">
                        <textarea
                          rows={2}
                          value={item.translations?.en || ''}
                          onChange={(e) => handleValueChange(item.key, 'en', e.target.value)}
                          className="w-full p-2 rounded-xl border border-stone-200 text-stone-900 text-xs bg-white/80 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        />
                      </td>

                      <td className="p-2 border-r border-stone-200/80 align-top">
                        <textarea
                          rows={2}
                          value={item.translations?.hi || ''}
                          onChange={(e) => handleValueChange(item.key, 'hi', e.target.value)}
                          className="w-full p-2 rounded-xl border border-stone-200 text-stone-900 text-xs bg-white/80 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        />
                      </td>

                      <td className="p-2 border-r border-stone-200/80 align-top">
                        <textarea
                          rows={2}
                          value={item.translations?.bn || ''}
                          onChange={(e) => handleValueChange(item.key, 'bn', e.target.value)}
                          className="w-full p-2 rounded-xl border border-stone-200 text-stone-900 text-xs bg-white/80 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        />
                      </td>

                      <td className="p-2 border-r border-stone-200/80 align-top" dir="rtl">
                        <textarea
                          rows={2}
                          value={item.translations?.ar || ''}
                          onChange={(e) => handleValueChange(item.key, 'ar', e.target.value)}
                          className="w-full p-2 rounded-xl border border-stone-200 text-stone-900 text-xs bg-white/80 focus:ring-1 focus:ring-amber-600 focus:outline-none font-sans"
                        />
                      </td>

                      <td className="p-2 align-top text-right">
                        <button
                          onClick={() => handleSaveRow(item)}
                          disabled={savingKey === item.key}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                            savedSuccessKey === item.key
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-md shadow-amber-600/30'
                          }`}
                        >
                          {savedSuccessKey === item.key ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Saved
                            </>
                          ) : savingKey === item.key ? (
                            'Saving...'
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" /> Save
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
