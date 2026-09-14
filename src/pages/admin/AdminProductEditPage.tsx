import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  Star,
} from 'lucide-react';
import { Product, Category, ProductVariant, ProductImage } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminProductEditPageProps {
  productId?: string; // If 'new' or undefined, create mode
  navigate: (path: string) => void;
}

export const AdminProductEditPage: React.FC<AdminProductEditPageProps> = ({ productId, navigate }) => {
  const isNew = !productId || productId === 'new';
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('Baggio');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [regularPrice, setRegularPrice] = useState('0');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('3');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState('Leather, Luxury, Italian');

  // Specs
  const [weight, setWeight] = useState('1.2');
  const [length, setLength] = useState('40');
  const [width, setWidth] = useState('20');
  const [height, setHeight] = useState('30');

  // Images list
  const [images, setImages] = useState<ProductImage[]>([
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      isPrimary: true,
      sortOrder: 0,
    },
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Variants list
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    // Fetch categories
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && isNew) {
        setCategoryId(cats[0].id);
      }
    });

    if (!isNew && productId) {
      api.getProductById(productId)
        .then((data) => {
          const p = data.product;
          setName(p.name);
          setSlug(p.slug);
          setBrand(p.brand);
          setSku(p.sku);
          setCategoryId(p.categoryId);
          setRegularPrice(p.regularPrice.toString());
          setSalePrice(p.salePrice ? p.salePrice.toString() : '');
          setStockQuantity(p.stockQuantity.toString());
          setLowStockThreshold(p.lowStockThreshold.toString());
          setShortDescription(p.shortDescription || '');
          setDescription(p.description);
          setStatus(p.status);
          setIsFeatured(p.isFeatured);
          setTags((p.tags || []).join(', '));
          setWeight(p.weight ? p.weight.toString() : '');
          setLength(p.length ? p.length.toString() : '');
          setWidth(p.width ? p.width.toString() : '');
          setHeight(p.height ? p.height.toString() : '');
          setImages(p.images || []);
          setVariants(p.variants || []);
        })
        .catch((err) => {
          error('Failed to load product data');
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [productId, isNew]);

  // Handle auto slug when name changes in new mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (isNew) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
      if (!sku) {
        setSku(`BAG-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  };

  const handleAddImageByUrl = () => {
    if (!newImageUrl.trim()) return;
    const newImg: ProductImage = {
      id: 'img-' + Date.now(),
      url: newImageUrl.trim(),
      isPrimary: images.length === 0,
      sortOrder: images.length,
    };
    setImages((prev) => [...prev, newImg]);
    setNewImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadImage(file);
      const newImg: ProductImage = {
        id: 'img-' + Date.now(),
        url: res.url,
        isPrimary: images.length === 0,
        sortOrder: images.length,
      };
      setImages((prev) => [...prev, newImg]);
      success('Image file uploaded successfully.');
    } catch (err: any) {
      error(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimaryImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleAddVariant = () => {
    const newV: ProductVariant = {
      id: 'var-' + Date.now(),
      name: 'Standard Edition',
      sku: `${sku}-ED${variants.length + 1}`,
      price: parseFloat(regularPrice) || 100,
      stockQuantity: 10,
    };
    setVariants((prev) => [...prev, newV]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, val: any) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regularPrice) {
      error('Title and regular price are mandatory.');
      return;
    }

    setIsSaving(true);
    try {
      const productPayload = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        brand,
        sku: sku || `BAG-${Date.now().toString().slice(-4)}`,
        categoryId: categoryId || (categories[0]?.id ?? 'cat-1'),
        regularPrice: parseFloat(regularPrice) || 0,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 3,
        shortDescription,
        description,
        status,
        isFeatured,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        weight: weight ? parseFloat(weight) : undefined,
        length: length ? parseFloat(length) : undefined,
        width: width ? parseFloat(width) : undefined,
        height: height ? parseFloat(height) : undefined,
        images,
        variants,
      };

      if (isNew) {
        await api.adminCreateProduct(productPayload);
        success('New article created successfully.');
      } else {
        await api.adminUpdateProduct(productId!, productPayload);
        success('Article specifications updated.');
      }
      navigate('/admin/products');
    } catch (err: any) {
      error(err.message || 'Failed to persist product.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-neutral-400">Loading article editor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            {isNew ? 'New Atelier Article' : `Edit: ${name}`}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-neutral-900 text-neutral-300 text-xs font-semibold rounded-xl hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            id="admin-save-product-btn"
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-white text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Persisting...' : 'Save Article'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              General Identity
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Master Tuscan Weekender Duffle"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  SKU Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="BAG-1001"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Artisan Guild Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Brand Line
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Short Summary (Card display)
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Compact synopsis shown on cards and quick overviews..."
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Full Artisan Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive technical breakdown, leather origin, hand-stitching notes..."
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Economics & Stock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Regular Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Sale / Promotional Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Leave empty if not on sale"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Inventory Stock Units *
                </label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Low Stock Threshold Alert
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Article Variants ({variants.length})
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-xs text-neutral-500">
                No variants configured. Product behaves as a singular edition.
              </p>
            ) : (
              <div className="space-y-3">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center"
                  >
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleUpdateVariant(v.id, 'name', e.target.value)}
                      placeholder="Variant name (e.g. Vintage Cognac)"
                      className="flex-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-white"
                    />
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="w-24 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-white font-mono"
                    />
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <span>$</span>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-white"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <span>Qty:</span>
                      <input
                        type="number"
                        value={v.stockQuantity}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, 'stockQuantity', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-16 px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings: Media, Status, SEO (1 col) */}
        <div className="space-y-6">
          {/* Publication Status & Featured */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Status & Placement
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Visibility Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Active">Active (Public on Store)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
              />
              <span>Feature on Storefront Homepage</span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Leather, Travel, Handcrafted"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Media & Gallery Management */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Media Showcase ({images.length})
            </h3>

            {/* Current Images List */}
            <div className="space-y-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`p-2 rounded-xl border flex items-center gap-3 ${
                    img.isPrimary
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-neutral-800 bg-neutral-900'
                  }`}
                >
                  <img
                    src={img.url}
                    alt="Gallery thumbnail"
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded bg-neutral-950 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-neutral-400 truncate">{img.url}</p>
                    {img.isPrimary ? (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 mt-1">
                        <Star className="w-3 h-3 fill-amber-400" /> Primary Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(img.id)}
                        className="text-[10px] text-neutral-400 hover:text-white mt-1 underline block"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image by URL */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                Add Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash..."
                  className="flex-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageByUrl}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Or Local Upload */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                Upload Local File
              </label>
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-500 text-xs text-neutral-400">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading file...' : 'Choose File to Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Dimensions & Freight
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
