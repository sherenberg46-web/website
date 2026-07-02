'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { REGIONS, type Region } from '@/lib/region';
import {
  SUB_PRICES,
  PS_IDS,
  EA_IDS,
  TIER_INFO,
  monthsLabel,
  type Tier,
  type Months,
} from '@/lib/subscriptions';

const MONTHS: Months[] = [1, 3, 12];

/** Прайс-таблица подписок: оба региона рядом, добавление в корзину в один клик. */
export function PricingTable() {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState<string | null>(null);

  function buy(region: Region, tier: Tier, months: Months) {
    const key = `${region}-${tier}-${months}`;
    const id = PS_IDS[region][tier][months];
    const price = SUB_PRICES[region].psplus[months][tier];
    addItem({
      product_id: id,
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: `PS Plus ${TIER_INFO.find((t) => t.id === tier)!.label} — ${monthsLabel(months)} (${region})`,
      image_url: '/placeholder.png',
      price_byn: price,
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(key);
    setTimeout(() => setAdded(null), 1500);
  }

  function buyEa(region: Region, months: 1 | 12) {
    const key = `ea-${region}-${months}`;
    addItem({
      product_id: EA_IDS[region][months],
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: `EA Play — ${monthsLabel(months)} (${region})`,
      image_url: '/placeholder.png',
      price_byn: SUB_PRICES[region].eaplay[months],
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(key);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <div className="space-y-12">
      {TIER_INFO.map((tier) => (
        <section key={tier.id}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">PS Plus {tier.label}</h2>
            <p className="text-text-secondary text-sm mt-1">{tier.features.join(' · ')}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-text-secondary text-xs font-medium uppercase tracking-wider pb-3">
                    Срок
                  </th>
                  {REGIONS.map((r) => (
                    <th
                      key={r.value}
                      className="text-left text-text-secondary text-xs font-medium uppercase tracking-wider pb-3"
                    >
                      {r.flag} {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m) => (
                  <tr key={m}>
                    <td className="py-3 pr-4 border-t border-border text-sm font-medium text-text-primary">
                      {monthsLabel(m)}
                    </td>
                    {REGIONS.map((r) => {
                      const price = SUB_PRICES[r.value].psplus[m][tier.id];
                      const key = `${r.value}-${tier.id}-${m}`;
                      const perMonth = Math.round(price / m);
                      return (
                        <td key={r.value} className="py-3 pr-4 border-t border-border">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div>
                              <span className="text-lg font-bold text-text-primary">
                                {price} BYN
                              </span>
                              {m > 1 && (
                                <span className="text-xs text-text-secondary ml-1.5">
                                  ≈{perMonth}/мес
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => buy(r.value, tier.id, m)}
                              className={clsx(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                                added === key
                                  ? 'bg-accent/20 text-accent'
                                  : 'btn-gradient text-black'
                              )}
                            >
                              {added === key ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> В корзине
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" /> Купить
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* EA Play */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">EA Play</h2>
          <p className="text-text-secondary text-sm mt-1">
            Каталог игр EA · пробные версии новинок · скидки 10%
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left text-text-secondary text-xs font-medium uppercase tracking-wider pb-3">
                  Срок
                </th>
                {REGIONS.map((r) => (
                  <th
                    key={r.value}
                    className="text-left text-text-secondary text-xs font-medium uppercase tracking-wider pb-3"
                  >
                    {r.flag} {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([1, 12] as const).map((m) => (
                <tr key={m}>
                  <td className="py-3 pr-4 border-t border-border text-sm font-medium text-text-primary">
                    {monthsLabel(m)}
                  </td>
                  {REGIONS.map((r) => {
                    const key = `ea-${r.value}-${m}`;
                    return (
                      <td key={r.value} className="py-3 pr-4 border-t border-border">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-lg font-bold text-text-primary">
                            {SUB_PRICES[r.value].eaplay[m]} BYN
                          </span>
                          <button
                            onClick={() => buyEa(r.value, m)}
                            className={clsx(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                              added === key ? 'bg-accent/20 text-accent' : 'btn-gradient text-black'
                            )}
                          >
                            {added === key ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> В корзине
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" /> Купить
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
