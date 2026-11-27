'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  TrendingUp,
  DollarSign,
  Package,
  Weight,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Truck,
  Box,
  CheckCircle,
  Sparkles,
  Scale,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <AdminHeader title="Sales Trajectory & Operations Overview" />
        <div className="p-8 flex items-center justify-center min-h-[500px]">
          <div className="animate-spin text-amber-600 text-4xl">🍯</div>
        </div>
      </div>
    );
  }

  const { summary, packagingSplit, weightSplit, topCategories, lowStockAlerts, statusCounts } = data || {};

  return (
    <div className="flex-1 pb-16">
      <AdminHeader title="Sales Trajectory & Operations Command" />

      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Glassmorphic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-3xl glass-card border border-white/90 p-6 shadow-xl shadow-amber-950/5 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">
                Gross Revenue
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-serif text-amber-950">
                ₹{summary?.grossRevenue?.toLocaleString('en-IN') || 0}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 font-medium">Inclusive of 5% GST</p>
          </div>

          <div className="rounded-3xl glass-card border border-white/90 p-6 shadow-xl shadow-amber-950/5 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-serif text-amber-950">
                {summary?.totalOrders || 0}
              </span>
              <span className="text-xs text-amber-800 font-bold">Consignments</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 font-medium">Single-Vendor D2C Store</p>
          </div>

          <div className="rounded-3xl glass-card border border-white/90 p-6 shadow-xl shadow-amber-950/5 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">
                Average Order Value
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-serif text-amber-950">
                ₹{Math.round(summary?.averageOrderValue || 0)}
              </span>
              <span className="text-xs text-stone-500 font-semibold">Per Basket</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 font-medium">High Multi-Variant Cart</p>
          </div>

          <div className="rounded-3xl glass-card border border-white/90 p-6 shadow-xl shadow-amber-950/5 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">
                Gross Shipped Tare
              </span>
              <div className="w-10 h-10 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center shadow-inner">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-serif text-amber-950">
                {summary?.totalGrossWeightShippedKg || 0} kg
              </span>
              <span className="text-xs text-yellow-800 font-bold">Total Weight</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 font-medium">Glass + PET Courier Tare</p>
          </div>
        </div>

        {/* Fulfillment Pipeline Glass Ribbon */}
        <div className="rounded-3xl glass-card border border-white/90 p-6 shadow-xl shadow-amber-950/5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <h3 className="font-serif font-black text-base text-amber-950 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-amber-600" />
              <span>Fulfillment Pipeline Status</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1.5"
            >
              <span>Manage Pipeline &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3.5 glass-card rounded-2xl text-center border border-white/80">
              <div className="text-xs text-stone-500 font-bold">Pending</div>
              <div className="text-2xl font-black text-stone-800 mt-1">{statusCounts?.PENDING || 0}</div>
            </div>
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-center">
              <div className="text-xs text-blue-700 font-bold">Confirmed</div>
              <div className="text-2xl font-black text-blue-900 mt-1">{statusCounts?.CONFIRMED || 0}</div>
            </div>
            <div className="p-3.5 glass-card-amber rounded-2xl text-center border border-amber-300">
              <div className="text-xs text-amber-800 font-bold">Packed</div>
              <div className="text-2xl font-black text-amber-950 mt-1">{statusCounts?.PACKED || 0}</div>
            </div>
            <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-center">
              <div className="text-xs text-indigo-700 font-bold">Shipped</div>
              <div className="text-2xl font-black text-indigo-900 mt-1">{statusCounts?.SHIPPED || 0}</div>
            </div>
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center">
              <div className="text-xs text-emerald-700 font-bold">Delivered</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{statusCounts?.DELIVERED || 0}</div>
            </div>
            <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-center">
              <div className="text-xs text-rose-700 font-bold">Cancelled</div>
              <div className="text-2xl font-black text-rose-900 mt-1">{statusCounts?.CANCELLED || 0}</div>
            </div>
          </div>
        </div>

        {/* 2×2 Variant Matrix Analytics: Glass vs PET & 500g vs 1kg */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Packaging Split */}
          <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-4">
            <h3 className="font-serif font-black text-base text-amber-950">
              Packaging Demand Split: Glass vs. PET
            </h3>
            <p className="text-xs text-stone-500">
              Real-time consumer material preference across honey varieties
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-amber-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Glass Jars (Tamper-Evident Luxury)
                  </span>
                  <span className="text-amber-800">
                    {packagingSplit?.glassJarsSold || 0} units ({packagingSplit?.glassPercent || 0}%)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full transition-all duration-700"
                    style={{ width: `${packagingSplit?.glassPercent || 50}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-stone-800 flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-stone-400" />
                    Food-Grade PET Jars (Shatterproof Light)
                  </span>
                  <span className="text-stone-600">
                    {packagingSplit?.petJarsSold || 0} units ({packagingSplit?.petPercent || 0}%)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-stone-400 rounded-full transition-all duration-700"
                    style={{ width: `${packagingSplit?.petPercent || 50}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl glass-card-amber border border-amber-300 text-xs text-amber-950 leading-relaxed">
              💡 <strong>Logistics Insight:</strong> Glass Jars generate higher average margin (+18%) but require specialized bubble cushioning that adds ~320g–480g gross shipping weight per jar.
            </div>
          </div>

          {/* Weight Split */}
          <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-4">
            <h3 className="font-serif font-black text-base text-amber-950">
              Weight Matrix Split: 500g vs. 1kg Jars
            </h3>
            <p className="text-xs text-stone-500">
              Net capacity distribution across consumer orders
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl glass-card border border-white/90 text-center shadow-sm">
                <div className="text-3xl font-black font-serif text-amber-950">
                  {weightSplit?.weight500gCount || 0}
                </div>
                <div className="text-xs font-bold text-amber-900 mt-1">500g (Pint Jars)</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Sample & Gifting volume</div>
              </div>

              <div className="p-5 rounded-2xl glass-card border border-white/90 text-center shadow-sm">
                <div className="text-3xl font-black font-serif text-amber-950">
                  {weightSplit?.weight1kgCount || 0}
                </div>
                <div className="text-xs font-bold text-amber-900 mt-1">1kg (Family Pack)</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Household repeat volume</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card text-xs text-stone-700">
              <span>Gross Weight Ratio:</span>
              <span className="font-bold text-amber-950 font-mono">1kg Glass (~1480g) vs 500g Glass (~820g)</span>
            </div>
          </div>
        </div>

        {/* Top Performing Categories & Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Varieties */}
          <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="font-serif font-black text-base text-amber-950">
                Top Performing Honey Varieties
              </h3>
              <Link
                href="/admin/products"
                className="text-xs font-bold text-amber-800 hover:text-amber-950"
              >
                All Varieties &rarr;
              </Link>
            </div>

            {topCategories && topCategories.length > 0 ? (
              <div className="space-y-2.5">
                {topCategories.map((cat: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/80 shadow-2xs hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-400/30">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{cat.title}</div>
                        <div className="text-[11px] text-stone-500">{cat.count} units sold</div>
                      </div>
                    </div>
                    <div className="text-xs font-black font-serif text-amber-950">
                      ₹{cat.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-6 text-center">No sales recorded yet.</p>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-black text-base text-amber-950">
                  Inventory Alerts (2×2 Matrix)
                </h3>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-bold text-amber-800 hover:text-amber-950"
              >
                Bulk Stock Editor &rarr;
              </Link>
            </div>

            {lowStockAlerts && lowStockAlerts.length > 0 ? (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {lowStockAlerts.map((alert: any) => (
                  <div
                    key={alert.variantId}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      alert.isCritical
                        ? 'bg-rose-50/80 border-rose-200'
                        : 'glass-card-amber border-amber-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-stone-900">{alert.productTitle}</div>
                      <div className="text-[11px] text-stone-600 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold">{alert.sku}</span>
                        <span>•</span>
                        <span>
                          {alert.netWeightGrams}g ({alert.packagingType === 'GLASS_JAR' ? 'Glass' : 'PET'})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-black ${
                          alert.isCritical
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-amber-600 text-white shadow-xs'
                        }`}
                      >
                        {alert.stockQuantity} Left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500 text-xs flex flex-col items-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <span className="font-semibold">All SKUs maintain healthy inventory levels.</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
