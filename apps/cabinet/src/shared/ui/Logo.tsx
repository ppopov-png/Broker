import trigonumIcon from '../../../../site/src/assets/trigonum-icon.svg'
import trigonumWordmark from '../../../../site/src/assets/trigonum-wordmark.svg'

export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <img
        src={trigonumIcon}
        alt="Trigonum"
        className="block size-8 shrink-0 object-contain"
      />
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2" aria-label="Trigonum Broker">
      <img
        src={trigonumIcon}
        alt=""
        aria-hidden="true"
        className="block size-8 shrink-0 object-contain"
      />
      <img
        src={trigonumWordmark}
        alt="TRIGONUM"
        className="block w-[112px] shrink-0"
      />
      <span className="h-6 w-px shrink-0 bg-[rgba(37,37,79,.22)]" aria-hidden="true" />
      <span className="shrink-0 font-semibold text-[10px] tracking-[0.22em] text-[#5a5ac4]">
        BROKER
      </span>
    </div>
  )
}
