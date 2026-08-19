/**
 * Избранное — только идентификаторы.
 *
 * Раньше здесь лежали полные карточки товаров, и лежали вечно: цена, скидка,
 * картинка и само наличие товара замораживались в момент нажатия ♥.
 * Через месяц покупатель открывал «Избранное» и видел прошлогоднюю цену,
 * скидку, которой давно нет, и игры, снятые с продажи. Клик по такой карточке
 * вёл на страницу с другой ценой — и это выглядело как обман.
 *
 * Теперь браузер хранит только id, а страница «Избранное» подтягивает свежие
 * карточки с сервера. Пропавший товар отдаёт 404 и тихо уходит из списка.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/types';

interface FavouritesState {
  ids: number[];
  addFavourite: (product: Product | number) => void;
  removeFavourite: (productId: number) => void;
  isFavourite: (productId: number) => boolean;
  toggleFavourite: (product: Product | number) => void;
  getCount: () => number;
}

/** Ключ в localStorage — он же имя persist, он же то, что слушаем между вкладками. */
const STORAGE_KEY = 'gamestore-favourites';

const idOf = (p: Product | number): number => (typeof p === 'number' ? p : p.id);

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
      ids: [],

      addFavourite: (product) => {
        const id = idOf(product);
        if (!get().isFavourite(id)) {
          set((s) => ({ ids: [...s.ids, id] }));
        }
      },

      removeFavourite: (productId) =>
        set((s) => ({ ids: s.ids.filter((id) => id !== productId) })),

      isFavourite: (productId) => get().ids.includes(productId),

      toggleFavourite: (product) => {
        const id = idOf(product);
        const fns = get();
        if (fns.isFavourite(id)) {
          fns.removeFavourite(id);
        } else {
          fns.addFavourite(id);
        }
      },

      getCount: () => get().ids.length,
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(safeStorage),
      // Персистим только список id: остальное — функции и производное.
      partialize: (s) => ({ ids: s.ids }) as unknown as FavouritesState,
      version: 2,
      /**
       * У тех, кто уже пользовался сайтом, в localStorage лежат старые
       * карточки целиком. Достаём из них id, чтобы избранное не обнулилось.
       */
      migrate: (persisted: unknown) => {
        const old = persisted as { ids?: number[]; products?: { id: number }[] } | null;
        if (old?.ids?.length) return { ids: old.ids } as FavouritesState;
        const ids = (old?.products ?? [])
          .map((p) => p?.id)
          .filter((id): id is number => typeof id === 'number');
        return { ids } as FavouritesState;
      },
    }
  )
);

/** Избранное синхронизируем между вкладками так же, как корзину. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    if (e.newValue === null) {
      useFavouritesStore.setState({ ids: [] });
      return;
    }
    void useFavouritesStore.persist.rehydrate();
  });
}
