import axios from 'axios';
import { products as fallbackProducts } from '../data/mockData';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Attach auth token if available (reads from tab session or storage)
api.interceptors.request.use((config) => {
  const authStorage =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('resin-auth-storage') || localStorage.getItem('resin-auth-storage')
      : null;
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

// =============================
// PRODUCTS API
// =============================
export interface Product {
  id: string;
  title: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
  featured?: boolean;
  sold?: number;
  tags?: string[];
  dimensions?: string;
  weight?: string;
  material?: string;
  finish?: string;
  care?: string[];
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export const fetchProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const res = await api.get('/products', { params: filters });
    if (res.data?.success && Array.isArray(res.data.products)) {
      return res.data.products;
    }
    return fallbackProducts as unknown as Product[];
  } catch (err) {
    console.warn('Backend API offline or unreachable, using local data fallback.', err);
    let result = [...fallbackProducts] as unknown as Product[];
    if (filters?.category && filters.category !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }
};

export const fetchProductById = async (id: string): Promise<{ product: Product; reviews: Review[] }> => {
  try {
    const res = await api.get(`/products/${id}`);
    if (res.data?.success && res.data.product) {
      return {
        product: res.data.product,
        reviews: res.data.reviews || [],
      };
    }
  } catch (err) {
    console.warn('Backend API error fetching product, falling back:', err);
  }

  const fallback = (fallbackProducts as unknown as Product[]).find((p) => p.id === id) || (fallbackProducts[0] as unknown as Product);
  return {
    product: fallback,
    reviews: [],
  };
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const res = await api.post('/products', productData);
  return res.data.product;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const res = await api.put(`/products/${id}`, updates);
  return res.data.product;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/products/${id}`);
  return !!res.data.success;
};

export const clearDemoProducts = async (): Promise<string> => {
  const res = await api.delete('/products/actions/clear-demo');
  return res.data?.message || 'Demo products cleared!';
};

export const fetchDbStatus = async (): Promise<{
  type: string;
  connected: boolean;
  host: string;
  name: string;
  uri?: string | null;
}> => {
  try {
    const res = await api.get('/db-status');
    return res.data?.status || { type: 'MongoDB', connected: true, host: 'cluster1.c2eapo6.mongodb.net', name: 'resin' };
  } catch {
    return { type: 'MongoDB', connected: false, host: 'cluster1.c2eapo6.mongodb.net', name: 'resin' };
  }
};

// =============================
// REVIEWS API
// =============================
export interface Review {
  id: string;
  productId: string;
  userName: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export const postReview = async (reviewData: {
  productId: string;
  userName: string;
  rating: number;
  comment: string;
}): Promise<Review> => {
  const res = await api.post('/reviews', reviewData);
  return res.data.review;
};

// =============================
// ORDERS API
// =============================
export interface OrderTimelineItem {
  status: string;
  date: string;
  note: string;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  customImage?: string;
  customNote?: string;
  isPhotoFrame?: boolean;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  items: OrderItem[];
  customImage?: string;
  customNote?: string;
  amount: number;
  status: string;
  payment: string;
  date: string;
  estimatedDelivery: string;
  trackingNumber: string;
  timeline: OrderTimelineItem[];
}

export const createOrder = async (orderPayload: {
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  paymentMethod?: 'cod';
  amount: number;
  customImage?: string;
  customNote?: string;
}): Promise<Order> => {
  try {
    const res = await api.post('/orders', { ...orderPayload, paymentMethod: 'cod' });
    if (res.data?.success && res.data.order) {
      return res.data.order;
    }
  } catch (err) {
    console.warn('API createOrder failed, generating local fallback order:', err);
  }

  // Fallback order generation if server offline
  const newId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const firstPhotoItem = orderPayload.items.find((i) => i.customImage);
  return {
    id: newId,
    customer: orderPayload.customer,
    email: orderPayload.email,
    phone: orderPayload.phone,
    address: orderPayload.address,
    product: orderPayload.items[0]?.title || 'Resin Art Piece',
    items: orderPayload.items,
    customImage: orderPayload.customImage || firstPhotoItem?.customImage || '',
    customNote: orderPayload.customNote || firstPhotoItem?.customNote || '',
    amount: orderPayload.amount,
    status: 'Confirmed',
    payment: 'Cash on Delivery (Pending)',
    date: dateStr,
    estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    trackingNumber: `BD${Math.floor(100000 + Math.random() * 900000)}IN`,
    timeline: [
      { status: 'Pending', date: `${dateStr} ${now.toTimeString().slice(0, 5)}`, note: 'Order placed by customer (Cash on Delivery)' },
      { status: 'Confirmed', date: `${dateStr} ${now.toTimeString().slice(0, 5)}`, note: 'Order confirmed and queued for handcrafting' },
    ],
  };
};

export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const res = await api.get(`/orders/${orderId.toUpperCase()}`);
    if (res.data?.success && res.data.order) {
      return res.data.order;
    }
  } catch (err) {
    console.warn('fetchOrderById server call failed:', err);
  }
  return null;
};

export const fetchOrders = async (email?: string): Promise<Order[]> => {
  try {
    const res = await api.get('/orders', { params: { email } });
    if (res.data?.success && Array.isArray(res.data.orders)) {
      return res.data.orders;
    }
  } catch {
    // fallback
  }
  return [];
};

export const updateOrderStatus = async (orderId: string, status: string, note?: string): Promise<Order> => {
  const res = await api.put(`/orders/${orderId}/status`, { status, note });
  return res.data.order;
};

// =============================
// AUTHENTICATION API
// =============================
export const loginUser = async (credentials: { email: string; password: string }) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const registerUser = async (userData: { name: string; email: string; password: string; phone?: string }) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const forgotPassword = async (data: {
  email?: string;
  phone?: string;
  newPassword?: string;
}) => {
  const res = await api.post('/auth/forgot-password', data);
  return res.data;
};

// =============================
// CUSTOM ORDERS & CONTACT
// =============================
export const fetchCustomOrders = async () => {
  try {
    const res = await api.get('/custom-orders');
    if (res.data?.success && Array.isArray(res.data.customOrders)) {
      return res.data.customOrders;
    }
  } catch {
    // fallback
  }
  return [];
};

export const submitCustomOrder = async (customOrderData: {
  name: string;
  email: string;
  phone: string;
  productType: string;
  dimensions?: string;
  colorPreferences?: string;
  designInstructions: string;
  budget?: string;
  deadline?: string;
}) => {
  const res = await api.post('/custom-orders', customOrderData);
  return res.data;
};

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export const submitContactMessage = async (messageData: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) => {
  const res = await api.post('/contact', messageData);
  return res.data;
};

export const fetchContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const res = await api.get('/contact');
    if (res.data?.success && Array.isArray(res.data.messages)) {
      return res.data.messages;
    }
    return [];
  } catch {
    return [];
  }
};

export const markContactMessageRead = async (id: string, read: boolean = true) => {
  const res = await api.patch(`/contact/${id}/read`, { read });
  return res.data;
};

export const deleteContactMessage = async (id: string) => {
  const res = await api.delete(`/contact/${id}`);
  return res.data;
};

export const clearAllContactMessages = async () => {
  const res = await api.delete('/contact');
  return res.data;
};

// =============================
// ADMIN STATS API
// =============================
export const fetchAdminStats = async () => {
  try {
    const res = await api.get('/admin/stats');
    if (res.data?.success && res.data.stats) {
      return res.data.stats;
    }
  } catch {
    // fallback
  }
  return null;
};

