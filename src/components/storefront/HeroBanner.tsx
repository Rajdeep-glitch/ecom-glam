'use client';

import { useStore } from '@/context/StoreContext';
import { Sparkles, ArrowRight, Award, Droplets, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HeroBanner({ onExploreClick }: { onExploreClick?: () => void }) {
  const { t } = useStore();

  return (
    <div className="relative overflow-hidden py-12 md:py-20 my-3 mx-2 sm:mx-4 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-amber-950 via-amber-900 to-stone-950 text-white border border-amber-500/20 shadow-2xl shadow-amber-950/20">
      {/* Contextual Ambient Hero Honey Background Overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-luminosity overflow-hidden">
        <img
          src="/hero-honey.jpg"
          alt=""
          className="w-full h-full object-cover filter blur-md scale-110"
        />
      </div>

      {/* Liquid Honey Ambient Glow Orbs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-600/15 rounded-full blur-2xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Luminous Harvest Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 backdrop-blur-md text-amber-200 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>{t('hero.badge', 'Bespoke Single-Origin Harvest • Winter 2026')}</span>
            </div>

            {/* Cinematic Headline with Luminous Amber Gradient */}
            <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-balance">
              <span className="text-white">Pure Unprocessed</span>{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-sm">
                Nectar From Untamed Flora
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-amber-100/80 leading-relaxed font-normal max-w-xl text-balance">
              {t(
                'hero.subtitle',
                'Explore rare floral mono-honeys packaged in eco-friendly tamper-evident Glass and lightweight PET jars.'
              )}
            </p>

            {/* Glowing CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto justify-center px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-amber-600/30 transition-all hover:scale-103 shimmer-button"
              >
                <span>{t('hero.cta_shop', 'Browse Varieties')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#purity-guarantee"
                className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-full glass-card-dark text-amber-100 hover:text-white hover:bg-amber-900/60 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-amber-500/30 transition-all"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>{t('hero.cta_purity', 'View NMR Lab Reports')}</span>
              </a>
            </div>

            {/* Micro Pillars */}
            <div className="pt-6 border-t border-amber-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-[11px] text-amber-200/90 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Sugar Syrups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Glass & PET Matrix</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>NMR Certified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with Context-Related Artisanal Honey Image (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Background Aura */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-600/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

            {/* Main Glassmorphic Photo Container */}
            <div className="group relative rounded-3xl p-3 glass-card-dark border border-amber-400/30 shadow-2xl shadow-amber-950/40 overflow-hidden space-y-3">
              {/* Product Visual Container with Aspect Ratio */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-inner border border-amber-500/20 bg-amber-950/50">
                <img
                  src="/hero-honey.jpg"
                  alt="Pure artisanal raw honey jar with golden nectar dipper and organic honeycomb"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />

                {/* Refined Gradient Overlay for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Micro Badge Top-Left */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-stone-950/70 backdrop-blur-md border border-amber-400/40 text-amber-200 text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% Raw • NMR Lab Tested</span>
                </div>

                {/* Floating Micro Badge Top-Right */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/25 backdrop-blur-md border border-amber-300/40 text-amber-100 text-[10px] font-mono font-bold tracking-wider">
                  WINTER 2026
                </div>

                {/* Bottom Overlay Info Banner */}
                <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-sm">
                      🍯
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight text-amber-100">Artisanal Reserve Harvest</div>
                      <div className="text-[10px] text-amber-200/70">Glass & PET • 500g / 1kg Matrix</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                      IN STOCK
                    </span>
                  </div>
                </div>
              </div>

              {/* Harvest Metrics Glass Row Below Photo */}
              <div className="grid grid-cols-3 gap-2 px-1 text-center">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-all backdrop-blur-sm">
                  <div className="text-[10px] text-amber-200/70 font-medium">Terroirs</div>
                  <div className="text-xs font-bold text-amber-300 font-mono mt-0.5">All Types</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-all backdrop-blur-sm">
                  <div className="text-[10px] text-amber-200/70 font-medium">SKU Matrix</div>
                  <div className="text-xs font-bold text-amber-300 font-mono mt-0.5">Glass & PET</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-all backdrop-blur-sm">
                  <div className="text-[10px] text-amber-200/70 font-medium">Tare Engine</div>
                  <div className="text-xs font-bold text-amber-300 font-mono mt-0.5">Auto Gross</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
