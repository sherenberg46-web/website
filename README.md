# GAME STORE — Публичный сайт

Публичный веб-сайт магазина цифровых игр PlayStation для Беларуси (BYN).

**Стек:** Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Zustand

---

## Быстрый старт

```bash
npm install
cp .env.local.example .env.local
# отредактируйте .env.local
npm run dev
```

---

## Переменные окружения

| Переменная | Обязательна | Описание |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL API: `https://tg-shop-production-1b03.up.railway.app/api/v1` |
| `NEXT_PUBLIC_TG_BOT` | — | Ссылка на Telegram-бот: `https://t.me/GameDigitalShop_bot` |

---

## Деплой на Railway

Проект уже содержит `railway.json` с нужной конфигурацией.

### 1. Создайте новый сервис

railway.app → **New Project** → **Deploy from GitHub repo** → выберите репозиторий.

Или через CLI:
```bash
npm i -g @railway/cli
railway login
railway init        # привяжите к проекту
railway up          # деплой
```

### 2. Переменные окружения

В разделе **Variables** Railway-сервиса добавьте:

```
NEXT_PUBLIC_API_URL = https://tg-shop-production-1b03.up.railway.app/api/v1
NEXT_PUBLIC_TG_BOT  = https://t.me/GameDigitalShop_bot
```

> `PORT` Railway проставит автоматически — `next start -p ${PORT:-3000}` уже настроен в `package.json`.

### 3. Домен

Settings → **Generate Domain** — получите `*.up.railway.app` адрес.  
Или добавьте свой домен в **Custom Domain**.

### 4. Автоматические деплои

Каждый `push` в `main` → Railway автоматически пересобирает и деплоит.

---

## Подключение веб-заказов (backend-патч)

Файл патча: `backend/routers/web_orders.py`

### Шаги

1. Скопируйте файл в папку `routers/` вашего FastAPI-проекта.

2. В `main.py` добавьте:
   ```python
   from routers.web_orders import router as web_orders_router
   app.include_router(web_orders_router)
   ```

3. Добавьте домен сайта в CORS:
   ```python
   CORS_ORIGINS = [
       "https://your-site.vercel.app",
       # ... остальные
   ]
   ```

4. В `.env` (backend):
   ```
   WEBSITE_GUEST_USER_ID=999999999
   ```

5. Деплойте backend. Форма на сайте автоматически переключится с fallback-режима (Telegram) на API.

> **Fallback**: пока endpoint не задеплоен, форма показывает кнопку «Оформить через Telegram» с предзаполненным сообщением.

---

## Структура страниц

| URL | Описание |
|---|---|
| `/` | Главная: hero, карусели, преимущества, FAQ |
| `/games` | Каталог с фильтрами и пагинацией |
| `/games/[id]` | Страница игры (SSR, SEO, JSON-LD) |
| `/sale` | Распродажи |
| `/sale/[path]` | Страница распродажи |
| `/preorders` | Предзаказы |
| `/new` | Новинки |
| `/collections/[slug]` | Подборки |
| `/favourites` | Избранное (localStorage) |
| `/cart` | Корзина + форма заказа |
| `/how-to-buy` | Как купить |
| `/guarantees` | Гарантии |
| `/contacts` | Контакты |

---

## SEO

- SSR через Next.js App Router (`revalidate` от 60 до 300 сек)
- `generateMetadata` для каждой страницы игры
- JSON-LD `Product` schema на страницах игр
- Sitemap генерируется автоматически Next.js

---

## Состояние (Zustand + localStorage)

| Store | Ключ | Данные |
|---|---|---|
| `useCartStore` | `gamestore-cart` | Товары корзины, qty |
| `useFavouritesStore` | `gamestore-favourites` | Избранные игры |

Данные сохраняются в `localStorage` и переживают перезагрузку.
