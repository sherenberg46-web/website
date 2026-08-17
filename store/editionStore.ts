import { create } from 'zustand';

/**
 * Какое издание выбрано на открытой карточке игры.
 *
 * Нужен потому, что обложка и выбор изданий живут в разных местах: картинка
 * рисуется серверным компонентом страницы, а кнопки изданий — клиентским
 * AddToCart. Прокинуть состояние пропсами нельзя, поэтому оба обращаются к
 * этому маленькому хранилищу.
 *
 * Обложки у изданий разные — у Deluxe и Ultimate своё оформление, — и
 * покупателю важно видеть именно то, что он выбирает.
 */
interface EditionState {
  /** Обложка выбранного издания. null — показываем общую обложку игры. */
  coverUrl: string | null;
  /** Товар, к которому относится выбор. Защищает от переноса обложки на
   *  соседнюю карточку при переходе между играми. */
  productId: number | null;
  select: (productId: number, coverUrl: string | null) => void;
  reset: () => void;
}

export const useEditionStore = create<EditionState>((set) => ({
  coverUrl: null,
  productId: null,
  select: (productId, coverUrl) => set({ productId, coverUrl }),
  reset: () => set({ productId: null, coverUrl: null }),
}));
