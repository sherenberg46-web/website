'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

/**
 * Яндекс.Метрика — счётчик посещаемости.
 *
 * Номер счётчика не секрет: он виден в исходном коде любой страницы,
 * как и у всех сайтов с Метрикой.
 */
const COUNTER_ID = 111860729;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

/**
 * Просмотры страниц при переходах.
 *
 * В App Router переходы между страницами происходят без перезагрузки, а
 * сниппет Метрики засчитывает только первый вход. Опция ssr в init про это
 * не помогает — она для корректного первого просмотра на SSR-сайтах.
 * Поэтому на каждую смену маршрута шлём hit сами, как рекомендует документация
 * для SPA. Первый просмотр пропускаем: его уже отправил init, иначе входы
 * считались бы дважды.
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
    // ym поднимается после загрузки tag.js; если посетитель ушёл со страницы
    // раньше — просмотр следующего экрана не критичен.
    window.ym?.(COUNTER_ID, 'hit', window.location.href);
  }, [pathname, searchParams]);

  return null;
}

export function YandexMetrika() {
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}', 'ym');

        ym(${COUNTER_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
      </Script>

      {/* useSearchParams требует границы Suspense, иначе Next не сможет
          отрендерить страницы статически. */}
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>

      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${COUNTER_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
