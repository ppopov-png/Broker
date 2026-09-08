export {
  DEFAULT_CLIENT_PROFILE,
  ONBOARDING_STORE_KEY,
  markClientProfile,
  markOnboardingState,
  readClientProfile,
  type OnboardingState,
} from './onboarding'
export {
  DOCUMENT_FORMS,
  FORM_RULES,
  JURISDICTIONS,
  documentChecklist,
  jurisdictionLabel,
  mandatoryCount,
  type ClientProfile,
  type ClientType,
  type DocumentForm,
  type Jurisdiction,
  type RequiredDocument,
} from './documents'

export type AppArea = 'site' | 'onboarding' | 'cabinet'

export type OnboardingStatus =
  | 'account_required'
  | 'kyc_required'
  | 'kyc_pending'
  | 'funding_required'
  | 'funding_pending'
  | 'active'
