import { readClientProfile } from '@trigonum/shared'
import { CompanyQuestionnairePage } from './CompanyQuestionnairePage'
import { SelfCertificationPage } from './SelfCertificationPage'

export function SelfCertificationRoute() {
  return readClientProfile().clientType === 'company'
    ? <CompanyQuestionnairePage />
    : <SelfCertificationPage />
}
