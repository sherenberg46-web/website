'use client';

import { useEffect } from 'react';
import { FitImage } from '@/components/ui/FitImage';
import { useEditionStore } from '@/store/editionStore';

interface Props {
  productId: number;
  /** Обложка самой игры — показывается, пока издание не выбрано. */
  src: string;
  alt: string;
}

/**
 * Обложка игры, которая меняется вместе с выбранным изданием.
 *
 * Сама страница — серверный компонент, состояние выбора живёт в клиентском
 * AddToCart. Связывает их общее хранилище: здесь мы только читаем выбор.
 */
export function GameCover({ productId, src, alt }: Props) {
  const coverUrl = useEditionStore((s) =>
    s.productId === productId ? s.coverUrl : null
  );
  const reset = useEditionStore((s) => s.reset);

  // При уходе со страницы сбрасываем выбор, иначе обложка одной игры
  // «переедет» на следующую открытую карточку.
  useEffect(() => reset, [productId, reset]);

  return (
    <FitImage
      key={coverUrl ?? src}
      src={coverUrl || src}
      alt={alt}
      priority
      className="absolute inset-0"
      sizes="(max-width: 1024px) 90vw, 384px"
    />
  );
}
