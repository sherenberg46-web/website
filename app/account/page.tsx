'use client';

/**
 * Личный кабинет на сайте — то же, что «Профиль» в Mini App:
 * баллы и их история, заказы (из бота и с сайта вместе), покупки,
 * поддержка и регион.
 *
 * Клиент — тот же Telegram ID, что в боте: вход через Telegram Login Widget,
 * данные по подписанной сессии (lib/site-auth.ts). Реквизиты аккаунтов
 * (email/пароль PS) сервер в кабинет не отдаёт.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import {
  Gift,
  Package,
  ShoppingBag,
  History,
  Settings,
  LogOut,
  MessageCircle,
  Coins,
  Wallet,
  Infinity as InfinityIcon,
  ChevronRight,
} from 'lucide-react';
import { TelegramLoginButton } from '@/components/auth/TelegramLoginButton';
import { RegionSwitcher } from '@/components/layout/RegionSwitcher';
import { getManagerLink, normalizeImageUrl } from '@/lib/api';
import { gamePath } from '@/lib/product-url';
import {
  entryLabel,
  fetchAccountOrders,
  formatSum,
  logout,
  pluralPoints,
  pointsToByn,
  useSiteLoyalty,
  type AccountOrder,
} from '@/lib/site-auth';

type Tab = 'orders' | 'purchases' | 'points' | 'settings';

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: 'orders', label: 'Заказы', icon: Package },
  { key: 'purchases', label: 'Покупки', icon: ShoppingBag },
  { key: 'points', label: 'Баллы', icon: History },
  { key: 'settings', label: 'Поддержка и регион', icon: Settings },
];

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Ждёт подтверждения', cls: 'bg-amber-400/15 text-amber-300' },
  paid: { label: 'Оплачен', cls: 'bg-sky-400/15 text-sky-300' },
  processing: { label: 'В работе', cls: 'bg-sky-400/15 text-sky-300' },
  completed: { label: 'Выполнен', cls: 'bg-emerald-400/15 text-emerald-300' },
  cancelled: { label: 'Отменён', cls: 'bg-red-400/15 text-red-300' },
};

/** «2026-10-26 21:15:00» → «26.10.2026, 21:15» */
function fmtDate(raw: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(raw || '');
  return m ? `${m[3]}.${m[2]}.${m[1]}, ${m[4]}:${m[5]}` : raw;
}

