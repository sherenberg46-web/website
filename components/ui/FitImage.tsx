'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

/**
 * Картинка, которая помещается в рамку целиком.
 *
 * Обложки приходят из PS Store в трёх формах (см. IMAGE_ROLE_PRIORITY в
 * parser/config.py): PORTRAIT_BANNER 2:3 у большинства товаров, MASTER 1:1
 * у остальных, широкий GAMEHUB_COVER_ART 16:9 у редких. Рамки на сайте были
 * квадратные, и `object-cover` резал почти каждую обложку: у портретной
 * уезжала треть высоты вместе с логотипом наверху, у широкой — половина ширины.
 *
 * Здесь картинка вписывается целиком (`object-contain`), а поля по краям
 * закрывает размытая копия её же. Приём в проекте не новый — так уже сделаны
 * карточки PS Plus (PricingTable) и номиналы пополнения (TopupList), где
 * исходники тоже портретные.
 *
 * Обе <Image> получают одинаковый `sizes`, поэтому loader строит один и тот же
 * URL и браузер скачивает файл один раз, а не два.
 *
 * Важно: `className` обязан задавать позиционирование (`relative` + пропорции,
 * либо `absolute inset-0` внутри уже позиционированного родителя) — `fill`
 * у next/image работает только внутри позиционированного контейнера.
 */

const FALLBACK = '/placeholder.png';

interface Props {
  src: string;
  alt: string;
  /** Обязателен: по нему loader просит у CDN превью нужной ширины */
  sizes: string;
  /** Рамка: позиционирование, пропорции, скругление, фон */
  className?: string;
  /** Классы для самой картинки — анимации наведения, отступ от краёв */
  imageClassName?: string;
  priority?: boolean;
  /** Размытая подложка. Для превью в 40–80 px не нужна: там хватает фона карточки. */
  backdrop?: boolean;
  /** Битая ссылка. Если задан — вместо заглушки решает вызывающий (у баннера
   *  на главной свой фолбэк: фирменный градиент, а не портретный placeholder). */
  onError?: () => void;
}

export function FitImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  priority = false,
  backdrop = true,
  onError,
}: Props) {
  // Битая ссылка — показываем заглушку вместо дыры в карточке.
  // Раньше обработчик подменял .src прямо на элементе, но srcset при этом
  // оставался прежним и браузер мог снова выбрать битый вариант.
  const [failed, setFailed] = useState(false);
  const url = (failed && !onError) || !src ? FALLBACK : src;

  return (
    <div className={clsx('overflow-hidden bg-bg-card-hover', className)}>
      {backdrop && (
        <Image
          src={url}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover scale-125 blur-2xl brightness-[.4] saturate-150"
        />
      )}
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => (onError ? onError() : setFailed(true))}
        className={clsx('object-contain', imageClassName)}
      />
    </div>
  );
}
