import type { KycStatus, OnboardingState } from '@trigonum/api'

/**
 * Cabinet keeps UI-only state helpers here. Domain DTOs come from the public
 * versioned API boundary and are re-exported to avoid breaking local consumers.
 */
export type {
  AccreditationDetails,
  Agreement,
  AgreementCategory,
  AgreementTemplate,
  ConsentLogEntry,
  DocumentType,
  EddAnswer,
  EddQuestion,
  EddQuestionType,
  EddResponse,
  EddTemplate,
  InvestorClassification,
  KycDecision,
  KycSession,
  KycSessionConflict,
  KycStatus,
  MessageThread,
  OnboardingHistoryEntry,
  OnboardingState,
  OnboardingStatus,
  SelfCertification,
  SubmittedDocument,
} from '@trigonum/api'

/** Order used only by cabinet progress UI and route guards. */
export const STATE_ORDER: OnboardingState[] = [
  'REGISTERED',
  'EMAIL_VERIFIED',
  'IDENTITY_IN_PROGRESS',
  'IDENTITY_VERIFIED',
  'IDENTITY_FAILED',
  'SELF_CERT_COMPLETED',
  'AGREEMENTS_ACCEPTED',
  'DOCUMENTS_SUBMITTED',
  'EDD_IN_PROGRESS',
  'EDD_SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
]

/** States at which cabinet stops status polling. */
export const TERMINAL_STATES: OnboardingState[] = ['APPROVED', 'REJECTED', 'SUSPENDED']

export const KYC_TERMINAL: KycStatus[] = ['COMPLETED', 'FAILED', 'EXPIRED']
export const KYC_CAN_START: KycStatus[] = ['NOT_STARTED', 'FAILED', 'EXPIRED']

/** Prototype mock error. HTTP error taxonomy is intentionally outside API v1. */
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
