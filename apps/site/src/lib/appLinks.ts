export function onboardingUrl() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5174/`
  }
  return `${import.meta.env.BASE_URL}open/`
}

export function cabinetUrl() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5175/`
  }
  return `${import.meta.env.BASE_URL}app/`
}
