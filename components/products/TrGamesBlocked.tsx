import Link from 'next/link';

/**
 * Отбивка для турецкого региона: игры из TR-каталога временно не продаём
 * (как в Mini App). Подписки и пополнение кошелька при этом работают —
 * подсказываем их ссылками, чтобы покупатель не ушёл с пустого экрана.
 *
 * Общий компонент: одна и та же заглушка стоит на главной, в каталоге,
 * на распродаже, в предзаказах и на странице TR-товара.
 */
export function TrGamesBlocked() {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-10 text-center max-w-2xl mx-auto">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold mb-3">Временно недоступно</h2>
      <p className="text-text-secondary">
        Покупка игр из турецкого каталога временно приостановлена.
      </p>
      <p className="text-text-secondary mt-1">
        Но вы можете купить подписку или пополнить кошелёк 👇
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/subscriptions"
          className="bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Подписки
        </Link>
        <Link
          href="/topup"
          className="bg-white/10 hover:bg-white/15 text-text-primary font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Пополнение PSN
        </Link>
      </div>
    </div>
  );
}
