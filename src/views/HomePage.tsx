import { useState, useEffect } from 'react';
import { Link } from '@/lib/compat-router';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useInView } from 'react-intersection-observer';
import {
  ArrowRightIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  PhoneArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import ProductCard from '../components/ProductCard';
import { categories, testimonials, galleryItems, products as fallbackProducts } from '../data/mockData';
import { fetchProducts, type Product } from '../services/api';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const heroSlides = [
  {
    id: 1,
    title: 'Handcrafted Resin Art',
    subtitle: 'Where Art Meets Epoxy',
    description: 'Discover one-of-a-kind resin art pieces that transform your living space into an extraordinary gallery.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=90',
    cta: 'Shop Now',
    ctaLink: '/shop',
    accent: '#6B46C1',
  },
  {
    id: 2,
    title: 'Custom Resin Orders',
    subtitle: 'Your Vision, Our Craft',
    description: 'Have something special in mind? We create fully personalized resin artwork tailored just for you.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=90',
    cta: 'Custom Order',
    ctaLink: '/custom-order',
    accent: '#F59E0B',
  },
  {
    id: 3,
    title: 'Luxury Resin Jewellery',
    subtitle: 'Wearable Masterpieces',
    description: 'Elegant jewellery pieces with real preserved flowers and gems, handcrafted with precision and care.',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1920&q=90',
    cta: 'View Collection',
    ctaLink: '/shop?category=Jewellery',
    accent: '#A78BFA',
  },
];

const features = [
  { icon: <TruckIcon className="w-6 h-6" />, title: 'Free Shipping', desc: 'On orders above ₹1,000' },
  { icon: <ShieldCheckIcon className="w-6 h-6" />, title: 'Quality Assured', desc: 'Premium grade epoxy resin' },
  { icon: <CurrencyRupeeIcon className="w-6 h-6" />, title: 'Cash on Delivery', desc: '100% Safe Pay-on-Delivery (COD)' },
  { icon: <PhoneArrowUpRightIcon className="w-6 h-6" />, title: '24/7 Support', desc: 'We\'re always here for you' },
];

const StatNumber = ({ value, label }: { value: string; label: string }) => {
  const { ref, inView } = useInView({ triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-playfair text-white mb-1">{value}</div>
      <div className="text-purple-200 text-xs sm:text-sm font-poppins">{label}</div>
    </motion.div>
  );
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Immediately initialize with frontend cache/fallback for instant page load
  const [homeProducts, setHomeProducts] = useState<Product[]>(() => fallbackProducts as unknown as Product[]);

  // Refresh in background from backend MongoDB
  useEffect(() => {
    let active = true;
    fetchProducts().then((res) => {
      if (active && Array.isArray(res) && res.length > 0) {
        setHomeProducts(res);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const featuredProducts = homeProducts.filter((p) => p.featured);
  const bestSellers = [...homeProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 6);

  // Dynamic category product count & display image from live database
  const getCategoryCount = (categoryName: string) => {
    const target = categoryName.trim().toLowerCase();
    return homeProducts.filter((p) => {
      const cat = (p.category || '').trim().toLowerCase();
      return cat === target || cat.includes(target) || target.includes(cat);
    }).length;
  };

  const getCategoryDisplayImage = (cat: typeof categories[0]) => {
    const target = cat.name.trim().toLowerCase();
    const matchingProduct = homeProducts.find(
      (p) =>
        p.images?.[0] &&
        ((p.category || '').trim().toLowerCase() === target ||
          (p.category || '').trim().toLowerCase().includes(target))
    );
    return matchingProduct?.images?.[0] || cat.image;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B14] text-gray-800 dark:text-gray-100 transition-colors">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[580px] sm:min-h-[640px] lg:h-screen overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="h-full"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              {/* Background Image */}
              <motion.div
                style={{ y: heroY }}
                className="absolute inset-0"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
              </motion.div>

              {/* Hero Content */}
              <motion.div
                style={{ opacity: heroOpacity }}
                className="relative h-full min-h-[580px] sm:min-h-[640px] lg:min-h-0 flex items-center pt-24 pb-16 lg:py-0"
              >
                <div className="container-max w-full">
                  <div className="max-w-2xl">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="flex flex-wrap items-center gap-3 mb-4 sm:mb-6"
                    >
                      <div className="bg-white/95 px-3 py-1 rounded-xl shadow-lg border border-white/40 flex items-center gap-2">
                        <img src="/logo.png" alt="Artvibe by Charu" className="h-7 sm:h-8 w-auto object-contain" />
                      </div>
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs sm:text-sm font-poppins">
                        <SparklesIcon className="w-4 h-4 text-amber-400" />
                        {slide.subtitle}
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="font-playfair text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6"
                    >
                      {slide.title}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-white/80 text-sm sm:text-base md:text-xl mb-6 sm:mb-10 leading-relaxed font-poppins"
                    >
                      {slide.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                    >
                      <Link to={slide.ctaLink} className="btn-primary text-sm sm:text-base px-7 py-3.5 sm:px-8 sm:py-4 justify-center">
                        {slide.cta}
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                      <Link to="/custom-order" className="btn-secondary text-sm sm:text-base px-7 py-3.5 sm:px-8 sm:py-4 border-white/50 text-white hover:bg-white hover:text-purple-700 justify-center">
                        Custom Order ✨
                      </Link>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="flex flex-wrap gap-3 sm:gap-6 mt-6 sm:mt-10"
                    >
                      {['⭐ 4.9 Rating', '🎨 350+ Products', '🚚 Free Delivery', '🔒 Secure Payment'].map((badge) => (
                        <span key={badge} className="text-white/75 text-xs sm:text-sm font-poppins bg-black/20 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full">{badge}</span>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center pt-2">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES BAR ===== */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-6 sm:py-8">
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl hover:bg-purple-50 dark:hover:bg-gray-800/80 transition-colors"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white text-sm">{feature.title}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{feature.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED CATEGORIES ===== */}
      <section className="section-padding bg-gray-50 dark:bg-[#0F0F1A]">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge badge-primary mb-4">Our Collections</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Categories
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
              From wall art to wearable jewellery — discover our full range of handcrafted resin creations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {categories.map((cat, i) => {
              const count = getCategoryCount(cat.name);
              const displayImage = getCategoryDisplayImage(cat);

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative"
                >
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="block relative h-72 sm:h-80 md:h-[340px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-purple-500/20 border border-purple-100/80 dark:border-white/10 transition-all duration-500 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {/* Background Imagery with Smooth Zoom */}
                    <img
                      src={displayImage}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Gradient Overlay for High Contrast & Visual Depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20 group-hover:from-black/90 group-hover:via-purple-950/40 transition-colors duration-500" />

                    {/* Top Bar: Icon Badge + Dynamic Product Count Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="w-11 h-11 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                        {cat.icon}
                      </span>

                      {/* Dynamic Product Count Badge */}
                      {count > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50 border border-white/25 backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{count} {count === 1 ? 'Product' : 'Products'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/55 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-sm">
                          <span>Custom Orders Open ✨</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Card Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end">
                      <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-1.5 group-hover:text-purple-200 transition-colors drop-shadow-sm">
                        {cat.name}
                      </h3>
                      <p className="text-gray-200/90 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4 font-light">
                        {cat.description}
                      </p>

                      {/* Interactive Footer Pill */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/15 text-xs">
                        <span className="text-purple-200 font-medium">
                          {count > 0 ? `${count} ${count === 1 ? 'Design In Studio' : 'Designs In Studio'}` : 'Handcrafted on Demand'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-semibold px-3.5 py-1.5 rounded-xl bg-white/20 group-hover:bg-white text-white group-hover:text-gray-900 backdrop-blur-md border border-white/30 transition-all duration-300 shadow-xs">
                          <span>Explore</span>
                          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section-padding bg-white dark:bg-[#0B0B14]">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12"
          >
            <div>
              <span className="badge badge-accent mb-3">Handpicked for You</span>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Featured Products
              </h2>
            </div>
            <Link to="/shop" className="btn-secondary mt-6 md:mt-0">
              View All Products
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>

          {featuredProducts.length === 0 ? (
            <div className="bg-purple-50/70 dark:bg-purple-950/30 rounded-3xl p-10 text-center border border-purple-100 dark:border-purple-800/50 max-w-xl mx-auto">
              <span className="text-4xl mb-3 block">🎨</span>
              <h3 className="font-playfair text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                New Studio Drops Launching Soon
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
                Demo products have been cleared! Add products directly in the Admin Panel or request a custom handcrafted commission via WhatsApp.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/custom-order" className="btn-primary text-xs py-2.5 px-5">
                  Request Custom Artwork ✨
                </Link>
                <a
                  href="https://wa.me/917218700468?text=Hello! I'm interested in ordering custom resin art."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-2.5 px-5 flex items-center gap-1.5"
                >
                  <span>WhatsApp: +91 7218700468</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== ABOUT ARTIST BANNER ===== */}
      <section className="section-padding bg-gray-900 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-purple-600 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-500 blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container-max relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="badge badge-accent mb-6">Our Story</span>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Crafted with Passion,
                <span className="text-gradient block">Made with Love</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                I'm Charu, the artist and founder of Artvibe by Charu. My journey began in 2018 when I discovered the mesmerizing world of epoxy resin art. What started as a hobby in my studio has grown into a passion-driven brand creating bespoke resin artwork and decor for homes across India.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Every piece I create carries a piece of my soul. I source the finest materials, experiment with countless color combinations, and pour hours of dedication into each artwork to ensure it's truly unique.
              </p>
              <Link to="/about" className="btn-primary">
                Read My Story
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 border-2 border-purple-400/30">
                <img
                  src="/charu.jpg"
                  alt="Charu in her resin art studio"
                  className="w-full h-96 sm:h-[450px] object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/70 via-transparent to-transparent" />
              </div>
              {/* Floating Stats Card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -bottom-6 -left-6 glass-dark rounded-2xl p-4 sm:p-5 shadow-xl border border-purple-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shadow shrink-0">
                    <img src="/charu.jpg" alt="Charu" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Charu • Master Artisan</div>
                    <div className="text-amber-300 text-xs">350+ Handcrafted Treasures</div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
                className="absolute -top-6 -right-6 glass-dark rounded-2xl p-5 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                    <StarSolid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">4.9★</div>
                    <div className="text-gray-400 text-xs">Average Rating</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-[#0B0B14]">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge badge-primary mb-4">Most Loved</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Best Sellers
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Our most popular pieces — loved and cherished by hundreds of happy customers.
            </p>
          </motion.div>

          {bestSellers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              <p>Explore our full range in the catalog or design your dream artwork with our resin artist.</p>
              <Link to="/shop" className="btn-primary text-xs py-2 px-5 mt-4 inline-block">Browse Catalog 🎨</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellers.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-20 bg-gradient-primary">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: '1,200+', label: 'Happy Customers' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '48+', label: 'Unique Products' },
              { value: '6+', label: 'Years of Craft' },
            ].map((stat) => (
              <StatNumber key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="section-padding bg-white dark:bg-[#0B0B14]">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="badge badge-accent mb-4">Customer Love</span>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                What Our Customers Say
              </h2>
            </motion.div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-12"
            >
              {testimonials.map((testimonial, i) => (
                <SwiperSlide key={testimonial.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-7 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-100 dark:hover:border-purple-600 transition-all h-full"
                  >
                    {/* Stars */}
                    <div className="flex mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <StarSolid key={i} className="w-5 h-5 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 italic line-clamp-3">
                      "{testimonial.comment}"
                    </p>

                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 dark:border-purple-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white text-sm">{testimonial.name}</div>
                        <div className="text-gray-400 dark:text-gray-400 text-xs">{testimonial.location}</div>
                      </div>
                      <div className="ml-auto">
                        <span className="badge badge-primary text-xs">{testimonial.product.split(' ')[0]}</span>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* ===== INSTAGRAM GALLERY ===== */}
      <section className="section-padding bg-gray-50 dark:bg-[#0F0F1A]">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <a
              href="https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <span className="badge badge-primary mb-4 hover:scale-105 transition-transform cursor-pointer">
                📸 @artvibe_by_charu
              </span>
            </a>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Follow Our Journey
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Get inspired by our latest resin art creations on Instagram. Tag us in your photos!
            </p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {galleryItems.slice(0, 12).map((item, i) => (
              <motion.a
                key={item.id}
                href="https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative group aspect-square overflow-hidden rounded-2xl block"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/60 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-2">
                    <div className="font-semibold text-xs mb-1">{item.title}</div>
                    <div className="text-xs text-purple-200">❤️ {item.likes}</div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span>Follow @artvibe_by_charu on Instagram</span>
              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="section-padding bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1600"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-max relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto mb-6" />
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-white mb-6">
              Have Something Special In Mind?
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              Commission a fully personalized resin artwork. Share your vision and we'll bring it to life.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/custom-order" className="btn-accent text-lg px-10 py-4">
                Request Custom Order ✨
              </Link>
              <a
                href="https://wa.me/917218700468?text=I'd like to place a custom resin art order!"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-white/50 text-white hover:bg-white hover:text-green-700 text-lg px-10 py-4"
              >
                WhatsApp Us 💬
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
