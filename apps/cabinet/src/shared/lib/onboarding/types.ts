/** Состояние онбординга. Двигает его только бэкенд, фронт вызывает доменные операции. */
export type OnboardingState =
  | 'REGISTERED'
  | 'EMAIL_VERIFIED'
  | 'IDENTITY_IN_PROGRESS'
  | 'IDENTITY_VERIFIED'
  | 'IDENTITY_FAILED'
  | 'SELF_CERT_COMPLETED'
  | 'AGREEMENTS_ACCEPTED'
  | 'EDD_IN_PROGRESS'
  | 'EDD_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'AMENDMENTS_REQUESTED'
  | 'SUSPENDED'
  | 'REVERIFICATION_REQUIRED'

/**
 * Порядок для прогресса и гардов. IDENTITY_FAILED стоит сразу после
 * IDENTITY_VERIFIED, чтобы не блокировать экран повтора.
 */
export const STATE_ORDER: OnboardingState[] = [
  'REGISTERED',
  'EMAIL_VERIFIED',
  'IDENTITY_IN_PROGRESS',
  'IDENTITY_VERIFIED',
  'IDENTITY_FAILED',
  'SELF_CERT_COMPLETED',
  'AGREEMENTS_ACCEPTED',
  'EDD_IN_PROGRESS',
  'EDD_SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
]

/** Состояния, на которых поллинг статуса останавливается. */
export const TERMINAL_STATES: OnboardingState[] = ['APPROVED', 'REJECTED', 'SUSPENDED']

export interface OnboardingStatus {
  currentState: OnboardingState
  stateChangedAt: string
  metadata?: { reason?: string }
}

export interface OnboardingHistoryEntry {
  id: string
  fromState: OnboardingState | null
  toState: OnboardingState
  createdAt: string
}

/* --- KYC ---------------------------------------------------------------- */

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'SUPERSEDED'

export const KYC_TERMINAL: KycStatus[] = ['COMPLETED', 'FAILED', 'EXPIRED']
export const KYC_CAN_START: KycStatus[] = ['NOT_STARTED', 'FAILED', 'EXPIRED']

export type KycDecision = 'Approved' | 'Declined' | 'Review'

export type DocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PROOF_OF_ADDRESS' | 'BANK_STATEMENT'

export interface KycSession {
  sessionId: string
  status: KycStatus
  verificationUrl?: string
  overallDecision?: KycDecision
  updatedAt?: string
  webhookReceivedAt?: string
  documentData?: { documentType?: DocumentType }
}

export interface KycSessionConflict {
  existingSessionId: string
  existingStatus: KycStatus
  verificationUrl?: string
}

/* --- Самосертификация --------------------------------------------------- */

export type InvestorClassification = 'RETAIL' | 'PROFESSIONAL' | 'INSTITUTIONAL'

export interface AccreditationDetails {
  netWorth: string
  annualIncome: string
  professionalExperience: string
  portfolioValue: string
}

export interface SelfCertification {
  isPep: boolean
  pepDetails?: string
  isSanctioned: boolean
  sanctionsDetails?: string
  sanctionedJurisdiction: boolean
  jurisdictionCountry?: string
  investorClassification: InvestorClassification
  accreditationDetails?: AccreditationDetails
}

/* --- Соглашения --------------------------------------------------------- */

export type AgreementCategory =
  | 'ASSET_MANAGEMENT'
  | 'BROKER_DEALER'
  | 'VIRTUAL_ASSETS'
  | 'RISK_DISCLOSURE'
  | 'PRIVACY_POLICY'
  | 'OTHER'

export interface AgreementTemplate {
  id: string
  name: string
  description: string
  version: string
  category: AgreementCategory
  isRequired: boolean
  mediaId: string
}

export interface Agreement {
  template: AgreementTemplate
  consented: boolean
  consentedAt: string | null
}

/* --- Анкета EDD --------------------------------------------------------- */

export type EddQuestionType = 'TEXT' | 'YES_NO' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'FILE_UPLOAD' | 'DATE'

export interface EddQuestion {
  id: string
  text: string
  type: EddQuestionType
  isRequired: boolean
  order: number
  options?: string[]
  metadata?: { requiresTextOnOther?: boolean }
}

export interface EddTemplate {
  id: string
  version: string
  questions: EddQuestion[]
}

export interface EddAnswer {
  questionId: string
  textValue?: string
  selectedOptions?: string[]
  mediaId?: string
  dateValue?: string
}

export interface EddResponse {
  id: string
  submittedAt: string
  answers: EddAnswer[]
}

/* --- Сообщения ---------------------------------------------------------- */

export interface MessageThread {
  id: string
  subject: string | null
  lastMessage: string
  updatedAt: string
}

/** Ошибка API со статусом — чтобы отличать 404 и 409 от прочих. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
