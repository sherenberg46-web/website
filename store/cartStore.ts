import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  /**
   * Когда корзину трогали в последний раз, в миллисекундах.
   *
   * Нужно для предложения скидки за брошенную корзину. В Mini App это считает
   * планировщик на сервере — там корзина хранится в базе и привязана к
   * telegram_id. На сайте корзина живёт только в localStorage, сервер о ней не
   * знает, поэтому отсчёт ведёт сам браузер.
   */
  updatedAt: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, editionId: number | null) => void;
  updateQty: (productId: number, editionId: number | null, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/** Ключ в localStorage — он же имя persist, он же то, что слушаем между вкладками. */
const STORAGE_KEY = 'gamestore-cart';

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
      updatedAt: 0,

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
            updatedAt: Date.now(),
          }));
        } else {
          set((s) => ({ items: [...s.items, item], updatedAt: Date.now() }));
        }
      },

      removeItem: (productId, editionId) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.product_id === productId && i.edition_id === editionId)
          ),
          updatedAt: Date.now(),
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
          updatedAt: Date.now(),
        }));
      },

      clearCart: () => set({ items: [], updatedAt: 0 }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price_byn * i.qty, 0),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(safeStorage),
    }
  )
);

/**
 * Две вкладки одного сайта.
 *
 * Корзина лежит в localStorage, но состояние zustand читает её один раз —
 * при загрузке страницы. Покупатель, открывший карточку игры во второй
 * вкладке (обычное дело: сравнить издания), добавлял туда товар, возвращался
 * в первую, оформлял заказ — и заказ уходил без этого товара. Хуже того,
 * первая вкладка при следующем изменении перезаписывала хранилище своей
 * старой корзиной, и добавленное пропадало совсем.
 *
 * Событие storage приходит только в *другие* вкладки, поэтому зацикливания
 * нет: та вкладка, что записала, его не получает.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    if (e.newValue === null) {
      // Хранилище очистили целиком (другая вкладка или сам покупатель).
      useCartStore.setState({ items: [], updatedAt: 0 });
      return;
    }
    void useCartStore.persist.rehydrate();
  });
}
