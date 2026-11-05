// Mock product data for the Resin Art Studio
export const products: any[] = [];

export const categories = [
  {
    id: 'wall-art',
    name: 'Wall Art',
    description: 'Stunning epoxy resin ocean waves, cosmic nebulae & geode canvases',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    icon: '🎨',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'coasters',
    name: 'Coasters',
    description: 'Heat-resistant drink coaster sets with gold foil & botanicals',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
    icon: '☕',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'keychains',
    name: 'Keychains',
    description: 'Personalized resin initial letters, alphabet charms & glitters',
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
    icon: '🔑',
    color: 'from-rose-400 to-pink-600',
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    description: 'Pendants, earrings & rings cast with preserved real dried flowers',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
    icon: '💎',
    color: 'from-teal-400 to-cyan-600',
  },
  {
    id: 'photo-frames',
    name: 'Photo Frames',
    description: 'Preserve wedding, anniversary & baby memories in crystal resin',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800',
    icon: '🖼️',
    color: 'from-violet-500 to-purple-700',
  },
  {
    id: 'personalized-gifts',
    name: 'Personalized Gifts',
    description: 'Custom keepsakes, luxury resin clocks, resin trays & nameplates',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    icon: '🎁',
    color: 'from-emerald-400 to-green-600',
  },
];

export const testimonials: any[] = [];

export const galleryItems = [
  {
    id: '1',
    image: '/gallery/resin-coasters-marble.jpg',
    category: 'Home Decor',
    title: 'Marble & Black Gold Resin Coasters',
    likes: 234,
  },
  {
    id: '2',
    image: '/gallery/ocean-tray.jpg',
    category: 'Home Decor',
    title: 'Ocean Wave Resin Serving Tray',
    likes: 312,
  },
  {
    id: '3',
    image: '/gallery/coffee-bean-coasters.jpg',
    category: 'Home Decor',
    title: 'Coffee Bean Resin Coasters',
    likes: 189,
  },
  {
    id: '4',
    image: '/gallery/festive-gift-set.jpg',
    category: 'Customized Orders',
    title: 'Festive Resin Gift Set — Shubh Labh',
    likes: 423,
  },
  {
    id: '5',
    image: '/gallery/resin-keychain.jpg',
    category: 'Jewellery',
    title: 'Blue Floral Resin Keychain',
    likes: 278,
  },
  {
    id: '6',
    image: '/gallery/custom-photo-frame.jpg',
    category: 'Customized Orders',
    title: 'Custom Scalloped Couple Photo Plaque with Gold Leaf',
    likes: 345,
  },
  {
    id: '7',
    image: '/gallery/resin-lamp-golden.jpg',
    category: 'Home Decor',
    title: 'Illuminated Golden Botanical Resin LED Night Lamp',
    likes: 412,
  },
  {
    id: '8',
    image: '/gallery/resin-wedding-invite.jpg',
    category: 'Customized Orders',
    title: 'Royal Maroon & Gold Foil Resin Wedding Invitation',
    likes: 388,
  },
  {
    id: '9',
    image: '/gallery/wedding-shadow-box.jpg',
    category: 'Customized Orders',
    title: 'Preserved Wedding Garland & Varmala Keepsake Frame',
    likes: 520,
  },
  {
    id: '10',
    image: '/gallery/floral-resin-invite.jpg',
    category: 'Customized Orders',
    title: 'Preserved Floral Blessing Slab with Golden Inscription',
    likes: 295,
  },
];

export const coupons = [
  { code: 'RESIN10', discount: 10, type: 'percentage' },
];

// Admin Dashboard analytics data structure
export const analyticsData = {
  totalRevenue: 0,
  totalOrders: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  customOrders: 0,
  monthlyRevenue: [
    { month: 'Jan', revenue: 0, orders: 0 },
    { month: 'Feb', revenue: 0, orders: 0 },
    { month: 'Mar', revenue: 0, orders: 0 },
    { month: 'Apr', revenue: 0, orders: 0 },
    { month: 'May', revenue: 0, orders: 0 },
    { month: 'Jun', revenue: 0, orders: 0 },
    { month: 'Jul', revenue: 0, orders: 0 },
    { month: 'Aug', revenue: 0, orders: 0 },
    { month: 'Sep', revenue: 0, orders: 0 },
    { month: 'Oct', revenue: 0, orders: 0 },
    { month: 'Nov', revenue: 0, orders: 0 },
    { month: 'Dec', revenue: 0, orders: 0 },
  ],
  categoryRevenue: [],
  recentOrders: [],
};

export const adminOrders: any[] = [];
export const adminCustomers: any[] = [];
