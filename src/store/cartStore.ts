import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
  stock: number;
  customImage?: string;
  customNote?: string;
  isPhotoFrame?: boolean;
}

interface CartStore {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const COUPONS: Record<string, { discount: number; type: 'percentage' | 'flat' }> = {
  'RESIN10': { discount: 10, type: 'percentage' },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: '',
      couponDiscount: 0,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === newItem.id && (i.customImage || '') === (newItem.customImage || '')
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing
                  ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),

      applyCoupon: (code) => {
        const coupon = COUPONS[code.toUpperCase()];
        if (!coupon) return false;
        const subtotal = get().getSubtotal();
        const discount = coupon.type === 'percentage'
          ? Math.round(subtotal * (coupon.discount / 100))
          : coupon.discount;
        set({ couponCode: code.toUpperCase(), couponDiscount: discount });
        return true;
      },

      removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),

      getSubtotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          const discountedPrice = item.price - (item.price * item.discount) / 100;
          return sum + discountedPrice * item.quantity;
        }, 0);
      },

      getDiscount: () => get().couponDiscount,

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const couponDiscount = get().couponDiscount;
        return Math.max(subtotal - couponDiscount, 0);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'resin-cart-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
