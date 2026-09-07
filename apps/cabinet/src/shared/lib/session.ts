import { useSyncExternalStore } from 'react'

/**
 * Сессия кабинета. Бэкенда нет, поэтому «вход» — это запись в localStorage:
 * она переживает перезагрузку, как настоящая кука, и снимается выходом.
 *
 * Выход намеренно НЕ трогает данные онбординга, договоров и настроек: в бою
 * они лежат на сервере и логаут их не стирает. Стереть всё можно кнопкой
 * «Начать сначала» в пульте прототипа.
 */

const SESSION_KEY = 'trigonum-session-v1'
const SESSION_EVENT = 'trigonum-session-changed'

export interface Session {
  email: string
  signedInAt: string
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    // Приватный режим: работаем как незалогиненные.
    return null
  }
}

/**
 * useSyncExternalStore сравнивает снимки по ссылке, поэтому парсить JSON на
 * каждый вызов нельзя — новый объект вызвал бы бесконечный ререндер.
 */
let cache: { raw: string | null; value: Session | null } = { raw: null, value: null }

function getSnapshot(): Session | null {
  const raw = readRaw()
  if (raw !== cache.raw) {
    let value: Session | null = null
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Session>
        if (typeof parsed?.email === 'string') {
          value = { email: parsed.email, signedInAt: parsed.signedInAt ?? new Date().toISOString() }
        }
      } catch {
        value = null
      }
    }
    cache = { raw, value }
  }
  return cache.value
}

function subscribe(onChange: () => void) {
  window.addEventListener(SESSION_EVENT, onChange)
  // Выход в соседней вкладке должен выкидывать и здесь.
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

function notify() {
  window.dispatchEvent(new Event(SESSION_EVENT))
}

export function signIn(email: string) {
  const session: Session = { email: email.trim(), signedInAt: new Date().toISOString() }
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Без персистентности сессия проживёт до перезагрузки — этого хватает.
  }
  notify()
}

export function signOut() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // Нечего убирать.
  }
  notify()
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
