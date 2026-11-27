'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Modal Form State
  const [sortOrder, setSortOrder] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'en' | 'hi' | 'bn' | 'ar'>('en');

  const [translations, setTranslations] = useState({
    en: { name: '', description: '', metaTitle: '', metaDescription: '' },
    hi: { name: '', description: '', metaTitle: '', metaDescription: '' },
    bn: { name: '', description: '', metaTitle: '', metaDescription: '' },
    ar: { name: '', description: '', metaTitle: '', metaDescription: '' },
  });

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories?all=true&lang=en')
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setSortOrder(categories.length + 1);
    setImageUrl('https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80');
    setTranslations({
      en: { name: '', description: '', metaTitle: '', metaDescription: '' },
      hi: { name: '', description: '', metaTitle: '', metaDescription: '' },
      bn: { name: '', description: '', metaTitle: '', metaDescription: '' },
      ar: { name: '', description: '', metaTitle: '', metaDescription: '' },
    });
    setActiveTab('en');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setSortOrder(cat.sortOrder || 1);
    setImageUrl(cat.imageUrl || '');

    const newTrans: any = {
      en: { name: '', description: '', metaTitle: '', metaDescription: '' },
      hi: { name: '', description: '', metaTitle: '', metaDescription: '' },
      bn: { name: '', description: '', metaTitle: '', metaDescription: '' },
      ar: { name: '', description: '', metaTitle: '', metaDescription: '' },
    };

    if (cat.translations) {
      for (const t of cat.translations) {
        if (newTrans[t.langCode]) {
          newTrans[t.langCode] = {
            name: t.name || '',
            description: t.description || '',
            metaTitle: t.metaTitle || '',
            metaDescription: t.metaDescription || '',
          };
        }
      }
    }

    setTranslations(newTrans);
    setActiveTab('en');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!translations.en.name) {
      alert('English category name is required');
      return;
    }

    const payload = {
      sortOrder: parseInt(sortOrder.toString(), 10),
      imageUrl,
      isActive: true,
      translations,
    };

    try {
      let res;
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save category');
      }
    } catch (err: any) {
      alert(err.message || 'Save error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this honey category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchCategories();
    } else {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="flex-1 pb-16">
      <AdminHeader title="Dynamic Category & Subcategory Manager (16+ Varieties)" />

      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center rounded-3xl glass-card border border-white/90 p-5 shadow-xl shadow-amber-950/5">
          <div>
            <h3 className="font-serif font-black text-base text-amber-950">
              Active Taxonomy: {categories.length} Honey Varieties
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage category hierarchy, sort order, and multi-language banners.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Honey Category</span>
          </button>
        </div>

        {/* Categories Grid with Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-3 text-center py-16 text-stone-500">
              Loading categories...
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-3xl glass-card border border-white/90 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div>
                  <div className="h-36 bg-stone-100 relative overflow-hidden">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-200 font-mono text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/30">
                      Priority #{cat.sortOrder}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs border border-white/80">
                      {cat.productCount} Products
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-serif font-black text-stone-900 text-base">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {cat.description || 'No description added.'}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5">
                      {['en', 'hi', 'bn', 'ar'].map((lang) => {
                        const hasTrans = cat.translations?.some((t: any) => t.langCode === lang);
                        return (
                          <span
                            key={lang}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              hasTrans ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200/60 text-stone-400'
                            }`}
                          >
                            {lang}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/40 border-t border-amber-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 px-3 rounded-xl hover:bg-white text-stone-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 px-3 rounded-xl hover:bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-6 text-stone-900 max-h-[90vh] overflow-y-auto border border-stone-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black font-serif text-amber-950 mb-1">
              {editingCategory ? 'Edit Honey Category' : 'Create New Honey Category'}
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Configure localized names, slugs, and banner artwork.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    Sort Order Priority
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* Language Tabs */}
              <div className="border border-amber-200/80 rounded-2xl p-5 bg-amber-50/40 space-y-4">
                <div className="flex gap-1.5 border-b border-amber-200/60 pb-3">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'bn', label: 'বাংলা' },
                    { code: 'ar', label: 'العربية (RTL)' },
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.code}
                      onClick={() => setActiveTab(tab.code as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        activeTab === tab.code
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md'
                          : 'bg-white border border-stone-200 text-stone-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div dir={activeTab === 'ar' ? 'rtl' : 'ltr'} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Category Name ({activeTab.toUpperCase()}) *
                    </label>
                    <input
                      type="text"
                      required={activeTab === 'en'}
                      value={translations[activeTab].name}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeTab]: { ...translations[activeTab], name: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                      placeholder={`e.g. ${activeTab === 'en' ? 'Acacia Honey' : 'बबूल शहद'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Description ({activeTab.toUpperCase()})
                    </label>
                    <textarea
                      rows={3}
                      value={translations[activeTab].description}
                      onChange={(e) =>
                        setTranslations({
                          ...translations,
                          [activeTab]: { ...translations[activeTab], description: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                      placeholder="Brief floral origin and culinary characteristics..."
                    />
                  </div>
                </div>
              </div>

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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
