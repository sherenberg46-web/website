'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { checkPromo, createWebOrder, getManagerLink, issueCartPromo } from '@/lib/api';
import { getClientRegion } from '@/lib/region';
import { clearPromo, loadPromo } from '@/lib/cart-promo';
import { PLUS5_CODE, plus5Active, plus5Available, markPlus5Used } from '@/lib/plus5';
import { LEVEL5_CODE, level5Active } from '@/lib/level5';
import { checkContact } from '@/lib/contact';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'fallback';

interface Props {
  /**
   * Заказ отправлен. Вызывается ДО очистки корзины.
   *
   * Страница корзины при пустом списке показывает «Корзина пуста» вместо
   * всего содержимого, включая эту форму. Раньше очистка шла первой, React
   * объединял оба обновления в один проход, форма размонтировалась вместе со
   * своим экраном «Заказ принят» — и покупатель после отправки видел пустую
   * корзину без единого слова о том, что заказ принят.
   */
  onOrdered?: () => void;
}

export function OrderForm({ onOrdered }: Props) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  // Те же поля, что спрашивает Mini App: без них менеджер не сможет выдать игру.
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [psEmail, setPsEmail] = useState('');
  const [psPassword, setPsPassword] = useState('');
  const [promo, setPromo] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  // Номер заказа с сервера: по нему менеджер находит заказ, а покупатель
  // может на него сослаться. Раньше ответ сервера просто выбрасывался.
  const [orderId, setOrderId] = useState<number | null>(null);
  const [promoState, setPromoState] = useState<{
    status: 'idle' | 'checking' | 'ok' | 'bad';
    percent: number;
    reason: string;
  }>({ status: 'idle', percent: 0, reason: '' });
  // PLUS5 — алиас акции: сервер такого кода не знает, поэтому при вводе PLUS5
  // мы просим у сервера настоящий одноразовый код 5 % и держим его здесь.
  // В заказ уходит он, а покупатель видит привычный PLUS5.
  const [promoRealCode, setPromoRealCode] = useState<string | null>(null);
  // Показываем ошибку контакта только после того, как поле покинули: ругаться
  // на «+37» посреди набора номера — значит мешать, а не помогать.
  const [contactTouched, setContactTouched] = useState(false);
  // Код ушёл в заказ, но сервер скидку не посчитал — предупреждаем на экране
  // успеха, что менеджер пересчитает вручную (сумма есть в комментарии).
  const [promoNotApplied, setPromoNotApplied] = useState(false);

  const contactCheck = checkContact(contact);
  const contactError = contactTouched && contact.trim() ? contactCheck.error : null;

  // Имя нужно живое, а не «ы» и не набор цифр: с ним менеджер обращается к
  // покупателю. Двух букв достаточно, чтобы отсечь случайное нажатие.
  // Флаг /u с \p{L} target проекта не поддерживает, поэтому перечисляем
  // буквы явно: латиница и кириллица покрывают всех наших покупателей.
  const nameOk = name.trim().length >= 2 && /[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ]{2}/.test(name);
  const nameError =
    name.trim() && !nameOk ? 'Имя — хотя бы две буквы' : null;

  // Код, который сайт уже выдал этому браузеру, подставляем сами: переписывать
  // его руками — лишний шанс ошибиться в букве и решить, что скидки нет.
  useEffect(() => {
    const issued = loadPromo();
    if (issued?.code) setPromo(issued.code.toUpperCase());
  }, []);

  // Промокод проверяет сервер, а не браузер. Сверять с кодом, который сайт
  // выдал этому же браузеру, было ошибкой: сервер принимает любой невыданный
  // ранее непросроченный код (в том числе выданный менеджером в переписке или
  // на другом устройстве), а форма при этом писала «код не найден» и считала
  // сумму без скидки. Покупатель видел одну цену, в заказ уходила другая.
  const promoCode = promo.trim().toUpperCase();
  // LEVEL5 — только на игры: сервер считает скидку от всей корзины, поэтому
  // корзину с подписками или пополнениями код не принимает вовсе, иначе
  // скидка легла бы и на них. Зависимость эффекта ниже от этого флага
  // перепроверяет код, когда состав корзины меняет применимость.
  const level5Eligible = !items.some(
    (i) => i.product_type === 'subscription' || i.product_type === 'topup'
  );
  useEffect(() => {
    // Любая смена ввода обнуляет алиас: код из прошлого ввода в заказ не
    // должен уехать под видом нового.
    setPromoRealCode(null);
    if (!promoCode) {
      setPromoState({ status: 'idle', percent: 0, reason: '' });
      return;
    }
    setPromoState({ status: 'checking', percent: 0, reason: '' });
    const ctl = new AbortController();
    // issueCartPromo сигнала не принимает — от гонок страхуемся флагом.
    let stale = false;
    // Пауза перед запросом — чтобы не дёргать сервер на каждую букву.
    const timer = setTimeout(() => {
      if (promoCode === PLUS5_CODE && plus5Active()) {
        if (!plus5Available()) {
          setPromoState({
            status: 'bad',
            percent: 0,
            reason: 'этот промокод уже использован',
          });
          return;
        }
        issueCartPromo()
          .then((p) => {
            if (stale) return;
            setPromoRealCode(p.code);
            setPromoState({ status: 'ok', percent: p.percent, reason: '' });
          })
          .catch(() => {
            if (stale) return;
            setPromoState({ status: 'bad', percent: 0, reason: 'не удалось применить' });
          });
        return;
      }
      if (promoCode === LEVEL5_CODE && level5Active()) {
        if (!level5Eligible) {
          setPromoState({
            status: 'bad',
            percent: 0,
            reason: 'LEVEL5 действует только на игры — уберите из корзины подписки и пополнения',
          });
          return;
        }
        issueCartPromo()
          .then((p) => {
            if (stale) return;
            setPromoRealCode(p.code);
            setPromoState({ status: 'ok', percent: p.percent, reason: '' });
          })
          .catch(() => {
            if (stale) return;
            setPromoState({ status: 'bad', percent: 0, reason: 'не удалось применить' });
          });
        return;
      }
      checkPromo(promoCode, ctl.signal)
        .then((r) =>
          setPromoState(
            r.valid
              ? { status: 'ok', percent: r.percent, reason: '' }
              : { status: 'bad', percent: 0, reason: r.reason }
          )
        )
        .catch((e: unknown) => {
          if ((e as Error)?.name === 'AbortError') return;
          setPromoState({ status: 'bad', percent: 0, reason: 'не удалось проверить' });
        });
    }, 400);
    return () => {
      stale = true;
      clearTimeout(timer);
      ctl.abort();
    };
  }, [promoCode, level5Eligible]);

  // Страховка на случай устаревшего состояния: LEVEL5 не применяется,
  // если в корзине есть подписки или пополнения, — даже если код успел
  // пройти проверку до изменения корзины.
  const promoOk =
    promoState.status === 'ok' &&
    !(promoCode === LEVEL5_CODE && !level5Eligible);
  // Копеек в магазине нет: цены целые, итог тоже. Считаем ровно так же, как
  // считает сервер (округление вверх от суммы со скидкой), иначе на экране и
  // в заказе будут разные числа. Скидку показываем как разницу — тогда
  // строчки в итоге всегда сходятся.
  const cartTotal = Math.ceil(totalPrice);
  // Именно (100 - p) / 100, а не (1 - p/100): вторая форма из-за двоичной
  // дроби иногда даёт 3.0000000000000004 вместо ровной тройки, и округление
  // вверх приписывает покупателю лишний рубль. Сервер считает так же.
  const finalPrice = promoOk
    ? Math.ceil((totalPrice * (100 - promoState.percent)) / 100)
    : cartTotal;
  const discount = cartTotal - finalPrice;

  const canSubmit =
    nameOk &&
    contactCheck.ok &&
    hasAccount !== null &&
    (hasAccount === false || !!psEmail.trim()) &&
    // Пока код проверяется, итог на экране ещё не окончательный — не даём
    // отправить заказ с суммой, которая через полсекунды изменится.
    promoState.status !== 'checking';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('loading');
    setError('');

    // Ответ может не прийти вовсе: сеть в метро, спящий сервер. Без предела
    // ожидания кнопка остаётся в «Отправляем...» навсегда, и покупатель либо
    // уходит, либо жмёт ещё раз и создаёт второй заказ.
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20_000);

    try {
      // Алиасы (PLUS5, LEVEL5): выданный сервером код живёт 30 минут. Если
      // покупатель долго заполнял форму, код мог истечь — перед отправкой
      // проверяем и при необходимости берём свежий, иначе заказ уйдёт без
      // скидки. Если скидка не применима (например, LEVEL5 при подписке в
      // корзине) — реальный код не отправляем вовсе.
      let codeToSend = promoOk ? promoRealCode : null;
      if (promoRealCode) {
        try {
          const still = await checkPromo(promoRealCode, ctl.signal);
          if (!still.valid) {
            const fresh = await issueCartPromo();
            codeToSend = fresh.code;
          }
        } catch {
          // Проверка не удалась — отправляем как есть: решает сервер,
          // а менеджер видит сумму со скидкой в комментарии ниже.
        }
      }

      const created = await createWebOrder({
        items: items.map((i) => ({
          product_id: i.product_id,
          edition_id: i.edition_id,
          qty: i.qty,
        })),
        name: name.trim(),
        // Отправляем приведённый вид: +375291234567 или @username. Менеджер
        // получает контакт в одном формате, а не как покупатель его набрал.
        contact: contactCheck.normalized || contact.trim(),
        // Если промокод применён — дублируем скидку в комментарий: менеджер
        // видит и процент, и итоговую сумму прямо в сообщении о заказе,
        // даже если что-то пойдёт не так на стороне сервера.
        comment:
          [
            comment.trim(),
            promoOk
              ? `Промокод ${promoCode} (−${promoState.percent}%): итог со скидкой ${finalPrice} BYN вместо ${cartTotal} BYN`
              : '',
          ]
            .filter(Boolean)
            .join(' | ') || undefined,
        region: getClientRegion(),
        account_type: hasAccount ? 'my_account' : 'no_account',
        ps_email: hasAccount ? psEmail.trim() : undefined,
        ps_password: hasAccount ? psPassword : undefined,
        // При алиасе (PLUS5, LEVEL5) уходит настоящий код, выданный
        // сервером, — само слово-алиас серверу неизвестно.
        promo_code: codeToSend ?? (promoCode || undefined),
      }, ctl.signal);
      setOrderId(created.order_id ?? null);
      // Страховка: код ушёл в заказ, а сервер скидку не посчитал
      // (promo_percent в ответе нулевой) — не притворяемся, что всё хорошо.
      if (codeToSend && !created.promo_percent) setPromoNotApplied(true);
      // Порядок важен: сначала сообщаем странице, потом чистим корзину.
      // Оба обновления попадут в один проход React, страница уже будет знать,
      // что заказ оформлен, и не подменит форму экраном «Корзина пуста».
      onOrdered?.();
      clearCart();
      clearPromo();
      // PLUS5 — одна покупка: после успешного заказа алиас для этого
      // браузера больше не срабатывает. LEVEL5 многоразовый, не помечаем.
      if (promoRealCode && promoCode === PLUS5_CODE) markPlus5Used();
      setStatus('success');
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if ((err as Error)?.name === 'AbortError') {
        // Ждали 20 секунд и не дождались. Дошёл заказ или нет — мы не знаем,
        // поэтому не зовём повторить вслепую, а ведём к менеджеру.
        setError(
          'Сервер не ответил. Напишите менеджеру в Telegram — он проверит, дошёл ли заказ.'
        );
        setStatus('error');
      } else if (status === 404 || status === 405) {
        // Endpoint not deployed yet — show Telegram fallback
        setStatus('fallback');
      } else {
        setError('Произошла ошибка. Попробуйте ещё раз или напишите в Telegram.');
        setStatus('error');
      }
    } finally {
      clearTimeout(timer);
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Заказ принят!</h2>
        {orderId !== null && (
          <p className="text-text-primary font-semibold mb-2">
            Номер заказа: <span className="text-accent">№{orderId}</span>
          </p>
        )}
        <p className="text-text-secondary mb-6">
          Менеджер свяжется с вами в ближайшее время для подтверждения заказа и оплаты.
          {orderId !== null && ' Номер заказа пригодится, если захотите уточнить статус.'}
        </p>
        {promoNotApplied && (
          <p className="text-amber-400 text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 mb-6 max-w-md mx-auto">
            Промокод не применился автоматически — не переживайте: менеджер
            видит сумму со скидкой в комментарии к заказу и пересчитает цену.
          </p>
        )}
        <a
          href={getManagerLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-8 py-3.5 rounded-md transition-colors"
        >
          Написать менеджеру
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (status === 'fallback') {
    const orderSummary = items
      .map((i) => `${i.title}${i.edition_name ? ` (${i.edition_name})` : ''} × ${i.qty}`)
      .join('\n');
    const tgLink = getManagerLink(
      `Заказ:\n${orderSummary}\n\nИмя: ${name}\nКонтакт: ${contact}${comment ? `\nКомментарий: ${comment}` : ''}`
    );

    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Оформить через Telegram</h2>
        <p className="text-text-secondary mb-6 max-w-sm mx-auto">
          Нажмите кнопку ниже — мы предзаполним сообщение с вашим заказом, остаётся только отправить.
        </p>
        <a
          href={tgLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-8 py-3.5 rounded-md transition-colors"
        >
          Отправить заказ менеджеру
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-6">Оформить заказ</h2>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Ваше имя <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Иван"
          className={clsx(
            'w-full px-4 py-3 bg-bg-page border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none transition-colors',
            nameError ? 'border-red-400/60 focus:border-red-400' : 'border-border focus:border-accent/50'
          )}
        />
        {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Telegram или телефон <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          onBlur={() => setContactTouched(true)}
          required
          placeholder="@username или +375XXXXXXXXX"
          className={clsx(
            'w-full px-4 py-3 bg-bg-page border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none transition-colors',
            contactError ? 'border-red-400/60 focus:border-red-400' : 'border-border focus:border-accent/50'
          )}
        />
        {contactError ? (
          <p className="text-red-400 text-xs mt-1">{contactError}</p>
        ) : contactCheck.ok ? (
          <p className="text-accent text-xs mt-1">
            {contactCheck.kind === 'phone' ? 'Телефон' : 'Telegram'}: {contactCheck.normalized}
          </p>
        ) : (
          <p className="text-text-secondary text-xs mt-1">
            Телефон с кодом страны или ник в Telegram — по нему менеджер напишет вам
          </p>
        )}
      </div>


      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Аккаунт PlayStation <span className="text-accent">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true, label: 'У меня есть' },
            { value: false, label: 'Нужен новый' },
          ].map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => setHasAccount(o.value)}
              className={clsx(
                'py-3 rounded-xl text-sm font-medium border transition-colors',
                hasAccount === o.value
                  ? 'border-accent bg-accent/10 text-text-primary'
                  : 'border-border bg-bg-page text-text-secondary hover:text-text-primary'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {hasAccount === true && (
        <>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Email от аккаунта PS <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              value={psEmail}
              onChange={(e) => setPsEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Пароль от аккаунта PS
            </label>
            <input
              type="password"
              value={psPassword}
              onChange={(e) => setPsPassword(e.target.value)}
              placeholder="Можно передать менеджеру лично"
              className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
            <p className="text-text-secondary text-xs mt-1">
              Нужен, чтобы зайти в аккаунт и купить игру. Если не хотите вводить
              здесь — оставьте поле пустым, менеджер запросит его в переписке.
            </p>
          </div>
        </>
      )}

      {hasAccount === false && (
        <p className="text-text-secondary text-xs bg-bg-page border border-border rounded-xl px-4 py-3">
          Создадим для вас новый аккаунт и передадим данные вместе с игрой.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Промокод
        </label>
        <input
          type="text"
          value={promo}
          onChange={(e) => setPromo(e.target.value.toUpperCase())}
          placeholder="Если есть"
          className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
        />
        {promoState.status === 'idle' && !promoCode && (plus5Active() || level5Active()) && (
          <p className="text-xs mt-1 text-text-secondary">
            {plus5Active() && (
              <>
                <span className="text-accent font-semibold">PLUS5</span> — скидка 5 % на
                первую покупку.{' '}
              </>
            )}
            {level5Active() && (
              <>
                <span className="text-accent font-semibold">LEVEL5</span> — скидка 5 % на
                игры до 4 сентября
              </>
            )}
          </p>
        )}
        {promoState.status !== 'idle' && (
          <p
            className={clsx(
              'text-xs mt-1',
              promoState.status === 'ok' ? 'text-accent' : 'text-text-secondary'
            )}
          >
            {promoState.status === 'checking' && 'Проверяем код...'}
            {promoState.status === 'ok' &&
              (promoRealCode
                ? `Промокод ${promoCode} — скидка ${promoState.percent} % применена`
                : `Скидка ${promoState.percent} % применена`)}
            {promoState.status === 'bad' &&
              `Код не применён${promoState.reason ? `: ${promoState.reason}` : ''}`}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Комментарий (необязательно)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Уточнения по заказу..."
          className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="pt-2">
        {discount > 0 && (
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-text-secondary">Скидка по промокоду:</span>
            <span className="text-accent font-medium">−{discount} BYN</span>
          </div>
        )}
        <div className="flex justify-between text-sm mb-4">
          <span className="text-text-secondary">Итого:</span>
          <span className="text-text-primary font-bold text-lg">{finalPrice} BYN</span>
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || !canSubmit}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all',
            status === 'loading' || !canSubmit
              ? 'bg-bg-card border border-border text-text-secondary cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover text-accent-contrast'
          )}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Отправляем...
            </>
          ) : (
            'Оформить заказ'
          )}
        </button>

        <p className="text-center text-text-secondary text-xs mt-3">
          Оплата — после подтверждения заказа менеджером
        </p>

        {/* Момент принятия оферты. Именно здесь покупатель передаёт нам свои
            данные и заключает договор, поэтому предупреждение должно стоять
            у кнопки, а не теряться в подвале. */}
        <p className="text-center text-text-secondary text-xs mt-3 leading-relaxed">
          Оформляя заказ, вы принимаете{' '}
          <Link href="/offer" className="text-accent hover:underline">
            публичную оферту
          </Link>{' '}
          и соглашаетесь с{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            политикой конфиденциальности
          </Link>
        </p>
      </div>
    </form>
  );
}
