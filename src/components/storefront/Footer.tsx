'use client';

import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, Award, Heart, Globe, Sparkles, Scale, ExternalLink } from 'lucide-react';

export default function StoreFooter() {
  const { t, languages, lang, setLang } = useStore();

  return (
    <footer className="relative bg-gradient-to-br from-amber-950 via-stone-950 to-stone-950 text-amber-100 border-t border-amber-500/20 pt-16 pb-12 mt-16 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Purity Guarantee Glass Banner */}
        <div id="purity-guarantee" className="rounded-3xl glass-card-dark border border-amber-400/30 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-amber-200 text-sm">
                  {t('usp.purity_title', 'Zero Adulteration Guarantee')}
                </h4>
                <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                  {t(
                    'usp.purity_desc',
                    'Nuclear Magnetic Resonance (NMR) tested for sugar syrup absence and organic floral enzymes.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-amber-200 text-sm">
                  {t('usp.packaging_title', 'Glass & PET Variant Matrix')}
                </h4>
                <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                  {t(
                    'usp.packaging_desc',
                    'Choose protective tamper-proof luxury glass or shatterproof lightweight food-grade PET jars.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30 shadow-inner">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-amber-200 text-sm">
                  {t('usp.shipping_title', 'Precision Weight Logistics')}
                </h4>
                <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                  {t(
                    'usp.shipping_desc',
                    'Weight-aware shipping rates with automated "Fragile Glass" protection badges on courier labels.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links & Brand Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-2xl shadow-md">
                🍯
              </div>
              <span className="font-serif font-black text-xl text-amber-200">
                {t('nav.store_name', 'Royal Nectar Apiaries')}
              </span>
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Bespoke single-origin artisanal honey harvested sustainably across untamed Indian biospheres. Single-vendor private D2C platform with verified floral traceabilities.
            </p>
            <div className="text-[11px] font-mono text-amber-400/80">
              FSSAI Lic: 10022022000142 | HSN: 04090000
            </div>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-amber-200 uppercase tracking-wider mb-3">
              Explore Varieties
            </h5>
            <ul className="space-y-2 text-xs text-amber-200/70">
              <li>Sidr (Ber) Reserve Honey</li>
              <li>Wild Forest Raw Nectar</li>
              <li>Himalayan Kashmiri White Honey</li>
              <li>Sundarban Khalsi Mangrove</li>
              <li>Raw Unfiltered Comb Honey</li>
              <li>Mustard & Acacia Blossoms</li>
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-amber-200 uppercase tracking-wider mb-3">
              Purity & Packaging
            </h5>
            <ul className="space-y-2 text-xs text-amber-200/70">
              <li>NMR Lab Purity Verified</li>
              <li>Tamper-Evident Luxury Glass</li>
              <li>Food-Grade Lightweight PET</li>
              <li>100% Unheated Raw Nectar</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-serif font-bold text-sm text-amber-200 uppercase tracking-wider mb-3">
              Language / भाषा
            </h5>
            <p className="text-xs text-amber-200/70">
              Experience the storefront in your preferred localized dialect:
            </p>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lang === l.code
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-600/30'
                      : 'bg-white/10 hover:bg-white/20 text-amber-200 border border-white/10'
                  }`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-amber-900/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-amber-400/60">
          <div>
            © 2026 Royal Nectar Apiaries. All Rights Reserved. Single-Vendor Private D2C Platform.
          </div>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Trade</span>
            <span>Shipping & Invoicing Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
