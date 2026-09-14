import { readClientProfile } from '@trigonum/shared'
import { CompanySignatoryVerificationPage } from './CompanySignatoryVerificationPage'
import { IdentityVerificationPage } from './IdentityVerificationPage'

export function IdentityVerificationRoute() {
  const profile = readClientProfile()
  return profile.clientType === 'company' ? <CompanySignatoryVerificationPage /> : <IdentityVerificationPage />
}
