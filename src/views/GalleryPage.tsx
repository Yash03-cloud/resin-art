import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { galleryItems } from '../data/mockData';

const galleryCategories = ['All', 'Home Decor', 'Jewellery', 'Customized Orders'];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null);

  const filtered = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20">
      {/* Header */}
      <div className="bg-gradient-hero py-14 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-block bg-white/95 px-4 py-2 rounded-2xl shadow-xl mb-4">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain mx-auto" />
            </div>
            <h1 className="font-playfair text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4">Art Gallery</h1>
            <p className="text-purple-200 text-sm sm:text-lg md:text-xl max-w-xl mx-auto">
              Browse our curated collection of handcrafted resin masterpieces
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-max py-8 sm:py-12">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 sm:flex-wrap sm:justify-center no-scrollbar">
          {galleryCategories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Masonry Grid */}
        <motion.div layout className="masonry-grid">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="relative group overflow-hidden rounded-2xl cursor-pointer bg-gray-200"
                style={{ breakInside: 'avoid', marginBottom: '1rem' }}
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading={i < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ minHeight: i % 3 === 0 ? '280px' : '200px', maxHeight: '380px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4">
                    <span className="text-[10px] sm:text-xs text-purple-300 font-semibold uppercase tracking-wide">{item.category}</span>
                    <h3 className="text-white font-semibold text-xs sm:text-sm mt-0.5">{item.title}</h3>
                  </div>
                </div>

                {/* Like Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}
                  aria-label="Like item"
                  className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow"
                >
                  {likedItems.has(item.id) ? (
                    <HeartSolid className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {/* Like Count */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  ❤️ {item.likes + (likedItems.has(item.id) ? 1 : 0)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Instagram Callout */}
        <div className="mt-12 text-center bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 border border-pink-200/60 dark:border-pink-800/40 rounded-3xl p-8 sm:p-10">
          <span className="badge badge-primary mb-3">Behind The Scenes 🎨</span>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Watch the Making Process on Instagram
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto text-sm sm:text-base mb-6">
            We share daily pouring reels, process videos, custom art reveals, and new workshop drops on <span className="font-semibold text-pink-600 dark:text-pink-400">@artvibe_by_charu</span>!
          </p>
          <a
            href="https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base px-6 py-3"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Follow @artvibe_by_charu on Instagram</span>
          </a>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full max-h-96 object-cover"
              />
              <div className="p-6">
                <span className="badge badge-primary mb-2">{selectedItem.category}</span>
                <h3 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-3">{selectedItem.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <HeartSolid className="w-5 h-5 text-red-400" />
                    <span>{selectedItem.likes} likes</span>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm py-2 px-3 inline-flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4 text-pink-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span>Instagram</span>
                    </a>
                    <button
                      onClick={() => toggleLike(selectedItem.id)}
                      className="btn-secondary text-sm py-2.5 px-4"
                    >
                      {likedItems.has(selectedItem.id) ? '❤️ Liked' : '🤍 Like'}
                    </button>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="btn-primary text-sm py-2.5 px-4"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
