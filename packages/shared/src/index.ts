export { ONBOARDING_STORE_KEY, markOnboardingState, type OnboardingState } from './onboarding'

export type AppArea = 'site' | 'onboarding' | 'cabinet'

export type OnboardingStatus =
  | 'account_required'
  | 'kyc_required'
  | 'kyc_pending'
  | 'funding_required'
  | 'funding_pending'
  | 'active'
