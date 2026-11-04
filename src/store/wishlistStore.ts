import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // product IDs
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (id) =>
        set((state) => ({ items: state.items.includes(id) ? state.items : [...state.items, id] })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i !== id) })),

      toggleItem: (id) => {
        const { items } = get();
        if (items.includes(id)) {
          set({ items: items.filter((i) => i !== id) });
        } else {
          set({ items: [...items, id] });
        }
      },

      isWishlisted: (id) => get().items.includes(id),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'resin-wishlist-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
