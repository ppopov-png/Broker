import { ONBOARDING_STORE_KEY, markOnboardingState } from '@trigonum/shared'
import type { SubmittedDocument } from './types'

interface StoreShape {
  documents?: Record<string, SubmittedDocument>
  documentFiles?: Record<string, SubmittedDocument[]>
  companyQuestionnaire?: { submittedAt?: string }
  [key: string]: unknown
}

function readStore(): StoreShape {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORE_KEY)
    return raw ? (JSON.parse(raw) as StoreShape) : {}
  } catch {
    return {}
  }
}

function writeStore(store: StoreShape) {
  try { window.localStorage.setItem(ONBOARDING_STORE_KEY, JSON.stringify(store)) } catch {}
}

function normalize(store: StoreShape): Record<string, SubmittedDocument[]> {
  const files = store.documentFiles ? { ...store.documentFiles } : Object.fromEntries(Object.entries(store.documents ?? {}).map(([id, document]) => [id, [document]]))
  if (store.companyQuestionnaire && !(files['company-form'] ?? []).length) {
    files['company-form'] = [{
      documentId: 'company-form',
      fileName: 'Анкета юридического лица — заполнена онлайн',
      mediaId: 'generated-company-questionnaire',
      uploadedAt: store.companyQuestionnaire.submittedAt ?? new Date().toISOString(),
      status: 'UPLOADED',
    }]
  }
  return files
}

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getDocumentFiles(): Promise<Record<string, SubmittedDocument[]>> {
  await wait()
  const store = readStore()
  const files = normalize(store)
  store.documentFiles = files
  writeStore(store)
  return files
}

export async function attachDocumentFile(documentId: string, fileName: string): Promise<SubmittedDocument> {
  await wait(160)
  const store = readStore()
  const files = normalize(store)
  const entry: SubmittedDocument = { documentId, fileName, mediaId: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, uploadedAt: new Date().toISOString(), status: 'UPLOADED' }
  files[documentId] = [...(files[documentId] ?? []), entry]
  store.documentFiles = files
  writeStore(store)
  return entry
}

export async function removeDocumentFile(documentId: string, mediaId: string): Promise<void> {
  await wait(100)
  if (documentId === 'company-form' && mediaId === 'generated-company-questionnaire') return
  const store = readStore()
  const files = normalize(store)
  files[documentId] = (files[documentId] ?? []).filter((entry) => entry.mediaId !== mediaId)
  if (files[documentId].length === 0) delete files[documentId]
  store.documentFiles = files
  writeStore(store)
}

export async function submitDocumentFiles(requiredIds: string[]): Promise<void> {
  await wait(160)
  const files = normalize(readStore())
  const missing = requiredIds.filter((id) => (files[id] ?? []).length === 0)
  if (missing.length > 0) throw new Error(`Documents incomplete: ${missing.join(', ')}`)
  markOnboardingState('DOCUMENTS_SUBMITTED')
}
