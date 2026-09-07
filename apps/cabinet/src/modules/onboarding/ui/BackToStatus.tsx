import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ONBOARDING_ROUTES } from '../../../shared/lib/onboarding/useOnboarding'

export function BackToStatus() {
  return (
    <Link
      to={ONBOARDING_ROUTES.status}
      className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--trigonum-blue)]"
    >
      <ArrowLeft size={14} />
      Статус заявки
    </Link>
  )
}
