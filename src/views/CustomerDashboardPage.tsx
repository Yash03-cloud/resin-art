import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/lib/compat-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  HeartIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { fetchOrders } from '../services/api';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'orders' | 'addresses' | 'profile';

const initialCustomerOrders: any[] = [];

const statusStyles: Record<string, { bg: string; text: string }> = {
  'Delivered': { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', text: 'Delivered' },
  'Shipped': { bg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', text: 'Shipped' },
  'Out For Delivery': { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', text: 'Out For Delivery' },
  'Creating Artwork': { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', text: 'Art in Progress' },
  'Processing': { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', text: 'Processing' },
  'Confirmed': { bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', text: 'Confirmed' },
  'Pending': { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', text: 'Pending' },
};

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [ordersList, setOrdersList] = useState<any[]>(initialCustomerOrders);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { user, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const cartCount = useCartStore((s) => s.getItemCount());
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const orders = await fetchOrders(user?.email);
        if (active) {
          setOrdersList(orders || []);
        }
      } catch (e) {
        console.warn('Could not load orders from API:', e);
      } finally {
        if (active) setLoadingOrders(false);
      }
    };
    loadOrders();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const currentUserName = user?.name || 'Guest Art Lover';
  const currentUserEmail = user?.email || 'customer@resinart.studio';
  const activeShipmentsCount = ordersList.filter((o) => o.status !== 'Delivered').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 sm:pt-20">
      <div className="container-max py-6 sm:py-10">
        {/* Welcome Header */}
        <div className="bg-gradient-hero rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl sm:text-2xl font-bold font-playfair shadow-glow">
                {user?.avatar ? (
                  <img src={user.avatar} alt={currentUserName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  currentUserName.charAt(0)
                )}
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-purple-200 text-xs font-medium mb-1">
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                  Valued Collector
                </span>
                <h1 className="font-playfair text-2xl sm:text-3xl font-bold leading-tight">
                  Welcome back, {currentUserName.split(' ')[0]}!
                </h1>
                <p className="text-purple-200 text-xs sm:text-sm mt-0.5">{currentUserEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <div className="hidden md:flex bg-white/95 px-2.5 py-1 rounded-xl shadow-sm border border-white/40 items-center">
                <img src="/logo.png" alt="Artvibe by Charu" className="h-8 w-auto object-contain" />
              </div>
              <Link
                to="/custom-order"
                className="btn-accent text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-5 flex-1 sm:flex-initial text-center justify-center"
              >
                Custom Order ✨
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 text-xs rounded-full border border-white/30 hover:bg-white/10 text-white transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 sm:inline sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar border-b border-gray-200 dark:border-gray-800">
          {[
            { id: 'overview', label: 'Overview', icon: <SparklesIcon className="w-4 h-4" /> },
            { id: 'orders', label: 'My Orders', icon: <ShoppingBagIcon className="w-4 h-4" />, badge: ordersList.length },
            { id: 'addresses', label: 'Saved Address', icon: <MapPinIcon className="w-4 h-4" /> },
            { id: 'profile', label: 'Account Details', icon: <UserIcon className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Stat Highlights */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">Total Orders</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <ShoppingBagIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900 dark:text-white">
                    {ordersList.length}
                  </div>
                  <span className="text-[11px] text-green-600 font-medium mt-1 inline-block">
                    {activeShipmentsCount} active shipment{activeShipmentsCount === 1 ? '' : 's'}
                  </span>
                </div>

                <Link
                  to="/wishlist"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium group-hover:text-purple-600 transition-colors">Wishlist</span>
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                      <HeartIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900 dark:text-white">
                    {wishlistCount}
                  </div>
                  <span className="text-[11px] text-purple-600 font-medium mt-1 inline-flex items-center gap-1">
                    View saved items →
                  </span>
                </Link>

                <Link
                  to="/cart"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium group-hover:text-purple-600 transition-colors">Cart Items</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                      <TruckIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900 dark:text-white">
                    {cartCount}
                  </div>
                  <span className="text-[11px] text-purple-600 font-medium mt-1 inline-flex items-center gap-1">
                    Checkout items →
                  </span>
                </Link>

                <Link
                  to="/track-order"
                  className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-glow hover:opacity-95 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-purple-200 font-medium">Order Tracker</span>
                    <TruckIcon className="w-5 h-5 text-purple-200" />
                  </div>
                  <div className="text-base sm:text-lg font-bold font-playfair mt-1">
                    Live Tracking
                  </div>
                  <span className="text-[11px] text-purple-200 mt-2 inline-flex items-center gap-1">
                    Track by Order ID →
                  </span>
                </Link>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-playfair text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Track and manage your handcrafted purchases</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs sm:text-sm text-purple-600 font-semibold hover:underline"
                  >
                    View All ({ordersList.length})
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <ArrowPathIcon className="w-5 h-5 animate-spin text-purple-600" />
                    Loading your orders...
                  </div>
                ) : ordersList.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p className="text-sm">No orders placed yet. Start exploring our handcrafted collection!</p>
                    <Link to="/shop" className="btn-primary text-xs py-2 px-4 mt-3 inline-block">
                      Browse Shop
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersList.slice(0, 3).map((order) => {
                      const badge = statusStyles[order.status] || { bg: 'bg-gray-100 text-gray-700', text: order.status };
                      const image = order.image || (order.items && order.items[0]?.image) || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
                      const productTitle = order.product || (order.items && order.items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ')) || 'Handcrafted Resin Piece';
                      return (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 transition-all"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={image}
                              alt={productTitle}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-purple-700 dark:text-purple-400">{order.id}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg}`}>
                                  {badge.text}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base mt-0.5 line-clamp-1">
                                {productTitle}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">{order.date} • ₹{Number(order.amount).toLocaleString('en-IN')}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                            <Link
                              to={`/track-order?id=${order.id}`}
                              className="btn-secondary text-xs py-2 px-3.5 flex-1 sm:flex-initial text-center justify-center"
                            >
                              Track Package
                            </Link>
                            <Link
                              to={`/track-order?id=${order.id}`}
                              className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <ChevronRightIcon className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Inspiration Banners */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:bg-gray-800 p-6 rounded-3xl border border-purple-100 dark:border-gray-700 flex flex-col justify-between">
                  <div>
                    <span className="badge badge-primary text-xs mb-2">Exclusive Bespoke</span>
                    <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">Commission Custom Resin Art</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Choose your colors, dimensions, geodes, preserved botanicals, and wood base. Handcrafted exclusively for your sanctuary.
                    </p>
                  </div>
                  <Link to="/custom-order" className="btn-primary text-xs py-2.5 px-4 self-start">
                    Submit Idea ✨
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:bg-gray-800 p-6 rounded-3xl border border-amber-100 dark:border-gray-700 flex flex-col justify-between">
                  <div>
                    <span className="badge badge-accent text-xs mb-2">New Drops</span>
                    <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">Explore Latest Collection</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Freshly cured ocean wall pieces, coaster sets, and crystal-clear botanical jewellery ready for fast shipment.
                    </p>
                  </div>
                  <Link to="/shop" className="btn-accent text-xs py-2.5 px-4 self-start">
                    Browse Catalog 🎨
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">Order History</h2>
                  <p className="text-xs sm:text-sm text-gray-500">All your handcrafted orders with tracking details</p>
                </div>
                <Link to="/shop" className="btn-primary text-xs py-2 px-4 hidden sm:inline-flex">
                  Explore New Pieces ✨
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <ArrowPathIcon className="w-5 h-5 animate-spin text-purple-600" />
                  Loading your orders...
                </div>
              ) : ordersList.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No orders placed yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Start your collection with our handcrafted resin art.</p>
                  <Link to="/shop" className="btn-primary text-xs py-2.5 px-5">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersList.map((order) => {
                    const badge = statusStyles[order.status] || { bg: 'bg-gray-100 text-gray-700', text: order.status };
                    const image = order.image || (order.items && order.items[0]?.image) || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
                    const productTitle = order.product || (order.items && order.items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ')) || 'Handcrafted Resin Piece';
                    const trackingNo = order.trackingNumber || `BD${order.id}IN`;
                    const estDelivery = order.estDelivery || (order.estimatedDelivery ? `Estimated by ${order.estimatedDelivery}` : 'Processing');

                    return (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-200 transition-all"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <img
                              src={image}
                              alt={productTitle}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-purple-700 dark:text-purple-400">{order.id}</span>
                                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${badge.bg}`}>
                                  {badge.text}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg leading-snug">
                                {productTitle}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">Ordered on {order.date}</p>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <div className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-400">
                              ₹{Number(order.amount).toLocaleString('en-IN')}
                            </div>
                            <span className="text-xs text-gray-500 block mt-0.5">{estDelivery}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
                          <div className="text-xs text-gray-500 font-mono">
                            Tracking: <span className="font-semibold text-gray-700 dark:text-gray-300">{trackingNo}</span>
                          </div>
                          <div className="flex items-center gap-2 self-stretch sm:self-auto">
                            <Link
                              to={`/track-order?id=${order.id}`}
                              className="btn-secondary text-xs py-2 px-4 flex-1 sm:flex-initial text-center justify-center"
                            >
                              Live Progress Tracker
                            </Link>
                            <Link
                              to="/shop"
                              className="btn-primary text-xs py-2 px-4 flex-1 sm:flex-initial text-center justify-center"
                            >
                              Shop More
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">Delivery Addresses</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Manage where your resin creations get shipped</p>
                </div>
                <button
                  onClick={() => toast.success('Address saved as default!')}
                  className="btn-primary text-xs py-2 px-4"
                >
                  + Add Address
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border-2 border-purple-500 bg-purple-50/20 dark:bg-gray-700/30 relative">
                  <span className="badge badge-primary text-[10px] mb-2">Default Address</span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{currentUserName}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    42, Orchid Greens, Andheri West, Near Link Road<br />
                    wardha, Maharashtra - 400053<br />
                    Phone: +91 7218700468
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center p-6 text-gray-400 hover:border-purple-400 hover:text-purple-600 cursor-pointer transition-colors">
                  <MapPinIcon className="w-8 h-8 mb-2" />
                  <p className="text-xs font-semibold">Add Alternate Delivery Address</p>
                  <p className="text-[11px] text-gray-400 mt-1">Home, Office, or Gifting Address</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6"
            >
              <div>
                <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">Account Information</h2>
                <p className="text-xs sm:text-sm text-gray-500">Update your profile credentials</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Profile details updated!');
                }}
                className="max-w-xl space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={currentUserName}
                      className="input-field text-sm py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue={currentUserEmail}
                      className="input-field text-sm py-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+91 7218700468"
                      className="input-field text-sm py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">City</label>
                    <input
                      type="text"
                      defaultValue="wardha"
                      className="input-field text-sm py-2.5"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="btn-primary text-xs py-2.5 px-6">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}