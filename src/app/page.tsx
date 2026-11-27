'use client';

import { useState, useEffect, useRef } from 'react';
import StoreHeader from '@/components/storefront/StoreHeader';
import HeroBanner from '@/components/storefront/HeroBanner';
import CategoryBar from '@/components/storefront/CategoryBar';
import ProductFilterBar from '@/components/storefront/ProductFilterBar';
import ProductCard from '@/components/storefront/ProductCard';
import StoreFooter from '@/components/storefront/Footer';
import { useStore } from '@/context/StoreContext';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Sparkles, SlidersHorizontal, Layers, ShieldCheck } from 'lucide-react';

export default function StorefrontHomePage() {
  const { lang, t } = useStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [packagingFilter, setPackagingFilter] = useState<string | null>(null);
  const [weightFilter, setWeightFilter] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const catalogSectionRef = useRef<HTMLDivElement>(null);

  // Fetch Categories
  useEffect(() => {
    fetch(`/api/categories?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, [lang]);

  // Fetch Products with multi-facet query
  const fetchProducts = () => {
    setLoading(true);
    let url = `/api/products?lang=${lang}`;

    if (selectedCategory) url += `&category=${selectedCategory}`;
    if (packagingFilter) url += `&packaging=${packagingFilter}`;
    if (weightFilter) url += `&weight=${weightFilter}`;
    if (inStockOnly) url += `&inStock=true`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [lang, selectedCategory, packagingFilter, weightFilter, inStockOnly, searchQuery]);

  // Supabase Realtime: live-sync catalog updates when products/stock change
  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      const channel = supabase
        .channel('catalog-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, () => {
          fetchProducts();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ProductVariant' }, () => {
          fetchProducts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return undefined;
    }
  }, [lang, selectedCategory, packagingFilter, weightFilter, inStockOnly, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setPackagingFilter(null);
    setWeightFilter(null);
    setInStockOnly(false);
    setSearchQuery('');
  };

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <StoreHeader onSearch={(q) => setSearchQuery(q)} />

      <HeroBanner onExploreClick={scrollToCatalog} />

      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => setSelectedCategory(id)}
      />

      <main ref={catalogSectionRef} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Product Catalog Grid */}
        <div className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-amber-200/60">
            <div>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-950">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name || 'Filtered Harvest'
                  : t('filter.all_categories', 'All Honey Varieties')}
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                Showing {products.length} artisanal honey selections
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {(selectedCategory || packagingFilter || weightFilter || inStockOnly || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-amber-700 hover:text-amber-900 font-bold underline"
                >
                  {t('filter.clear_all', 'Reset Filters')}
                </button>
              )}

              <ProductFilterBar
                packaging={packagingFilter}
                setPackaging={setPackagingFilter}
                weight={weightFilter}
                setWeight={setWeightFilter}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-96 rounded-3xl glass-card animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 rounded-3xl glass-card border border-white/80 p-8 space-y-3 shadow-xl">
              <div className="text-5xl">🍯</div>
              <h3 className="font-serif font-black text-lg text-amber-950">
                No honey varieties found matching your filters.
              </h3>
              <p className="text-xs text-stone-500">
                Try clearing the packaging or weight filters to view available harvests.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-full text-xs font-bold shadow-md shadow-amber-600/30"
              >
                View All Varieties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
