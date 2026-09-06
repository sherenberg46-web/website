import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

/**
 * Единая кнопка мобильного слоя. Server-компонент, без клиентского JS —
 * вся стилистика в классах .btn* (app/globals.css). Минимальная высота
 * 44px заложена в .btn.
 *
 * Для ссылок используйте <Link className="btn btn-primary"> напрямую —
 * набор классов один и тот же.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  type,
  ...rest
}: Props) {
  return (
    <button
      type={type ?? 'button'}
      className={clsx(
        'btn',
        `btn-${variant}`,
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'btn-lg',
        block && 'btn-block',
        className
      )}
      {...rest}
    />
  );
}
