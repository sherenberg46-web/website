"""
Патч для FastAPI: веб-заказы без Telegram ID.

Подключение:
1. Поместите этот файл в backend/routers/web_orders.py вашего проекта
2. В backend/main.py добавьте:
       from routers.web_orders import router as web_orders_router
       app.include_router(web_orders_router)
3. Добавьте домен вашего сайта в CORS_ORIGINS (settings или main.py):
       CORS_ORIGINS = ["https://your-site.up.railway.app", ...]
4. Добавьте в .env:
       WEBSITE_GUEST_USER_ID=999999999   # фиктивный user_id для веб-заказов
       ADMIN_CHAT_ID=...                 # уже должен быть
5. Деплой → веб-форма заработает автоматически (JS в OrderForm.tsx попробует API)
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1", tags=["web-orders"])

GUEST_USER_ID = int(os.getenv("WEBSITE_GUEST_USER_ID", "999999999"))


# ─── Schemas ────────────────────────────────────────────────────────────────

class WebOrderItem(BaseModel):
    product_id: int
    edition_id: Optional[int] = None
    qty: int = Field(1, ge=1, le=10)


class WebOrderIn(BaseModel):
    items: List[WebOrderItem] = Field(..., min_items=1)
    name: str = Field(..., min_length=1, max_length=100)
    contact: str = Field(..., min_length=2, max_length=200)
    comment: Optional[str] = Field(None, max_length=1000)


class WebOrderOut(BaseModel):
    order_id: int
    message: str


# ─── Endpoint ───────────────────────────────────────────────────────────────

@router.post("/web-orders", response_model=WebOrderOut, status_code=201)
async def create_web_order(payload: WebOrderIn):
    """
    Принимает заказ с публичного сайта (без авторизации Telegram).

    Сохраняет в таблицу orders с GUEST_USER_ID и контактом в комментарии.
    Отправляет уведомление администратору в Telegram.
    """
    try:
        # ── Импорт зависимостей из вашего проекта ──────────────────────────
        # Адаптируйте пути под реальную структуру вашего backend
        from database import get_db           # noqa: F401 — ваш SessionLocal/engine
        from models import Order, OrderItem   # noqa: F401 — ваши SQLAlchemy-модели
        from services.notify import send_admin_order_notification  # noqa: F401

        # ── Сборка комментария ──────────────────────────────────────────────
        web_comment = (
            f"[ВЕБ-ЗАКАЗ] Имя: {payload.name} | Контакт: {payload.contact}"
            + (f" | {payload.comment}" if payload.comment else "")
        )

        # ── Создание заказа (адаптируйте под вашу модель данных) ───────────
        async with get_db() as session:
            order = Order(
                user_id=GUEST_USER_ID,
                status="pending",
                created_at=datetime.utcnow(),
                comment=web_comment,
            )
            session.add(order)
            await session.flush()  # получаем order.id

            for item in payload.items:
                session.add(
                    OrderItem(
                        order_id=order.id,
                        product_id=item.product_id,
                        edition_id=item.edition_id,
                        qty=item.qty,
                    )
                )
            await session.commit()
            await session.refresh(order)

        # ── Уведомление администратору ──────────────────────────────────────
        await send_admin_order_notification(
            order_id=order.id,
            user_info=f"Сайт | {payload.name} | {payload.contact}",
            items=payload.items,
        )

        return WebOrderOut(
            order_id=order.id,
            message="Заказ принят. Менеджер свяжется с вами для подтверждения.",
        )

    except ImportError as exc:
        # Заглушка для проверки схемы без реального backend
        raise HTTPException(
            status_code=501,
            detail=f"Backend integration not configured: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ─── Пример упрощённой реализации для проектов без async ────────────────────
# Если ваш backend использует синхронный SQLAlchemy — раскомментируйте блок
# ниже и замените тело функции create_web_order:
#
# from sqlalchemy.orm import Session
# from fastapi import Depends
#
# @router.post("/web-orders", response_model=WebOrderOut, status_code=201)
# def create_web_order_sync(payload: WebOrderIn, db: Session = Depends(get_db)):
#     web_comment = (
#         f"[ВЕБ-ЗАКАЗ] Имя: {payload.name} | Контакт: {payload.contact}"
#         + (f" | {payload.comment}" if payload.comment else "")
#     )
#     order = Order(user_id=GUEST_USER_ID, status="pending", comment=web_comment)
#     db.add(order)
#     db.flush()
#     for item in payload.items:
#         db.add(OrderItem(order_id=order.id, **item.dict()))
#     db.commit()
#     db.refresh(order)
#     # notify_admin(order)  — вызовите вашу функцию уведомлений
#     return WebOrderOut(order_id=order.id, message="Заказ принят.")
