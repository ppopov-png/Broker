import type { OnboardingState } from '@trigonum/shared'

export type { OnboardingState } from '@trigonum/shared'

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

export type KycStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'SUPERSEDED'

export type KycDecision = 'Approved' | 'Declined' | 'Review'

export type DocumentType =
  | 'PASSPORT'
  | 'NATIONAL_ID'
  | 'DRIVERS_LICENSE'
  | 'PROOF_OF_ADDRESS'
  | 'BANK_STATEMENT'

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

export interface ConsentLogEntry {
  id: string
  templateId: string
  name: string
  version: string
  action: 'granted' | 'revoked'
  at: string
}

export interface Agreement {
  template: AgreementTemplate
  consented: boolean
  consentedAt: string | null
}

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

export interface MessageThread {
  id: string
  subject: string | null
  lastMessage: string
  updatedAt: string
}

export interface SubmittedDocument {
  documentId: string
  fileName: string
  mediaId: string
  uploadedAt: string
  status: 'UPLOADED' | 'ACCEPTED' | 'REJECTED'
  reason?: string
}

export interface GetKycSessionRequest {
  sessionId: string
}

export interface AgreementConsentRequest {
  agreementTemplateId: string
}

export interface AttachDocumentRequest {
  documentId: string
  fileName: string
}

export interface RemoveDocumentRequest {
  documentId: string
}

export interface SubmitDocumentsRequest {
  requiredIds: string[]
}

export interface SubmitEddResponseRequest {
  answers: EddAnswer[]
}
