/**
 * Контракт хранилища онбординга. Лежит в общем пакете, потому что запись
 * состояния делают оба приложения: онбординг после подтверждения почты
 * и кабинет на дальнейших шагах. На проде они на одном origin, поэтому
 * localStorage у них общий.
 */

import type { ClientProfile, ClientType, Jurisdiction } from './documents'

export const ONBOARDING_STORE_KEY = 'trigonum-onboarding-v1'

/** Профиль по умолчанию: физлицо-резидент — самый короткий перечень документов. */
export const DEFAULT_CLIENT_PROFILE: ClientProfile = { clientType: 'individual', jurisdiction: 'KG' }

export type OnboardingState =
  | 'REGISTERED'
  | 'EMAIL_VERIFIED'
  | 'IDENTITY_IN_PROGRESS'
  | 'IDENTITY_VERIFIED'
  | 'IDENTITY_FAILED'
  | 'SELF_CERT_COMPLETED'
  | 'AGREEMENTS_ACCEPTED'
  | 'DOCUMENTS_SUBMITTED'
  | 'EDD_IN_PROGRESS'
  | 'EDD_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'AMENDMENTS_REQUESTED'
  | 'SUSPENDED'
  | 'REVERIFICATION_REQUIRED'

interface StoreShape {
  currentState: OnboardingState
  stateChangedAt: string
  metadata?: { reason?: string }
  history: { id: string; fromState: OnboardingState | null; toState: OnboardingState; createdAt: string }[]
  clientType?: ClientType
  jurisdiction?: Jurisdiction
  [key: string]: unknown
}

function readStore(): StoreShape | null {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORE_KEY)
    return raw ? (JSON.parse(raw) as StoreShape) : null
  } catch {
    return null
  }
}

/**
 * Тип клиента и юрисдикция выбираются до регистрации и определяют весь
 * дальнейший маршрут: состав документов, формулировки шагов и то, чью
 * личность проверяет провайдер. Пишутся сюда, потому что выбор делает
 * приложение открытия счёта, а читает его кабинет.
 */
export function markClientProfile(profile: ClientProfile): void {
  try {
    const store = readStore() ?? {
      currentState: 'REGISTERED' as OnboardingState,
      stateChangedAt: new Date().toISOString(),
      history: [],
    }
    store.clientType = profile.clientType
    store.jurisdiction = profile.jurisdiction
    window.localStorage.setItem(ONBOARDING_STORE_KEY, JSON.stringify(store))
  } catch {
    // Приватный режим — выбор просто не сохранится.
  }
}

export function readClientProfile(): ClientProfile {
  const store = readStore()
  return {
    clientType: store?.clientType ?? DEFAULT_CLIENT_PROFILE.clientType,
    jurisdiction: store?.jurisdiction ?? DEFAULT_CLIENT_PROFILE.jurisdiction,
  }
}

/**
 * Переводит онбординг в указанное состояние и дописывает переход в историю.
 * Используется и для реальных доменных событий, и пультом прототипа.
 */
export function markOnboardingState(next: OnboardingState, reason?: string): void {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORE_KEY)
    const createdAt = new Date().toISOString()
    const store: StoreShape = raw
      ? (JSON.parse(raw) as StoreShape)
      : { currentState: 'REGISTERED', stateChangedAt: createdAt, history: [] }

    if (store.currentState === next) return

    store.history = [
      ...(store.history ?? []),
      { id: `h${(store.history?.length ?? 0) + 1}`, fromState: store.currentState ?? null, toState: next, createdAt },
    ]
    store.currentState = next
    store.stateChangedAt = createdAt
    store.metadata = reason ? { reason } : undefined

    window.localStorage.setItem(ONBOARDING_STORE_KEY, JSON.stringify(store))
  } catch {
    // Приватный режим — переключение просто не сохранится.
  }
}
