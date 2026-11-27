'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/Footer';
import { useStore } from '@/context/StoreContext';
import {
  ShieldAlert,
  Box,
  ShoppingBag,
  Check,
  ChevronLeft,
  Truck,
  Scale,
  Sparkles,
  Droplets,
  Award,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, t, addToCart } = useStore();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Variant selector states
  const [selectedPackaging, setSelectedPackaging] = useState<'GLASS_JAR' | 'PET_JAR'>('GLASS_JAR');
  const [selectedWeight, setSelectedWeight] = useState<500 | 1000>(500);
  const [activeTab, setActiveTab] = useState<'desc' | 'floral' | 'purity' | 'storage'>('desc');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/products/${params.id}?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <StoreHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-4xl animate-bounce">🍯</div>
        </div>
        <StoreFooter />
      </div>
    );
  }

  if (!product || product.error) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <StoreHeader />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-serif font-black text-amber-950">
            Honey Variety Not Found
          </h2>
          <p className="text-xs text-stone-500">
            The requested harvest may have been retired or sold out.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold text-xs shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Varieties
          </Link>
        </div>
        <StoreFooter />
      </div>
    );
  }

  // Active Variant based on 2x2 matrix pills
  const activeVariant =
    product.variants?.find(
      (v: any) => v.packagingType === selectedPackaging && v.netWeightGrams === selectedWeight
    ) || product.variants?.[0];

  const mrp = activeVariant?.mrp || product.basePrice * 1.25;
  const salePrice = activeVariant?.salePrice || product.basePrice;
  const savings = Math.max(0, mrp - salePrice);
  const savingsPercent = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;
  const isFragile = activeVariant?.isFragile || selectedPackaging === 'GLASS_JAR';
  const grossWeight = activeVariant?.grossShippingWeightGrams || (selectedPackaging === 'GLASS_JAR' ? (selectedWeight === 500 ? 820 : 1480) : (selectedWeight === 500 ? 555 : 1085));

  const handleAddToCart = () => {
    if (!activeVariant) return;

    addToCart({
      variantId: activeVariant.id,
      productId: product.id,
      title: product.title,
      packagingType: selectedPackaging,
      netWeightGrams: selectedWeight,
      grossWeightGrams: grossWeight,
      isFragile,
      sku: activeVariant.sku,
      price: salePrice,
      mrp,
      quantity: 1,
      imageUrl: activeVariant.variantImageUrl || product.primaryImage,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 relative">
      <StoreHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Breadcrumb Glass Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs text-stone-500 shadow-xs">
          <Link href="/" className="hover:text-amber-800 transition-colors">
            {t('nav.home', 'Home')}
          </Link>
          <span>/</span>
          <span className="text-amber-900 font-bold">{product.categoryName}</span>
          <span>/</span>
          <span className="text-stone-800 font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* Product Hero Grid (Frosted Glass Container) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 rounded-[2.5rem] glass-card border border-white/90 p-6 sm:p-10 shadow-2xl shadow-amber-950/5 relative overflow-hidden">
          {/* Specular Top Sheen */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

          {/* Left Column: Image & Badges */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-b from-stone-100 to-amber-50/50 border border-amber-200/60 shadow-inner group">
              <img
                src={activeVariant?.variantImageUrl || product.primaryImage}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
              />

              {savingsPercent > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-amber-900/30 uppercase tracking-wider">
                  SAVE {savingsPercent}%
                </div>
              )}

              {isFragile && (
                <div className="absolute top-4 right-4 bg-amber-950/80 backdrop-blur-md text-amber-200 font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-amber-500/30">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Fragile Glass Jar</span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-xs px-3.5 py-1.5 rounded-xl text-stone-800 font-mono font-bold shadow-md border border-white/80 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-stone-500" />
                <span>Tare Gross: {grossWeight}g</span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.media && product.media.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.media.map((m: any) => (
                  <img
                    key={m.id}
                    src={m.url}
                    alt={m.altText || product.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-amber-200 cursor-pointer hover:opacity-80 transition-opacity shadow-xs"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Variant Matrix, Pricing, CTAs */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-950 font-black tracking-wider uppercase border border-amber-400/40">
                  {product.categoryName}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  HSN: {product.hsnCode || '04090000'}
                </span>
              </div>

              <h1 className="font-serif font-black text-3xl sm:text-4xl text-amber-950 leading-tight">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {product.summary || product.description}
              </p>

              {/* Real-time Pricing Glass Card */}
              <div className="p-4 rounded-3xl glass-card-amber border border-amber-400/50 flex items-baseline justify-between shadow-md">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black font-serif text-amber-950">
                      ₹{salePrice}
                    </span>
                    {mrp > salePrice && (
                      <span className="text-sm text-stone-400 line-through">
                        ₹{mrp}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold mt-1">
                    {savings > 0 && `You save ₹${savings} (${savingsPercent}% discount) • `}
                    5% GST Included
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-950">
                    SKU: {activeVariant?.sku}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Gross: <strong className="text-amber-950">{grossWeight}g</strong>
                  </div>
                </div>
              </div>

              {/* 2×2 Variant Matrix Tactile Selectors */}
              <div className="space-y-4 pt-2">
                {/* 1. Packaging Material (Glass Jar vs PET Jar) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      1. Packaging Material Option
                    </span>
                    <span className="text-[11px] text-amber-800 font-bold">
                      {selectedPackaging === 'GLASS_JAR' ? 'Tamper-Evident Luxury Glass' : 'Lightweight Food-Grade PET'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPackaging('GLASS_JAR')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        selectedPackaging === 'GLASS_JAR'
                          ? 'border-amber-600 bg-amber-500/15 ring-2 ring-amber-600/40 shadow-md'
                          : 'glass-card hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-200/70 text-amber-950 flex items-center justify-center font-bold text-base">
                          🍯
                        </div>
                        <div>
                          <div className="text-xs font-black text-amber-950">Glass Jar</div>
                          <div className="text-[10px] text-stone-500">Tamper-Proof Luxury</div>
                        </div>
                      </div>
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPackaging('PET_JAR')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        selectedPackaging === 'PET_JAR'
                          ? 'border-amber-600 bg-amber-500/15 ring-2 ring-amber-600/40 shadow-md'
                          : 'glass-card hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-base">
                          📦
                        </div>
                        <div>
                          <div className="text-xs font-black text-stone-900">Food-Grade PET</div>
                          <div className="text-[10px] text-stone-500">Shatterproof Light</div>
                        </div>
                      </div>
                      <Box className="w-4 h-4 text-stone-400" />
                    </button>
                  </div>
                </div>

                {/* 2. Weight Capacity (500g vs 1kg) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      2. Net Weight Capacity
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono font-semibold">
                      {selectedWeight}g Net
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedWeight(500)}
                      className={`py-3 px-4 rounded-2xl border text-center transition-all ${
                        selectedWeight === 500
                          ? 'bg-amber-950 text-amber-200 font-black shadow-lg shadow-amber-950/30'
                          : 'glass-card text-stone-700 font-semibold hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-black">500g (Pint Jar)</div>
                      <div className={`text-[10px] ${selectedWeight === 500 ? 'text-amber-200/80' : 'text-stone-400'}`}>
                        Sample & Daily Use
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedWeight(1000)}
                      className={`py-3 px-4 rounded-2xl border text-center transition-all ${
                        selectedWeight === 1000
                          ? 'bg-amber-950 text-amber-200 font-black shadow-lg shadow-amber-950/30'
                          : 'glass-card text-stone-700 font-semibold hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-black">1kg (Family Pack)</div>
                      <div className={`text-[10px] ${selectedWeight === 1000 ? 'text-amber-200/80' : 'text-stone-400'}`}>
                        Maximum Economy
                      </div>
                    </button>
                  </div>
                </div>

                {/* Fragile Cushioning Banner */}
                {isFragile && (
                  <div className="p-3.5 rounded-2xl glass-card-amber border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>{t('product.fragile_alert', 'Fragile Glass: Packed with extra shock-absorbent eco-cushioning.')}</strong>
                      <div className="text-[11px] text-amber-900/80 mt-0.5">
                        Our logistics team attaches high-visibility Glass safety badges on all courier parcels.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-amber-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`py-4 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                    added
                      ? 'bg-emerald-600 text-white scale-102'
                      : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white hover:scale-102 shadow-amber-600/30 shimmer-button'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Consignment!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('product.add_to_cart', 'Add to Cart')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-4 px-5 rounded-2xl bg-amber-950 hover:bg-stone-900 text-amber-100 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-102 shadow-lg shadow-amber-950/30"
                >
                  <span>{t('product.buy_now', 'Buy Now & Checkout')}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-amber-700" />
                  Estimated Delivery: 2–3 Days Express
                </span>
                <span className="font-bold text-emerald-700">
                  Ready to Dispatch ({activeVariant?.stockQuantity || 50} in stock)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Information Glass Container */}
        <div className="rounded-[2.5rem] glass-card border border-white/90 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex border-b border-amber-100 gap-4 overflow-x-auto pb-1">
            {[
              { id: 'desc', label: 'Artisanal Overview' },
              { id: 'floral', label: t('product.floral_origin', 'Floral Source') },
              { id: 'purity', label: t('product.lab_notes', 'NMR Lab Analysis') },
              { id: 'storage', label: t('product.storage', 'Storage Guidelines') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs sm:text-sm font-black tracking-wider uppercase transition-all border-b-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'border-amber-700 text-amber-950'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <div className="p-4 rounded-2xl glass-card-amber border border-amber-200 text-xs">
                  <strong>Purity Seal:</strong> Our honey is never pasteurized, micro-filtered, or ultra-heated.
                  Every jar contains naturally occurring live invertase, amylase, and catalase enzymes.
                </div>
              </div>
            )}

            {activeTab === 'floral' && (
              <div className="space-y-3">
                <h4 className="font-serif font-black text-amber-950 text-base">
                  Botanical & Floral Provenance
                </h4>
                <p className="p-4 rounded-2xl glass-card-amber border border-amber-200 text-amber-950 font-semibold">
                  {product.floralOrigin || 'Wild natural blossom nectar sustainably harvested from Indian biospheres.'}
                </p>
                <p className="text-xs text-stone-500">
                  Single-origin provenance ensures distinct seasonal terroir, viscosity, and natural sweetness without industrial blending.
                </p>
              </div>
            )}

            {activeTab === 'purity' && (
              <div className="space-y-3">
                <h4 className="font-serif font-black text-amber-950 text-base">
                  Nuclear Magnetic Resonance (NMR) & Carbon Isotope (SIRA) Testing
                </h4>
                <p className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-semibold">
                  {product.purityNotes || 'NMR Spectrometry Certified: 0% Added Corn/Cane/Rice Sugar Syrup. Fructose/Glucose Ratio > 1.30.'}
                </p>
                <div className="text-xs text-stone-600 space-y-1 font-medium">
                  <div>✓ C4 / C3 Sugar Adulteration: <strong>ABSENT (Pass)</strong></div>
                  <div>✓ Moisture Content: <strong>&lt; 18.5% (Natural Non-fermenting)</strong></div>
                  <div>✓ Antibiotic & Heavy Metal Residues: <strong>NOT DETECTED</strong></div>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-3">
                <h4 className="font-serif font-black text-amber-950 text-base">
                  Optimal Storage & Handling Instructions
                </h4>
                <p className="p-4 rounded-2xl glass-card border border-stone-200 text-stone-800 font-medium">
                  {product.storageTips || 'Store at ambient room temperature in a dry pantry away from direct sunlight. Do NOT refrigerate.'}
                </p>
                <p className="text-xs text-stone-500">
                  Natural crystallization is the hallmark of real unheated honey. To liquify, place the jar in a warm water bath (below 40°C).
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
