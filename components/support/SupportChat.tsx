'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import clsx from 'clsx';
import { askConsultant, rateConsultant, getManagerLink } from '@/lib/api';
import { getClientRegion } from '@/lib/region';
import { gamePath } from '@/lib/product-url';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const GREETING =
  'Привет! 👋 Я Макс, консультант GAME STORE. Помогу подобрать игру или подписку PlayStation по лучшей цене. Что ищете?';

/**
 * Консультант отвечает обычным текстом, а товары помечает тегом
 * [ТОВАР:id:название] — так он может сослаться на карточку, не зная адресов
 * сайта. Вырезаем теги из текста и рисуем на их месте кнопки.
 */
const TAG_RE = /\[ТОВАР:(\d+):([^\]]+)\]/g;

function parseMessage(text: string) {
  const products: { id: string; name: string }[] = [];
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(text)) !== null) products.push({ id: m[1], name: m[2] });
  const clean = text.replace(TAG_RE, '').replace(/\n{3,}/g, '\n\n').trim();
  return { clean, products };
}

/**
 * Чат с консультантом — тот же, что в приложении Telegram.
 *
 * На сайте его не было вовсе: покупатель с вопросом либо уходил в Telegram,
 * либо уходил совсем. Логика и бэкенд общие (/consultant/chat), отличается
 * только оформление — здесь оно в стиле сайта, а не мини-приложения.
 */
export function SupportChat() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsManager, setNeedsManager] = useState(false);
  const [dialogId, setDialogId] = useState<number | null>(null);
  const [rated, setRated] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Ключ разговора. Живёт во вкладке: перезагрузил страницу — тот же ключ,
   * закрыл вкладку — новый. Нужен, чтобы владелец видел переписку одним
   * диалогом, а не набором несвязанных вопросов.
   *
   * Ничего личного в нём нет — случайная строка, не привязанная к человеку.
   */
  const sessionRef = useRef<string>('');
  if (!sessionRef.current && typeof window !== 'undefined') {
    const KEY = 'gs_chat_session';
    let sid = window.sessionStorage?.getItem(KEY) ?? '';
    if (!sid) {
      sid = `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      try {
        window.sessionStorage?.setItem(KEY, sid);
      } catch {
        /* приватный режим — обойдёмся ключом на время жизни вкладки */
      }
    }
    sessionRef.current = sid;
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  // Закрытие по Esc — привычно для панели поверх страницы.
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setNeedsManager(false);
    setLoading(true);
    try {
      const data = await askConsultant(text, history, getClientRegion(), sessionRef.current);
      if (data.dialog_id) setDialogId(data.dialog_id);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.reply || 'Извините, не расслышал. Повторите?' },
      ]);
      if (Array.isArray(data.history)) setHistory(data.history);
      if (data.needs_manager) setNeedsManager(true);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Что-то пошло не так 😔 Можно написать менеджеру напрямую.',
        },
      ]);
      setNeedsManager(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Чат с консультантом"
          className="fixed right-5 bottom-5 z-40 w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-accent-contrast shadow-lg shadow-accent/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-bg-page" />
        </button>
      )}

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed z-50 flex flex-col overflow-hidden bg-bg-card border border-border shadow-2xl inset-x-0 bottom-0 h-[82vh] rounded-t-2xl sm:inset-auto sm:right-5 sm:bottom-5 sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:rounded-2xl">
            {/* Шапка */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-xl shrink-0">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-primary text-sm">Макс</p>
                <p className="text-xs text-accent flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  консультант GAME STORE
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="w-8 h-8 rounded-full bg-bg-page text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Сообщения */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                const { clean, products } = isUser
                  ? { clean: msg.content, products: [] as { id: string; name: string }[] }
                  : parseMessage(msg.content);
                return (
                  <div
                    key={i}
                    className={clsx(
                      'flex flex-col gap-1.5',
                      isUser ? 'items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={clsx(
                        'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                        isUser
                          ? 'bg-accent text-accent-contrast rounded-br-sm'
                          : 'bg-bg-page text-text-primary rounded-bl-sm'
                      )}
                    >
                      {clean}
                    </div>
                    {products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setOpen(false);
                          router.push(gamePath(p.id, 'PS'));
                        }}
                        className="max-w-[85%] text-left px-3.5 py-2 rounded-xl border border-accent/40 bg-accent/10 text-text-primary text-xs font-semibold hover:bg-accent/20 transition-colors"
                      >
                        🛒 {p.name}
                      </button>
                    ))}
                  </div>
                );
              })}

              {loading && (
                <div className="self-start bg-bg-page rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
                </div>
              )}

              {/* Оценка — единственный способ узнать, что консультант не
                  справился: клиент, которому не помогли, обычно просто уходит
                  молча. Показываем один раз, после второго ответа, чтобы не
                  мешать в начале разговора. */}
              {dialogId && !rated && !loading && messages.length >= 4 && (
                <div className="self-start flex items-center gap-2 text-xs text-text-secondary">
                  <span>Помог?</span>
                  <button
                    onClick={() => { rateConsultant(dialogId, 1); setRated(true); }}
                    aria-label="Помог"
                    className="w-8 h-8 rounded-full border border-border hover:border-accent/50 hover:text-accent flex items-center justify-center transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { rateConsultant(dialogId, -1); setRated(true); setNeedsManager(true); }}
                    aria-label="Не помог"
                    className="w-8 h-8 rounded-full border border-border hover:border-accent/50 hover:text-accent flex items-center justify-center transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {rated && (
                <p className="self-start text-xs text-text-secondary">Спасибо, учтём 🙌</p>
              )}

              {needsManager && (
                <a
                  href={getManagerLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start max-w-[85%] px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-contrast text-sm font-bold transition-colors"
                >
                  💬 Написать менеджеру
                </a>
              )}
            </div>

            {/* Ввод */}
            <div className="flex items-end gap-2 p-3 border-t border-border shrink-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Спросите Макса…"
                className="flex-1 resize-none max-h-24 px-3.5 py-2.5 rounded-2xl bg-bg-page border border-border text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                aria-label="Отправить"
                className={clsx(
                  'w-11 h-11 rounded-full shrink-0 flex items-center justify-center transition-all',
                  input.trim() && !loading
                    ? 'bg-accent hover:bg-accent-hover text-accent-contrast'
                    : 'bg-bg-page text-text-secondary cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
