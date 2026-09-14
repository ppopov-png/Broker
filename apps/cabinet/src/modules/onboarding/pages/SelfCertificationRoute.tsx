import { Navigate } from 'react-router-dom'
import { readClientProfile } from '@trigonum/shared'
import { SelfCertificationPage } from './SelfCertificationPage'

export function SelfCertificationRoute() {
  return readClientProfile().clientType === 'company'
    ? <Navigate to="/onboarding/agreements" replace />
    : <SelfCertificationPage />
}
