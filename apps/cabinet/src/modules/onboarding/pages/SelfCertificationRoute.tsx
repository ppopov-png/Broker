import { readClientProfile } from '@trigonum/shared'
import { CompanyDeclarationsPage } from './CompanyDeclarationsPage'
import { SelfCertificationPage } from './SelfCertificationPage'

export function SelfCertificationRoute() {
  return readClientProfile().clientType === 'company' ? <CompanyDeclarationsPage /> : <SelfCertificationPage />
}
