export type OfferApplicationStatus = 'review' | 'clarification' | 'contract_ready' | 'funding' | 'declined'

export type OfferApplication = { id:string; offerId:string; offerName:string; team:string; investor:string; initials:string; amount:string; wallet:string; note:string; createdAt:string; status:OfferApplicationStatus; contract?:string; decisionNote?:string }

const key = 'trigonum-broker-offer-applications'
const eventName = 'trigonum-broker-applications-changed'

export function readOfferApplications(): OfferApplication[] { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
export function saveOfferApplications(applications: OfferApplication[]) { localStorage.setItem(key, JSON.stringify(applications)); window.dispatchEvent(new Event(eventName)) }
export function updateOfferApplication(id: string, patch: Partial<OfferApplication>) { saveOfferApplications(readOfferApplications().map(application => application.id === id ? { ...application, ...patch } : application)) }
export { eventName as offerApplicationsEvent }
