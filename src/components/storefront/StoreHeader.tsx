'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingBag,
  Globe,
  Search,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Scale,
} from 'lucide-react';

export default function StoreHeader({ onSearch }: { onSearch?: (q: string) => void }) {
  const { lang, setLang, direction, languages, t, cart, setIsCartOpen, shipping } = useStore();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="sticky top-0 z-40 px-2 sm:px-4 pt-2 pb-1 transition-all">
      {/* Top Floating Announcement Bar */}
      <div className="max-w-7xl mx-auto mb-2 rounded-full glass-card-dark text-amber-200 text-[11px] sm:text-xs py-1.5 px-4 flex items-center justify-between border border-amber-500/30 shadow-lg shadow-amber-950/15">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-medium truncate text-amber-100">
            {t('nav.tagline', '100% Raw Artisanal Honey • Farm to Spoon')}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline text-amber-300/90 font-semibold text-[11px]">
            {t('cart.free_shipping_notice', 'Free shipping on orders above ₹999!')}
          </span>
        </div>
      </div>

      {/* Main Floating Glassmorphic Navbar */}
      <nav className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl glass-card border border-white/80 shadow-xl shadow-amber-950/5 px-4 sm:px-6 h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo with Glowing Aura */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-600/30 group-hover:scale-105 transition-transform duration-300">
              🍯
            </div>
            <div className="absolute inset-0 rounded-2xl bg-amber-400/30 blur-md -z-10 group-hover:bg-amber-400/50 transition-all" />
          </div>
          <div>
            <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-amber-950 block leading-tight">
              {t('nav.store_name', 'Royal Nectar Apiaries')}
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700/90 block">
              Direct Artisanal Honey Harvest
            </span>
          </div>
        </Link>

        {/* Glassmorphic Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-2 relative"
        >
          <Search className="w-4 h-4 text-amber-700/80 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t('nav.search_placeholder', 'Search floral origins, sidr, wild forest...')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white/60 hover:bg-white/90 focus:bg-white border border-amber-200/80 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner"
          />
        </form>

        {/* Right Actions: Language Switcher, Cart Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dynamic Language Switcher with Frosted Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-amber-300/80 text-xs font-bold text-amber-950 transition-all shadow-2xs hover:shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span>{currentLang?.nativeName || 'Language'}</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {langMenuOpen && (
              <div
                className={`absolute ${direction === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-48 rounded-2xl glass-card border border-white/90 shadow-2xl py-2 z-50 animate-fadeIn`}
              >
                <div className="px-3.5 py-1 text-[10px] font-bold text-amber-800/60 uppercase tracking-wider border-b border-amber-100">
                  Select Language / भाषा
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-amber-100/60 transition-colors ${
                      lang === l.code ? 'bg-amber-100/90 text-amber-950 font-bold' : 'text-stone-700'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] uppercase font-mono text-amber-700/70">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Drawer Trigger Button with Luminous Tare Indicator */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all hover:scale-102 shimmer-button"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t('nav.cart', 'Cart')}</span>
            {totalItemCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-200 font-black text-[11px] shadow-xs">
                {totalItemCount}
              </span>
            )}
            {shipping.totalGrossWeightGrams > 0 && (
              <span className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono bg-amber-950/30 px-1.5 py-0.5 rounded-full text-amber-100">
                <Scale className="w-2.5 h-2.5" />
                {(shipping.totalGrossWeightGrams / 1000).toFixed(1)}kg
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-amber-950 hover:bg-amber-100/70"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 rounded-2xl glass-card border border-white/80 p-4 space-y-3 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-amber-700 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('nav.search_placeholder', 'Search honey varieties...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-amber-300 bg-white/70"
            />
          </form>
        </div>
      )}
    </div>
  );
}
