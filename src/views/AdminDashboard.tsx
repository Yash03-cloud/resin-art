import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  CubeIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ServerStackIcon,
  StarIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from '@/lib/compat-router';
import { useAuthStore } from '../store/authStore';
import { analyticsData } from '../data/mockData';
import {
  fetchOrders,
  updateOrderStatus,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearDemoProducts,
  fetchDbStatus,
  fetchCustomOrders,
  fetchContactMessages,
  markContactMessageRead,
  deleteContactMessage,
  clearAllContactMessages,
  type Product,
  type ContactMessage,
} from '../services/api';
import toast from 'react-hot-toast';

type AdminTab = 'creator' | 'products' | 'orders' | 'custom-orders' | 'messages' | 'overview';

const WHATSAPP_NUMBER = '7218700468';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Creating Artwork',
  'Packing',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
];

const statusColor: Record<string, string> = {
  Pending: 'badge-danger',
  Confirmed: 'badge-primary',
  Processing: 'badge-primary',
  'Creating Artwork': 'badge-accent',
  Packing: 'badge-accent',
  Shipped: 'badge-primary',
  'Out For Delivery': 'badge-primary',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
};

const CATEGORIES = [
  'Wall Art',
  'Coasters',
  'Keychains',
  'Jewellery',
  'Photo Frames',
  'Personalized Gifts',
  'Home Decor',
  'Clocks & Trays',
  'Custom Commission',
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('artvibe_admin_tab') as AdminTab;
      if (saved && ['creator', 'products', 'orders', 'custom-orders', 'messages', 'overview'].includes(saved)) {
        return saved;
      }
    }
    return 'creator';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('artvibe_admin_tab', activeTab);
    }
  }, [activeTab]);
  const [dbStatus, setDbStatus] = useState<any>({
    type: 'Local JSON Storage',
    connected: false,
    host: 'localhost',
  });
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [customOrdersList, setCustomOrdersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [contactMessagesList, setContactMessagesList] = useState<ContactMessage[]>([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [previewModalPhoto, setPreviewModalPhoto] = useState<{
    url: string;
    title: string;
    note?: string;
    orderId: string;
    customer: string;
  } | null>(null);

  // Direct Product Creator State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wall Art');
  const [price, setPrice] = useState('3500');
  const [discount, setDiscount] = useState('10');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState(
    'Handcrafted premium epoxy resin masterpiece with glass-like luster, UV resistance, and bespoke artisan pigments.'
  );
  const [dimensions, setDimensions] = useState('12" x 12" inches');
  const [weight, setWeight] = useState('1.2 kg');
  const [material, setMaterial] = useState('UV-Resistant Resin & Natural Wood Base');
  const [finish, setFinish] = useState('Diamond Glass Glossy Finish');
  const [featured, setFeatured] = useState(true);

  // Local File Upload & Download States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Client-side image upload & optimization (max 1200x1200)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    setUploadingImage(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setImageUrl(compressed);
          toast.success(`Image "${file.name}" uploaded successfully! 🖼️`);
        } else {
          setImageUrl(event.target?.result as string);
          toast.success('Image loaded!');
        }
        setUploadingImage(false);
      };
      img.onerror = () => {
        setImageUrl(event.target?.result as string);
        setUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Instant image download handler
  const handleDownloadImage = async (url: string, filenameTitle: string) => {
    try {
      const safeTitle = (filenameTitle || 'resin-art-product')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safeTitle}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image downloaded! 💾');
        return;
      }

      toast.loading('Downloading image...', { id: 'img-dl' });
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${safeTitle}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Image downloaded! 💾', { id: 'img-dl' });
    } catch {
      window.open(url, '_blank');
      toast.success('Opened image in new tab for saving!', { id: 'img-dl' });
    }
  };

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Load backend data & DB status
  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, prodsRes, ordersRes, customRes, messagesRes] = await Promise.all([
        fetchDbStatus(),
        fetchProducts(),
        fetchOrders(),
        fetchCustomOrders(),
        fetchContactMessages(),
      ]);
      if (statusRes) setDbStatus(statusRes);
      if (Array.isArray(prodsRes)) setProductsList(prodsRes);
      if (Array.isArray(ordersRes)) setOrdersList(ordersRes);
      if (Array.isArray(customRes)) setCustomOrdersList(customRes);
      if (Array.isArray(messagesRes)) setContactMessagesList(messagesRes);
    } catch (err) {
      console.warn('Admin sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMessageRead = async (id: string, currentRead: boolean) => {
    try {
      await markContactMessageRead(id, !currentRead);
      setContactMessagesList((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: !currentRead } : msg))
      );
      toast.success(!currentRead ? 'Message marked as read ✓' : 'Message marked as unread');
    } catch {
      toast.error('Failed to update message status');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this contact message permanently?')) return;
    try {
      await deleteContactMessage(id);
      setContactMessagesList((prev) => prev.filter((msg) => msg.id !== id));
      toast.success('Message deleted successfully');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleClearAllMessages = async () => {
    if (!window.confirm('Are you sure you want to delete ALL contact messages in the database?')) return;
    try {
      await clearAllContactMessages();
      setContactMessagesList([]);
      toast.success('All contact messages removed from database! 🗑️');
    } catch {
      toast.error('Failed to clear contact messages');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Direct Product Creator Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      toast.error('Title and price are required!');
      return;
    }

    if (!imageUrl?.trim()) {
      toast.error('Please upload a product image from your device!');
      return;
    }

    setSubmittingProduct(true);
    const productPayload: Partial<Product> = {
      title: title.trim(),
      price: Number(price),
      discount: Number(discount) || 0,
      stock: Number(stock) || 10,
      category: category.trim(),
      description: description.trim(),
      images: [imageUrl.trim()],
      featured: Boolean(featured),
      dimensions: dimensions.trim(),
      weight: weight.trim(),
      material: material.trim(),
      finish: finish.trim(),
      tags: [category.toLowerCase().replace(/\s+/g, '-'), 'handcrafted', 'resin'],
    };

    try {
      if (editingProductId) {
        // Update product
        const updated = await updateProduct(editingProductId, productPayload);
        setProductsList((prev) =>
          prev.map((p) => (p.id === editingProductId ? { ...p, ...updated } : p))
        );
        toast.success(`Product card "${title}" updated successfully! ✨`);
        setEditingProductId(null);
      } else {
        // Create new product
        const created = await createProduct(productPayload);
        setProductsList((prev) => [created, ...prev]);
        toast.success(`Product card "${title}" published directly to store! 🎨`);
      }

      // Reset form
      setTitle('');
      setPrice('3500');
      setDiscount('10');
      setStock('10');
      setDimensions('12" x 12" inches');
      setImageUrl('');
      setUploadedFileName(null);
      setActiveTab('products');
    } catch {
      toast.error('Could not save product card. Check server connection.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setTitle(prod.title);
    setCategory(prod.category);
    setPrice(String(prod.price));
    setDiscount(String(prod.discount || 0));
    setStock(String(prod.stock || 10));
    setImageUrl(prod.images?.[0] || '');
    setDescription(prod.description || '');
    setDimensions(prod.dimensions || '12" x 12" inches');
    setWeight(prod.weight || '1.2 kg');
    setMaterial(prod.material || 'UV-Resistant Resin & Natural Wood Base');
    setFinish(prod.finish || 'Diamond Glass Glossy Finish');
    setFeatured(Boolean(prod.featured));
    setActiveTab('creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Editing product card. Update details and click Save.', { icon: '✏️' });
  };

  const handleDeleteProduct = async (id: string, prodTitle: string) => {
    if (!window.confirm(`Delete product "${prodTitle}" from database?`)) return;
    try {
      await deleteProduct(id);
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Product "${prodTitle}" deleted from catalog`);
    } catch {
      toast.error('Could not delete product');
    }
  };

  const handleClearDemoProducts = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete all demo products? You will have a clean, fresh catalog ready for your own products.'
      )
    )
      return;
    try {
      const msg = await clearDemoProducts();
      setProductsList([]);
      toast.success(msg || 'All demo products cleared! 🎉');
    } catch {
      toast.error('Could not clear demo products');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrdersList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order ${orderId} updated to "${newStatus}" ✓`);
    } catch {
      toast.error('Could not update order status');
    }
  };

  const numPrice = Number(price) || 0;
  const numDiscount = Number(discount) || 0;
  const finalPrice = Math.round(numPrice - (numPrice * numDiscount) / 100);

  const filteredProducts = productsList.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const NAV_ITEMS: {
    id: AdminTab;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string | null;
  }[] = [
    {
      id: 'creator',
      label: editingProductId ? 'Edit Product Card' : 'Direct Product Creator',
      shortLabel: 'Creator',
      icon: SparklesIcon,
      badge: editingProductId ? 'Editing' : null,
    },
    {
      id: 'products',
      label: 'Products Catalog',
      shortLabel: 'Catalog',
      icon: CubeIcon,
      badge: productsList.length,
    },
    {
      id: 'orders',
      label: 'Customer Orders',
      shortLabel: 'Orders',
      icon: ShoppingBagIcon,
      badge: ordersList.length,
    },
    {
      id: 'custom-orders',
      label: 'Custom Inquiries',
      shortLabel: 'Inquiries',
      icon: ChatBubbleLeftRightIcon,
      badge: customOrdersList.length,
    },
    {
      id: 'messages',
      label: 'Contact Messages',
      shortLabel: 'Messages',
      icon: EnvelopeIcon,
      badge:
        contactMessagesList.filter((m) => !m.read).length > 0
          ? `${contactMessagesList.filter((m) => !m.read).length} new`
          : contactMessagesList.length > 0
          ? contactMessagesList.length
          : null,
    },
    {
      id: 'overview',
      label: 'Store Analytics',
      shortLabel: 'Analytics',
      icon: ChartBarIcon,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B14] flex flex-col lg:flex-row text-gray-800 dark:text-gray-100">
      {/* ======================================================== */}
      {/* 1. DESKTOP LEFT SIDEBAR                                  */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 z-30 select-none">
        {/* Brand Logo & Studio Identity */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('creator')}
            className="flex items-center gap-3 group text-left cursor-pointer w-full"
            title="Admin Console"
          >
            <div className="p-1.5 rounded-xl bg-white shadow-xs border border-purple-100/60 preserve-white shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-9 w-auto object-contain" />
            </div>
            <div className="min-w-0">
              <span className="font-playfair font-bold text-base text-gray-900 dark:text-white leading-tight block truncate">
                Artvibe by Charu
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider block">
                Admin Console
              </span>
            </div>
          </button>

          {/* Database connection badge */}
          <div
            className={`mt-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              dbStatus.connected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
            <span className="truncate">
              {dbStatus.connected ? `MongoDB Active (${dbStatus.host})` : 'MongoDB Storage Active'}
            </span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          <div className="px-3 pb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Navigation Menu
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Actions in Left Sidebar */}
          <div className="pt-4 px-3 pb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Quick Actions
          </div>

          <button
            onClick={() => {
              setEditingProductId(null);
              setTitle('');
              setActiveTab('creator');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 transition-colors border border-purple-200 dark:border-purple-800/60 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>

          <Link
            to="/shop"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <EyeIcon className="w-4 h-4 text-gray-500" />
            <span>View Live Store ↗</span>
          </Link>

          <a
            href={`https://wa.me/91${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 border border-green-200 dark:border-green-800/60 transition-colors"
          >
            <span>💬 WhatsApp Support</span>
          </a>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-300 shrink-0">
              <img src="/charu.jpg" alt="Charu" className="w-full h-full object-cover object-top" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || 'Charu (Admin)'}
              </p>
              <span className="text-[10px] text-gray-400 block truncate">
                {user?.email || 'admin@artvibe.in'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE HEADER & QUICK TAB STRIP (lg:hidden)           */}
      {/* ======================================================== */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        {/* Top bar on Mobile */}
        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              aria-label="Open Admin Menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white shadow-xs border border-purple-100/60 preserve-white">
                <img src="/logo.png" alt="Artvibe by Charu" className="h-7 w-auto object-contain" />
              </div>
              <div>
                <span className="font-playfair font-bold text-sm text-gray-900 dark:text-white block leading-tight">
                  Admin Panel
                </span>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider block">
                  Artvibe
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to="/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 px-2.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 px-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick Tab Pills */}
        <div className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-950/40">
          {NAV_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.shortLabel}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MOBILE SLIDE-OUT DRAWER OVERLAY (lg:hidden)           */}
      {/* ======================================================== */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-gray-900 z-50 flex flex-col justify-between shadow-2xl lg:hidden"
            >
              {/* Drawer Top */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-white shadow-xs border border-purple-100/60 preserve-white">
                    <img src="/logo.png" alt="Artvibe by Charu" className="h-8 w-auto object-contain" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-sm text-gray-900 dark:text-white leading-tight">
                      Artvibe Admin
                    </h3>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider block">
                      Navigation
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                <div
                  className={`mb-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    dbStatus.connected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
                  <span className="truncate">
                    {dbStatus.connected ? `MongoDB: Active` : 'Database Ready'}
                  </span>
                </div>

                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="pt-3">
                  <Link
                    to="/shop"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <EyeIcon className="w-4 h-4 text-purple-600" />
                    <span>View Live Shop ↗</span>
                  </Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-300">
                    <img src="/charu.jpg" alt="Charu" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[130px]">
                      {user?.name || 'Charu (Admin)'}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[130px]">
                      {user?.email || 'admin@artvibe.in'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 4. MAIN DASHBOARD CONTENT AREA                           */}
      {/* ======================================================== */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
              <span>Admin Console</span>
              <span>/</span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold capitalize">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
            <h1 className="font-playfair text-xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'creator'
                ? editingProductId ? `Edit Product Card #${editingProductId}` : 'Direct Product Creator'
                : activeTab === 'products' ? 'Products Catalog'
                : activeTab === 'orders' ? 'Customer Orders Management'
                : activeTab === 'custom-orders' ? 'Bespoke Inquiries'
                : activeTab === 'messages' ? 'Contact Form Messages & Inquiries'
                : 'Store Analytics & Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Database status pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                dbStatus.connected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400'
              }`}
            >
              <ServerStackIcon className="w-3.5 h-3.5" />
              <span>
                {dbStatus.connected ? `MongoDB Active: ${dbStatus.host}` : `Database Ready`}
              </span>
            </div>

            {/* Reload button */}
            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Data from MongoDB"
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            </button>

            {/* WhatsApp indicator */}
            <a
              href={`https://wa.me/91${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
            >
              <span>💬 +91 {WHATSAPP_NUMBER}</span>
            </a>

            <Link
              to="/shop"
              className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span>View Live Store</span>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: DIRECT PRODUCT CARD CREATOR */}
          {activeTab === 'creator' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="badge badge-accent text-xs mb-2">Artisan Control Panel</span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold">
                  {editingProductId ? `Edit Product Card (#${editingProductId})` : 'Direct Product Card Creator'}
                </h2>
                <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-2xl">
                  Fill in your craft details, choose or paste photo URLs, set prices and specs. The live preview on the right shows exactly how customers see your product in the store.
                </p>
              </div>

              {editingProductId && (
                <button
                  onClick={() => {
                    setEditingProductId(null);
                    setTitle('');
                    toast('Reset to new product creation mode');
                  }}
                  className="btn-secondary bg-white text-purple-800 text-xs py-2 px-4"
                >
                  Cancel Edit Mode
                </button>
              )}
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Creator Form */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSaveProduct} noValidate className="space-y-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-600" />
                    <span>Product Card Information</span>
                  </h3>

                  {/* Title & Category */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Celestial Ocean Resin Wall Clock"
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field text-sm"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing & Stock */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="3500"
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="10"
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Stock Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="10"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  {/* Calculated Selling Price helper */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-300">Customer Will Pay:</span>
                    <span className="font-bold text-sm text-purple-700 dark:text-purple-300">
                      ₹{finalPrice.toLocaleString('en-IN')}{' '}
                      {numDiscount > 0 && (
                        <span className="text-gray-400 line-through text-xs font-normal">
                          ₹{numPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Image Upload, Download & URL Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Product Card Image *
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(imageUrl, title)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-1.5 transition-colors"
                          title="Download current image to your device"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          <span>Download Image</span>
                        </button>
                      )}
                    </div>

                    {/* Local File Upload Dropzone / Button */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
                      >
                        <CloudArrowUpIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                        <span>{uploadingImage ? 'Uploading & Optimizing...' : 'Upload Image from Computer / Phone'}</span>
                      </button>

                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(imageUrl, title)}
                          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                      )}
                    </div>

                    {/* If local photo is uploaded, show confirmation banner and NO URL input needed */}
                    {imageUrl?.startsWith('data:') ? (
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={imageUrl}
                            alt="Uploaded local preview"
                            className="w-12 h-12 rounded-xl object-cover border border-emerald-300 dark:border-emerald-700 shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full mb-0.5">
                              ✓ Local Photo Attached
                            </span>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                              {uploadedFileName || 'Photo uploaded from device'}
                            </p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Ready to publish directly — no URL required!
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50 transition-colors cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setUploadedFileName(null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Remove local photo"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* When no local file is uploaded, optional web URL input */
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            Or paste web image link (Optional):
                          </span>
                        </div>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => {
                            setUploadedFileName(null);
                            setImageUrl(e.target.value);
                          }}
                          placeholder="https://your-domain.com/photo.jpg"
                          className="input-field text-xs sm:text-sm py-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* Detailed Specifications */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3">
                      Piece Specifications & Craft Details
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">Dimensions</label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder='e.g. 14" x 14" inches'
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">Weight</label>
                        <input
                          type="text"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g. 1.5 kg"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">Base Material</label>
                        <input
                          type="text"
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          placeholder="e.g. Seasoned Teak Wood & Epoxy"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">Finish Coating</label>
                        <input
                          type="text"
                          value={finish}
                          onChange={(e) => setFinish(e.target.value)}
                          placeholder="e.g. Scratch-Resistant Gloss"
                          className="input-field text-xs py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Artisan Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the colors, layers, glitter accents, and uniqueness of this piece..."
                      className="input-field text-sm resize-none"
                    />
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="feat-check"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="feat-check" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      ⭐ Highlight this piece on Homepage as Featured Artwork
                    </label>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={submittingProduct}
                      className="btn-primary flex-1 justify-center py-3.5 text-sm flex items-center gap-2"
                    >
                      {submittingProduct ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Publishing to Store...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-5 h-5" />
                          <span>{editingProductId ? 'Update Product Card' : 'Publish Product Card to Store ✨'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Interactive Product Card Preview */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <EyeIcon className="w-4 h-4 text-purple-600" />
                      <span>Live Store Card Preview</span>
                    </h3>
                    <span className="badge badge-primary text-[10px]">Real-Time Shop View</span>
                  </div>

                  {/* Live Rendered Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md overflow-hidden transition-all max-w-sm mx-auto">
                    {imageUrl ? (
                      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={imageUrl}
                          alt={title || 'Product Preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                        {/* Floating actions on card preview */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={() => handleDownloadImage(imageUrl, title)}
                            className="px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-sm transition-all flex items-center gap-1 shadow cursor-pointer"
                            title="Download Image to computer/phone"
                          >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                            <span>Save Image</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-[11px] font-semibold backdrop-blur-sm transition-all flex items-center gap-1 shadow cursor-pointer"
                            title="Upload new image"
                          >
                            <CloudArrowUpIcon className="w-3.5 h-3.5" />
                            <span>Replace</span>
                          </button>
                        </div>
                        {numDiscount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            -{numDiscount}% OFF
                          </div>
                        )}
                        {featured && (
                          <div className="absolute top-3 right-3 bg-purple-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <StarIcon className="w-3 h-3 fill-current text-amber-300" />
                            Featured
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square bg-purple-50/40 dark:bg-gray-800/60 border-2 border-dashed border-purple-200 dark:border-purple-800/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 shadow-xs transition-transform">
                          🎨
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                          No Photo Uploaded Yet
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[210px] mb-3">
                          Upload your resin artwork image to preview your live store card
                        </p>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white shadow-sm group-hover:bg-purple-500 transition-colors">
                          <CloudArrowUpIcon className="w-4 h-4" />
                          <span>Upload Photo</span>
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
                          {category}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {Number(stock) > 0 ? `${stock} in stock` : 'Out of stock'}
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-1">
                        {title || 'Your Product Title Here'}
                      </h4>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {description || 'Product description will appear here.'}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                              ₹{finalPrice.toLocaleString('en-IN')}
                            </span>
                            {numDiscount > 0 && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{numPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-primary text-xs py-2 px-3.5 shadow-sm"
                          onClick={() => toast.success('Add-to-cart simulation verified!')}
                        >
                          Add to Cart 🛒
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dimensions:</span>
                      <span className="font-medium">{dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weight:</span>
                      <span className="font-medium">{weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Material:</span>
                      <span className="font-medium text-right max-w-[180px] truncate">{material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Finish:</span>
                      <span className="font-medium text-right max-w-[180px] truncate">{finish}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRODUCTS CATALOG                                  */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">Products Catalog</h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {productsList.length} active product cards in store database
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProductId(null);
                    setTitle('');
                    setActiveTab('creator');
                  }}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>+ Direct Add Card</span>
                </button>
                <button
                  onClick={handleClearDemoProducts}
                  className="p-2 px-3 text-xs rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 font-medium"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Clear Demo Products</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2.5 text-sm"
              />
            </div>

            {/* Products Table/Grid */}
            {loading ? (
              <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-purple-600" />
                <span>Loading products from database...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-playfair text-xl font-bold text-gray-800 dark:text-white mb-2">
                  No Products in Store Catalog
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  Demo products have been deleted or none match your search. Click below to directly add your real resin art cards!
                </p>
                <button
                  onClick={() => setActiveTab('creator')}
                  className="btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add First Product Card ✨</span>
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        {['Product Card', 'Category', 'Price', 'Stock', 'Specs', 'Featured', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredProducts.map((product) => {
                        const finalP = Math.round(product.price - (product.price * (product.discount || 0)) / 100);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images?.[0] || '/logo.png'}
                                  alt={product.title}
                                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                                    {product.title}
                                  </p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">#{product.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="badge badge-primary text-xs">{product.category}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                ₹{finalP.toLocaleString('en-IN')}
                              </div>
                              {product.discount > 0 && (
                                <div className="text-xs text-gray-400 line-through">
                                  ₹{product.price.toLocaleString('en-IN')} (-{product.discount}%)
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`badge text-xs ${
                                  (product.stock || 0) <= 3
                                    ? 'badge-danger'
                                    : (product.stock || 0) <= 8
                                    ? 'badge-accent'
                                    : 'badge-success'
                                }`}
                              >
                                {product.stock} units
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-500">
                              <div>{product.dimensions || '12" x 12"'}</div>
                              <div className="text-gray-400">{product.weight || '1 kg'}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`badge text-xs ${
                                  product.featured ? 'badge-accent' : 'text-gray-400 bg-gray-100'
                                }`}
                              >
                                {product.featured ? '⭐ Featured' : 'Standard'}
                              </span>
                            </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleDownloadImage(product.images?.[0] || '/logo.png', product.title)}
                                    className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg transition-colors"
                                    title="Download Product Image"
                                  >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                                    title="Edit Card"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id, product.title)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-gray-700 text-red-500 rounded-lg transition-colors"
                                    title="Delete Card"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CUSTOMER ORDERS & WHATSAPP                        */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">Customer Orders</h2>
                <p className="text-xs sm:text-sm text-gray-500">Manage order statuses and communicate directly via WhatsApp</p>
              </div>
            </div>

            {ordersList.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center text-purple-600 text-2xl">
                  📦
                </div>
                <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Customer Orders Yet
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  All demo orders have been removed. When real customers order products via Cash on Delivery, they will appear here with WhatsApp messaging and live status controls.
                </p>
                <Link to="/shop" className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5">
                  <span>View Live Shop ↗</span>
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        {['Order ID', 'Customer & Contact', 'Items', 'Photo Frame Upload', 'Amount', 'Status', 'Update Status', 'WhatsApp'].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {ordersList.map((order) => {
                        const cleanPhone = (order.phone || WHATSAPP_NUMBER).replace(/\D/g, '');
                        const waLink = `https://wa.me/91${cleanPhone.slice(-10)}?text=Hello ${encodeURIComponent(
                          order.customer
                        )}, this is Artvibe by Charu regarding your order ${order.id}. Current status is: ${order.status}.`;

                        const customPhotos = [
                          ...(order.customImage ? [{ image: order.customImage, note: order.customNote, title: order.product || 'Photo Frame' }] : []),
                          ...((order.items || []).filter((it: any) => it.customImage).map((it: any) => ({
                            image: it.customImage,
                            note: it.customNote,
                            title: it.title || 'Photo Frame'
                          })) || [])
                        ].filter((v, idx, arr) => arr.findIndex((t) => t.image === v.image) === idx);

                        return (
                          <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-sm text-purple-700 dark:text-purple-400 font-mono">
                                {order.id}
                              </span>
                              <div className="text-[11px] text-gray-400">{order.date}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-sm text-gray-800 dark:text-white">{order.customer}</div>
                              <div className="text-xs text-gray-500">{order.phone || `+91 ${WHATSAPP_NUMBER}`}</div>
                              <div className="text-[11px] text-gray-400">{order.email}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium max-w-[200px] truncate">
                                {order.product || (order.items && order.items[0]?.title) || 'Resin Art Piece'}
                              </p>
                              <span className="text-[11px] text-gray-400">{order.items?.length || 1} item(s)</span>
                            </td>
                            <td className="px-4 py-3.5">
                              {customPhotos.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  {customPhotos.map((photo, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className="flex items-center gap-2 p-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800"
                                    >
                                      <img
                                        src={photo.image}
                                        alt="Customer Frame Photo"
                                        onClick={() =>
                                          setPreviewModalPhoto({
                                            url: photo.image,
                                            title: photo.title,
                                            note: photo.note,
                                            orderId: order.id,
                                            customer: order.customer,
                                          })
                                        }
                                        className="w-11 h-11 object-cover rounded-lg border border-purple-300 dark:border-purple-700 cursor-pointer hover:scale-105 transition-transform shadow-xs shrink-0"
                                        title="Click to view full photo"
                                      />
                                      <div className="min-w-0 flex flex-col gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDownloadImage(
                                              photo.image,
                                              `${order.customer}-photo-frame-${order.id}`
                                            )
                                          }
                                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-purple-700 bg-white hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap"
                                          title="Download customer photo for printing/framing"
                                        >
                                          <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                          <span>Download</span>
                                        </button>
                                        {photo.note && (
                                          <span
                                            className="text-[10px] text-gray-500 dark:text-gray-400 italic max-w-[130px] truncate"
                                            title={photo.note}
                                          >
                                            "{photo.note}"
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white">
                              ₹{Number(order.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`badge text-xs ${statusColor[order.status] || 'badge-primary'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <select
                                value={order.status}
                                onChange={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStatusChange(order.id, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-purple-500 cursor-pointer"
                              >
                                {ORDER_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3.5">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold border border-green-200 transition-colors"
                              >
                                <span>💬 WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CUSTOM INQUIRIES & COMMISSIONS                   */}
        {/* ======================================================== */}
        {activeTab === 'custom-orders' && (
          <div className="space-y-6">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">
              Bespoke Custom Commissions
            </h2>

            {customOrdersList.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center text-purple-600 text-2xl">
                  💬
                </div>
                <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Custom Inquiries Yet
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  All demo inquiries have been cleared. When customers request custom artwork on the site, their requirements, dimensions, and WhatsApp contacts will show up here.
                </p>
                <Link to="/custom-order" target="_blank" className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5">
                  <span>View Custom Commission Form ↗</span>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customOrdersList.map((inq) => {
                  const cleanPhone = (inq.phone || WHATSAPP_NUMBER).replace(/\D/g, '');
                  const waLink = `https://wa.me/91${cleanPhone.slice(-10)}?text=Hello ${encodeURIComponent(
                    inq.name
                  )}, this is Charu from Artvibe regarding your custom resin art inquiry (${inq.productType || 'Commission'})...`;

                  return (
                    <div
                      key={inq.id}
                      className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-purple-600 font-mono">{inq.id}</span>
                          <span className="badge badge-accent text-[10px]">{inq.status || 'In Review'}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">{inq.name}</h4>
                          <p className="text-xs text-gray-400">{inq.email}</p>
                          <p className="text-xs text-gray-500">{inq.phone || `+91 ${WHATSAPP_NUMBER}`}</p>
                        </div>

                        <div className="p-3 bg-purple-50/50 dark:bg-gray-700/30 rounded-xl space-y-1 text-xs">
                          <p>
                            <strong className="text-gray-700 dark:text-gray-300">Type:</strong>{' '}
                            {inq.productType || 'Custom Piece'}
                          </p>
                          <p>
                            <strong className="text-gray-700 dark:text-gray-300">Size:</strong>{' '}
                            {inq.dimensions || 'Bespoke'}
                          </p>
                          <p>
                            <strong className="text-gray-700 dark:text-gray-300">Budget:</strong>{' '}
                            <span className="text-purple-700 dark:text-purple-400 font-bold">
                              {inq.budget || 'Open for discussion'}
                            </span>
                          </p>
                        </div>

                        {(inq.designInstructions || inq.desc) && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                            "{inq.designInstructions || inq.desc}"
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full py-2.5 text-xs justify-center flex items-center gap-2"
                        >
                          <span>Reply on WhatsApp (+91 {cleanPhone.slice(-10) || WHATSAPP_NUMBER}) 💬</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: CONTACT FORM MESSAGES & INQUIRIES                */}
        {/* ======================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <span>Contact Form Inquiries</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-bold">
                    {contactMessagesList.length} Messages
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Messages submitted by website visitors from the Contact page, stored dynamically in MongoDB.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-purple-500 w-44 sm:w-56"
                  />
                  {messageSearch && (
                    <button
                      onClick={() => setMessageSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setMessageFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      messageFilter === 'all'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                    }`}
                  >
                    All ({contactMessagesList.length})
                  </button>
                  <button
                    onClick={() => setMessageFilter('unread')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      messageFilter === 'unread'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                    }`}
                  >
                    Unread ({contactMessagesList.filter((m) => !m.read).length})
                  </button>
                  <button
                    onClick={() => setMessageFilter('read')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      messageFilter === 'read'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                    }`}
                  >
                    Read ({contactMessagesList.filter((m) => m.read).length})
                  </button>
                </div>

                {contactMessagesList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllMessages}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/60 transition-colors cursor-pointer flex items-center gap-1"
                    title="Delete all contact messages from database"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>Clear All Messages</span>
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {contactMessagesList.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center text-purple-600 text-2xl">
                  📬
                </div>
                <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Contact Messages Yet
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  When visitors submit a question or inquiry on the Contact page, it is stored in MongoDB and appears here in real-time.
                </p>
                <Link to="/contact" target="_blank" className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5">
                  <span>Open Contact Form ↗</span>
                </Link>
              </div>
            ) : (
              (() => {
                const filteredMessages = contactMessagesList
                  .filter((msg) => {
                    if (messageFilter === 'unread') return !msg.read;
                    if (messageFilter === 'read') return Boolean(msg.read);
                    return true;
                  })
                  .filter((msg) => {
                    if (!messageSearch.trim()) return true;
                    const query = messageSearch.toLowerCase();
                    return (
                      msg.name?.toLowerCase().includes(query) ||
                      msg.email?.toLowerCase().includes(query) ||
                      msg.phone?.toLowerCase().includes(query) ||
                      msg.subject?.toLowerCase().includes(query) ||
                      msg.message?.toLowerCase().includes(query)
                    );
                  });

                if (filteredMessages.length === 0) {
                  return (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 text-sm">No messages matching "{messageSearch}"</p>
                      <button
                        onClick={() => {
                          setMessageSearch('');
                          setMessageFilter('all');
                        }}
                        className="mt-3 text-xs text-purple-600 hover:underline font-semibold"
                      >
                        Reset filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid md:grid-cols-2 gap-5">
                    {filteredMessages.map((msg) => {
                      const cleanPhone = (msg.phone || WHATSAPP_NUMBER).replace(/\D/g, '');
                      const waLink = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                        `Hello ${msg.name}, this is Charu from Artvibe by Charu regarding your inquiry about "${msg.subject}". How can I help you today? ✨`
                      )}`;
                      const mailtoLink = `mailto:${msg.email}?subject=${encodeURIComponent(
                        `Artvibe by Charu - Re: ${msg.subject}`
                      )}&body=${encodeURIComponent(
                        `Hello ${msg.name},\n\nThank you for reaching out to Artvibe by Charu regarding "${msg.subject}".\n\nBest regards,\nCharu\nArtvibe Studio (+91 7218700468)`
                      )}`;

                      return (
                        <div
                          key={msg.id}
                          className={`rounded-3xl p-5 shadow-xs border transition-all flex flex-col justify-between ${
                            !msg.read
                              ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 shadow-purple-500/5'
                              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Header row: Badge, Date */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {!msg.read ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                    NEW / UNREAD
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    ✓ READ
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-gray-400">{msg.id}</span>
                              </div>
                              <span className="text-[11px] text-gray-400 font-medium">
                                {msg.createdAt || 'Recent'}
                              </span>
                            </div>

                            {/* Subject & Sender info */}
                            <div>
                              <span className="inline-block text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-900/40 px-2 py-0.5 rounded-md mb-1.5">
                                {msg.subject || 'General Inquiry'}
                              </span>
                              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                {msg.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <a
                                  href={mailtoLink}
                                  className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
                                >
                                  ✉️ {msg.email}
                                </a>
                                {msg.phone && (
                                  <a
                                    href={`tel:${msg.phone}`}
                                    className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
                                  >
                                    📞 {msg.phone}
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Message Body */}
                            <div className="p-3.5 bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                              "{msg.message}"
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="pt-3.5 mt-4 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary py-2 px-3 text-xs flex-1 justify-center inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-500 border-none text-white shadow-xs"
                              >
                                <span>WhatsApp 💬</span>
                              </a>
                              <a
                                href={mailtoLink}
                                className="btn-secondary py-2 px-3 text-xs flex-1 justify-center inline-flex items-center gap-1.5"
                              >
                                <span>Email ✉️</span>
                              </a>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleMessageRead(msg.id, Boolean(msg.read))}
                                title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold cursor-pointer"
                              >
                                {msg.read ? 'Mark Unread' : 'Mark Read ✓'}
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Delete Message"
                                className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: OVERVIEW & ANALYTICS                             */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 font-medium">Total Products</span>
                <div className="text-2xl sm:text-3xl font-bold font-playfair text-purple-700 dark:text-purple-300 mt-1">
                  {productsList.length}
                </div>
                <span className="text-[11px] text-green-600 font-medium">Ready in database</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 font-medium">Total Orders</span>
                <div className="text-2xl sm:text-3xl font-bold font-playfair text-blue-600 mt-1">
                  {ordersList.length}
                </div>
                <span className="text-[11px] text-blue-500 font-medium">Recorded shipments</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 font-medium">WhatsApp Support</span>
                <div className="text-lg font-bold font-mono text-green-600 mt-1">
                  7218700468
                </div>
                <span className="text-[11px] text-green-600 font-medium">Active Hotline</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 font-medium">Database System</span>
                <div className="text-base font-bold text-gray-800 dark:text-white mt-1">
                  {dbStatus.connected ? '🍃 MongoDB' : '📁 Local Storage'}
                </div>
                <span className="text-[11px] text-purple-600 font-medium">Auto-Syncing</span>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-6">Revenue & Order Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.monthlyRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7C3AED" fill="url(#revGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Customer Frame Photo Modal Preview */}
        {previewModalPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
            onClick={() => setPreviewModalPhoto(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-playfair text-lg font-bold text-gray-900 dark:text-white">
                    Customer Frame Photo
                  </h3>
                  <p className="text-xs text-gray-500">
                    Order #{previewModalPhoto.orderId} • {previewModalPhoto.customer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalPhoto(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 max-h-[55vh] flex items-center justify-center border border-gray-200 dark:border-gray-700 p-2">
                <img
                  src={previewModalPhoto.url}
                  alt={previewModalPhoto.title}
                  className="max-h-[50vh] w-auto max-w-full object-contain rounded-xl shadow-inner"
                />
              </div>

              {previewModalPhoto.note && (
                <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Dedication Note:</span>
                  <p className="text-gray-700 dark:text-gray-200 italic mt-0.5">"{previewModalPhoto.note}"</p>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setPreviewModalPhoto(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadImage(
                      previewModalPhoto.url,
                      `${previewModalPhoto.customer}-photo-frame-${previewModalPhoto.orderId}`
                    );
                  }}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download High-Res ⬇</span>
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
