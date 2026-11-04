import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from '@/lib/compat-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/mockData';
import { fetchProducts, type Product } from '../services/api';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'best-selling', label: 'Best Selling' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 9;

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    if (cat && cat !== selectedCategory) setSelectedCategory(cat);
    if (search !== null && search !== searchQuery) setSearchQuery(search);
  }, [searchParams]);

  // Load products dynamically from API
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      const data = await fetchProducts({
        category: selectedCategory,
        search: searchQuery,
        sort: sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
      if (active) {
        setProductsList(data);
        setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const allCategories = ['All', ...categories.map((c) => c.name)];

  const totalPages = Math.ceil(productsList.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    return productsList.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    );
  }, [productsList, currentPage, productsPerPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 text-gray-800 dark:text-gray-100">
      {/* Page Header */}
      <div className="bg-gradient-hero py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1615869442320-fd02a129c77c?w=1600"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block bg-white/95 px-4 py-2 rounded-2xl shadow-xl mb-4">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain mx-auto" />
            </div>
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-white mb-4">
              Our Collection
            </h1>
            <p className="text-purple-200 text-lg max-w-xl mx-auto">
              Discover handcrafted resin masterpieces — each piece is unique and made with love.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-max py-10">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search products, categories, tags..."
              className="input-field pl-12 py-3"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field appearance-none pr-9 py-3 cursor-pointer text-sm font-medium w-full sm:min-w-44"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all whitespace-nowrap shrink-0 ${
                showFilters ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* View Mode */}
            <div className="flex rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 sm:p-3 transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 sm:p-3 transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                aria-label="List view"
              >
                <ListBulletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-purple-600 dark:hover:text-purple-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                    Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Min</label>
                        <input
                          type="number"
                          value={priceRange[0]}
                          min={0}
                          max={priceRange[1]}
                          onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                          className="input-field text-sm py-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Max</label>
                        <input
                          type="number"
                          value={priceRange[1]}
                          min={priceRange[0]}
                          max={50000}
                          onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                          className="input-field text-sm py-2"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[[0, 500], [500, 2000], [2000, 5000], [5000, 10000]].map(([min, max]) => (
                        <button
                          key={`${min}-${max}`}
                          onClick={() => setPriceRange([min, max])}
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${
                            priceRange[0] === min && priceRange[1] === max
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-200 text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          ₹{min.toLocaleString()} - ₹{max.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">{productsList.length} products found</span>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 10000]);
                    setSearchQuery('');
                    setSortBy('featured');
                    setCurrentPage(1);
                  }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Chips (always visible) */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:text-purple-600 dark:hover:text-purple-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count & Status */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 text-sm flex items-center gap-2">
            {loading && <ArrowPathIcon className="w-4 h-4 animate-spin text-purple-600" />}
            Showing <span className="font-semibold text-gray-900">{paginatedProducts.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{productsList.length}</span> live products
            {selectedCategory !== 'All' && (
              <span> in <span className="text-purple-600 font-medium">{selectedCategory}</span></span>
            )}
          </p>
          {searchQuery && (
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
              <span className="text-sm text-purple-600">"{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')}>
                <XMarkIcon className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="w-full h-56 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && paginatedProducts.length > 0 ? (
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            <AnimatePresence mode="popLayout">
              {paginatedProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {viewMode === 'grid' ? (
                    <ProductCard product={product} index={i} />
                  ) : (
                    // Responsive List view
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 p-4 hover:shadow-lg transition-all group">
                      <Link to={`/product/${product.id}`} className="shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full sm:w-44 h-48 sm:h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider">{product.category}</span>
                            {product.discount > 0 && (
                              <span className="badge badge-primary text-[10px]">-{product.discount}% OFF</span>
                            )}
                          </div>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base sm:text-lg mt-1 mb-1.5 hover:text-purple-600 transition-colors">
                              {product.title}
                            </h3>
                          </Link>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed font-poppins">{product.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-400">
                              ₹{(product.price - (product.price * product.discount) / 100).toLocaleString('en-IN')}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 ml-2">⭐ {product.rating} ({product.reviews})</span>
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : !loading ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🎨</div>
            <h3 className="font-playfair text-2xl font-bold text-gray-800 mb-3">No Products Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setPriceRange([0, 10000]);
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : null}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-medium transition-all ${
                  currentPage === page
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'border border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
