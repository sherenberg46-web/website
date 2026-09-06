'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

/** id формы — чтобы закреплённая кнопка (портал в body) сабмитила её через form=… */
const FORM_ID = 'checkout-form';

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

const inputBase =
  'w-full rounded-control border bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/70 outline-none transition-colors';

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
  // Пароль от аккаунта на сайте больше не вводится — его передают менеджеру в
  // переписке. Значение остаётся пустым; payload при этом байт-в-байт совпадает
  // с прежним сценарием «оставил поле пустым», который бэкенд уже принимает.
  const [psPassword] = useState('');
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

  // Портал закреплённой кнопки — только на клиенте.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const contactCheck = checkContact(contact);
  const contactError = contactTouched && contact.trim() ? contactCheck.error : null;

  // Имя нужно живое, а не «ы» и не набор цифр: с ним менеджер обращается к
  // покупателю. Двух букв достаточно, чтобы отсечь случайное нажатие.
  const nameOk = name.trim().length >= 2 && /[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ]{2}/.test(name);
  const nameError = name.trim() && !nameOk ? 'Имя — хотя бы две буквы' : null;

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

  // Короткая подсказка «чего не хватает» — для закреплённой кнопки, где полей
  // формы под рукой нет.
  const submitHint = !nameOk
    ? 'Укажите имя'
    : !contactCheck.ok
      ? 'Укажите телефон или ник в Telegram'
      : hasAccount === null
        ? 'Выберите: есть аккаунт или нужен новый'
        : hasAccount && !psEmail.trim()
          ? 'Укажите email аккаунта PlayStation'
          : promoState.status === 'checking'
            ? 'Проверяем промокод…'
            : '';

  // Высота закреплённой панели — Chat FAB поднимается на неё (см. SupportChat).
  // Та же переменная, что использует sticky-CTA на странице товара.
  useEffect(() => {
    const el = document.documentElement;
    if (status === 'success' || status === 'fallback') {
      el.style.removeProperty('--pdp-cta-h');
      return;
    }
    el.style.setProperty('--pdp-cta-h', '4.5rem');
    return () => {
      el.style.removeProperty('--pdp-cta-h');
    };
  }, [status]);

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
      <div className="py-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-accent" />
        <h2 className="mb-2 text-xl font-bold">Заказ принят!</h2>
        {orderId !== null && (
          <p className="mb-2 font-semibold text-text-primary">
            Номер заказа: <span className="text-accent">№{orderId}</span>
          </p>
        )}
        <p className="mx-auto mb-6 max-w-sm text-sm text-text-secondary">
          Менеджер свяжется с вами в ближайшее время для подтверждения заказа и оплаты.
          {orderId !== null && ' Номер заказа пригодится, если захотите уточнить статус.'}
        </p>
        {promoNotApplied && (
          <p className="mx-auto mb-6 max-w-md rounded-card border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-400">
            Промокод не применился автоматически — не переживайте: менеджер
            видит сумму со скидкой в комментарии к заказу и пересчитает цену.
          </p>
        )}
        <a
          href={getManagerLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Написать менеджеру
          <ExternalLink className="h-4 w-4" />
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
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-brand-gradient">
          <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold">Оформить через Telegram</h2>
        <p className="mx-auto mb-6 max-w-sm text-sm text-text-secondary">
          Нажмите кнопку ниже — мы предзаполним сообщение с вашим заказом, остаётся только отправить.
        </p>
        <a href={tgLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Отправить заказ менеджеру
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <>
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-bold">Оформление заказа</h2>

        {/* Контакты */}
        <div className="space-y-4">
          <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">
            Контакты
          </p>

          <div>
            <label htmlFor="of-name" className="mb-1.5 block text-sm font-medium text-text-secondary">
              Ваше имя <span className="text-accent">*</span>
            </label>
            <input
              id="of-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Иван"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'of-name-err' : undefined}
              className={clsx(
                inputBase,
                nameError ? 'border-red-400/60 focus:border-red-400' : 'border-border focus:border-accent/50'
              )}
            />
            {nameError && (
              <p id="of-name-err" className="mt-1 text-xs text-red-400">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="of-contact"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Telegram или телефон <span className="text-accent">*</span>
            </label>
            <input
              id="of-contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onBlur={() => setContactTouched(true)}
              required
              placeholder="@username или +375XXXXXXXXX"
              aria-invalid={!!contactError}
              aria-describedby="of-contact-hint"
              className={clsx(
                inputBase,
                contactError
                  ? 'border-red-400/60 focus:border-red-400'
                  : 'border-border focus:border-accent/50'
              )}
            />
            <p id="of-contact-hint" className="mt-1 text-xs" aria-live="polite">
              {contactError ? (
                <span className="text-red-400">{contactError}</span>
              ) : contactCheck.ok ? (
                <span className="text-accent">
                  {contactCheck.kind === 'phone' ? 'Телефон' : 'Telegram'}: {contactCheck.normalized}
                </span>
              ) : (
                <span className="text-text-secondary">
                  Телефон с кодом страны или ник в Telegram — по нему менеджер напишет вам
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Аккаунт PlayStation */}
        <div className="space-y-3 border-t border-border pt-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">
            Аккаунт PlayStation <span className="text-accent">*</span>
          </p>

          <div
            role="radiogroup"
            aria-label="Тип аккаунта PlayStation"
            className="grid grid-cols-2 gap-2"
          >
            {[
              { value: true, label: 'У меня есть аккаунт' },
              { value: false, label: 'Нужен новый аккаунт' },
            ].map((o) => (
              <label key={String(o.value)} className="cursor-pointer">
                <input
                  type="radio"
                  name="account_type"
                  className="peer sr-only"
                  checked={hasAccount === o.value}
                  onChange={() => setHasAccount(o.value)}
                />
                <span className="flex min-h-[44px] items-center justify-center rounded-control border border-border bg-surface-2 px-3 text-center text-sm font-medium text-text-secondary transition-colors peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                  {o.label}
                </span>
              </label>
            ))}
          </div>

          {hasAccount === true && (
            <div className="space-y-2.5">
              <div>
                <label
                  htmlFor="of-email"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Email от аккаунта PS <span className="text-accent">*</span>
                </label>
                <input
                  id="of-email"
                  type="email"
                  value={psEmail}
                  onChange={(e) => setPsEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={clsx(inputBase, 'border-border focus:border-accent/50')}
                />
              </div>
              <p className="rounded-control border border-border bg-surface-2 px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
                Пароль вводить здесь не нужно. Данные для входа в аккаунт вы передадите
                менеджеру в переписке уже после оформления заказа.
              </p>
            </div>
          )}

          {hasAccount === false && (
            <p className="rounded-control border border-border bg-surface-2 px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
              Создадим для вас новый аккаунт и передадим данные вместе с игрой.
            </p>
          )}
        </div>

        {/* Промокод и комментарий */}
        <div className="space-y-4 border-t border-border pt-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">
            Промокод и комментарий
          </p>

          <div>
            <label
              htmlFor="of-promo"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Промокод
            </label>
            <input
              id="of-promo"
              type="text"
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="Если есть"
              aria-describedby="of-promo-hint"
              className={clsx(inputBase, 'border-border focus:border-accent/50')}
            />
            <p id="of-promo-hint" className="mt-1 text-xs" aria-live="polite">
              {promoState.status === 'idle' && !promoCode && (plus5Active() || level5Active()) && (
                <span className="text-text-secondary">
                  {plus5Active() && (
                    <>
                      <span className="font-semibold text-accent">PLUS5</span> — скидка 5 % на
                      первую покупку.{' '}
                    </>
                  )}
                  {level5Active() && (
                    <>
                      <span className="font-semibold text-accent">LEVEL5</span> — скидка 5 % на
                      игры до 4 сентября
                    </>
                  )}
                </span>
              )}
              {promoState.status !== 'idle' && (
                <span
                  className={
                    promoState.status === 'ok' ? 'text-accent' : 'text-text-secondary'
                  }
                >
                  {promoState.status === 'checking' && 'Проверяем код…'}
                  {promoState.status === 'ok' &&
                    (promoRealCode
                      ? `Промокод ${promoCode} — скидка ${promoState.percent} % применена`
                      : `Скидка ${promoState.percent} % применена`)}
                  {promoState.status === 'bad' &&
                    `Код не применён${promoState.reason ? `: ${promoState.reason}` : ''}`}
                </span>
              )}
            </p>
          </div>

          <div>
            <label
              htmlFor="of-comment"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Комментарий (необязательно)
            </label>
            <textarea
              id="of-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Уточнения по заказу…"
              className={clsx(inputBase, 'resize-none border-border focus:border-accent/50')}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-control border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        {/* Итого + основное действие */}
        <div className="space-y-3 border-t border-border pt-4">
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Скидка по промокоду</span>
              <span className="font-medium text-accent">−{discount} BYN</span>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-text-secondary">Итого к оплате</span>
            <span className="text-xl font-extrabold tracking-tight text-text-primary" aria-live="polite">
              {finalPrice} BYN
            </span>
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !canSubmit}
            className="btn btn-primary btn-block"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправляем…
              </>
            ) : (
              `Оформить заказ · ${finalPrice} BYN`
            )}
          </button>

          <p className="text-center text-xs text-text-secondary">
            Оплата — после того, как менеджер подтвердит заказ
          </p>
          {/* Момент принятия оферты — у кнопки, а не в подвале. */}
          <p className="text-center text-xs leading-relaxed text-text-secondary">
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

      {/* Мобильная закреплённая панель оформления.
          Портал в body: страница корзины внутри motion.div из template.tsx
          (transform ломает fixed). Кнопка сабмитит форму через form=…
          Экраны успеха/фолбэка сюда не доходят — они выходят раньше по return. */}
      {mounted &&
        createPortal(
          <div
            className="md:hidden fixed inset-x-0 z-40 border-t border-border bg-surface-1/95 backdrop-blur-xl"
            style={{ bottom: 'calc(var(--mobile-nav-h) + env(safe-area-inset-bottom))' }}
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <span
                  className="text-base font-extrabold tracking-tight text-text-primary"
                  aria-live="polite"
                >
                  {finalPrice} BYN
                </span>
                {discount > 0 && (
                  <span className="ml-2 text-xs text-text-muted line-through">{cartTotal}</span>
                )}
                {!canSubmit && status !== 'loading' && submitHint && (
                  <span className="block text-2xs leading-tight text-text-secondary" aria-live="polite">
                    {submitHint}
                  </span>
                )}
              </div>
              <button
                type="submit"
                form={FORM_ID}
                disabled={status === 'loading' || !canSubmit}
                className="btn btn-primary btn-sm shrink-0 px-5"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Отправляем…
                  </>
                ) : (
                  'Оформить заказ'
                )}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
