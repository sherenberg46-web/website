import type { Metadata } from 'next';
import Link from 'next/link';
import { getManagerLink } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';
import { HowToBuy } from '@/components/home/HowToBuy';
import { HOW_TO_BUY_FAQ, howToBuyFaqJsonLd } from '@/lib/how-to-buy-faq';

/**
 * «Как купить» — главная страница под поисковые запросы.
 *
 * До этого здесь было полтора экрана: три шага и короткий список. Поисковику
 * нечего было оценивать, а покупателю — нечего читать. При этом самый частый
 * вопрос перед покупкой («а нужен ли украинский аккаунт и не потеряю ли я свои
 * игры») на сайте не разбирался вообще, хотя именно он останавливает людей.
 *
 * Теперь страница отвечает на него подробно и заодно закрывает запросы вроде
 * «как купить игру на ps5 в беларуси» и «как создать украинский аккаунт
 * playstation». Ответы продублированы разметкой FAQPage — Google умеет
 * разворачивать их прямо в выдаче.
 */

export const metadata: Metadata = {
  title: 'Как купить игру для PlayStation в Беларуси',
  description:
    'Пошагово: как купить цифровую игру PS4 и PS5 в Беларуси, нужен ли украинский аккаунт, как активировать код и чем платить. Отвечаем на вопросы, которые задают перед покупкой.',
  alternates: { canonical: '/how-to-buy' },
};

export default function HowToBuyPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Как купить', item: `${siteUrl}/how-to-buy` },
    ],
  };

  // Разметка инструкции: из неё Google строит пошаговую карточку в выдаче
  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Как купить цифровую игру PlayStation в Беларуси',
    description:
      'Выбор игры в каталоге, оформление заказа и получение кода активации в Telegram.',
    totalTime: 'PT30M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Выберите игру',
        text: 'Найдите игру в каталоге или через поиск. Цены указаны в белорусских рублях, пересчитывать ничего не нужно.',
        url: `${siteUrl}/games`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Оформите заказ',
        text: 'Добавьте игру в корзину и укажите имя и контакт в Telegram или телефон.',
        url: `${siteUrl}/cart`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Получите код',
        text: 'Менеджер свяжется, подтвердит заказ и пришлёт код активации. Обычно 15–30 минут.',
        url: `${siteUrl}/how-to-buy`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToBuyFaqJsonLd()) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-text-primary">
            Главная
          </Link>
          <span>/</span>
          <span className="text-text-primary">Как купить</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Как купить игру для PlayStation в Беларуси</h1>
        <p className="text-text-secondary text-lg mb-12 max-w-2xl">
          Цифровая игра покупается за несколько минут: вы выбираете её в каталоге, платите в
          белорусских рублях и получаете код активации в Telegram. Ниже — как это устроено и
          ответы на вопросы, которые чаще всего задают перед первой покупкой.
        </p>

        <HowToBuy />

        <div className="mt-16 prose-dark">
          <h2>Нужен ли украинский аккаунт</h2>
          <p>
            Это главный вопрос, и ответ такой: нужен, если игра из украинского каталога. Код
            активируется только на аккаунте того же региона — это правило самой PlayStation
            Network, обойти его нельзя.
          </p>
          <p>
            Но менять свой основной аккаунт не придётся. На консоли можно держать несколько
            аккаунтов одновременно: ваш прежний со всеми играми и трофеями остаётся как был, а
            рядом добавляется второй, украинский, для покупок. Переключаться между ними —
            обычная смена пользователя, как между профилями членов семьи.
          </p>
          <p>
            Игры при этом остаются на консоли и запускаются с обоих профилей, если на них
            заходили с того аккаунта, на котором игра куплена. Язык игры от региона не зависит:
            если разработчик сделал русскую локализацию, она будет доступна.
          </p>

          <h2>Как создать аккаунт нужного региона</h2>
          <p>
            Регион задаётся один раз, при регистрации, и потом не меняется — поэтому важно
            выбрать его сразу правильно.
          </p>
          <ol>
            <li>
              На консоли: <strong>Настройки → Пользователи и аккаунты → Другие → Создать
              аккаунт</strong>. Либо на сайте PlayStation, если удобнее с компьютера.
            </li>
            <li>
              В поле <strong>Страна или регион</strong> выберите нужную страну. Именно этот шаг и
              определяет, коды какого каталога подойдут аккаунту.
            </li>
            <li>
              Дату рождения указывайте настоящую: у аккаунтов младше 18 лет включаются
              родительские ограничения, снять их потом хлопотно.
            </li>
            <li>
              Почта подойдёт любая, к региону она не привязана. Главное — не та, на которую уже
              зарегистрирован другой аккаунт PSN.
            </li>
          </ol>
          <p>
            Если что-то пойдёт не так или регион окажется выбран не тот —{' '}
            <a href={getManagerLink()} target="_blank" rel="noopener noreferrer">
              напишите менеджеру
            </a>
            , подскажем, что делать.
          </p>

          <h2>Способы оплаты</h2>
          <ul>
            <li>Перевод на карту — VISA, MasterCard, Белкарт</li>
            <li>ЕРИП</li>
          </ul>
          <p>
            Все цены на сайте — в белорусских рублях, окончательные. Ни конвертации, ни
            комиссий сверху, ни привязки к курсу на день оплаты.
          </p>

          <h2>Как активировать код</h2>
          <ol>
            <li>Войдите на консоли под тем аккаунтом, для региона которого куплен код.</li>
            <li>
              Откройте PlayStation Store и выберите <strong>Активировать код</strong> — пункт
              находится в меню профиля в правом верхнем углу.
            </li>
            <li>Введите код из 12 символов. Игра появится в библиотеке сразу.</li>
          </ol>
          <p>
            То же самое можно сделать через браузер на сайте PlayStation Store, если консоли под
            рукой нет — игра всё равно привяжется к аккаунту.
          </p>

          <h2>Сколько ждать</h2>
          <p>
            Обычно код приходит за 15–30 минут после подтверждения заказа. Работаем с 10:00 до
            22:00; заказы, оформленные ночью, обрабатываем с утра. Предзаказы — отдельный
            случай: код по ним выдаётся к дате выхода игры, а не сразу после оплаты.
          </p>

          <h2>Если код не работает</h2>
          <p>
            Напишите менеджеру и опишите, что происходит. Чаще всего причина простая — код
            вводят под аккаунтом другого региона. Если дело в самом коде, заменим его или
            вернём деньги. Единственный случай, когда возврат невозможен, — код уже активирован:
            отменить это не может ни один продавец цифровых товаров.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Частые вопросы</h2>
          <div className="space-y-4">
            {HOW_TO_BUY_FAQ.map((item) => (
              <details
                key={item.q}
                className="bg-bg-card border border-border rounded-xl px-5 py-4 group"
              >
                <summary className="font-medium text-text-primary cursor-pointer list-none flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-accent shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-text-secondary text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary mb-6">
            Остались вопросы? Напишите — ответим и поможем выбрать.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/games"
              className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors"
            >
              Перейти в каталог
            </Link>
            <a
              href={getManagerLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-md border border-white/25 text-text-primary font-semibold hover:bg-white/10 transition-colors"
            >
              Написать менеджеру
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