export default function AccountPage() {
  const [mounted, setMounted] = useState(false);
  const { user, session, loyalty } = useSiteLoyalty();
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!session) {
      setOrders(null);
      return;
    }
    let alive = true;
    fetchAccountOrders(session).then((r) => {
      if (!alive) return;
      setOrders(r ?? []);
      setFailed(r === null);
    });
    return () => {
      alive = false;
    };
  }, [session]);

  // Покупки — товары из выполненных заказов, как «Мои ключи» в приложении
  const purchases = useMemo(
    () =>
      (orders ?? [])
        .filter((o) => o.status === 'completed')
        .flatMap((o) => o.items.map((it) => ({ ...it, orderId: o.id, date: o.created_at }))),
    [orders]
  );
  const completedCount = (orders ?? []).filter((o) => o.status === 'completed').length;
  const earnedTotal = (orders ?? []).reduce((s, o) => s + Math.max(o.points_earned, 0), 0);

  if (!mounted) {
    return <div className="mx-auto min-h-[60vh] max-w-5xl px-4 py-8" />;
  }

  // ── Гость: зовём войти ──────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="relative overflow-hidden rounded-card border border-accent/30 bg-surface-1 p-6 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative max-w-lg">
            <span className="mb-4 inline-flex items-center gap-2 rounded-pill bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
              <Gift className="h-4 w-4" /> Бонусная программа
            </span>
            <h1 className="mb-3 text-2xl font-extrabold tracking-tight md:text-3xl">
              Личный кабинет GAME STORE
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-text-secondary md:text-base">
              Войдите через Telegram — увидите свои заказы и покупки, а за каждую покупку будут
              копиться баллы. Баланс общий с нашим ботом. Новым клиентам — 50 стартовых баллов.
            </p>
            <div className="mb-6 inline-block">
              <TelegramLoginButton />
            </div>
          </div>
          <RulesRow />
        </div>
      </main>
    );
  }

  // ── Вошёл ───────────────────────────────────────────────────────────────
  const name = user.first_name || (user.username ? `@${user.username}` : 'Покупатель');

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      {/* Шапка кабинета: человек + баланс */}
      <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <div className="flex items-center gap-4 rounded-card border border-border bg-surface-1 p-5">
          {user.photo_url ? (
            <Image
              src={user.photo_url}
              alt=""
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-gradient text-xl font-extrabold text-accent-contrast">
              {name.replace('@', '')[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{name}</p>
            {user.username && (
              <p className="truncate text-sm text-text-secondary">@{user.username}</p>
            )}
            <button
              type="button"
              onClick={logout}
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> Выйти
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-card bg-brand-gradient p-5 text-accent-contrast">
          <Gift className="pointer-events-none absolute -bottom-6 -right-4 h-36 w-36 rotate-12 opacity-15" />
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Мои баллы</p>
          {loyalty ? (
            <>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">
                {loyalty.balance}
                <span className="ml-2 text-base font-bold opacity-80">
                  {pluralPoints(loyalty.balance)} = {pointsToByn(loyalty.balance, loyalty.points_per_byn)} BYN
                </span>
              </p>
              {loyalty.welcome_left > 0 ? (
                <p className="relative mt-2 max-w-sm text-sm font-medium opacity-85">
                  Из них {loyalty.welcome_left} {pluralPoints(loyalty.welcome_left)} — стартовый бонус,
                  его можно потратить в заказе от {loyalty.welcome_min_order_byn} BYN
                </p>
              ) : (
                <p className="relative mt-2 text-sm font-medium opacity-85">
                  Списать баллы можно в корзине — до {Math.round(loyalty.max_spend_share * 100)} % заказа
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm font-medium opacity-80">Загружаем баланс…</p>
          )}
        </div>
      </div>

      {/* Цифры */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Заказов" value={orders ? orders.length : '…'} />
        <Stat label="Выполнено" value={orders ? completedCount : '…'} />
        <Stat label="Получено баллов" value={orders ? earnedTotal : '…'} accent />
      </div>

      {/* Вкладки */}
      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex shrink-0 items-center gap-2 rounded-pill border px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.key
                ? 'border-accent bg-accent text-accent-contrast'
                : 'border-border bg-surface-1 text-text-secondary hover:text-text-primary'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {failed && (
          <p className="mb-3 rounded-control border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
            Не удалось загрузить заказы. Обновите страницу чуть позже.
          </p>
        )}

        {tab === 'orders' &&
          (orders === null ? (
            <Skeleton />
          ) : orders.length === 0 ? (
            <Empty text="Заказов пока нет" />
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          ))}

        {tab === 'purchases' &&
          (orders === null ? (
            <Skeleton />
          ) : purchases.length === 0 ? (
            <Empty text="Здесь появятся товары из выполненных заказов" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {purchases.map((p, i) => (
                <Link
                  key={`${p.orderId}-${p.product_id}-${i}`}
                  href={gamePath(p.product_id, p.platform)}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface-1 p-3 transition-colors hover:border-accent/40"
                >
                  <Cover src={p.image_url} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{p.title}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {p.region} · {p.quantity} шт. · заказ #{p.orderId}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
                </Link>
              ))}
            </div>
          ))}

        {tab === 'points' && (
          <div className="rounded-card border border-border bg-surface-1 p-4">
            <RulesRow compact />
            {!loyalty?.history?.length ? (
              <Empty text="Движений по баллам пока нет" />
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {loyalty.history.map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block text-text-primary">{entryLabel(e)}</span>
                      <span className="block text-xs text-text-muted">{fmtDate(e.created_at)}</span>
                    </span>
                    <span
                      className={clsx(
                        'shrink-0 font-bold',
                        e.delta > 0 ? 'text-emerald-400' : 'text-text-primary'
                      )}
                    >
                      {e.delta > 0 ? '+' : ''}
                      {e.delta}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="grid gap-3 md:grid-cols-2">
            <a
              href={getManagerLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-card border border-border bg-surface-1 p-4 transition-colors hover:border-accent/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-control bg-accent/15 text-accent">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">Написать в поддержку</span>
                <span className="block text-xs text-text-secondary">Менеджер в Telegram, 24/7</span>
              </span>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </a>
            <div className="flex items-center gap-3 rounded-card border border-border bg-surface-1 p-4">
              <span className="flex-1">
                <span className="block font-semibold">Регион цен</span>
                <span className="block text-xs text-text-secondary">Каталог PlayStation: Украина или Турция</span>
              </span>
              <RegionSwitcher />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function OrderCard({ order: o }: { order: AccountOrder }) {
  const st = STATUS[o.status] ?? { label: o.status, cls: 'bg-white/10 text-text-secondary' };
  return (
    <div className="rounded-card border border-border bg-surface-1 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">Заказ #{o.id}</span>
          <span className={clsx('rounded-pill px-2.5 py-0.5 text-2xs font-bold', st.cls)}>{st.label}</span>
        </div>
        <span className="text-xs text-text-muted">
          {fmtDate(o.created_at)} · {o.source === 'site' ? 'сайт' : 'Telegram'}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {o.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3">
            <Cover src={it.image_url} small />
            <p className="min-w-0 flex-1 truncate text-sm">
              {it.title}
              {it.quantity > 1 && <span className="text-text-secondary"> ×{it.quantity}</span>}
            </p>
            <span className="shrink-0 text-sm text-text-secondary">{formatSum(it.price_paid * it.quantity)} BYN</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap gap-2">
          {o.points_spent > 0 && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-white/5 px-2.5 py-1 text-2xs font-semibold text-text-secondary">
              <Coins className="h-3 w-3" /> −{o.points_spent} {pluralPoints(o.points_spent)}
            </span>
          )}
          {o.points_earned > 0 && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-accent/15 px-2.5 py-1 text-2xs font-bold text-accent">
              <Gift className="h-3 w-3" /> +{o.points_earned} {pluralPoints(o.points_earned)}
            </span>
          )}
        </div>
        <span className="text-base font-extrabold">{formatSum(o.total_byn)} BYN</span>
      </div>
    </div>
  );
}

function Cover({ src, small }: { src: string | null; small?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={normalizeImageUrl(src)}
      alt=""
      loading="lazy"
      className={clsx(
        'shrink-0 rounded-control bg-surface-2 object-cover',
        small ? 'h-10 w-8' : 'h-16 w-12'
      )}
    />
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-card border border-border bg-surface-1 p-3 text-center md:p-4">
      <p className={clsx('text-xl font-extrabold md:text-2xl', accent && 'text-accent')}>{value}</p>
      <p className="mt-0.5 text-2xs uppercase tracking-wider text-text-secondary md:text-xs">{label}</p>
    </div>
  );
}

function RulesRow({ compact }: { compact?: boolean }) {
  const rules = [
    { icon: Coins, title: '1 балл за 10 BYN', text: 'Начисляем после оплаты заказа' },
    { icon: Wallet, title: 'До 25 % заказа', text: '10 баллов = 1 BYN, списание в корзине' },
    { icon: InfinityIcon, title: 'Не сгорают', text: 'Общий баланс с Telegram-ботом' },
  ];
  return (
    <div className={clsx('relative grid gap-3', compact ? 'grid-cols-1 sm:grid-cols-3' : 'mt-2 sm:grid-cols-3')}>
      {rules.map((r) => (
        <div key={r.title} className="flex items-start gap-3 rounded-control bg-surface-2 p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/15 text-accent">
            <r.icon className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-bold">{r.title}</span>
            <span className="block text-xs text-text-secondary">{r.text}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-border px-4 py-10 text-center text-sm text-text-secondary">
      {text}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-card bg-surface-1" />
      ))}
    </div>
  );
}
