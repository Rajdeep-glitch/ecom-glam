'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Save,
  Search,
  Check,
  ShieldAlert,
  Box,
  Scale,
} from 'lucide-react';

export default function AdminInventoryGridPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Flattened variant rows for spreadsheet editing
  const [variantRows, setVariantRows] = useState<any[]>([]);

  const loadData = () => {
    setLoading(true);
    fetch('/api/products?lang=en')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        const rows: any[] = [];
        for (const p of data) {
          for (const v of p.variants || []) {
            rows.push({
              variantId: v.id,
              productId: p.id,
              productTitle: p.title,
              categoryName: p.categoryName,
              packagingType: v.packagingType,
              netWeightGrams: v.netWeightGrams,
              grossShippingWeightGrams: v.grossShippingWeightGrams,
              isFragile: v.isFragile,
              sku: v.sku,
              mrp: v.mrp,
              salePrice: v.salePrice,
              stockQuantity: v.stockQuantity,
              isActive: v.isActive,
            });
          }
        }
        setVariantRows(rows);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCellChange = (index: number, field: string, value: any) => {
    const updated = [...variantRows];
    updated[index] = { ...updated[index], [field]: value };
    setVariantRows(updated);
  };

  const handleBulkSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Group variants by productId
      const groupedByProduct: Record<string, any[]> = {};
      for (const row of variantRows) {
        if (!groupedByProduct[row.productId]) {
          groupedByProduct[row.productId] = [];
        }
        groupedByProduct[row.productId].push({
          id: row.variantId,
          mrp: parseFloat(row.mrp),
          salePrice: parseFloat(row.salePrice),
          stockQuantity: parseInt(row.stockQuantity, 10),
          grossShippingWeightGrams: parseInt(row.grossShippingWeightGrams, 10),
          isActive: row.isActive,
        });
      }

      // Update products via API
      for (const [productId, variants] of Object.entries(groupedByProduct)) {
        await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variants }),
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Error updating inventory: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredRows = variantRows.filter((r) =>
    r.productTitle?.toLowerCase().includes(search.toLowerCase()) ||
    r.sku?.toLowerCase().includes(search.toLowerCase()) ||
    r.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 pb-16">
      <AdminHeader title="Variant Matrix & Bulk Inventory Editor" />

      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Toolbar Glass Card */}
        <div className="rounded-3xl glass-card border border-white/90 p-4 shadow-xl shadow-amber-950/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by SKU, Product or Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                All SKUs Updated Successfully!
              </span>
            )}
            <button
              onClick={handleBulkSave}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Syncing...' : 'Save Spreadsheet Changes'}
            </button>
          </div>
        </div>

        {/* Dense Spreadsheet Grid with Frosted Glass Surface */}
        <div className="rounded-3xl glass-card border border-white/90 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-amber-950 text-amber-100 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 border-r border-amber-900/40">SKU Code</th>
                  <th className="p-3.5 border-r border-amber-900/40">Product Title</th>
                  <th className="p-3.5 border-r border-amber-900/40">Packaging Material</th>
                  <th className="p-3.5 border-r border-amber-900/40">Net Size</th>
                  <th className="p-3.5 border-r border-amber-900/40">Gross Courier Tare (g)</th>
                  <th className="p-3.5 border-r border-amber-900/40">MRP (₹)</th>
                  <th className="p-3.5 border-r border-amber-900/40">Sale Price (₹)</th>
                  <th className="p-3.5 border-r border-amber-900/40">Stock Units</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-stone-500">
                      Loading variant matrix grid...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-stone-500">
                      No matching SKU variants found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => (
                    <tr
                      key={row.variantId}
                      className={idx % 2 === 0 ? 'bg-white/60 hover:bg-amber-50/50' : 'bg-stone-50/40 hover:bg-amber-50/50'}
                    >
                      <td className="p-3 font-mono font-black text-amber-950 border-r border-stone-200/80">
                        {row.sku}
                      </td>

                      <td className="p-3 font-bold text-stone-900 border-r border-stone-200/80">
                        <div>{row.productTitle}</div>
                        <div className="text-[10px] text-stone-400 font-normal">{row.categoryName}</div>
                      </td>

                      <td className="p-3 border-r border-stone-200/80">
                        {row.packagingType === 'GLASS_JAR' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300">
                            <ShieldAlert className="w-3 h-3 text-amber-700" />
                            Glass Jar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                            <Box className="w-3 h-3 text-stone-400" />
                            Food PET
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-black text-stone-800 border-r border-stone-200/80">
                        {row.netWeightGrams}g
                      </td>

                      <td className="p-2 border-r border-stone-200/80">
                        <input
                          type="number"
                          value={row.grossShippingWeightGrams}
                          onChange={(e) => handleCellChange(idx, 'grossShippingWeightGrams', e.target.value)}
                          className="w-20 p-1.5 rounded-xl border border-stone-300 bg-white/80 text-stone-900 font-mono text-xs focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        />
                      </td>

                      <td className="p-2 border-r border-stone-200/80">
                        <input
                          type="number"
                          value={row.mrp}
                          onChange={(e) => handleCellChange(idx, 'mrp', e.target.value)}
                          className="w-20 p-1.5 rounded-xl border border-stone-300 bg-white/80 text-stone-900 font-mono text-xs focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        />
                      </td>

                      <td className="p-2 border-r border-stone-200/80">
                        <input
                          type="number"
                          value={row.salePrice}
                          onChange={(e) => handleCellChange(idx, 'salePrice', e.target.value)}
                          className="w-20 p-1.5 rounded-xl border border-amber-300 bg-amber-50/80 font-black text-amber-950 font-mono text-xs focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        />
                      </td>

                      <td className="p-2 border-r border-stone-200/80">
                        <input
                          type="number"
                          value={row.stockQuantity}
                          onChange={(e) => handleCellChange(idx, 'stockQuantity', e.target.value)}
                          className={`w-20 p-1.5 rounded-xl border font-mono text-xs font-black focus:ring-1 focus:ring-amber-600 focus:outline-none ${
                            row.stockQuantity <= 15
                              ? 'border-rose-400 bg-rose-50 text-rose-800'
                              : 'border-stone-300 bg-white/80 text-stone-900'
                          }`}
                        />
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            row.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {row.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
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
