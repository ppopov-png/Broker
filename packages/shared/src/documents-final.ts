import {
  DOCUMENT_FORMS,
  FORM_RULES,
  JURISDICTIONS,
  documentChecklist as regulatoryChecklist,
  jurisdictionLabel,
  mandatoryCount,
  type ClientProfile,
  type ClientType,
  type DocumentForm,
  type Jurisdiction,
  type RequiredDocument,
} from './documents-regulatory'

export {
  DOCUMENT_FORMS,
  FORM_RULES,
  JURISDICTIONS,
  jurisdictionLabel,
  mandatoryCount,
  type ClientProfile,
  type ClientType,
  type DocumentForm,
  type Jurisdiction,
  type RequiredDocument,
}

/**
 * Точная форма отдельных российских документов следует буквальному перечню:
 * нотариальное заверение отдельно указано для решений, устава, изменений,
 * полномочий, ЕГРЮЛ, паспортов и лицензий. Для свидетельства о регистрации,
 * налогового документа и реестра акционеров действует общее правило
 * «оригинал либо нотариально заверенная копия».
 */
export function documentChecklist(profile: ClientProfile): RequiredDocument[] {
  const items = regulatoryChecklist(profile)
  if (profile.clientType !== 'company' || profile.jurisdiction !== 'RU') return items

  const generalRuleIds = new Set(['registration-certificate', 'tax-registration', 'shareholders-register'])
  return items.map((item) => (generalRuleIds.has(item.id) ? { ...item, form: 'original' as DocumentForm } : item))
}
