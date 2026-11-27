'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Truck,
  Package,
  Layers,
  FolderTree,
  Languages,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Sales Trajectory & KPIs', icon: BarChart3 },
  { href: '/admin/orders', label: 'Orders & Dispatch Pipeline', icon: Truck },
  { href: '/admin/products', label: 'Catalog & Products CRUD', icon: Package },
  { href: '/admin/inventory', label: 'Variant Matrix Grid', icon: Layers },
  { href: '/admin/categories', label: '16+ Category Manager', icon: FolderTree },
  { href: '/admin/translations', label: 'Storefront UI CMS', icon: Languages },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <aside className="w-64 bg-stone-950/90 text-amber-50 flex flex-col min-h-screen border-r border-amber-500/20 shadow-2xl backdrop-blur-2xl shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-amber-500/20 bg-amber-950/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-xl shadow-lg shadow-amber-600/30">
              🍯
            </div>
            <div className="absolute inset-0 rounded-2xl bg-amber-400/30 blur-sm -z-10" />
          </div>
          <div>
            <h1 className="font-serif font-black text-sm tracking-wide text-amber-200">
              SELLER CENTRAL
            </h1>
            <p className="text-[10px] text-amber-400/80 font-mono tracking-wider uppercase font-semibold">
              Honey Command Suite
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-amber-400/60 uppercase">
          Operations & Catalog
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-600/30 font-bold scale-101'
                  : 'text-amber-200/80 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 py-2 text-[10px] font-bold tracking-widest text-amber-400/60 uppercase">
          Live Storefront
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs text-amber-300/90 hover:bg-white/5 transition-all border border-amber-500/20 glass-card-dark"
        >
          <span className="flex items-center gap-2 font-bold">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            Customer Storefront
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-400/30">
            3-4 Lang
          </span>
        </Link>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-amber-500/20 bg-amber-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold">Admin Authorized</span>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-xl hover:bg-white/10 text-amber-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
