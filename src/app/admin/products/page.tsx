'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Layers,
  Languages,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Modal State
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'hi' | 'bn' | 'ar'>('en');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [hsnCode, setHsnCode] = useState('04090000');
  const [taxRate, setTaxRate] = useState(5.0);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload image to Neon');
      }
    } catch (err: any) {
      alert(err.message || 'Upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Multilingual text states
  const [translations, setTranslations] = useState({
    en: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
    hi: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
    bn: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
    ar: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
  });

  // 2x2 Variant Matrix State
  const [variants, setVariants] = useState([
    { packagingType: 'GLASS_JAR', netWeightGrams: 500, grossShippingWeightGrams: 820, isFragile: true, sku: 'HON-NEW-500G-GLS', mrp: 599, salePrice: 499, stockQuantity: 50, variantImageUrl: '' },
    { packagingType: 'GLASS_JAR', netWeightGrams: 1000, grossShippingWeightGrams: 1480, isFragile: true, sku: 'HON-NEW-1KGG-GLS', mrp: 1099, salePrice: 899, stockQuantity: 30, variantImageUrl: '' },
    { packagingType: 'PET_JAR', netWeightGrams: 500, grossShippingWeightGrams: 555, isFragile: false, sku: 'HON-NEW-500P-PET', mrp: 549, salePrice: 449, stockQuantity: 60, variantImageUrl: '' },
    { packagingType: 'PET_JAR', netWeightGrams: 1000, grossShippingWeightGrams: 1085, isFragile: false, sku: 'HON-NEW-1KGP-PET', mrp: 999, salePrice: 799, stockQuantity: 40, variantImageUrl: '' },
  ]);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products?lang=en')
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch('/api/categories?lang=en')
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        if (data.length > 0 && !categoryId) setCategoryId(data[0].id);
      });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setCategoryId(categories[0]?.id || '');
    setIsFeatured(false);
    setHsnCode('04090000');
    setTaxRate(5.0);
    setImageUrl('');
    setTranslations({
      en: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
      hi: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
      bn: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
      ar: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
    });
    setVariants([
      { packagingType: 'GLASS_JAR', netWeightGrams: 500, grossShippingWeightGrams: 820, isFragile: true, sku: 'HON-VAR-500G-GLS', mrp: 599, salePrice: 499, stockQuantity: 50, variantImageUrl: '' },
      { packagingType: 'GLASS_JAR', netWeightGrams: 1000, grossShippingWeightGrams: 1480, isFragile: true, sku: 'HON-VAR-1KGG-GLS', mrp: 1099, salePrice: 899, stockQuantity: 30, variantImageUrl: '' },
      { packagingType: 'PET_JAR', netWeightGrams: 500, grossShippingWeightGrams: 555, isFragile: false, sku: 'HON-VAR-500P-PET', mrp: 549, salePrice: 449, stockQuantity: 60, variantImageUrl: '' },
      { packagingType: 'PET_JAR', netWeightGrams: 1000, grossShippingWeightGrams: 1085, isFragile: false, sku: 'HON-VAR-1KGP-PET', mrp: 999, salePrice: 799, stockQuantity: 40, variantImageUrl: '' },
    ]);
    setActiveLangTab('en');
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setCategoryId(p.categoryId);
    setIsFeatured(Boolean(p.isFeatured));
    setHsnCode(p.hsnCode || '04090000');
    setTaxRate(p.taxRate || 5.0);
    setImageUrl(p.primaryImage || '');

    const newTrans: any = {
      en: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
      hi: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
      bn: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
      ar: { title: '', summary: '', description: '', floralOrigin: '', purityNotes: '', storageTips: '', seoKeywords: '' },
    };

    if (p.translations) {
      for (const t of p.translations) {
        if (newTrans[t.langCode]) {
          newTrans[t.langCode] = {
            title: t.title || '',
            summary: t.summary || '',
            description: t.description || '',
            floralOrigin: t.floralOrigin || '',
            purityNotes: t.purityNotes || '',
            storageTips: t.storageTips || '',
            seoKeywords: t.seoKeywords || '',
          };
        }
      }
    }
    setTranslations(newTrans);

    if (p.variants && p.variants.length > 0) {
      setVariants(
        p.variants.map((v: any) => ({
          id: v.id,
          packagingType: v.packagingType,
          netWeightGrams: v.netWeightGrams,
          grossShippingWeightGrams: v.grossShippingWeightGrams,
          isFragile: v.isFragile,
          sku: v.sku,
          mrp: v.mrp,
          salePrice: v.salePrice,
          stockQuantity: v.stockQuantity,
          variantImageUrl: v.variantImageUrl || '',
        }))
      );
    }

    setActiveLangTab('en');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!translations.en.title) {
      alert('English Product Title is required');
      return;
    }

    const payload = {
      categoryId,
      isFeatured,
      hsnCode,
      taxRate,
      basePrice: variants[0]?.salePrice || 499,
      translations,
      variants,
      media: [{ url: imageUrl, isPrimary: true, altText: translations.en.title }],
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save product');
      }
    } catch (err: any) {
      alert(err.message || 'Save error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this honey product? All 4 variants will be removed.')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchProducts();
    } else {
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 pb-16">
      <AdminHeader title="Honey Catalog & Multilingual Products CRUD" />

      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Actions bar Glass Card */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 rounded-3xl glass-card border border-white/90 p-4 shadow-xl shadow-amber-950/5">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
            />
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Honey Variety</span>
          </button>
        </div>

        {/* Product Cards / Table Glass Card */}
        <div className="rounded-3xl glass-card border border-white/90 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-amber-950 text-amber-100 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Honey Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">2×2 Variant Matrix & Pricing</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Languages</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-stone-500">
                      Loading catalog...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-stone-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.primaryImage}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-amber-200/80 shadow-xs shrink-0"
                        />
                        <div>
                          <div className="font-bold text-sm text-stone-900">{p.title}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-1">{p.floralOrigin || p.summary}</div>
                          {p.isFeatured && (
                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-950 font-bold border border-amber-400/40">
                              ★ Featured Reserve
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-amber-950">
                        {p.categoryName}
                      </td>

                      <td className="p-4">
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <span className="px-2 py-1 rounded-lg bg-amber-100/60 font-mono text-amber-950 border border-amber-200/50">
                            500g Glass: ₹{p.variants?.find((v: any) => v.packagingType === 'GLASS_JAR' && v.netWeightGrams === 500)?.salePrice || 'N/A'}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-amber-100/60 font-mono text-amber-950 border border-amber-200/50">
                            1kg Glass: ₹{p.variants?.find((v: any) => v.packagingType === 'GLASS_JAR' && v.netWeightGrams === 1000)?.salePrice || 'N/A'}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-stone-100/80 font-mono text-stone-700 border border-stone-200/50">
                            500g PET: ₹{p.variants?.find((v: any) => v.packagingType === 'PET_JAR' && v.netWeightGrams === 500)?.salePrice || 'N/A'}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-stone-100/80 font-mono text-stone-700 border border-stone-200/50">
                            1kg PET: ₹{p.variants?.find((v: any) => v.packagingType === 'PET_JAR' && v.netWeightGrams === 1000)?.salePrice || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-black text-amber-950 text-sm">
                          {p.totalStock} units
                        </div>
                        <div className="text-[10px] text-stone-500">Across 4 SKUs</div>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-1">
                          {['en', 'hi', 'bn', 'ar'].map((code) => {
                            const exists = p.translations?.some((t: any) => t.langCode === code);
                            return (
                              <span
                                key={code}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  exists ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200/60 text-stone-400'
                                }`}
                              >
                                {code}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-xl hover:bg-amber-100/60 text-stone-600 hover:text-amber-900 transition-colors"
                          title="Edit Product & Translations"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal with Glassmorphism */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-6 text-stone-900 max-h-[90vh] overflow-y-auto border border-stone-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black font-serif text-amber-950 mb-1">
              {editingProduct ? 'Edit Honey Variety & Localization' : 'Add New Honey Variety'}
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Configure multilingual translations and 2x2 Packaging × Weight variant SKU matrix.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Category, Featured, Image URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    Honey Category (16+ Taxonomy)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    Primary Image (Upload to Neon DB)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                      placeholder="/api/files/... or upload below"
                    />
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-amber-400 bg-amber-50/60 hover:bg-amber-100/60 text-xs font-bold text-amber-900 cursor-pointer transition-colors">
                      <span>{uploadingImage ? 'Uploading to Neon...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    Mark as Featured Reserve
                  </label>
                </div>
              </div>

              {/* Dedicated Language Tabs (EN, HI, BN, AR) */}
              <div className="border border-amber-200/80 rounded-2xl p-5 bg-amber-50/40 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Multilingual Localization Tabs
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { code: 'en', label: 'English [EN]' },
                      { code: 'hi', label: 'हिन्दी [HI]' },
                      { code: 'bn', label: 'বাংলা [BN]' },
                      { code: 'ar', label: 'العربية [AR - RTL]' },
                    ].map((tab) => (
                      <button
                        type="button"
                        key={tab.code}
                        onClick={() => setActiveLangTab(tab.code as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeLangTab === tab.code
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-600/30'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Localized Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Product Title ({activeLangTab.toUpperCase()}) *
                    </label>
                    <input
                      type="text"
                      required={activeLangTab === 'en'}
                      value={translations[activeLangTab].title}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeLangTab]: { ...translations[activeLangTab], title: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                      placeholder={`e.g. ${activeLangTab === 'en' ? 'Royal Sidr Reserve' : 'शहद का नाम'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Short Summary ({activeLangTab.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={translations[activeLangTab].summary}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeLangTab]: { ...translations[activeLangTab], summary: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Floral Origin Source ({activeLangTab.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={translations[activeLangTab].floralOrigin}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeLangTab]: { ...translations[activeLangTab], floralOrigin: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Detailed Description ({activeLangTab.toUpperCase()})
                    </label>
                    <textarea
                      rows={3}
                      value={translations[activeLangTab].description}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeLangTab]: { ...translations[activeLangTab], description: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Purity & NMR Lab Notes ({activeLangTab.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={translations[activeLangTab].purityNotes}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeLangTab]: { ...translations[activeLangTab], purityNotes: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Storage Guidelines ({activeLangTab.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={translations[activeLangTab].storageTips}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeLangTab]: { ...translations[activeLangTab], storageTips: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2×2 Variant Matrix Specification */}
              <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50 space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    2×2 Variant Matrix (Glass/PET × 500g/1kg)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {variants.map((v, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={v.packagingType === 'GLASS_JAR' ? 'text-amber-950 font-black' : 'text-stone-800 font-black'}>
                          {v.netWeightGrams}g - {v.packagingType === 'GLASS_JAR' ? 'Glass Jar' : 'Food PET Jar'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 font-mono text-stone-600">
                          Gross: {v.grossShippingWeightGrams}g
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-500 font-bold">MRP (₹)</label>
                          <input
                            type="number"
                            value={v.mrp}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].mrp = parseFloat(e.target.value) || 0;
                              setVariants(updated);
                            }}
                            className="w-full p-1.5 text-xs rounded-xl border border-stone-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 font-bold">Sale Price (₹)</label>
                          <input
                            type="number"
                            value={v.salePrice}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].salePrice = parseFloat(e.target.value) || 0;
                              setVariants(updated);
                            }}
                            className="w-full p-1.5 text-xs rounded-xl border border-amber-300 font-black text-amber-950 bg-amber-50/50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 font-bold">Stock (Qty)</label>
                          <input
                            type="number"
                            value={v.stockQuantity}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].stockQuantity = parseInt(e.target.value, 10) || 0;
                              setVariants(updated);
                            }}
                            className="w-full p-1.5 text-xs rounded-xl border border-stone-200 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-stone-500 font-bold">SKU Code</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].sku = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full p-1.5 text-xs font-mono rounded-xl border border-stone-200 text-stone-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/30"
                >
                  Save Honey Product & Sync Variants
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
