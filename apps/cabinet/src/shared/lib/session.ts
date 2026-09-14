import { useSyncExternalStore } from 'react'
import {
  findPrototypeAccount,
  markClientProfile,
  type ClientType,
  type Jurisdiction,
} from '@trigonum/shared'

const SESSION_KEY = 'trigonum-session-v1'
const SESSION_EVENT = 'trigonum-session-changed'

interface DemoAccount {
  email: string
  name: string
  clientType: ClientType
  jurisdiction: Jurisdiction
  accountId: string
}

export const DEMO_INDIVIDUAL_EMAIL = 'artem@trigonum.broker'
export const DEMO_COMPANY_EMAIL = 'company@trigonum.broker'

const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  [DEMO_INDIVIDUAL_EMAIL]: {
    email: DEMO_INDIVIDUAL_EMAIL,
    name: 'Артём Дробков',
    clientType: 'individual',
    jurisdiction: 'KG',
    accountId: 'artem-personal',
  },
  [DEMO_COMPANY_EMAIL]: {
    email: DEMO_COMPANY_EMAIL,
    name: 'ООО «Чень дешёвые билеты на Aviasales»',
    clientType: 'company',
    jurisdiction: 'KG',
    accountId: 'capital-no-wait-llc',
  },
}

export interface Session {
  email: string
  signedInAt: string
  clientType: ClientType
  jurisdiction: Jurisdiction
  accountName: string
  accountId?: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function resolveLoginAccount(email: string) {
  const normalized = normalizeEmail(email)
  const registered = findPrototypeAccount(normalized)
  if (registered) return { ...registered, accountId: undefined }
  return DEMO_ACCOUNTS[normalized] ?? null
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

let cache: { raw: string | null; value: Session | null } = { raw: null, value: null }

function getSnapshot(): Session | null {
  const raw = readRaw()
  if (raw !== cache.raw) {
    let value: Session | null = null
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Session>
        if (
          typeof parsed.email === 'string' &&
          (parsed.clientType === 'individual' || parsed.clientType === 'company') &&
          typeof parsed.jurisdiction === 'string'
        ) {
          value = {
            email: parsed.email,
            signedInAt: parsed.signedInAt ?? new Date().toISOString(),
            clientType: parsed.clientType,
            jurisdiction: parsed.jurisdiction as Jurisdiction,
            accountName: parsed.accountName ?? parsed.email,
            accountId: parsed.accountId,
          }
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
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

function notify() {
  window.dispatchEvent(new Event(SESSION_EVENT))
}

/** Возвращает null, если такого аккаунта нет в прототипном реестре. */
export function signIn(email: string): Session | null {
  const account = resolveLoginAccount(email)
  if (!account) return null

  const session: Session = {
    email: account.email,
    signedInAt: new Date().toISOString(),
    clientType: account.clientType,
    jurisdiction: account.jurisdiction,
    accountName: account.name,
    accountId: account.accountId,
  }

  // Восстанавливаем профиль конкретного аккаунта: весь последующий онбординг
  // обязан строиться по типу и юрисдикции вошедшего клиента.
  markClientProfile({ clientType: session.clientType, jurisdiction: session.jurisdiction })

  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Без персистентности вход проживёт только текущую вкладку.
  }
  notify()
  return session
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
