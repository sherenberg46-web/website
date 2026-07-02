import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, editionId: number | null) => void;
  updateQty: (productId: number, editionId: number | null, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const safeStorage = () =>
  typeof window !== 'undefined'
    ? localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.product_id === item.product_id && i.edition_id === item.edition_id
        );
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.product_id === item.product_id && i.edition_id === item.edition_id
                ? { ...i, qty: i.qty + item.qty }
                : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, item] }));
        }
      },

      removeItem: (productId, editionId) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.product_id === productId && i.edition_id === editionId)
          ),
        })),

      updateQty: (productId, editionId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, editionId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.product_id === productId && i.edition_id === editionId ? { ...i, qty } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price_byn * i.qty, 0),
    }),
    {
      name: 'gamestore-cart',
      storage: createJSONStorage(safeStorage),
    }
  )
);
