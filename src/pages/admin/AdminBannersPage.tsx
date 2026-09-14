import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import { Banner } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [sortOrder, setSortOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { success, error } = useToast();

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetBanners();
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('Autumn Horology & Luggage');
    setSubtitle('Handcrafted in the hills of Florence with certified full-grain hides.');
    setImageUrl('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop');
    setCtaText('Discover Atelier');
    setCtaLink('/shop');
    setSortOrder((banners.length + 1).toString());
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl);
    setCtaText(b.ctaText || 'Shop Now');
    setCtaLink(b.ctaLink || '/shop');
    setSortOrder(b.sortOrder.toString());
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        imageUrl: imageUrl.trim(),
        ctaText: ctaText.trim(),
        ctaLink: ctaLink.trim(),
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive,
      };

      if (editingBanner) {
        await api.adminUpdateBanner(editingBanner.id, payload);
        success('Hero banner updated.');
      } else {
        await api.adminCreateBanner(payload);
        success('New hero campaign banner added.');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      error(err.message || 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, bTitle: string) => {
    if (!confirm(`Delete banner "${bTitle}"?`)) return;
    try {
      await api.adminDeleteBanner(id);
      success(`Banner deleted.`);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to remove banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Homepage Campaigns & Banners</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage hero slideshow carousel graphics, promotional links, and seasonal launches.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Hero Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 p-12 text-center text-xs text-neutral-400">Loading banners...</div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[16/8] bg-neutral-900">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Order {b.sortOrder} • {b.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <h3 className="text-base font-serif font-bold">{b.title}</h3>
                  <p className="text-xs text-neutral-300 truncate">{b.subtitle}</p>
                </div>
              </div>

              <div className="p-4 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between">
                <div className="text-xs text-neutral-400">
                  <span>CTA: </span>
                  <span className="text-white font-semibold">{b.ctaText}</span>
                  <span className="ml-2 font-mono text-[11px]">({b.ctaLink})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-neutral-400 hover:text-amber-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingBanner ? 'Edit Banner' : 'New Campaign Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Subtitle</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  High-Resolution Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">CTA Label</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Active on Homepage Hero</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-white text-neutral-950 text-xs font-bold rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
