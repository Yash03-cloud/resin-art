import { useState } from 'react';
import { Link } from '@/lib/compat-router';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  rating: number;
  reviews: number;
  images: string[];
  featured?: boolean;
  sold?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();

  const discountedPrice = product.price - (product.price * product.discount) / 100;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      discount: product.discount,
      quantity: 1,
      image: product.images[0],
      stock: product.stock,
    });
    toast.success(`${product.title} added to cart!`, {
      style: { fontFamily: 'Poppins, sans-serif' },
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem(product.id);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️', {
      style: { fontFamily: 'Poppins, sans-serif' },
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating);
      const partial = !filled && i < rating;
      return (
        <span key={i} className={filled || partial ? 'star-filled' : 'star-empty'}>
          {filled ? (
            <StarSolid className="w-3.5 h-3.5 inline" />
          ) : (
            <StarIcon className="w-3.5 h-3.5 inline" />
          )}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="product-card group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image Container */}
          <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 h-52 sm:h-60 md:h-64">
            {/* Shimmer Loading */}
            {!imageLoaded && <div className="shimmer absolute inset-0" />}

            <img
              src={hovered && product.images[1] ? product.images[1] : product.images[0]}
              alt={product.title}
              className="product-card-img h-full w-full object-cover"
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />

            {/* Badges on Top of Image */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 sm:gap-1.5 z-10 pointer-events-none">
              {product.featured && (
                <span className="badge badge-accent text-[10px] sm:text-xs shadow-xs">⭐ Featured</span>
              )}
              {product.discount > 0 && (
                <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md tracking-wide">
                  -{product.discount}% OFF
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="badge badge-danger text-[10px] sm:text-xs shadow-xs">Only {product.stock} left</span>
              )}
              {product.stock === 0 && (
                <span className="badge badge-danger text-[10px] sm:text-xs shadow-xs">Out of Stock</span>
              )}
            </div>

            {/* Desktop Action Buttons (Hover) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 15 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex absolute bottom-3 left-3 right-3 gap-2"
            >
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                <ShoppingCartIcon className="w-4 h-4" />
                Add to Cart
              </button>
              <Link
                to={`/product/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow transition-colors"
                aria-label="Quick View"
              >
                <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-200" />
              </Link>
            </motion.div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="absolute top-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full flex items-center justify-center shadow transition-all hover:scale-110 active:scale-95"
            >
              {wishlisted ? (
                <HeartSolid className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Product Info */}
          <div className="p-3.5 sm:p-4 flex flex-col flex-1">
            <span className="text-[11px] sm:text-xs text-purple-600 font-semibold uppercase tracking-wide">
              {product.category}
            </span>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mt-1 mb-1.5 line-clamp-2 text-xs sm:text-sm leading-snug font-poppins">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="text-[11px] sm:text-xs text-gray-500">({product.reviews})</span>
              {product.sold && (
                <span className="text-[10px] sm:text-xs text-gray-400 ml-auto">{product.sold} sold</span>
              )}
            </div>

            {/* Price & Mobile Add */}
            <div className="flex items-center justify-between gap-2 mt-auto pt-1">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-400">
                    ₹{discountedPrice.toLocaleString('en-IN')}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.2 rounded-md">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                {discountedPrice >= 1000 && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                    <span>🚚</span> Free Delivery
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                aria-label="Add to cart"
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm active:scale-95 transition-all disabled:opacity-40"
              >
                <ShoppingCartIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
