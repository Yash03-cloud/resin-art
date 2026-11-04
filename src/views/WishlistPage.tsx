import { Link } from '@/lib/compat-router';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { products } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const wishlistProducts = products.filter((p) => items.includes(p.id));

  const moveAllToCart = () => {
    wishlistProducts.forEach((product) => {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        discount: product.discount,
        quantity: 1,
        image: product.images[0],
        stock: product.stock,
      });
    });
    clearWishlist();
    toast.success(`${wishlistProducts.length} items moved to cart! 🛒`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-4"
        >
          <div className="inline-block bg-white/95 preserve-white p-3 rounded-3xl shadow-sm border border-purple-100 mb-6">
            <img src="/logo.png" alt="Artvibe by Charu" className="h-14 sm:h-16 w-auto object-contain mx-auto" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
            Save your favourite pieces here to come back to them later!
          </p>
          <Link to="/shop" className="btn-primary text-lg px-10 py-4">
            Explore Products ✨
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20">
      <div className="container-max py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            My Wishlist
            <span className="ml-2 text-sm sm:text-base font-poppins font-normal text-gray-400">({items.length} items)</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={moveAllToCart}
              className="btn-primary text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-6"
            >
              🛒 Move All to Cart
            </button>
            <button
              onClick={() => { clearWishlist(); toast('Wishlist cleared'); }}
              className="flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1"
            >
              <TrashIcon className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
