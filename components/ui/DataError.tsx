import { WifiOff } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
}

/** Дружелюбная заглушка, когда данные не загрузились (сбой API). */
export function DataError({
  title = 'Не удалось загрузить данные',
  message = 'Похоже, сервер временно недоступен. Попробуйте обновить страницу через минуту.',
}: Props) {
  return (
    <div className="bg-bg-card border border-border rounded-3xl p-10 text-center max-w-xl mx-auto my-10">
      <div className="w-14 h-14 rounded-2xl bg-bg-card-hover border border-border mx-auto mb-5 flex items-center justify-center">
        <WifiOff className="w-6 h-6 text-text-secondary" />
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-text-secondary text-sm mb-6">{message}</p>
      <a
        href=""
        className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-md text-sm inline-block"
      >
        Обновить страницу
      </a>
    </div>
  );
}
