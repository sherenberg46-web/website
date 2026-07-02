import type { Metadata } from 'next';
import Link from 'next/link';
import { getTelegramLink } from '@/lib/api';
import { HowToBuy } from '@/components/home/HowToBuy';

export const metadata: Metadata = {
  title: 'Как купить',
  description: 'Инструкция по покупке цифровых игр PlayStation в нашем магазине.',
};

export default function HowToBuyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Как купить игру</h1>
      <p className="text-text-secondary mb-12">
        Покупка цифровой игры занимает всего несколько минут. Вот как это работает:
      </p>

      <HowToBuy />

      <div className="mt-16 prose-dark">
        <h2>Способы оплаты</h2>
        <ul>
          <li>Перевод на карту (VISA, MasterCard, Белкарт)</li>
          <li>Электронные кошельки (WebMoney, QIWI и другие)</li>
          <li>Оплата наличными через ЕРИП</li>
        </ul>

        <h2>Активация кода</h2>
        <p>
          После получения кода активации войдите в PlayStation Store на консоли или через браузер,
          выберите &quot;Активировать код&quot; и введите его. Игра сразу появится в вашей библиотеке.
        </p>

        <h2>Регион аккаунта</h2>
        <p>
          Убедитесь, что регион вашего PlayStation-аккаунта соответствует региону купленного кода.
          Если не уверены — напишите нам, поможем подобрать правильный.
        </p>
      </div>

      <div className="mt-10 text-center">
        <a
          href={getTelegramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gradient text-black font-semibold px-8 py-3.5 rounded-full inline-block"
        >
          Задать вопрос в Telegram
        </a>
      </div>
    </div>
  );
}
