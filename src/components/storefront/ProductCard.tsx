'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShieldAlert, Box, ShoppingBag, Check, Sparkles, Scale } from 'lucide-react';

export default function ProductCard({ product }: { product: any }) {
  const { t, addToCart } = useStore();

  const [selectedPackaging, setSelectedPackaging] = useState<'GLASS_JAR' | 'PET_JAR'>('GLASS_JAR');
  const [selectedWeight, setSelectedWeight] = useState<500 | 1000>(500);
  const [added, setAdded] = useState(false);

  // Find variant matching active pills
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

  return (
    <div className="group h-full rounded-3xl glass-card border border-white/85 shadow-lg shadow-amber-950/5 hover:shadow-2xl hover:shadow-amber-600/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Specular Highlight Sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 z-30" />

      {/* Image, Floating Badges & Hover Product Details Overlay */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-gradient-to-b from-stone-100 to-amber-50/50">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={activeVariant?.variantImageUrl || product.primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Floating Savings Capsule */}
        {savingsPercent > 0 && (
          <span className="absolute top-3.5 left-3.5 z-10 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-black text-[10px] px-3 py-1 rounded-full shadow-lg shadow-amber-900/30 uppercase tracking-wider">
            SAVE {savingsPercent}%
          </span>
        )}

        {/* Floating Category Glass Pill */}
        <span className="absolute top-3.5 right-3.5 z-10 glass-pill text-amber-950 font-bold text-[10px] px-3 py-1 rounded-full shadow-xs">
          {product.categoryName}
        </span>

        {/* Fragile Glass Alert Badge */}
        {isFragile && (
          <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 bg-amber-950/80 backdrop-blur-md text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-xl shadow-md border border-amber-500/30">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Fragile Glass</span>
          </span>
        )}

        {/* Gross Tare Capsule */}
        <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 bg-white/85 backdrop-blur-md text-stone-700 font-mono text-[10px] px-2.5 py-1 rounded-xl shadow-xs border border-white/60">
          <Scale className="w-2.5 h-2.5 text-stone-500" />
          <span>{grossWeight}g tare</span>
        </span>

        {/* Hover Product Details Overlay */}
        <Link
          href={`/product/${product.id}`}
          className="absolute inset-0 z-20 bg-amber-950/90 backdrop-blur-md text-amber-50 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {product.categoryName}
              </span>
              <span className="text-[10px] font-mono text-emerald-300">
                {activeVariant?.stockQuantity > 0 ? `${activeVariant.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>
            <h4 className="font-serif font-bold text-sm text-white leading-snug">
              {product.title}
            </h4>
            {product.floralOrigin && (
              <p className="text-[11px] text-amber-200">
                <span className="font-semibold text-amber-400">Origin:</span> {product.floralOrigin}
              </p>
            )}
            <p className="text-[11px] text-amber-100/90 leading-relaxed line-clamp-3">
              {product.description || product.summary}
            </p>
            {product.purityNotes && (
              <p className="text-[10px] text-emerald-200/90 leading-snug">
                <span className="font-semibold text-emerald-300">Purity:</span> {product.purityNotes}
              </p>
            )}
          </div>
          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] font-bold text-amber-300">
            <span>SKU: {activeVariant?.sku}</span>
            <span>View Full Details →</span>
          </div>
        </Link>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-serif font-black text-base text-stone-900 group-hover:text-amber-800 transition-colors leading-snug min-h-[2.75rem]">
              {product.title}
            </h3>
          </Link>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed min-h-[2.5rem]">
            {product.summary || product.floralOrigin || product.description}
          </p>
        </div>

        {/* Variant Selectors */}
        <div className="space-y-2.5 pt-3 mt-3 border-t border-amber-100/70">
          {/* Packaging Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-900/60 uppercase w-10 shrink-0">Jar:</span>
            <div className="grid grid-cols-2 gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => setSelectedPackaging('GLASS_JAR')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedPackaging === 'GLASS_JAR'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-101'
                    : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/80'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-amber-300" />
                <span>Glass</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPackaging('PET_JAR')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedPackaging === 'PET_JAR'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-101'
                    : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/80'
                }`}
              >
                <Box className="w-3 h-3 text-stone-400" />
                <span>PET</span>
              </button>
            </div>
          </div>

          {/* Weight Capacity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-900/60 uppercase w-10 shrink-0">Size:</span>
            <div className="grid grid-cols-2 gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => setSelectedWeight(500)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  selectedWeight === 500
                    ? 'bg-amber-950 text-amber-200 shadow-md shadow-amber-950/30'
                    : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/80'
                }`}
              >
                500g
              </button>

              <button
                type="button"
                onClick={() => setSelectedWeight(1000)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  selectedWeight === 1000
                    ? 'bg-amber-950 text-amber-200 shadow-md shadow-amber-950/30'
                    : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/80'
                }`}
              >
                1kg (Family)
              </button>
            </div>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 mt-3 border-t border-amber-100/70 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-serif text-amber-950">
                ₹{salePrice}
              </span>
              {mrp > salePrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{mrp}
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-emerald-700 font-semibold">
              Tax Incl. (5% GST)
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              added
                ? 'bg-emerald-600 text-white scale-102'
                : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white hover:scale-103 shadow-amber-600/30'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('product.add_to_cart', 'Add')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
