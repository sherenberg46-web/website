'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { fbTrack } from '@/lib/fbq';

/**
 * ID пикселя. Идентификатор не секрет — он и так виден в исходном коде любой
 * страницы, — поэтому держим рабочее значение прямо здесь как запасное.
 * Переменная окружения нужна, чтобы можно было подменить пиксель на тестовый
 * или выключить его совсем, не пересобирая код.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '915433181624055';

/**
 * Просмотры страниц.
 *
 * В App Router переходы между страницами происходят без перезагрузки, и
 * штатный сниппет Meta засчитывает только первый экран. Поэтому шлём PageView
 * сами на каждую смену маршрута. Первый просмотр пропускаем: его уже отправил
 * сниппет при инициализации, иначе входы считались бы дважды.
 */
function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    fbTrack('PageView');
  }, [pathname, searchParams]);

  return null;
}

/**
 * Переход в Telegram = событие Lead.
 *
 * Оплата у нас проходит в боте или в переписке с менеджером, то есть покупку
 * сайт не видит никогда. Самое близкое к деньгам, что он может зафиксировать, —
 * уход человека в Telegram. Именно под это событие настраивается оптимизация
 * рекламы.
 *
 * Слушатель один на весь сайт и ловит клики по любой ссылке на t.me: кнопки в
 * шапке, в карточке товара, в таблице подписок, в пополнении. Вешать обработчик
 * на каждую кнопку значило бы править пять файлов и забыть про шестой, который
 * появится завтра.
 */
function TelegramLeads() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>('a[href*="t.me"]');
      if (!link) return;

      fbTrack('Lead', { content_name: link.getAttribute('href') ?? undefined });
    }

    // Фаза перехвата: срабатываем до того, как обработчики самой ссылки успеют
    // отменить всплытие события.
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}

export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>

      {/* useSearchParams требует границы Suspense, иначе Next не сможет
          отрендерить страницы статически. */}
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>

      <TelegramLeads />

      <noscript>
        {/* Запасной вариант для браузеров с отключённым JS */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
