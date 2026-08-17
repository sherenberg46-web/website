'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Props {
  /** Куда уйти, если возвращаться некуда — прямой заход по ссылке. */
  fallback: string;
  label?: string;
}

/**
 * Возврат на предыдущую страницу.
 *
 * Нужен потому, что хлебные крошки ведут в каталог, а не туда, откуда пришёл
 * покупатель. Со страницы Kingdom Come он открывает дополнение и хочет
 * вернуться к изданиям этой же игры — а крошки отправляют его в общий список
 * из двадцати тысяч карточек, и путь приходится искать заново.
 *
 * history.back() возвращает ровно на предыдущий шаг и сохраняет позицию
 * прокрутки. Но если страницу открыли по прямой ссылке из поиска или
 * мессенджера, возвращаться некуда — тогда уводим в каталог платформы.
 */
export function BackButton({ fallback, label = 'Назад' }: Props) {
  // История длиной 1 — прямой заход. Проверяем после монтирования: на сервере
  // window нет, а несовпадение разметки ломает гидратацию.
  const [canGoBack, setCanGoBack] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.back() : router.push(fallback))}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-bg-card text-sm text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
