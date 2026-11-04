import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from '@/lib/compat-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  CameraIcon,
  PhotoIcon,
  CheckCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import ProductCard from '../components/ProductCard';
import { products as initialProducts } from '../data/mockData';
import { fetchProductById, postReview, type Product, type Review } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [zoomed, setZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Photo Frame Customization State
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [customPhotoName, setCustomPhotoName] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();

  useEffect(() => {
    if (!id) return;
    let active = true;
    const loadProduct = async () => {
      setLoading(true);
      const res = await fetchProductById(id);
      if (active) {
        setProduct(res.product);
        setReviewsList(res.reviews);
        setLoading(false);
      }
    };
    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-10 h-10 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading handcrafted artwork...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="font-playfair text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const discountedPrice = product.price - (product.price * product.discount) / 100;
  const relatedProducts = initialProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const wishlisted = isWishlisted(product.id);

  const isPhotoFrame = Boolean(
    product && (
      product.category?.toLowerCase() === 'photo frames' ||
      product.category?.toLowerCase().includes('frame') ||
      product.title?.toLowerCase().includes('frame') ||
      product.title?.toLowerCase().includes('photo') ||
      product.tags?.some((t) => t.toLowerCase().includes('frame'))
    )
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    setUploadingPhoto(true);
    setCustomPhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.9);
          setCustomPhoto(compressed);
          toast.success('Your photo has been uploaded for the frame! 📸');
        }
        setUploadingPhoto(false);
      };
      img.onerror = () => {
        setUploadingPhoto(false);
        toast.error('Could not load image. Try another file.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setCustomPhoto(null);
    setCustomPhotoName('');
    if (photoInputRef.current) photoInputRef.current.value = '';
    toast('Photo removed');
  };

  const handleAddToCart = () => {
    if (isPhotoFrame && !customPhoto) {
      toast.error('Please upload your photo for this frame first! 📸');
      photoInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      discount: product.discount,
      quantity,
      image: product.images[0],
      stock: product.stock,
      customImage: customPhoto || undefined,
      customNote: customNote.trim() || undefined,
      isPhotoFrame,
    });
    toast.success(`${quantity}x ${product.title} added to cart! 🛒`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please share your thoughts in the review comment');
      return;
    }
    const name = reviewerName.trim() || user?.name || 'Art Enthusiast';
    setSubmittingReview(true);
    try {
      const newRev = await postReview({
        productId: product.id,
        userName: name,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewsList((prev) => [newRev, ...prev]);
      setProduct((prev) => prev ? { ...prev, reviews: (prev.reviews || 0) + 1 } : prev);
      setReviewComment('');
      toast.success('Thank you! Your review has been published! ⭐');
    } catch {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-16 sm:pt-20 pb-24 lg:pb-12">
      <div className="container-max py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-purple-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-purple-600 transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{product.title}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div
              className="relative rounded-3xl overflow-hidden bg-white shadow-lg mb-4 cursor-zoom-in"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-96 lg:h-[500px] object-cover"
                style={
                  zoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transform: 'scale(1.8)',
                      }
                    : {}
                }
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && <span className="badge badge-accent">⭐ Featured</span>}
                {product.discount > 0 && (
                  <span className="badge badge-primary">-{product.discount}% OFF</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-purple-500 shadow-md scale-105' : 'border-transparent hover:border-purple-300'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-primary">{product.category}</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                <img src="/logo.png" alt="Artvibe by Charu" className="w-4 h-4 object-contain" />
                Artvibe by Charu Original
              </span>
            </div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarSolid
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-200">{product.rating}</span>
              <span className="text-gray-400 text-sm">({product.reviews} reviews)</span>
              <span className="text-gray-400 text-sm">• {product.sold} sold</span>
            </div>

            {/* Price */}
            <div className="mb-6 p-5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/50">
              <div className="flex items-end gap-4">
                <div>
                  <span className="text-4xl font-bold text-purple-700 dark:text-purple-400 font-playfair">
                    ₹{discountedPrice.toLocaleString('en-IN')}
                  </span>
                  {product.discount > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 line-through text-lg">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                        You save ₹{(product.price - discountedPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`ml-auto badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </span>
              </div>

              {/* Delivery info tag */}
              <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/40 flex items-center gap-2 text-xs">
                {discountedPrice >= 1000 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span>🚚</span>
                    <span>FREE Delivery Unlocked on this piece (Over ₹1,000)!</span>
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <span>🚚</span>
                    <span>Standard Delivery ₹99 • <strong>FREE on orders over ₹1,000</strong></span>
                  </span>
                )}
              </div>
            </div>

            {/* Custom Photo Upload Section for Photo Frame */}
            {isPhotoFrame && (
              <div
                ref={photoInputRef as any}
                className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-amber-50/60 dark:from-purple-950/40 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-800/70 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-purple-600 text-white shadow-xs">
                      <CameraIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">
                        Upload Photo for Frame
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        We will print & preserve your photo inside crystal epoxy resin
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-accent text-[10px] shrink-0">Customization</span>
                </div>

                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  id="frame-photo-upload"
                />

                {!customPhoto ? (
                  <label
                    htmlFor="frame-photo-upload"
                    className="border-2 border-dashed border-purple-300 hover:border-purple-500 dark:border-purple-700 dark:hover:border-purple-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/70 dark:bg-gray-800/60 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      {uploadingPhoto ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <PhotoIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      {uploadingPhoto ? 'Processing photo...' : 'Click to Upload Your Photo 📸'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Supports JPG, PNG, WEBP (High resolution recommended)
                    </span>
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700 flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-amber-300 shadow-sm shrink-0">
                        <img
                          src={customPhoto}
                          alt="Customer uploaded frame preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircleIcon className="w-4 h-4 shrink-0" />
                          <span>Photo Attached Successfully!</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {customPhotoName || 'frame-custom-photo.jpg'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label
                          htmlFor="frame-photo-upload"
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Replace
                        </label>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove photo"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dedication / Date inscription on frame (Optional):
                      </label>
                      <input
                        type="text"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="e.g. Rahul & Pooja • Forever & Always"
                        className="input-field text-xs py-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MinusIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="px-5 py-2 font-bold text-gray-800 dark:text-gray-100 text-lg min-w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-secondary flex-1 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-primary flex-1 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now ⚡
              </button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => {
                  toggleItem(product.id);
                  toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500 text-gray-600 dark:text-gray-300 hover:text-red-500 text-sm font-medium transition-all"
              >
                {wishlisted ? (
                  <HeartSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button
                onClick={() => {
                  navigator.share?.({ title: product.title, url: window.location.href });
                  toast('Link copied!');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 text-gray-600 dark:text-gray-300 hover:text-purple-600 text-sm font-medium transition-all"
              >
                <ShareIcon className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <TruckIcon className="w-5 h-5" />, text: 'Free Shipping', sub: 'Orders above ₹1,000' },
                { icon: <ShieldCheckIcon className="w-5 h-5" />, text: 'Quality Assured', sub: 'Premium resin grade' },
                { icon: '🎁', text: 'Gift Wrapping', sub: 'Available on request' },
                { icon: '🔄', text: '7-Day Returns', sub: 'Hassle-free policy' },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-purple-600 dark:text-purple-400 mt-0.5">
                    {typeof feat.icon === 'string' ? <span className="text-xl">{feat.icon}</span> : feat.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{feat.text}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">{feat.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-16 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {(['description', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'description' ? '📝 Description' : `⭐ Reviews (${reviewsList.length})`}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'description' ? (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-6">{product.description}</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Product Details</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex gap-2"><span className="text-purple-500">•</span> Handcrafted with premium epoxy resin</li>
                        <li className="flex gap-2"><span className="text-purple-500">•</span> UV-resistant and durable finish</li>
                        <li className="flex gap-2"><span className="text-purple-500">•</span> Each piece is unique — slight variations possible</li>
                        <li className="flex gap-2"><span className="text-purple-500">•</span> Category: {product.category}</li>
                        <li className="flex gap-2"><span className="text-purple-500">•</span> In Stock: {product.stock} units</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Care Instructions</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex gap-2"><span className="text-purple-500">•</span> Keep away from direct sunlight for extended periods</li>
                        <li className="flex gap-2"><span className="text-purple-500">•</span> Clean with soft dry cloth</li>
                        <li className="flex gap-2"><span className="text-purple-500">•</span> Avoid contact with harsh chemicals</li>
                        <li className="flex gap-2"><span className="text-purple-500">•</span> Handle with care to avoid dropping</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(product.tags || []).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Rating Summary */}
                  <div className="flex flex-col md:flex-row gap-8 mb-8 p-6 bg-purple-50 rounded-2xl">
                    <div className="text-center">
                      <div className="text-6xl font-bold font-playfair text-purple-700">{product.rating}</div>
                      <div className="flex justify-center my-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarSolid key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <div className="text-gray-500 text-sm">{reviewsList.length} reviews</div>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewsList.filter((r) => Math.round(r.rating) === star).length;
                        const pct = reviewsList.length ? Math.round((count / reviewsList.length) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500 w-4">{star}</span>
                            <StarSolid className="w-4 h-4 text-amber-400" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviewsList.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-base font-medium">No reviews yet for this masterpiece.</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to share your experience!</p>
                      </div>
                    ) : (
                      reviewsList.map((review) => {
                        const displayName = (review as any).userName || (review as any).user || 'Art Collector';
                        const avatar = (review as any).avatar || `https://images.unsplash.com/photo-${1534528741775 + (String(review.id).length % 50)}?w=100&auto=format&fit=crop&q=80`;
                        return (
                          <div key={review.id} className="border-b border-gray-100 pb-6">
                            <div className="flex items-start gap-4">
                              <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover border border-purple-100" />
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-semibold text-gray-800">{displayName}</span>
                                  <div className="flex">
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                      <StarSolid key={i} className="w-4 h-4 text-amber-400" />
                                    ))}
                                  </div>
                                  <span className="text-gray-400 text-xs">{review.date}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Write Review Form */}
                  <form onSubmit={handleReviewSubmit} className="mt-8 p-6 bg-gray-50 rounded-2xl">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ChatBubbleLeftIcon className="w-5 h-5 text-purple-500" />
                      Write a Verified Review
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Your Name</label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder={user?.name || 'e.g. Your Name'}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
                        <div className="flex items-center gap-1.5 h-10">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 focus:outline-none transition-transform hover:scale-125"
                            >
                              <StarSolid
                                className={`w-6 h-6 transition-colors ${
                                  (hoverRating || reviewRating) >= star ? 'text-amber-400' : 'text-gray-200'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs text-purple-700 font-semibold ml-2">
                            {reviewRating} of 5 Stars
                          </span>
                        </div>
                      </div>
                    </div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Your Feedback</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share details about craftsmanship, luster, packaging, and colors..."
                      className="input-field mb-4 resize-none"
                      rows={3}
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn-primary flex items-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Submitting Review...
                        </>
                      ) : (
                        'Submit Review ⭐'
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-30 lg:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 block leading-tight">Total Price</span>
          <span className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300 leading-tight">
            ₹{(discountedPrice * quantity).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-secondary text-xs py-2.5 px-3.5 font-semibold disabled:opacity-50"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="btn-primary text-xs py-2.5 px-4 font-semibold disabled:opacity-50 whitespace-nowrap"
          >
            Buy Now ⚡
          </button>
        </div>
      </div>
    </div>
  );
}
