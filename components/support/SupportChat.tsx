'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import clsx from 'clsx';
import { askConsultant, rateConsultant, getManagerBotLink, sendManagerContact } from '@/lib/api';
import { checkContact } from '@/lib/contact';
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
  // Форма «оставьте телефон или ник» — для тех, у кого Telegram не открылся.
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSending, setContactSending] = useState(false);

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

  async function submitContact() {
    if (contactSending) return;
    const check = checkContact(contact);
    if (!check.ok) {
      setContactError(check.error);
      return;
    }
    setContactError(null);
    setContactSending(true);
    try {
      const res = await sendManagerContact(sessionRef.current, check.normalized);
      if (!res.ok) {
        setContactError(res.error || 'Не получилось отправить. Попробуйте ещё раз.');
        return;
      }
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: `✅ Передал менеджеру ваш контакт ${res.contact || check.normalized}. Он свяжется с вами сам.`,
        },
      ]);
      setNeedsManager(false);
      setContactOpen(false);
      setContact('');
    } catch {
      setContactError('Не получилось отправить. Проверьте интернет и попробуйте ещё раз.');
    } finally {
      setContactSending(false);
    }
  }

  // «Позвать менеджера» внизу чата: человек зовёт менеджера сразу, не
  // уговаривая Макса. Показываем тот же блок связи, что и после передачи
  // разговора Максом: Telegram с перепиской или телефон/ник в форме.
  function callManager() {
    setMessages((m) => [
      ...m,
      { role: 'assistant', content: 'Подключаю менеджера 🙌 Выберите, как вам удобнее связаться:' },
    ]);
    setContactOpen(false);
    setContactError(null);
    setNeedsManager(true);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Чат с консультантом"
          className="fixed right-5 bottom-[calc(var(--mobile-nav-h)_+_env(safe-area-inset-bottom)_+_var(--pdp-cta-h,0px)_+_1rem)] md:bottom-5 z-40 w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-accent-contrast shadow-lg shadow-accent/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
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

              {/* Связь с менеджером. Первым — Telegram через бота: по ключу
                  чата менеджер получит всю переписку и контакт человека. Кому
                  Telegram не подходит, оставляет телефон или ник прямо здесь —
                  раньше такой посетитель уходил, и написать ему было не по чему. */}
              {needsManager && (
                <div className="self-start w-full max-w-[85%] flex flex-col gap-2">
                  <a
                    href={getManagerBotLink(sessionRef.current)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-contrast text-sm font-bold text-center transition-colors"
                  >
                    💬 Написать менеджеру в Telegram
                  </a>
                  {!contactOpen ? (
                    <button
                      onClick={() => setContactOpen(true)}
                      className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 text-xs font-semibold transition-colors"
                    >
                      Нет Telegram? Оставьте телефон или ник
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-bg-page">
                      <p className="text-xs text-text-secondary">
                        Оставьте телефон или ник в Telegram — менеджер напишет вам сам.
                      </p>
                      <input
                        value={contact}
                        onChange={(e) => {
                          setContact(e.target.value);
                          setContactError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            submitContact();
                          }
                        }}
                        placeholder="+375 29 123-45-67 или @nick"
                        aria-label="Телефон или ник в Telegram"
                        aria-invalid={!!contactError}
                        className="px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
                      />
                      {contactError && <p className="text-xs text-red-400">{contactError}</p>}
                      <button
                        onClick={submitContact}
                        disabled={contactSending || !contact.trim()}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors',
                          contactSending || !contact.trim()
                            ? 'bg-bg-card text-text-secondary cursor-not-allowed'
                            : 'bg-accent hover:bg-accent-hover text-accent-contrast'
                        )}
                      >
                        {contactSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить менеджеру'}
                      </button>
                      <p className="text-[11px] leading-snug text-text-secondary">
                        Отправляя контакт, вы соглашаетесь с{' '}
                        <a href="/privacy" target="_blank" className="text-accent hover:underline">
                          политикой конфиденциальности
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Плашка «Позвать менеджера» — пока блок связи не открыт */}
            {!needsManager && (
              <div className="flex justify-center pb-2 shrink-0">
                <button
                  onClick={callManager}
                  className="px-3 py-1.5 rounded-full border border-border bg-bg-page text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors"
                >
                  👤 Позвать менеджера
                </button>
              </div>
            )}

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
