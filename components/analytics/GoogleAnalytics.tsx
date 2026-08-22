'use client';

import Script from 'next/script';

/**
 * Google Analytics 4.
 *
 * ID измерения не секрет — он виден в исходном коде любой страницы.
 *
 * Просмотры при переходах без перезагрузки (у нас App Router) отдельно
 * досылать не нужно: в GA4 расширенная статистика по умолчанию отслеживает
 * «просмотры страниц на основе событий истории браузера», то есть мягкие
 * переходы Next.js засчитываются сами. Дублировать вручную — значит
 * получить двойные просмотры.
 */
const GA_ID = 'G-Z47SCX9HZE';

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
