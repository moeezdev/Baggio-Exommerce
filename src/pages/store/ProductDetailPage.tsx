import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  X,
} from 'lucide-react';
import { Product, Category, Review, ProductVariant } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ProductCard } from '../../components/store/ProductCard.tsx';
import { formatPrice } from '../../utils/currency.ts';

interface ProductDetailPageProps {
  productId: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, navigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProductById(productId);
        setProduct(data.product);
        setCategory(data.category);
        setRelatedProducts(data.relatedProducts || []);
        if (data.product.variants && data.product.variants.length > 0) {
          setSelectedVariant(data.product.variants[0]);
        }
        // Fetch reviews
        const reviewList = await api.getReviews({ productId });
        setReviews(reviewList);
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-neutral-100 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
            <div className="h-8 bg-neutral-100 rounded w-3/4"></div>
            <div className="h-6 bg-neutral-100 rounded w-1/3"></div>
            <div className="h-24 bg-neutral-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-neutral-900">Creation Not Found</h2>
        <p className="text-sm text-neutral-500 mt-2">The article you requested could not be located.</p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-6 px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const images = product.images.length > 0 ? product.images : [{ id: '1', url: '', isPrimary: true, sortOrder: 0 }];
  const activeImageUrl = images[selectedImageIndex]?.url || images[0]?.url || '';

  const effectivePrice = selectedVariant
    ? selectedVariant.price
    : product.salePrice ?? product.regularPrice;

  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const isOutOfStock = product.stockQuantity === 0 || (selectedVariant && selectedVariant.stockQuantity === 0);
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant?.id);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant?.id);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Please sign in or register to submit a verified client review.');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      error('Please share your thoughts in the review comment.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview({
        productId: product.id,
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews((prev) => [res.review, ...prev]);
      setIsReviewModalOpen(false);
      setNewComment('');
      success('Your review has been published.');
    } catch (err: any) {
      error(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-8 overflow-x-auto whitespace-nowrap">
        <button onClick={() => navigate('/')} className="hover:text-black">
          Home
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate('/shop')} className="hover:text-black">
          Shop
        </button>
        {category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navigate(`/category/${category.slug}`)} className="hover:text-black">
              {category.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
        {/* Left: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] shrink-0">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    idx === selectedImageIndex
                      ? 'border-neutral-950 shadow-md'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} angle ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Primary View */}
          <div className="relative flex-1 aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={activeImageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-md">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Right: Purchasing & Specification Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold tracking-widest uppercase mb-1">
              <span>{product.brand}</span>
              <span className="text-neutral-500">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating) ? 'fill-amber-400' : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-800">
                {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
              </span>
              <span className="text-xs text-neutral-400">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-950">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
            </div>

            {/* Stock status badge */}
            <div>
              {isOutOfStock ? (
                <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                  Only {product.stockQuantity} Remaining
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                  In Stock & Ready
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            {product.shortDescription || product.description}
          </p>

          {/* Variants selection (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
                Select Edition / Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="ml-1.5 opacity-80">({formatPrice(v.price)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add to Bag */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-3 text-neutral-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  disabled={quantity >= product.stockQuantity || isOutOfStock}
                  className="p-3 text-neutral-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                id="product-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-lg border transition-colors ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-neutral-300 text-neutral-600 hover:text-black hover:border-black'
                }`}
                aria-label="Save to wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Buy Now Button */}
            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
              >
                Instant Checkout
              </button>
            )}
          </div>

          {/* Guarantees List */}
          <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-500">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-neutral-700" />
              <span>Complimentary insured express shipping over Rs. 5,000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-700" />
              <span>Lifetime warranty against structural defects</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-neutral-700" />
              <span>30-day global exchange privilege</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specs, Reviews */}
      <div className="mt-16 sm:mt-24 border-t border-neutral-200 pt-10">
        <div className="flex gap-8 border-b border-neutral-200 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 transition-colors relative ${
              activeTab === 'description' ? 'text-black font-bold' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Artisan Description
            {activeTab === 'description' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 transition-colors relative ${
              activeTab === 'specs' ? 'text-black font-bold' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Dimensions & Provenance
            {activeTab === 'specs' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'text-black font-bold' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <span>Verified Reviews</span>
            <span className="px-1.5 py-0.5 bg-neutral-100 text-[10px] rounded-full text-neutral-600">
              {reviews.length}
            </span>
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black"></div>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-8">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-sm text-neutral-600 leading-relaxed">
              <p>{product.description}</p>
              <h4 className="font-semibold text-neutral-900 pt-2">Material Notes</h4>
              <p>
                Each creation utilizes certified vegetable-tanned Italian calf hides that naturally
                patina over time. Hardware elements are custom-milled from solid brass and coated
                against corrosion.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl text-xs space-y-3">
              <div className="grid grid-cols-2 py-2 border-b border-neutral-100">
                <span className="text-neutral-400 font-medium">SKU</span>
                <span className="text-neutral-900 font-semibold">{product.sku}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-neutral-100">
                <span className="text-neutral-400 font-medium">Brand</span>
                <span className="text-neutral-900 font-semibold">{product.brand}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-neutral-100">
                <span className="text-neutral-400 font-medium">Origin</span>
                <span className="text-neutral-900 font-semibold">Florence & Geneva</span>
              </div>
              {product.weight && (
                <div className="grid grid-cols-2 py-2 border-b border-neutral-100">
                  <span className="text-neutral-400 font-medium">Weight</span>
                  <span className="text-neutral-900 font-semibold">{product.weight} kg</span>
                </div>
              )}
              {product.length && product.width && product.height && (
                <div className="grid grid-cols-2 py-2 border-b border-neutral-100">
                  <span className="text-neutral-400 font-medium">Dimensions (L × W × H)</span>
                  <span className="text-neutral-900 font-semibold">
                    {product.length} × {product.width} × {product.height} cm
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Header with write review button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-neutral-950">Client Impressions</h3>
                  <p className="text-xs text-neutral-500">
                    Real testimonials submitted by verified owners.
                  </p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="p-8 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500">
                  Be the first to share your evaluation of this article.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 bg-neutral-50/70 rounded-xl border border-neutral-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">{rev.userName}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                            <Check className="w-3 h-3" />
                            Verified Owner
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400' : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 pt-12 border-t border-neutral-100">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-950 mb-6">
            Complementary Creations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-neutral-950">Write Your Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Overall Score
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Client Assessment
                </label>
                <textarea
                  required
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details on texture, weight, precision, or craftsmanship..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
