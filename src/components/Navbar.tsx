import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from '@/lib/compat-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';

const navLinks = [
  { name: 'Home', path: '/' },
  {
    name: 'Shop',
    path: '/shop',
    children: [
      { name: 'All Products', path: '/shop' },
      { name: 'Wall Art', path: '/shop?category=Wall Art' },
      { name: 'Coasters', path: '/shop?category=Coasters' },
      { name: 'Keychains', path: '/shop?category=Keychains' },
      { name: 'Jewellery', path: '/shop?category=Jewellery' },
      { name: 'Photo Frames', path: '/shop?category=Photo Frames' },
      { name: 'Personalized Gifts', path: '/shop?category=Personalized Gifts' },
    ],
  },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Custom Order', path: '/custom-order' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('artvibe_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  const isTransparentNavbar = location.pathname === '/' && !isScrolled;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('artvibe_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('artvibe_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isTransparentNavbar
            ? 'bg-transparent text-white'
            : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-purple-100/60 dark:border-gray-800'
        }`}
      >
        <div className="container-max">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className={`p-1 rounded-xl transition-all duration-200 ${
                isTransparentNavbar ? 'bg-white/90 preserve-white shadow-sm backdrop-blur-sm' : 'bg-white/95 preserve-white shadow-xs'
              }`}>
                <img
                  src="/logo.png"
                  alt="Artvibe by Charu"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className={`font-playfair font-bold text-base sm:text-lg leading-tight ${
                  isTransparentNavbar ? 'text-white drop-shadow-sm' : 'text-gray-900 dark:text-white'
                }`}>
                  Artvibe
                </span>
                <span className={`text-[10px] sm:text-xs font-poppins font-semibold leading-tight tracking-widest uppercase ${
                  isTransparentNavbar ? 'text-amber-300' : 'text-purple-600 dark:text-purple-400'
                }`}>
                  by Charu
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      location.pathname === link.path
                        ? isTransparentNavbar
                          ? 'text-white bg-white/20 shadow-sm'
                          : 'text-purple-600 bg-purple-50 font-semibold dark:bg-purple-900/30 dark:text-purple-300'
                        : isTransparentNavbar
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    }`}
                  >
                    {link.name}
                    {link.children && <ChevronDownIcon className="w-3 h-3 mt-0.5" />}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-purple-100 dark:border-gray-700 overflow-hidden py-1.5"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.path}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className={`p-2 rounded-full transition-colors ${
                  isTransparentNavbar
                    ? 'text-white hover:bg-white/15'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
                aria-label="Search products"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </motion.button>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-colors hidden sm:flex ${
                  isTransparentNavbar
                    ? 'text-white hover:bg-white/15'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5" />}
              </motion.button>

              {/* Wishlist */}
              <Link to="/wishlist" aria-label="View Wishlist">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 rounded-full transition-colors ${
                    isTransparentNavbar
                      ? 'text-white hover:bg-white/15'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <HeartIcon className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </motion.div>
              </Link>

              {/* Cart */}
              <Link to="/cart" aria-label="View Shopping Cart">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 rounded-full transition-colors ${
                    isTransparentNavbar
                      ? 'text-white hover:bg-white/15'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 1.4 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-purple-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* User Menu (Desktop + Tablet) */}
              <div className="relative hidden sm:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
                    isTransparentNavbar
                      ? 'text-white hover:bg-white/15'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                  }`}
                  aria-label="User Account"
                >
                  {isAuthenticated && user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-purple-400" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-purple-100 dark:border-gray-700 overflow-hidden z-50"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-purple-50/50 dark:bg-gray-700/40">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Dashboard
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            to="/track-order"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Track Package
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/30"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              ⚡ Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-700 transition-colors"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 font-medium"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center px-4 py-3 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 border-t border-gray-100 dark:border-gray-700"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Create Account
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Hamburger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-full transition-colors ${
                  isTransparentNavbar
                    ? 'text-white hover:bg-white/15'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
                aria-label="Open Navigation Menu"
              >
                <Bars3Icon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-white/90 preserve-white shadow-xs border border-purple-100/60 dark:border-gray-700">
                    <img
                      src="/logo.png"
                      alt="Artvibe by Charu"
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-playfair font-bold text-base text-gray-900 dark:text-white leading-tight">
                      Artvibe
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase">
                      by Charu
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Mobile Search Form */}
                <form onSubmit={handleSearch} className="relative">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resin art..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </form>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-gray-800 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                  >
                    <HeartIcon className="w-4 h-4 text-red-500" />
                    <span>Wishlist ({wishlistCount})</span>
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-gray-800 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                  >
                    <ShoppingCartIcon className="w-4 h-4 text-purple-600" />
                    <span>Cart ({cartCount})</span>
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <div key={link.name} className="border-b border-gray-50 dark:border-gray-800">
                      {link.children ? (
                        <div>
                          <button
                            onClick={() => setMobileShopOpen(!mobileShopOpen)}
                            className="w-full flex items-center justify-between py-3 text-left font-medium text-gray-800 dark:text-gray-200 hover:text-purple-600 text-base"
                          >
                            <span>{link.name}</span>
                            <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${mobileShopOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {mobileShopOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-3 pb-2 space-y-1 overflow-hidden"
                              >
                                {link.children.map((child) => (
                                  <Link
                                    key={child.name}
                                    to={child.path}
                                    className="block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    • {child.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          to={link.path}
                          className={`block py-3 font-medium text-base transition-colors ${
                            location.pathname === link.path
                              ? 'text-purple-600 dark:text-purple-400 font-semibold'
                              : 'text-gray-800 dark:text-gray-200 hover:text-purple-600'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}

                  <Link
                    to="/track-order"
                    className="flex items-center gap-2 py-3 text-gray-800 dark:text-gray-200 hover:text-purple-600 text-base font-medium border-b border-gray-50 dark:border-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ClockIcon className="w-5 h-5 text-purple-500" />
                    <span>Track Order</span>
                  </Link>
                </div>

                {/* Dark Mode in Drawer */}
                <div className="flex items-center justify-between pt-3 pb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Theme</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                  >
                    {darkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Drawer Footer / Auth */}
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-gray-800 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-secondary text-xs py-2 px-3 justify-center text-center w-full"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-secondary text-xs py-2 px-3 justify-center text-center w-full"
                      >
                        Orders
                      </Link>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-center text-xs font-semibold text-purple-600 py-1.5 bg-purple-100/60 rounded-xl"
                      >
                        ⚡ Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-center text-xs font-semibold text-red-500 py-2 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      to="/login"
                      className="btn-secondary text-center text-sm py-2.5 justify-center w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary text-center text-sm py-2.5 justify-center w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 sm:pt-32 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 shadow-2xl border border-purple-100 dark:border-gray-700"
            >
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 text-purple-500" />
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search art, clocks, coasters, jewellery..."
                  className="w-full pl-12 sm:pl-14 pr-12 py-3.5 sm:py-4 text-base sm:text-lg rounded-2xl border-2 border-purple-200 dark:border-gray-700 focus:border-purple-500 dark:bg-gray-900 dark:text-white outline-none font-poppins"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"
                  aria-label="Close search"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Popular:</span>
                {['Ocean Clock', 'Galaxy Coasters', 'Botanical Pendant', 'Geode Wall Art'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(tag)}`);
                      setSearchOpen(false);
                    }}
                    className="px-2.5 py-1 bg-purple-50 dark:bg-gray-700 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-3 text-center">
                Press Enter to search or Escape to close
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for desktop user dropdown */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}