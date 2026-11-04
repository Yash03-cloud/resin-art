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
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    category: 'Resin Art',
    title: 'Galaxy Wall Piece',
    likes: 234,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500',
    category: 'Home Decor',
    title: 'Ocean Coasters',
    likes: 189,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500',
    category: 'Jewellery',
    title: 'Botanical Necklace',
    likes: 312,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
    category: 'Resin Art',
    title: 'Abstract Creation',
    likes: 156,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=500',
    category: 'Jewellery',
    title: 'Floral Earrings',
    likes: 278,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500',
    category: 'Home Decor',
    title: 'Marble Frame',
    likes: 145,
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=500',
    category: 'Resin Art',
    title: 'Geode Painting',
    likes: 423,
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    category: 'Customized Orders',
    title: 'Custom Name Plaque',
    likes: 198,
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500',
    category: 'Customized Orders',
    title: 'Custom Keychain',
    likes: 167,
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500',
    category: 'Resin Art',
    title: 'Purple Dream',
    likes: 389,
  },
  {
    id: '11',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
    category: 'Home Decor',
    title: 'Botanical Decor',
    likes: 134,
  },
  {
    id: '12',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
    category: 'Customized Orders',
    title: 'Wedding Gift Set',
    likes: 256,
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
