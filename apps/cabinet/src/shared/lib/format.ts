const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyFormatterCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number, withCents = false): string {
  return (withCents ? currencyFormatterCents : currencyFormatter).format(value)
}

export function formatSigned(value: number, withCents = false): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatCurrency(Math.abs(value), withCents)}`
}

export function formatPercent(value: number, withSign = true): string {
  const sign = withSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatShare(value: number): string {
  return `${Math.round(value)}%`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${formatDate(iso)} ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return 'завершено'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}д ${hours}ч ${minutes}м`
  if (hours > 0) return `${hours}ч ${minutes}м ${seconds}с`
  return `${minutes}м ${seconds}с`
}
