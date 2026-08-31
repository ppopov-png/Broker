export type AppArea = 'site' | 'onboarding' | 'cabinet'

export type OnboardingStatus =
  | 'account_required'
  | 'kyc_required'
  | 'kyc_pending'
  | 'funding_required'
  | 'funding_pending'
  | 'active'
