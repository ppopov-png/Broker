import { Navigate } from 'react-router-dom'
import { readClientProfile } from '@trigonum/shared'
import { DocumentsChecklistPage } from './DocumentsChecklistPage'

export function DocumentsRoute() {
  return readClientProfile().clientType === 'individual'
    ? <Navigate to="/onboarding/edd" replace />
    : <DocumentsChecklistPage />
}
