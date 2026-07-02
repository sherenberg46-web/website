import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/types';

interface FavouritesState {
  products: Product[];
  addFavourite: (product: Product) => void;
  removeFavourite: (productId: number) => void;
  isFavourite: (productId: number) => boolean;
  toggleFavourite: (product: Product) => void;
  getCount: () => number;
}

const safeStorage = () =>
  typeof window !== 'undefined'
    ? localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      products: [],

      addFavourite: (product) => {
        if (!get().isFavourite(product.id)) {
          set((s) => ({ products: [...s.products, product] }));
        }
      },

      removeFavourite: (productId) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== productId),
        })),

      isFavourite: (productId) => get().products.some((p) => p.id === productId),

      toggleFavourite: (product) => {
        const fns = get();
        if (fns.isFavourite(product.id)) {
          fns.removeFavourite(product.id);
        } else {
          fns.addFavourite(product);
        }
      },

      getCount: () => get().products.length,
    }),
    {
      name: 'gamestore-favourites',
      storage: createJSONStorage(safeStorage),
    }
  )
);
